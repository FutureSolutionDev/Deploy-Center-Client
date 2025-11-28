# Deploy Center - Coding Standards

This document outlines the coding standards and conventions used in both Server and Client repositories to maintain consistency across the entire project.

## 📋 Naming Conventions

### PascalCase (Server & Client Alignment)

All properties, variables, functions, and interfaces follow **PascalCase** naming convention:

#### ✅ Correct Examples

```typescript
// Interfaces
export interface IApiResponse<T> {
  Success: boolean;
  Message: string;
  Data?: T;
  Error?: string;
  Code: number;
}

export interface IUser {
  Id: number;
  Username: string;
  Email: string;
  Password: string;
  Role: EUserRole;
  IsActive: boolean;
  TwoFactorEnabled: boolean;
  LastLogin: Date | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}

// Variables and Properties
const UserId = 123;
const AccessToken = "token_value";
const IsActive = true;

// Function Parameters
function CreateUser(Username: string, Email: string, Password: string) {
  // ...
}

// React Component Props
interface IButtonProps {
  Label: string;
  OnClick: () => void;
  IsDisabled: boolean;
}
```

#### ❌ Incorrect Examples

```typescript
// DO NOT USE camelCase
interface IApiResponse<T> {
  success: boolean;      // ❌ Wrong
  message: string;       // ❌ Wrong
  data?: T;              // ❌ Wrong
}

// DO NOT USE snake_case
const user_id = 123;           // ❌ Wrong
const access_token = "token";  // ❌ Wrong
```

### Enum Naming

- Enum names: **PascalCase** with `E` prefix
- Enum values: **PascalCase**

```typescript
export enum EUserRole {
  Admin = 'admin',
  Developer = 'developer',
  Viewer = 'viewer',
}

export enum EDeploymentStatus {
  Queued = 'queued',
  Pending = 'pending',
  InProgress = 'inProgress',
  Success = 'success',
  Failed = 'failed',
}
```

### Interface Naming

- All interfaces must start with `I` prefix
- Use PascalCase for interface names

```typescript
interface IProject {
  Id: number;
  Name: string;
  RepoUrl: string;
  Branch: string;
}

interface IDeployment {
  Id: number;
  ProjectId: number;
  Status: EDeploymentStatus;
  CreatedAt: Date;
}
```

## 🏗️ Code Structure

### 1. React Components

```typescript
import React, { useState, useEffect } from 'react';

interface IMyComponentProps {
  Title: string;
  OnSave: (Data: any) => void;
  IsLoading: boolean;
}

export const MyComponent: React.FC<IMyComponentProps> = ({ Title, OnSave, IsLoading }) => {
  const [Data, setData] = useState<any>(null);
  
  const HandleSubmit = () => {
    OnSave(Data);
  };
  
  return (
    <div>
      <h1>{Title}</h1>
    </div>
  );
};
```

### 2. Services

```typescript
export class ProjectsService {
  private readonly ApiInstance: AxiosInstance;

  constructor() {
    this.ApiInstance = ApiInstance;
  }

  public async GetAll(): Promise<IProject[]> {
    const Response = await this.ApiInstance.get('/projects');
    return Response.data.Data?.Projects || [];
  }

  public async GetById(Id: number): Promise<IProject> {
    const Response = await this.ApiInstance.get(`/projects/${Id}`);
    return Response.data.Data?.Project;
  }

  public async Create(Data: ICreateProjectData): Promise<IProject> {
    const Response = await this.ApiInstance.post('/projects', Data);
    return Response.data.Data?.Project;
  }
}
```

### 3. Controllers (Server-side)

```typescript
export class AuthController {
  private readonly AuthService: AuthService;

  constructor() {
    this.AuthService = new AuthService();
  }

  public Login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Username, Password } = req.body;
      
      if (!Username || !Password) {
        ResponseHelper.ValidationError(res, 'Missing required fields');
        return;
      }

      const Result = await this.AuthService.Login({ Username, Password });
      ResponseHelper.Success(res, 'Login successful', { User: Result.User });
    } catch (error) {
      Logger.Error('Login failed', error as Error);
      ResponseHelper.Unauthorized(res, (error as Error).message);
    }
  };
}
```

## 📦 Import Organization

Order imports logically:

