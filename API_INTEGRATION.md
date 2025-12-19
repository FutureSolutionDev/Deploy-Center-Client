# API Integration Guide

Complete guide for integrating with Deploy Center backend API.

---

## 🔗 Base Configuration

### API Instance Setup

```typescript
// src/services/api.ts
import axios from 'axios';
import { Config } from '@/utils/config';

const ApiInstance = axios.create({
  baseURL: Config.Api.BaseUrl,  // http://localhost:3000/api
  timeout: Config.Api.Timeout,   // 30000ms
  withCredentials: true,         // Send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Environment Configuration

```typescript
// src/utils/config.ts
export const Config = {
  Api: {
    BaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    Timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  Socket: {
    Url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
    Path: import.meta.env.VITE_SOCKET_PATH || '/v1/ws',
  },
};
```

---

## 🔐 Authentication

### Login Flow

```typescript
// src/services/authService.ts
export const AuthService = {
  login: async (credentials: ILoginCredentials) => {
    const response = await ApiInstance.post('/auth/login', credentials);
    // JWT stored in HTTP-only cookie automatically
    return response.data.Data.User;
  },

  logout: async () => {
    await ApiInstance.post('/auth/logout');
    // Cookie cleared by server
  },

  getProfile: async () => {
    const response = await ApiInstance.get('/auth/profile');
    return response.data.Data.User;
  },
};
```

### Auto Token Refresh

```typescript
// Interceptor handles token refresh automatically
ApiInstance.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      // Refresh token
      const newToken = await RefreshAccessToken();

      // Retry original request
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return ApiInstance(error.config);
    }

    return Promise.reject(error);
  }
);
```

---

## 📦 API Services

### Service Pattern

All API calls use a consistent service pattern:

```typescript
export const ServiceName = {
  getAll: async () => { /* ... */ },
  getById: async (id: number) => { /* ... */ },
  create: async (data: ICreate) => { /* ... */ },
  update: async (id: number, data: IUpdate) => { /* ... */ },
  delete: async (id: number) => { /* ... */ },
};
```

---

## 🗂️ Available Services

### 1. Projects Service

```typescript
// src/services/projectsService.ts
export const ProjectsService = {
  // Get all projects
  getAll: async (): Promise<IProject[]> => {
    const response = await ApiInstance.get('/projects');
    return response.data.Data.Projects;
  },

  // Get single project
  getById: async (id: number): Promise<IProject> => {
    const response = await ApiInstance.get(`/projects/${id}`);
    return response.data.Data.Project;
  },

  // Create project
  create: async (data: ICreateProject): Promise<IProject> => {
    const response = await ApiInstance.post('/projects', data);
    return response.data.Data.Project;
  },

  // Update project
  update: async (id: number, data: IUpdateProject): Promise<IProject> => {
    const response = await ApiInstance.put(`/projects/${id}`, data);
    return response.data.Data.Project;
  },

  // Delete project
  delete: async (id: number): Promise<void> => {
    await ApiInstance.delete(`/projects/${id}`);
  },

  // Trigger deployment
  deploy: async (id: number, branch?: string): Promise<IDeployment> => {
    const response = await ApiInstance.post(`/projects/${id}/deploy`, { branch });
    return response.data.Data.Deployment;
  },

  // Get project statistics
  getStatistics: async (id: number): Promise<IProjectStatistics> => {
    const response = await ApiInstance.get(`/projects/${id}/statistics`);
    return response.data.Data.Statistics;
  },

  // Regenerate webhook secret
  regenerateWebhook: async (id: number): Promise<string> => {
    const response = await ApiInstance.post(`/projects/${id}/regenerate-webhook`);
    return response.data.Data.WebhookSecret;
  },
};
```

### 2. Deployments Service

```typescript
// src/services/deploymentsService.ts
export const DeploymentsService = {
  getAll: async (): Promise<IDeployment[]> => {
    const response = await ApiInstance.get('/deployments');
    return response.data.Data.Deployments || [];
  },

  getById: async (id: number): Promise<IDeployment> => {
    const response = await ApiInstance.get(`/deployments/${id}`);
    return response.data.Data.Deployment;
  },

  getLogs: async (id: number): Promise<string> => {
    const response = await ApiInstance.get(`/deployments/${id}/logs`);
    return response.data.Data.Logs || '';
  },

  cancel: async (id: number): Promise<void> => {
    await ApiInstance.post(`/deployments/${id}/cancel`);
  },

  retry: async (id: number): Promise<IDeployment> => {
    const response = await ApiInstance.post(`/deployments/${id}/retry`);
    return response.data.Data.Deployment;
  },

  getStatistics: async (): Promise<IDeploymentStatistics> => {
    const response = await ApiInstance.get('/deployments/statistics');
    return response.data.Data.Statistics;
  },

  getQueueStatus: async (): Promise<IQueueStatus> => {
    const response = await ApiInstance.get('/deployments/queue/status');
    return response.data.Data.QueueStatus;
  },

  cancelAllPending: async (projectId: number): Promise<void> => {
    await ApiInstance.post(`/deployments/projects/${projectId}/queue/cancel-all`);
  },
};
```

### 3. User Settings Service

```typescript
// src/services/userSettingsService.ts
export const UserSettingsService = {
  get: async (): Promise<IUserSettings> => {
    const response = await ApiInstance.get('/users/settings');
    return response.data.Data.Settings;
  },

  update: async (settings: Partial<IUserSettings>): Promise<IUserSettings> => {
    const response = await ApiInstance.put('/users/settings', settings);
    return response.data.Data.Settings;
  },
};
```

---

## 🔌 Socket.IO Integration

### Connection

```typescript
// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { Config } from '@/utils/config';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(Config.Socket.Url, {
      path: Config.Socket.Path,
      auth: {
        token: Cookies.get('auth_token'),
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.setupEventHandlers();

    return this.socket;
  }

  private setupEventHandlers() {
    this.socket?.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket?.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  joinProject(projectId: number) {
    this.socket?.emit('join:project', projectId);
  }

  joinDeployment(deploymentId: number) {
    this.socket?.emit('join:deployment', deploymentId);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export default new SocketService();
```

### Socket Events

**Server → Client Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `deployment:updated` | `IDeployment` | Deployment status changed |
| `deployment:completed` | `IDeployment` | Deployment finished |
| `deployment:log` | `{ DeploymentId, Log, Timestamp }` | New log line |

**Client → Server Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `join:project` | `projectId: number` | Join project room |
| `join:deployment` | `deploymentId: number` | Join deployment room |

### Usage Example

```typescript
// In component
import { useSocket, useDeploymentEvents } from '@/hooks/useSocket';

const DeploymentsPage = () => {
  const [deployments, setDeployments] = useState<IDeployment[]>([]);

  // Listen for deployment updates
  useDeploymentEvents(
    (deployment) => {
      // Update deployment in list
      setDeployments(prev =>
        prev.map(d => d.Id === deployment.Id ? deployment : d)
      );
    },
    (deployment) => {
      // Deployment completed
      console.log('Completed:', deployment);
    }
  );

  return <DeploymentsList deployments={deployments} />;
};
```

---

## 🛡️ Security Features

### 1. CSRF Protection

```typescript
// Interceptor adds CSRF token to all requests
ApiInstance.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('XSRF-TOKEN');

  if (csrfToken && config.method !== 'get') {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
});
```

### 2. Idempotency Keys

```typescript
// For POST/PUT/DELETE requests
const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
};

