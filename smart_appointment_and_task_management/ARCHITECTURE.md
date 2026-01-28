# Architecture Deep Dive

## Clean Architecture Principles

This project follows **Clean Architecture** (also known as Onion Architecture or Hexagonal Architecture) principles to create a maintainable, testable, and scalable application.

### Core Principles

1. **Dependency Rule**: Dependencies always point inward
   - UI depends on Business Logic
   - Business Logic depends on Data Access
   - Data Access depends on Database
   - **Never the reverse**

2. **Separation of Concerns**: Each layer has a single responsibility
   - **Controllers**: Handle HTTP requests/responses
   - **Services**: Implement business logic
   - **Repositories**: Handle data access
   - **Models**: Define domain entities

## Backend Architecture

### Layer Breakdown

#### 1. **Models Layer (Domain)**

- **Purpose**: Define core business entities
- **Location**: `Backend/Models/`
- **Components**:
  - `User.cs`: User entity with authentication data
  - `Appointment.cs`: Appointment scheduling entity
  - `TaskItem.cs`: Task management entity

**Why?** These are your business objects that represent real-world concepts. They should be independent of databases, frameworks, or UI.

```csharp
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    // Navigation properties for relationships
    public ICollection<Appointment> Appointments { get; set; }
}
```

#### 2. **DTOs Layer (Data Transfer Objects)**

- **Purpose**: Define contracts for API communication
- **Location**: `Backend/DTOs/`
- **Why separate from Models?**
  - **Security**: Don't expose internal model structure
  - **Flexibility**: Change internal models without breaking API
  - **Validation**: Add API-specific validation attributes

```csharp
public class CreateAppointmentDto
{
    [Required]
    public string Title { get; set; }
    // Only fields needed for creation
}
```

#### 3. **Data Access Layer**

- **Components**:
  - `ApplicationDbContext.cs`: EF Core database context
  - Repository Interfaces: `IUserRepository`, `IAppointmentRepository`
  - Repository Implementations: Concrete data access logic

**Repository Pattern Benefits**:

- Abstracts database operations
- Easy to mock for testing
- Can swap database implementations

```csharp
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User> CreateAsync(User user);
}
```

#### 4. **Business Logic Layer (Services)**

- **Purpose**: Implement business rules and validation
- **Location**: `Backend/Services/`
- **Responsibilities**:
  - Validate business rules
  - Coordinate between repositories
  - Transform between DTOs and Models

**Example Business Logic**:

```csharp
public async Task<AppointmentDto> CreateAsync(CreateAppointmentDto dto, int userId)
{
    // Business rule: Check for conflicts
    if (await HasConflict(dto.StartDateTime, dto.EndDateTime))
        throw new InvalidOperationException("Conflict detected");

    // Business rule: Can't schedule in the past
    if (dto.StartDateTime < DateTime.UtcNow)
        throw new InvalidOperationException("Cannot schedule in past");

    // Create and save
    var appointment = MapToEntity(dto, userId);
    return await _repository.CreateAsync(appointment);
}
```

#### 5. **Presentation Layer (Controllers)**

- **Purpose**: Handle HTTP requests and responses
- **Location**: `Backend/Controllers/`
- **Responsibilities**:
  - Route requests to services
  - Validate request data
  - Return appropriate HTTP status codes

```csharp
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
{
    var userId = GetUserIdFromClaims();
    var result = await _service.CreateAsync(dto, userId);
    return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
}
```

### Cross-Cutting Concerns

#### Middleware

Located in `Backend/Middleware/`:

1. **ErrorHandlingMiddleware**
   - Catches all unhandled exceptions
   - Returns consistent error responses
   - Logs errors

2. **LoggingMiddleware**
   - Logs all HTTP requests/responses
   - Tracks request duration
   - Helps with debugging

**Why Middleware?**

- Centralizes cross-cutting logic
- Keeps controllers clean
- Executes for all requests

#### Helpers

Located in `Backend/Helpers/`:

1. **JwtHelper**
   - Generates JWT tokens
   - Encapsulates token configuration
   - Reusable across services

## Frontend Architecture

### Component Structure

#### 1. **Pages**

- **Location**: `src/pages/`
- **Purpose**: Top-level route components
- **Examples**: `Login.tsx`, `Dashboard.tsx`, `Appointments.tsx`

**Characteristics**:

- Connected to routing
- Manage page-level state
- Orchestrate multiple components

#### 2. **Components**

- **Location**: `src/components/`
- **Purpose**: Reusable UI building blocks
- **Structure**:
  - `common/`: Shared components (Layout, Navbar, ProtectedRoute)
  - `appointments/`: Appointment-specific components
  - `tasks/`: Task-specific components

**Component Design**:

```tsx
interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: number) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onEdit,
  onDelete
}) => {
  // Presentational logic only
  return (/* JSX */);
};
```

#### 3. **Services**

- **Location**: `src/services/`
- **Purpose**: API communication layer
- **Benefits**:
  - Centralized API calls
  - Type-safe requests
  - Error handling

```typescript
export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>("/appointments");
    return response.data;
  },
};
```

#### 4. **Context (State Management)**

- **Location**: `src/contexts/`
- **Purpose**: Global state management
- **Example**: `AuthContext`

**Why Context API?**

- Built into React
- Avoids prop drilling
- Perfect for authentication state

```tsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context; // { user, login, logout, etc. }
};
```

#### 5. **Types**

- **Location**: `src/types/`
- **Purpose**: TypeScript type definitions
- **Benefits**:
  - Type safety
  - Auto-completion
  - Compile-time error checking

## Authentication Flow

### Registration Process