```typescript
// 1. External libraries
import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// 2. Internal contexts and hooks
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// 3. Services and utilities
import { ProjectsService } from '@/services/projectsService';

// 4. Types
import type { IProject } from '@/types';
```

## 🎯 API Response Format

All API responses must follow this structure:

```typescript
{
  Success: boolean;
  Message: string;
  Data?: {
    // Response data here
  };
  Error?: string;
  Code: number;
}
```

### Examples

```typescript
// Success Response
{
  Success: true,
  Message: "User logged in successfully",
  Data: {
    User: {
      Id: 1,
      Username: "admin",
      Email: "admin@example.com"
    }
  },
  Code: 200
}

// Error Response
{
  Success: false,
  Message: "Authentication failed",
  Error: "Invalid credentials",
  Code: 401
}
```

## 🔧 Type Definitions

### Always Use Strong Typing

```typescript
// ✅ Good
interface IFormData {
  Username: string;
  Email: string;
  Password: string;
}

const [FormData, setFormData] = useState<IFormData>({
  Username: "",
  Email: "",
  Password: "",
});

// ❌ Bad
const [formData, setFormData] = useState<any>({});
```

## 🎨 Component Props

```typescript
interface ICardProps {
  Title: string;
  Description?: string;
  Children?: React.ReactNode;
  OnClick?: () => void;
  IsLoading?: boolean;
}

export const Card: React.FC<ICardProps> = ({
  Title,
  Description,
  Children,
  OnClick,
  IsLoading = false,
}) => {
  // Component implementation
};
```

## 📝 Comments and Documentation

### Use JSDoc for Functions

```typescript
/**
 * Create a new project
 * @param Data - Project creation data
 * @returns Created project
 */
public async CreateProject(Data: ICreateProjectData): Promise<IProject> {
  // Implementation
}
```

### File Headers

```typescript
/**
 * Authentication Service
 * Handles user authentication and token management
 * Following SOLID principles and PascalCase naming convention
 */
```

## 🚫 Avoid These Patterns

### ❌ Don't Mix Naming Conventions

```typescript
// ❌ Bad - Mixed conventions
interface IUser {
  id: number;           // ❌ camelCase
  Username: string;     // ✅ PascalCase
  email_address: string; // ❌ snake_case
}

// ✅ Good - Consistent PascalCase
interface IUser {
  Id: number;
  Username: string;
  Email: string;
}
```

### ❌ Don't Use Generic Names

```typescript
// ❌ Bad
const Data = getUserData();
const Temp = processData();

// ✅ Good
const UserProfile = getUserData();
const ProcessedProjects = processData();
```

## 🔄 Async/Await Pattern

Always use async/await for asynchronous operations:

```typescript
// ✅ Good
const FetchProjects = async () => {
  try {
    const Projects = await ProjectsService.GetAll();
    setProjects(Projects);
  } catch (Error) {
    console.error('Failed to fetch projects', Error);
  } finally {
    setLoading(false);
  }
};

// ❌ Bad
ProjectsService.GetAll().then(projects => {
  setProjects(projects);
}).catch(error => {
  console.error(error);
});
```

## 🎭 React Hooks Naming

```typescript
// State hooks - use descriptive names
const [Projects, setProjects] = useState<IProject[]>([]);
const [IsLoading, setIsLoading] = useState<boolean>(false);
const [ErrorMessage, setErrorMessage] = useState<string | null>(null);

// Event handlers - use Handle prefix
const HandleSubmit = async (Event: React.FormEvent) => {
  Event.preventDefault();
  // Handle form submission
};

const HandleDelete = async (Id: number) => {
  // Handle deletion
};
```

## ✅ Summary

1. **Always use PascalCase** for all properties, variables, and functions
2. **Prefix interfaces with `I`** (e.g., `IUser`, `IProject`)
3. **Prefix enums with `E`** (e.g., `EUserRole`, `EDeploymentStatus`)
4. **Use strong typing** - avoid `any` when possible
5. **Follow the standard API response format**
6. **Use async/await** for asynchronous operations
7. **Write clear, descriptive variable names**
8. **Add JSDoc comments** for public functions
9. **Keep code consistent** across Server and Client

---

**Important**: This document applies to **both Server and Client** repositories. All code must follow these standards to maintain consistency across the project.
