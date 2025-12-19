# Deploy Center Client - Architecture Guide

## 📐 Architecture Overview

Deploy Center Client follows a **component-based architecture** using React with TypeScript, organized in a clean, scalable structure.

```
Client Architecture:
┌─────────────────────────────────────┐
│          Browser                    │
│  ┌──────────────────────────────┐  │
│  │      React App (SPA)         │  │
│  │  ┌────────────────────────┐  │  │
│  │  │   Pages & Components   │  │  │
│  │  └────────────────────────┘  │  │
│  │  ┌────────────────────────┐  │  │
│  │  │   Context Providers    │  │  │
│  │  │  (State Management)    │  │  │
│  │  └────────────────────────┘  │  │
│  │  ┌────────────────────────┐  │  │
│  │  │   Services Layer       │  │  │
│  │  │  (API + Socket.IO)     │  │  │
│  │  └────────────────────────┘  │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
          ↓ HTTP/WebSocket
┌─────────────────────────────────────┐
│      Deploy Center Server           │
└─────────────────────────────────────┘
```

---

## 🗂️ Folder Structure

### `/src/components/`

Reusable React components organized by feature:

```
components/
├── Common/              # Shared UI components
│   ├── Loader.tsx
│   ├── ErrorMessage.tsx
│   └── ConfirmDialog.tsx
├── Layout/              # Layout components
│   ├── MainLayout.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
├── Projects/            # Project-specific components
│   ├── ProjectCard.tsx
│   ├── ProjectWizard.tsx
│   └── ProjectForm.tsx
├── Deployments/         # Deployment components
│   ├── DeploymentCard.tsx
│   ├── DeploymentModal.tsx
│   └── LogsViewer.tsx
├── Settings/            # Settings components
│   ├── ProfileTab.tsx
│   ├── NotificationsTab.tsx
│   └── SecurityTab.tsx
└── ErrorBoundary.tsx    # Error boundary
```

**Component Patterns:**
- **Presentational Components**: UI-only, receive props
- **Container Components**: Handle logic, fetch data
- **Compound Components**: For complex UI (e.g., Wizard)

---

### `/src/contexts/`

React Context for global state management:

```typescript
contexts/
├── AuthContext.tsx          # Authentication state
├── ThemeContext.tsx         # Theme (dark/light + colors)
├── LanguageContext.tsx      # i18n (EN/AR)
├── UserSettingsContext.tsx  # User preferences
└── ToastContext.tsx         # Toast notifications
```

**Key Contexts:**

1. **AuthContext** - User authentication
```typescript
interface IAuthContext {
  User: IUser | null;
  IsAuthenticated: boolean;
  IsLoading: boolean;
  Login: (credentials) => Promise<void>;
  Logout: () => void;
  RefreshToken: () => Promise<void>;
}
```

2. **ToastContext** - Global notifications
```typescript
interface IToastContext {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}
```

3. **ThemeContext** - Theming
```typescript
interface IThemeContext {
  Mode: 'light' | 'dark';
  Color: string;
  ToggleMode: () => void;
  SetColor: (color: string) => void;
}
```

---

### `/src/pages/`

Top-level page components for routing:

```
pages/
├── Auth/
│   ├── LoginPage.tsx        # /login
│   └── RegisterPage.tsx     # /register
├── Dashboard/
│   └── DashboardPage.tsx    # /dashboard
├── Projects/
│   ├── ProjectsPage.tsx     # /projects
│   └── ProjectDetailsPage.tsx  # /projects/:id
├── Deployments/
│   ├── DeploymentsPage.tsx     # /deployments
│   ├── DeploymentDetailsPage.tsx  # /deployments/:id
│   └── DeploymentLogsPage.tsx
├── Queue/
│   └── QueuePage.tsx        # /queue
├── Settings/
│   └── SettingsPage.tsx     # /settings
└── Reports/
    └── ReportsPage.tsx      # /reports
```

**Page Structure:**
```typescript
const MyPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IData[]>([]);

  useEffect(() => {
    // Fetch data on mount
    fetchData();
  }, []);

  return (
    <Box>
      {/* Page content */}
    </Box>
  );
};
```

---

### `/src/services/`

API integration layer - all backend communication:

```
services/
├── api.ts                   # Axios instance with interceptors
├── authService.ts           # Authentication API
├── projectsService.ts       # Projects CRUD
├── deploymentsService.ts    # Deployments API
├── userSettingsService.ts   # User settings
├── socketService.ts         # Socket.IO client
└── socket.ts               # Socket connection
```

**Service Pattern:**
```typescript
export const ProjectsService = {
  getAll: async (): Promise<IProject[]> => {
    const response = await ApiInstance.get('/projects');
    return response.data.Data.Projects;
  },

  getById: async (id: number): Promise<IProject> => {
    const response = await ApiInstance.get(`/projects/${id}`);
    return response.data.Data.Project;
  },

  create: async (data: ICreateProject): Promise<IProject> => {
    const response = await ApiInstance.post('/projects', data);
    return response.data.Data.Project;
  },
};
```

---

### `/src/hooks/`

Custom React hooks for reusable logic:

```
hooks/
├── useSocket.ts             # Socket.IO connection
├── useDateFormatter.ts      # Date formatting
├── useDebounce.ts          # Debounce values
└── useLocalStorage.ts      # Local storage
```

**Example Hook:**
```typescript
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  return { isConnected, socket: socketService };
};
```

