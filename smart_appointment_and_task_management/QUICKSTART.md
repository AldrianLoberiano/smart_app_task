# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites Check

Run these commands to verify you have everything installed:

```bash
# Check .NET version (need 8.0+)
dotnet --version

# Check Node.js version (need 18+)
node --version

# Check npm version
npm --version

# Check PostgreSQL
psql --version
```

If anything is missing, install:

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/)

---

## Step 1: Database Setup

### Option A: Using PostgreSQL Locally

1. **Start PostgreSQL service**

```bash
# Windows (if installed as service)
net start postgresql-x64-16

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

2. **Create the database**

```bash
psql -U postgres
```

```sql
CREATE DATABASE SmartAppointmentDB;
\q
```

3. **Update connection string** in `Backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=SmartAppointmentDB;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

### Option B: Using Docker (Easier)

```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=SmartAppointmentDB \
  -p 5432:5432 \
  -d postgres:16
```

Connection string:

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=SmartAppointmentDB;Username=postgres;Password=postgres"
```

---

## Step 2: Backend Setup

Open a terminal in the `Backend` folder:

```bash
cd Backend

# 1. Restore packages
dotnet restore

# 2. Create database migrations
dotnet ef migrations add InitialCreate

# 3. Apply migrations to database
dotnet ef database update

# 4. Run the API
dotnet run
```

You should see:

```
info: Starting Smart Appointment & Task Management API
info: Now listening on: https://localhost:5001
```

### Test the API

Open your browser to: `https://localhost:5001`

You should see the Swagger UI with all API endpoints.

---

## Step 3: Frontend Setup

Open a **new terminal** in the `Frontend` folder:

```bash
cd Frontend

# 1. Install dependencies (first time only)
npm install

# 2. Start development server
npm run dev
```

You should see:

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

Open your browser to: `http://localhost:5173`

---

## 🎉 First Time Usage

### 1. Register a New Account

1. Open `http://localhost:5173`
2. Click "Register here"
3. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!`
4. Click "Register"

You'll be automatically logged in and redirected to the dashboard!

### 2. Create Your First Appointment

1. Click "View Appointments"
2. Click "New Appointment"
3. Fill in:
   - Title: "Team Meeting"
   - Description: "Discuss project roadmap"
   - Start: Tomorrow at 10:00 AM
   - End: Tomorrow at 11:00 AM
   - Location: "Conference Room A"
4. Click "Save"

### 3. Create Your First Task

1. Click "Tasks" in the navbar
2. Click "New Task"
3. Fill in:
   - Title: "Review code"
   - Description: "Review pull requests"
   - Due Date: Tomorrow
   - Priority: "High"
4. Click "Save"

---

## 🧪 Testing the API with Swagger

1. Open `https://localhost:5001` in your browser
2. You'll see Swagger UI with all endpoints

### Test Registration:

1. Find `POST /api/auth/register`
2. Click "Try it out"
3. Enter:

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "User"
}
```

4. Click "Execute"
5. Copy the `token` from the response

### Test Protected Endpoints:

1. Click the "Authorize" button at the top
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"
4. Now you can test protected endpoints like:
   - `GET /api/appointments`
   - `POST /api/appointments`
   - `GET /api/tasks`

---

## 🔍 Verifying Everything Works

### Check Backend Health

```bash
# Test auth endpoint
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"testuser","password":"Test123!"}'
```

Should return a JSON with a token.

### Check Database

```bash
psql -U postgres -d SmartAppointmentDB

# List tables
\dt

# Check users
SELECT * FROM "Users";

# Check appointments
SELECT * FROM "Appointments";

# Exit
\q
```

### Check Frontend

1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform an action (create appointment)
4. You should see API calls to `https://localhost:5001/api/...`

---

## 🐛 Common Issues & Fixes

### Issue 1: "Port already in use"

**Backend (Port 5001):**

```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5001 | xargs kill -9
```

**Frontend (Port 5173):**

```bash
# Kill process on port 5173
# Then restart: npm run dev
```

### Issue 2: "Cannot connect to database"

```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -p 5432

# If fails, check if PostgreSQL is running
# Windows
services.msc  # Look for PostgreSQL service

# Mac
brew services list

# Linux
sudo systemctl status postgresql
```

### Issue 3: "SSL connection error"

In `appsettings.json`, add to connection string:

```
"DefaultConnection": "Host=localhost;Port=5432;Database=SmartAppointmentDB;Username=postgres;Password=postgres;SSL Mode=Disable"
```

### Issue 4: "Migration already applied"

```bash
cd Backend

# Drop database and recreate
dotnet ef database drop
dotnet ef database update

# Or reset migrations
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Issue 5: "CORS error in browser"

Check `Backend/Program.cs` has:

```csharp
app.UseCors("AllowFrontend");
```

And CORS is configured for `http://localhost:5173`

### Issue 6: "401 Unauthorized"