ApiInstance.interceptors.request.use((config) => {
  if (['post', 'put', 'delete'].includes(config.method || '')) {
    config.headers['Idempotency-Key'] = generateIdempotencyKey();
  }

  return config;
});
```

### 3. HTTP-Only Cookies

JWT tokens are stored in HTTP-only cookies (not localStorage):
- ✅ Protected from XSS attacks
- ✅ Automatically sent with requests
- ✅ Server manages expiration

---

## 📊 Response Format

All API responses follow this format:

```typescript
interface IApiResponse<T = any> {
  Success: boolean;
  Message: string;
  Data: T | null;
  Error: string | false;
}
```

**Success Response:**
```json
{
  "Success": true,
  "Message": "Operation successful",
  "Data": {
    "Project": { /* ... */ }
  },
  "Error": false
}
```

**Error Response:**
```json
{
  "Success": false,
  "Message": "Validation error",
  "Data": null,
  "Error": "Project name is required"
}
```

---

## ❌ Error Handling

### Global Error Handler

```typescript
// src/utils/apiInterceptors.ts
ApiInstance.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const message = getErrorMessage(error);

    // Show toast notification
    if (error.response?.status !== 401) {
      toast.showError(message);
    }

    return Promise.reject(error);
  }
);

function getErrorMessage(error: AxiosError): string {
  if (error.response) {
    const data = error.response.data as any;
    return data?.Message || data?.error || 'An error occurred';
  }

  if (error.request) {
    return 'Network error - Please check your connection';
  }

  return error.message || 'An unexpected error occurred';
}
```

### Component-Level Error Handling

```typescript
const MyComponent = () => {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setError(null);
      await SomeService.doSomething();
    } catch (err) {
      // Error already shown via toast
      // Optionally set local error state
      setError('Failed to complete action');
    }
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      {/* ... */}
    </>
  );
};
```

---

## 🎯 Best Practices

1. **Always use services** - Don't call API directly from components
2. **Type everything** - Define interfaces for requests/responses
3. **Handle errors** - Use try/catch and show user feedback
4. **Loading states** - Show loaders during API calls
5. **Debounce** - For search/filter operations
6. **Cancel requests** - For unmounted components
7. **Socket cleanup** - Always unsubscribe in useEffect cleanup

---

## 📝 Example: Complete Flow

```typescript
// 1. Define types
interface ICreateProjectData {
  Name: string;
  RepoUrl: string;
  Branch: string;
}

// 2. Create service method
export const ProjectsService = {
  create: async (data: ICreateProjectData): Promise<IProject> => {
    const response = await ApiInstance.post('/projects', data);
    return response.data.Data.Project;
  },
};

// 3. Use in component
const CreateProjectPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: ICreateProjectData) => {
    try {
      setLoading(true);
      const project = await ProjectsService.create(data);

      // Success toast shown automatically by interceptor
      navigate(`/projects/${project.Id}`);
    } catch (error) {
      // Error toast shown automatically by interceptor
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  return <ProjectForm onSubmit={handleSubmit} loading={loading} />;
};
```

---

## 🔗 Related Documentation

- [Architecture Guide](ARCHITECTURE.md) - Application structure
- [Frontend Roadmap](FRONTEND_ROADMAP.md) - Features and status
- [Server API Documentation](../server/README.md) - Backend API reference
