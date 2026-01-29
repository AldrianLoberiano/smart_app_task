# Smart Appointment & Task Management System

A full-stack web application for managing appointments and tasks with role-based access control, built with modern technologies and clean architecture principles.

## Architecture Overview

### **Clean Architecture Layers**

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React + TypeScript - Components, Pages, Services)     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                      API Layer                          │
│           (ASP.NET Core Controllers + DTOs)             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                   │
│        (Services - Business Rules & Validation)         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                      │
│    (Repositories - EF Core + Database Operations)       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                         │
│              (PostgreSQL Database)                       │
└─────────────────────────────────────────────────────────┘
```

### **Why Clean Architecture?**

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to unit test business logic independently
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Easy to add new features or swap implementations
5. **Dependency Rule**: Dependencies point inward (UI → Business Logic → Data)

## Technology Stack

### **Backend**

- **Framework**: ASP.NET Core 8.0 Web API
- **Language**: C# 12
- **ORM**: Entity Framework Core 8.0
- **Database**: PostgreSQL 16
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: FluentValidation
- **Logging**: Serilog

### **Frontend**

- **Framework**: React 18
- **Language**: TypeScript 5
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Material-UI (MUI)
- **Form Handling**: React Hook Form

## Database Schema

### **Entities and Relationships**

```sql
┌─────────────────┐         ┌─────────────────┐
│     Users       │         │  Appointments   │
├─────────────────┤         ├─────────────────┤
│ Id (PK)         │────┐    │ Id (PK)         │
│ Username        │    │    │ Title           │
│ Email           │    │    │ Description     │
│ PasswordHash    │    │    │ StartDateTime   │
│ Role            │    │    │ EndDateTime     │
│ CreatedAt       │    │    │ Location        │
│ UpdatedAt       │    │    │ Status          │
└─────────────────┘    │    │ UserId (FK)     │←──┘
                       │    │ CreatedAt       │
                       │    │ UpdatedAt       │
                       │    └─────────────────┘
                       │
                       │    ┌─────────────────┐
                       │    │     Tasks       │
                       │    ├─────────────────┤
                       │    │ Id (PK)         │
                       │    │ Title           │
                       │    │ Description     │
                       │    │ DueDate         │
                       │    │ Priority        │
                       │    │ Status          │
                       │    │ IsCompleted     │
                       └────│ UserId (FK)     │
                            │ CreatedAt       │
                            │ UpdatedAt       │
                            └─────────────────┘
```

### **Relationships**

- **One-to-Many**: One User can have many Appointments
- **One-to-Many**: One User can have many Tasks
- **Foreign Keys**: Enforce referential integrity

## Features

### **Authentication & Authorization**

- User Registration with password hashing (BCrypt)
- JWT-based Login with access tokens
- Role-based authorization (Admin, User)
- Protected API endpoints
- Token validation and expiration

### **Appointment Management**

- Create, Read, Update, Delete appointments
- Filter by date range and status
- Calendar view integration
- Status tracking (Scheduled, Completed, Cancelled)
- Conflict detection

### **Task Management**

- Create, Read, Update, Delete tasks
- Priority levels (Low, Medium, High)
- Status tracking (Pending, InProgress, Completed)
- Due date reminders
- Mark tasks as complete

### **Additional Features**

- Global error handling
- Request/Response logging
- Data validation (server & client)
- Responsive UI design
- Search and filter capabilities

## Project Structure

### **Backend Structure**

```
Backend/
├── Controllers/           # API endpoints
│   ├── AuthController.cs
│   ├── AppointmentsController.cs
│   └── TasksController.cs
├── Services/             # Business logic
│   ├── Interfaces/
│   ├── AuthService.cs
│   ├── AppointmentService.cs
│   └── TaskService.cs
├── Repositories/         # Data access
│   ├── Interfaces/
│   ├── UserRepository.cs
│   ├── AppointmentRepository.cs
│   └── TaskRepository.cs
├── Models/              # Domain entities
│   ├── User.cs
│   ├── Appointment.cs
│   └── Task.cs
├── DTOs/                # Data transfer objects
│   ├── Auth/
│   ├── Appointments/
│   └── Tasks/
├── Data/                # EF Core context
│   └── ApplicationDbContext.cs
├── Middleware/          # Custom middleware
│   ├── ErrorHandlingMiddleware.cs
│   └── LoggingMiddleware.cs
├── Helpers/             # Utility classes
│   └── JwtHelper.cs
├── Program.cs           # Application entry point
└── appsettings.json     # Configuration
```

### **Frontend Structure**

```
Frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/
│   │   ├── appointments/
│   │   └── tasks/
│   ├── pages/              # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Appointments.tsx
│   │   └── Tasks.tsx
│   ├── services/           # API integration
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── appointmentService.ts
│   │   └── taskService.ts
│   ├── contexts/           # React Context
│   │   └── AuthContext.tsx
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   └── validation.ts
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── package.json
└── tsconfig.json
```

## Setup Instructions

### **Prerequisites**

- .NET 8.0 SDK
- Node.js 18+ & npm
- PostgreSQL 16+
- Visual Studio Code or Visual Studio 2022

### **Backend Setup**

1. **Navigate to Backend folder**

```bash
cd Backend
```

2. **Restore NuGet packages**

```bash
dotnet restore
```

3. **Update database connection string in appsettings.json**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=SmartAppointmentDB;Username=your_user;Password=your_password"
  }
}
```

