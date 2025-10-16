## Running the Project with Docker

This project includes a Docker setup for streamlined development and deployment. The provided `Dockerfile` and `docker-compose.yml` are configured for a Node.js (NestJS) application.

### Requirements
- **Docker** and **Docker Compose** installed on your system.
- The project uses **Node.js v22.13.1-slim** as specified in the Dockerfile.

### Build and Run Instructions

1. **Build and start the application:**
   ```sh
   docker compose up --build
   ```
   This will build the Docker image and start the `typescript-app` service.

2. **Accessing the application:**
   - The app will be available on [http://localhost:3000](http://localhost:3000) by default.
   - Port **3000** is exposed and mapped from the container to your host.

### Environment Variables
- No required environment variables are specified by default.
- If you need to use a `.env` file, uncomment the `env_file: ./.env` line in `docker-compose.yml` and provide your environment variables there.

### Special Configuration
- The container runs as a non-root user (`appuser`) for improved security.
- No external services (databases, caches, etc.) are configured by default.
- No persistent volumes or custom networks are defined.

### Service Details
- **Service Name:** `typescript-app`
- **Port Exposed:** `3000` (NestJS default)

---

_Refer to the Dockerfile and docker-compose.yml for further customization as needed._

## Passwordless Authentication (Magic Links)

This application uses a passwordless authentication system with magic links sent via email. Users don't need to register with a password - they simply log in using their email address.

### How It Works

1. **Request Login**: User enters their email address
   - `POST /auth/request-login` with `{ "email": "user@example.com" }`
   - System creates user (if new) with `emailVerified: false`
   - Generates a unique token valid for 15 minutes
   - Magic link is sent to the user's email

2. **Verify Login**: User clicks the magic link button in their email
   - Magic link format: `${FRONT}/auth/verify?token=xxxxx`
   - `GET /auth/verify-login?token=xxxxx`
   - User's email is marked as verified (`emailVerified: true`)
   - If valid, returns JWT access token

3. **Access Protected Routes**: Use the JWT token in Authorization header
   - `Authorization: Bearer <token>`

### Email Configuration

The system uses [Resend](https://resend.com) for sending emails. You need to:

1. Create a Resend account and get an API key
2. Set up the following environment variables:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   FRONT=http://localhost:5173  # Your frontend URL
   APP_NAME=Your App Name
   ```

### Security Features

- **Email Verification**: Users are created but marked as unverified until they click the magic link
- **Token Expiration**: Magic links expire after 15 minutes
- **Single Use**: Tokens are cleared after successful login
- **Secure Storage**: Tokens are stored with select: false in the database
- **JWT**: Access tokens have configurable expiration (default 7 days)
- **Anonymous Usernames**: Auto-generated unique usernames for privacy

### API Endpoints

#### Request Magic Link
```http
POST /auth/request-login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Si el email existe, recibirás un enlace de acceso en tu bandeja de entrada."
}
```

#### Verify Magic Link
```http
GET /auth/verify-login?token=xxxxx
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Frontend Integration

On your frontend, handle the magic link verification:

```typescript
// When user lands on /auth/verify?token=xxxxx
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (token) {
  const response = await fetch(`${API_URL}/auth/verify-login?token=${token}`);
  const data = await response.json();
  
  if (response.ok) {
    // Store JWT token
    localStorage.setItem('token', data.access_token);
    // Redirect to dashboard
    router.push('/dashboard');
  } else {
    // Show error
    console.error('Invalid or expired token');
  }
}
```

### Database Schema

Users table includes:
```typescript
@Column({ nullable: true, select: false })
loginToken!: string | null;

@Column({ type: 'timestamp', nullable: true })
loginTokenExpires!: Date | null;
```

### Testing Locally

1. Set up a test email or use a service like [Mailtrap](https://mailtrap.io) for development
2. Configure your `.env` file with proper credentials
3. Request a magic link and check your email
4. Click the button or copy the link to verify login
