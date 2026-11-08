# Deploy Center - Client

> [!WARNING]
> **This project is archived and no longer maintained.** Deploy Center is not running anywhere, receives no fixes (security fixes included), and should not be installed or used.
>
> Its successor is **[Dhow](https://github.com/Khaymah/dhow)**, a self-hosted Continuous Deployment control plane built from the ground up by the same team. Please use Dhow for new and existing deployments.
>
> **هذا المشروع مؤرشف ولم يعد يُطوَّر.** لا يعمل Deploy Center في أي مكان، ولا تصله أي إصلاحات (ومنها الإصلاحات الأمنية)، فلا تثبّته ولا تستخدمه. البديل هو **[داو (Dhow)](https://github.com/Khaymah/dhow)**.

Modern React-based web interface for Deploy Center CI/CD platform.

## 🚀 Features

- ✅ Real-time deployment updates via Socket.IO
- ✅ Material-UI based responsive design
- ✅ Multi-language support (English/Arabic)
- ✅ Dark/Light theme with customizable colors
- ✅ Toast notifications for user feedback
- ✅ Secure authentication with JWT
- ✅ Role-based access control
- ✅ Project and deployment management
- ✅ Live deployment logs streaming
- ✅ Statistics and analytics dashboard

## 📋 Prerequisites

- [Bun](https://bun.sh) 1.4+ (the project's package manager and script runner)
- Deploy Center Server running

## 🛠️ Installation

```bash
# Install dependencies (bun.lock is the only lockfile)
bun install
```

## ⚙️ Configuration

Create `.env` file in the client directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Optional: Override default settings
VITE_SOCKET_PATH=/v1/ws
VITE_API_TIMEOUT=30000
```

## 🏃 Development

```bash
# Start development server
bun run dev

# Server will start at http://localhost:5173
```

## 🔨 Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

Build output will be in `dist/` directory.

## 📁 Project Structure

```
client/
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts (Auth, Theme, Toast, etc.)
│   ├── hooks/           # Custom hooks (useSocket, etc.)
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── App.tsx          # Root component
├── .env                 # Environment variables
└── vite.config.ts       # Vite configuration
```

## 🔗 Documentation

- [Architecture Guide](ARCHITECTURE.md) - Component structure
- [API Integration](API_INTEGRATION.md) - Backend integration
- [Frontend Roadmap](FRONTEND_ROADMAP.md) - Status and plans

## 📞 Support

For documentation and support, see [Current Status](../CURRENT_STATUS.md)
