# Rental App Server API Documentation

## Authentication Middleware Implementation

The server now includes a complete authentication middleware system with the following components:

### Core Components

1. **Supabase Configuration** (`config/supabase.ts`)
   - Server-side Supabase clients (admin and regular)
   - Environment variable validation

2. **JWT Utilities** (`utils/jwt.ts`)
   - Token verification functions
   - Token extraction from headers
   - Supabase-specific JWT handling

3. **User Service** (`services/userService.ts`)
   - Database profile management
   - User role handling (manager/tenant)
   - Profile creation and retrieval

4. **Authentication Middleware** (`middleware/auth.ts`)
   - `authenticate` - Required authentication
   - `optionalAuth` - Optional authentication
   - `requireRole` - Role-based authorization
   - `requireManager` - Manager-only access
   - `requireTenant` - Tenant-only access
   - `requireOwnership` - Resource ownership validation

### API Endpoints

#### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Create new user account |
| POST | `/api/auth/signin` | Public | Sign in user |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/auth/me` | Protected | Get current user profile |
| POST | `/api/auth/signout` | Protected | Sign out user |
| GET | `/api/auth/health` | Public | Health check |

#### Properties Routes (`/api/properties`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/properties` | Public/Optional Auth | Get all properties (with optional user context) |
| GET | `/api/properties/my-properties` | Manager Only | Get manager's properties |
| POST | `/api/properties` | Manager Only | Create new property |

#### Tenant Routes (`/api/tenants`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tenants/applications` | Tenant Only | Get tenant's applications |
| POST | `/api/tenants/applications` | Tenant Only | Submit property application |
| GET | `/api/tenants/favorites` | Tenant Only | Get favorite properties |
| POST | `/api/tenants/favorites` | Tenant Only | Add property to favorites |
| DELETE | `/api/tenants/favorites/:propertyId` | Tenant Only | Remove from favorites |

### Usage Examples

#### 1. Sign Up New User
```javascript
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "tenant" // or "manager"
}
```

#### 2. Sign In
```javascript
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 3. Access Protected Route
```javascript
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### 4. Create Property (Manager Only)
```javascript
POST /api/properties
Authorization: Bearer <manager_access_token>
Content-Type: application/json

{
  "name": "Beautiful Apartment",
  "description": "A beautiful apartment in downtown",
  "price_per_month": 2000,
  "security_deposit": 2000,
  "application_fee": 50,
  "beds": 2,
  "baths": 1,
  "square_feet": 1000,
  "property_type": "Apartment",
  "amenities": ["WiFi", "Parking"],
  "highlights": ["GreatView", "CloseToTransit"],
  "is_pets_allowed": true,
  "is_parking_included": true,
  "location": {
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "country": "United States",
    "postal_code": "90210"
  }
}
```

#### 5. Apply for Property (Tenant Only)
```javascript
POST /api/tenants/applications
Authorization: Bearer <tenant_access_token>
Content-Type: application/json

{
  "property_id": 1,
  "message": "I'm very interested in this property."
}
```

### Environment Variables Required

```env
# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Response Formats

#### Success Response
```json
{
  "data": {}, // Response data
  "message": "Success message"
}
```

#### Error Response
```json
{
  "error": "Error message",
  "details": "Optional error details"
}
```

#### Authentication Response
```json
{
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": 1234567890,
    "token_type": "bearer"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "created_at": "2023-01-01T00:00:00Z"
  },
  "appUser": {
    "role": "tenant",
    "profile": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "phone_number": "+1234567890"
    }
  }
}
```

### Testing the API

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Test health check:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Test sign up:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User","phone":"+1234567890","role":"tenant"}'
   ```

4. **Test protected route:**
   ```bash
   curl -X GET http://localhost:3001/api/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Security Features

1. **JWT Token Validation** - All protected routes verify tokens
2. **Role-Based Access Control** - Manager/tenant specific endpoints
3. **Resource Ownership** - Users can only access their own resources
4. **CORS Configuration** - Properly configured for client communication
5. **Request Validation** - Input validation and sanitization
6. **Error Handling** - Comprehensive error handling and logging

### Integration with Client

The client-side `AuthProvider` should be updated to use these server endpoints:

```javascript
// Update the client's AuthProvider to call server endpoints
const signIn = async (credentials) => {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  return response.json()
}
```

This completes the full-stack authentication implementation with proper server-side middleware, role-based access control, and comprehensive API endpoints.