---

### `/src/types/`

TypeScript type definitions:

```typescript
// types/index.ts
export interface IProject {
  Id: number;
  Name: string;
  RepoUrl: string;
  Branch: string;
  Config: IProjectConfig;
  // ...
}

export interface IDeployment {
  Id: number;
  ProjectId: number;
  Status: EDeploymentStatus;
  CommitHash: string;
  // ...
}

export enum EDeploymentStatus {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
}
```

---

## 🔄 Data Flow

### 1. User Interaction
```
User clicks button
  ↓
Component calls service method
  ↓
Service makes API request via Axios
  ↓
Interceptor adds auth headers + CSRF token
  ↓
Server processes request
  ↓
Response interceptor shows toast notification
  ↓
Component updates state
  ↓
UI re-renders
```

### 2. Real-Time Updates
```
Server emits Socket.IO event
  ↓
SocketService receives event
  ↓
useDeploymentEvents hook callback fires
  ↓
Component updates state
  ↓
UI updates in real-time
```

---

## 🎨 Styling Approach

**Material-UI (MUI) v5**
- Component library for consistent UI
- Theme customization via ThemeContext
- `sx` prop for inline styles
- Responsive design with Grid/Box

**Example:**
```typescript
<Box
  sx={{
    padding: 2,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 1,
  }}
>
  <Typography variant="h5">Title</Typography>
</Box>
```

---

## 🔐 Security

### Authentication Flow
```
1. User submits login form
2. AuthService.login() sends credentials
3. Server returns JWT in HTTP-only cookie
4. CSRF token stored in cookie
5. All subsequent requests include both
6. Token auto-refreshes on 401
```

### API Security
- **HTTP-only cookies** for JWT (no localStorage)
- **CSRF protection** via X-XSRF-TOKEN header
- **Idempotency keys** for POST/PUT/DELETE
- **Auto token refresh** on expiration

---

## 🌐 Routing

**React Router v6**

```typescript
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<LoginPage />} />

  {/* Protected routes */}
  <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
    <Route index element={<Navigate to="/dashboard" />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="projects" element={<ProjectsPage />} />
    {/* ... */}
  </Route>
</Routes>
```

**Route Guards:**
- `ProtectedRoute` - Requires authentication
- `PublicRoute` - Redirects if authenticated

---

## 📡 State Management

**Strategy**: React Context + Local State

- **Global State**: Contexts (Auth, Theme, Settings)
- **Page State**: useState/useReducer in page components
- **Server State**: Fetched on-demand, no caching layer

**Why no Redux?**
- React Context sufficient for current complexity
- Less boilerplate
- Better TypeScript integration

---

## 🧪 Component Patterns

### 1. Container/Presentational Pattern
```typescript
// Container (logic)
const ProjectsPageContainer = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    ProjectsService.getAll().then(setProjects);
  }, []);

  return <ProjectsList projects={projects} />;
};

// Presentational (UI)
const ProjectsList = ({ projects }: { projects: IProject[] }) => (
  <Grid container spacing={2}>
    {projects.map(project => (
      <Grid item xs={12} md={6} key={project.Id}>
        <ProjectCard project={project} />
      </Grid>
    ))}
  </Grid>
);
```

### 2. Compound Components
```typescript
<Wizard>
  <Wizard.Step title="Basic Info">
    <BasicInfoForm />
  </Wizard.Step>
  <Wizard.Step title="Configuration">
    <ConfigForm />
  </Wizard.Step>
  <Wizard.Actions />
</Wizard>
```

---

## 🔌 Socket.IO Integration

### Connection Management
```typescript
// socketService.ts
class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(Config.Socket.Url, {
      path: Config.Socket.Path,
      auth: { token: getAuthToken() },
    });
  }

  joinProject(projectId: number) {
    this.socket?.emit('join:project', projectId);
  }

  on(event: string, callback: Function) {
    this.socket?.on(event, callback);
  }
}
```

### Usage in Components
```typescript
const DeploymentPage = ({ projectId }) => {
  useDeploymentEvents(
    (deployment) => {
      // Update on deployment change
      setDeployments(prev =>
        prev.map(d => d.Id === deployment.Id ? deployment : d)
      );
    }
  );
};
```

---

## 📦 Build & Optimization

**Vite Configuration:**
- Code splitting by route
- Lazy loading for large components
- Tree shaking for unused code
- Asset optimization (images, fonts)

**Performance:**
- React.memo for expensive components
- useMemo/useCallback for optimization
- Virtualization for long lists (if needed)

---

## 🔍 Error Handling

### Error Boundary
```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### API Errors
```typescript
// Handled globally by API interceptor
api.interceptors.response.use(
  response => response,
  error => {
    toast.showError(getErrorMessage(error));
    return Promise.reject(error);
  }
);
```

---

## 📝 Best Practices

1. **Component Size**: Keep components under 200 lines
2. **Prop Drilling**: Max 2 levels, then use Context
3. **Type Safety**: Always define TypeScript interfaces
4. **File Naming**: PascalCase for components, camelCase for utils
5. **Import Order**: React → Libraries → Local
6. **Comments**: Only for complex logic, code should be self-documenting

---

## 🔗 Related Documentation

- [README.md](README.md) - Setup and installation
- [API_INTEGRATION.md](API_INTEGRATION.md) - Backend API guide
- [FRONTEND_ROADMAP.md](FRONTEND_ROADMAP.md) - Features and status
