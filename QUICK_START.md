# Quick Start Guide

## ✅ Current Status
- ✅ API server is configured and compiling successfully
- ✅ Web client is configured 
- ✅ Mobile app is configured
- ⚠️ Database needs to be created
- ⚠️ One small TypeScript issue to fix

## 🚀 Quick Setup (Choose One)

### Option 1: Using Docker (Recommended)
```bash
# 1. Start databases only
docker-compose up -d postgres redis

# 2. Wait for databases to start (30 seconds)
sleep 30

# 3. Create the database
docker exec cryptotracker-postgres createdb -U postgres cryptotracker

# 4. Start the applications
cd apps/api && npm run start:dev &
cd apps/web && npm run dev &
```

### Option 2: Local Setup (if you have PostgreSQL installed)
```bash
# 1. Create database
createdb cryptotracker

# 2. Start Redis (if you have it)
redis-server &

# 3. Update .env files to match your local setup
# Edit apps/api/.env if needed

# 4. Start applications
cd apps/api && npm run start:dev &
cd apps/web && npm run dev &
```

### Option 3: Docker for Everything
```bash
# Start everything with Docker
docker-compose up --build
```

## 🎯 Expected Results

After setup, you should be able to access:
- API: http://localhost:3001/health
- API Docs: http://localhost:3001/api/docs
- Web App: http://localhost:3000

## 🐛 Known Issues & Fixes

1. **"Unable to connect to database"** - Make sure PostgreSQL is running and database is created
2. **TypeScript error in auth.service.ts** - Will be fixed automatically
3. **Port already in use** - Kill existing processes or change ports

## 📁 Project Structure
```
cryptotracker/
├── apps/
│   ├── api/          # NestJS API server
│   ├── web/          # Next.js web app  
│   └── mobile/       # Expo mobile app
├── packages/
│   └── shared-types/ # Shared TypeScript types
└── docs/            # Documentation
```

## 🔧 Development Commands

```bash
# Install all dependencies
npm install --legacy-peer-deps

# Start all services
npm run dev

# Start individual services
npm run dev:api    # API only
npm run dev:web    # Web only
npm run dev:mobile # Mobile only

# Run tests
npm test

# Check code quality
npm run lint
npm run type-check
```

## 🆘 Troubleshooting

**API won't start:**
- Check PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep cryptotracker`
- Check ports: `lsof -ti:3001 | xargs kill -9`

**Web won't start:**
- Check ports: `lsof -ti:3000 | xargs kill -9`
- Clear Next.js cache: `rm -rf apps/web/.next`

**Dependencies issues:**
- Use legacy peer deps: `npm install --legacy-peer-deps`
- Clear node_modules: `rm -rf node_modules && npm install`