1. Check token is being sent:
   - Open DevTools → Network
   - Check request headers for `Authorization: Bearer ...`

2. Check token hasn't expired (1 hour by default)
   - Re-login to get a new token

3. Check JWT configuration in `appsettings.json`

---

## 📱 API Endpoint Quick Reference

### Authentication

```bash
# Register
POST /api/auth/register
{
  "username": "john",
  "email": "john@example.com",
  "password": "Password123!"
}

# Login
POST /api/auth/login
{
  "usernameOrEmail": "john",
  "password": "Password123!"
}

# Get Profile
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

### Appointments

```bash
# Get all
GET /api/appointments
Headers: Authorization: Bearer <token>

# Get by ID
GET /api/appointments/1
Headers: Authorization: Bearer <token>

# Create
POST /api/appointments
Headers: Authorization: Bearer <token>
{
  "title": "Meeting",
  "description": "Team sync",
  "startDateTime": "2026-01-29T10:00:00Z",
  "endDateTime": "2026-01-29T11:00:00Z",
  "location": "Room 101"
}

# Update
PUT /api/appointments/1
Headers: Authorization: Bearer <token>
{
  "title": "Updated Meeting",
  "description": "Team sync",
  "startDateTime": "2026-01-29T10:00:00Z",
  "endDateTime": "2026-01-29T11:00:00Z",
  "location": "Room 101",
  "status": "Scheduled"
}

# Delete
DELETE /api/appointments/1
Headers: Authorization: Bearer <token>
```

### Tasks

```bash
# Get all
GET /api/tasks
Headers: Authorization: Bearer <token>

# Create
POST /api/tasks
Headers: Authorization: Bearer <token>
{
  "title": "Review code",
  "description": "Check PR #123",
  "dueDate": "2026-01-30T17:00:00Z",
  "priority": "High"
}

# Update
PUT /api/tasks/1
Headers: Authorization: Bearer <token>
{
  "title": "Review code",
  "description": "Check PR #123",
  "dueDate": "2026-01-30T17:00:00Z",
  "priority": "High",
  "status": "InProgress",
  "isCompleted": false
}

# Mark complete
PATCH /api/tasks/1/complete
Headers: Authorization: Bearer <token>

# Delete
DELETE /api/tasks/1
Headers: Authorization: Bearer <token>
```

---

## 🛠️ Development Workflow

### Making Changes to Backend

1. Make your code changes
2. The app auto-reloads (hot reload)
3. If you changed models:

```bash
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

### Making Changes to Frontend

1. Make your code changes
2. Vite auto-reloads the browser
3. Check browser console for errors

### Adding a New Package

**Backend:**

```bash
cd Backend
dotnet add package PackageName
```

**Frontend:**

```bash
cd Frontend
npm install package-name
```

---

## 📊 Viewing Logs

### Backend Logs

Logs are in `Backend/logs/` folder:

```bash
# View latest log
tail -f Backend/logs/log-20260128.txt

# Windows
Get-Content Backend\logs\log-20260128.txt -Tail 50 -Wait
```

### Frontend Logs

Open browser DevTools (F12) → Console tab

### Database Logs

```bash
# PostgreSQL logs location varies by OS
# Ubuntu/Debian
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# macOS (Homebrew)
tail -f /usr/local/var/log/postgresql@16.log

# Windows
# Check PostgreSQL data directory
```

---

## 🎓 Learning Exercises

### Exercise 1: Add a Priority Filter to Appointments

1. Add `Priority` field to `Appointment` model
2. Create migration and update database
3. Add filter endpoint in controller
4. Add filter UI in frontend

### Exercise 2: Add Email Notifications

1. Install email package: `dotnet add package MailKit`
2. Create `EmailService`
3. Send email on appointment creation
4. Test with a fake SMTP server

### Exercise 3: Add Search Functionality

1. Add search endpoint to controllers
2. Implement search in repositories
3. Add search bar in frontend
4. Filter results in real-time

---

## 🚀 Performance Tips

### Backend

```csharp
// Use AsNoTracking for read-only queries
var appointments = await _context.Appointments
    .AsNoTracking()
    .ToListAsync();

// Use pagination
var appointments = await _context.Appointments
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();
```

### Frontend

```tsx
// Use React.memo for expensive components
const AppointmentList = React.memo(({ appointments }) => {
  // Component logic
});

// Debounce search input
const debouncedSearch = useDebounce(searchTerm, 500);
```

---

## 📚 Additional Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [React Documentation](https://react.dev/)
- [Material-UI](https://mui.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---

## ✅ Checklist

Before considering your setup complete:

- [ ] Backend runs without errors
- [ ] Frontend loads in browser
- [ ] Can register a new user
- [ ] Can login
- [ ] Can create an appointment
- [ ] Can create a task
- [ ] Can edit and delete items
- [ ] Swagger UI works
- [ ] Database contains data

---

Need help? Check the logs, use debugger, or review the TUTORIAL.md for detailed explanations!
