# DB-Talk Setup Guide

Complete guide to set up and run DB-Talk on your local machine using Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Accessing the Application](#accessing-the-application)
- [Configuration Options](#configuration-options)
- [Troubleshooting](#troubleshooting)
- [Stopping the Application](#stopping-the-application)
- [Advanced Setup](#advanced-setup)

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software

1. **Docker Desktop** (or Docker Engine + Docker Compose)
   - Windows: Download from [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
   - Mac: Download from [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
   - Linux: Install Docker Engine and Docker Compose
   
   Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Google Gemini AI API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/api-keys)
   - Sign in with your Google account
   - Create a new API key
   - Save the key for later use

## Installation Steps

### Step 1: Get the Project Files

You have two options:

**Option A: Clone the entire repository (Recommended for development)**
```bash
git clone <repository-url>
cd Db-Talk
```

**Option B: Download only docker-compose.yml (Quick setup)**

If you just want to run the application without the source code:
1. Create a new directory for DB-Talk
2. Download the `docker-compose.yml` file into that directory
3. Navigate to that directory in your terminal

```bash
mkdir db-talk
cd db-talk
# Download docker-compose.yml to this directory
```

### Step 2: Create Environment File

Copy the example environment file and configure it:

```bash
# Copy .env.example to .env
cp .env.example .env
```

If you downloaded only the docker-compose.yml file, create a `.env` file manually in the same directory.

### Step 3: Configure Environment Variables

Open the `.env` file in your preferred text editor and update the values. The `.env.example` file contains all the necessary variables with descriptions

## Running the Application

### Start All Services

From the project root directory or Where your docker compose file is, run:

```bash
docker-compose up -d
```

This command will:
1. Pull the necessary Docker images (PostgreSQL, Redis, Backend, Frontend)
2. Create a network for inter-service communication
3. Start all services in detached mode
4. Create persistent volumes for database and cache data

### Check Service Status

Verify all services are running:

```bash
docker-compose ps
```

You should see all four services (postgres, redis, backend, frontend) with status "Up".

## Accessing the Application

Once all services are up and running:

### Frontend (User Interface)
Open your browser and navigate to:
```
http://localhost:3000
```

### Backend API
The backend API is available at:
```
http://localhost:3001
```

API health check:
```
http://localhost:3001/api/health
```

### Login

Use the credentials you set in your `.env` file:
- **Email**: Value from `ADMIN_EMAIL`
- **Password**: Value from `ADMIN_PASSWORD`

## Configuration Options

### Changing Ports

If the default ports are already in use, you can modify them in the `docker-compose.yml` file:

```yaml
services:
  db-talk-frontend:
    ports:
      - "8080:3000"  # Change 8080 to your preferred port
  
  db-talk-backend:
    ports:
      - "8081:3001"  # Change 8081 to your preferred port
```

Remember to update `NEXT_PUBLIC_API_BASE_URL` in your `.env` file if you change the backend port.

### Persistent Data

Data is stored in Docker volumes:
- `db_talk_postgres_data`: PostgreSQL database data
- `db_talk_redis_data`: Redis cache data

These volumes persist even if containers are stopped or removed.

### Using External Databases

If you want to use an existing PostgreSQL or Redis instance:

1. Comment out the respective service in `docker-compose.yml`
2. Update connection strings in `.env` to point to your external instances

## Getting Help

If you've found a bug or need help, please [create an issue](https://github.com/KAMAL-02/DB-Talk/issues) with:
   - Description of the problem
   - Steps to reproduce
   - Error messages or logs if any

---

**You're all set!** 🎉!
