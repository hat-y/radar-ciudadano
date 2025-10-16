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