4. **Apply database migrations**

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

5. **Run the API**

```bash
dotnet run
```

API will be available at `https://localhost:5001`

### **Frontend Setup**

1. **Navigate to Frontend folder**

```bash
cd Frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Update API URL in src/services/api.ts if needed**

```typescript
const API_BASE_URL = "https://localhost:5001/api";
```

4. **Run the development server**

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Security Best Practices

1. **Password Security**
   - BCrypt hashing with salt
   - Minimum password requirements
   - Never store plain-text passwords

2. **JWT Token Security**
   - Short expiration times (1 hour)
   - Secure token storage (httpOnly cookies or localStorage with caution)
   - Token validation on every request

3. **API Security**
   - HTTPS only in production
   - CORS configuration
   - Rate limiting
   - Input validation and sanitization

4. **Database Security**
   - Parameterized queries (EF Core)
   - Least privilege principle
   - Regular backups

## API Endpoints

### **Authentication**

```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
GET  /api/auth/profile     - Get current user profile
```

### **Appointments**

```
GET    /api/appointments              - Get all appointments
GET    /api/appointments/{id}         - Get appointment by ID
POST   /api/appointments              - Create appointment
PUT    /api/appointments/{id}         - Update appointment
DELETE /api/appointments/{id}         - Delete appointment
GET    /api/appointments/filter?start={date}&end={date}
```

### **Tasks**

```
GET    /api/tasks              - Get all tasks
GET    /api/tasks/{id}         - Get task by ID
POST   /api/tasks              - Create task
PUT    /api/tasks/{id}         - Update task
DELETE /api/tasks/{id}         - Delete task
PATCH  /api/tasks/{id}/complete - Mark task as complete
```

## Testing

### **Backend Testing**

```bash
cd Backend.Tests
dotnet test
```

### **Frontend Testing**

```bash
cd Frontend
npm test
```

## Design Patterns Used

1. **Repository Pattern**: Abstracts data access logic
2. **Service Pattern**: Encapsulates business logic
3. **Dependency Injection**: Promotes loose coupling
4. **DTO Pattern**: Separates internal models from API contracts
5. **Middleware Pattern**: Cross-cutting concerns (logging, error handling)

## Learning Resources

### **Clean Architecture**

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [ASP.NET Core Architecture Guide](https://docs.microsoft.com/en-us/dotnet/architecture/)

### **Entity Framework Core**

- [EF Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [Code First Migrations](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/)

### **React & TypeScript**

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Copyright Notice

Copyright © 2026 Aldrian Loberiano.  
This project is intended strictly for personal use.  
Any unauthorized commercial use, distribution, or copying of the code or materials in this repository is prohibited and may constitute copyright infringement.

## Support

For questions or issues, please create an issue in the repository.