```
1. User submits registration form
   ↓
2. Frontend → POST /api/auth/register
   ↓
3. AuthController validates data
   ↓
4. AuthService checks for duplicates
   ↓
5. Password hashed with BCrypt
   ↓
6. User saved to database
   ↓
7. JWT token generated
   ↓
8. Token + user info returned
   ↓
9. Frontend stores token in localStorage
   ↓
10. User redirected to dashboard
```

### Login Process

```
1. User submits credentials
   ↓
2. Frontend → POST /api/auth/login
   ↓
3. AuthService finds user
   ↓
4. BCrypt verifies password
   ↓
5. JWT token generated
   ↓
6. Token returned to frontend
   ↓
7. Frontend stores token
   ↓
8. Token sent in Authorization header for future requests
```

### Protected Requests

```
1. User makes API request
   ↓
2. Axios interceptor adds: Authorization: Bearer <token>
   ↓
3. JWT middleware validates token
   ↓
4. User claims extracted from token
   ↓
5. Request proceeds to controller
   ↓
6. Controller gets userId from claims
   ↓
7. Service uses userId for authorization
```

## Database Design

### Entity Relationships

```
User (1) ─────── (N) Appointment
  │
  └────────────── (N) TaskItem
```

**One-to-Many Relationships**:

- One User has many Appointments
- One User has many Tasks

**Foreign Keys**:

- `Appointment.UserId` → `User.Id`
- `TaskItem.UserId` → `User.Id`

**Cascade Delete**:

- Deleting a User deletes all their Appointments and Tasks

### Indexes for Performance

```csharp
// Unique indexes for lookups
entity.HasIndex(e => e.Username).IsUnique();
entity.HasIndex(e => e.Email).IsUnique();

// Performance indexes for queries
entity.HasIndex(e => e.StartDateTime);
entity.HasIndex(e => e.Status);
entity.HasIndex(e => e.DueDate);
```

**Why Indexes?**

- Speed up SELECT queries
- Essential for foreign key lookups
- Trade-off: Slower INSERT/UPDATE

## Best Practices Implemented

### 1. **Dependency Injection**

All dependencies are injected via constructors:

```csharp
public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _repository;

    public AppointmentService(IAppointmentRepository repository)
    {
        _repository = repository;
    }
}
```

**Benefits**:

- Loose coupling
- Easy to test (mock dependencies)
- Managed by DI container

### 2. **Async/Await Pattern**

All I/O operations are asynchronous:

```csharp
public async Task<User> GetByIdAsync(int id)
{
    return await _context.Users.FindAsync(id);
}
```

**Benefits**:

- Better scalability
- Non-blocking operations
- Efficient thread usage

### 3. **Error Handling**

Centralized error handling in middleware:

```csharp
catch (KeyNotFoundException)
{
    statusCode = HttpStatusCode.NotFound;
}
catch (UnauthorizedAccessException)
{
    statusCode = HttpStatusCode.Unauthorized;
}
```

### 4. **Validation**

Multiple validation layers:

- **Client-side**: Form validation in React
- **DTO Validation**: Data annotations in C#
- **Business Logic**: Service layer validation

### 5. **Security**

- Password hashing with BCrypt
- JWT token authentication
- HTTPS in production
- CORS configuration
- SQL injection prevention (parameterized queries via EF Core)

## API Design Principles

### RESTful Conventions

```
GET    /api/appointments      - List all
GET    /api/appointments/5    - Get one
POST   /api/appointments      - Create
PUT    /api/appointments/5    - Update
DELETE /api/appointments/5    - Delete
PATCH  /api/tasks/5/complete  - Partial update
```

### HTTP Status Codes

- **200 OK**: Successful GET, PUT
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Response Format

Consistent JSON structure:

```json
{
  "id": 1,
  "title": "Meeting",
  "status": "Scheduled",
  "createdAt": "2026-01-28T10:00:00Z"
}
```

## Testing Strategy

### Unit Tests

Test individual components in isolation:

```csharp
[Fact]
public async Task CreateAppointment_WithValidData_ReturnsAppointment()
{
    // Arrange
    var mockRepo = new Mock<IAppointmentRepository>();
    var service = new AppointmentService(mockRepo.Object);

    // Act
    var result = await service.CreateAsync(dto, userId);

    // Assert
    Assert.NotNull(result);
}
```

### Integration Tests

Test API endpoints:

```csharp
[Fact]
public async Task PostAppointment_ReturnsCreated()
{
    var response = await _client.PostAsync("/api/appointments", content);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
}
```

## Performance Considerations

1. **Database Queries**
   - Use `Include()` for related data (avoid N+1 queries)
   - Add indexes on frequently queried columns
   - Use pagination for large datasets

2. **Caching**
   - Consider Redis for frequently accessed data
   - Cache user profiles
   - Cache static data

3. **API Performance**
   - Async operations
   - Connection pooling (automatic in EF Core)
   - Response compression

## Scalability

### Horizontal Scaling

- Stateless API (JWT in requests)
- Database connection pooling
- Load balancer compatible

### Vertical Scaling

- Optimize queries
- Add database indexes
- Increase server resources

## Deployment

### Backend

```bash
dotnet publish -c Release
# Deploy to Azure App Service, AWS, or Docker
```

### Frontend

```bash
npm run build
# Deploy to Netlify, Vercel, or CDN
```

### Database

- Use managed PostgreSQL (Azure, AWS RDS)
- Regular backups
- Connection string in environment variables

## Conclusion

This architecture provides:

- ✅ Clear separation of concerns
- ✅ Easy to test and maintain
- ✅ Scalable and extensible
- ✅ Industry-standard practices
- ✅ Type safety (C# + TypeScript)
- ✅ Secure by design
