# Deployment Guide

## Overview

This guide covers deployment strategies for CryptoTracker across different environments (development, staging, production) and platforms (web, mobile, Telegram Web App).

## Prerequisites

### Required Tools
- Docker v20+
- Kubernetes CLI (kubectl) v1.24+
- Helm v3.9+
- AWS CLI v2 (for AWS deployment)
- Terraform v1.3+

### Required Accounts
- AWS Account with appropriate IAM permissions
- Docker Hub account
- Domain names for web and API
- SSL certificates (or use Let's Encrypt)

## Infrastructure as Code

### Terraform Configuration

```hcl
# terraform/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  
  backend "s3" {
    bucket = "cryptotracker-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

# VPC Configuration
module "vpc" {
  source = "./modules/vpc"
  
  cidr_block           = "10.0.0.0/16"
  availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnet_cidrs  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# EKS Cluster
module "eks" {
  source = "./modules/eks"
  
  cluster_name    = "cryptotracker-prod"
  cluster_version = "1.27"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  
  node_groups = {
    general = {
      desired_size = 3
      min_size     = 2
      max_size     = 10
      instance_types = ["t3.large"]
    }
  }
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds"
  
  identifier     = "cryptotracker-prod-db"
  engine_version = "14.7"
  instance_class = "db.r6g.large"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  
  backup_retention_period = 30
  multi_az               = true
}

# ElastiCache Redis
module "redis" {
  source = "./modules/redis"
  
  cluster_id           = "cryptotracker-prod-cache"
  node_type           = "cache.r6g.large"
  num_cache_nodes     = 3
  parameter_group_name = "default.redis7"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
}
```

## Container Configuration

### Dockerfile - API Service

```dockerfile
# docker/api/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Build application
RUN npm run build:api

# Production image
FROM node:18-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/apps/api/main.js"]
```

### Docker Compose - Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: cryptotracker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: docker/api/Dockerfile
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/cryptotracker
      REDIS_URL: redis://redis:6379
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/api:/app/apps/api
      - ./packages:/app/packages

  web:
    build:
      context: .
      dockerfile: docker/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./apps/web:/app/apps/web
      - ./packages:/app/packages

volumes:
  postgres_data:
  redis_data:
```

## Kubernetes Deployment

### Namespace and ConfigMap

```yaml
# k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cryptotracker

---
# k8s/base/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: cryptotracker
data:
  NODE_ENV: "production"
  API_PORT: "3001"
  LOG_LEVEL: "info"
```

### API Deployment

```yaml
# k8s/deployments/api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: cryptotracker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      serviceAccountName: api-service-account
      containers:
      - name: api
        image: cryptotracker/api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 10
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true

---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: cryptotracker
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 3001
  type: ClusterIP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: cryptotracker
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Ingress Configuration

```yaml
# k8s/ingress/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  namespace: cryptotracker
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.ptracker.com
    - app.ptracker.com
    secretName: cryptotracker-tls
  rules:
  - host: api.ptracker.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80
  - host: app.ptracker.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```

## CI/CD Pipeline

### GitHub Actions - Build and Deploy

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: cryptotracker
  EKS_CLUSTER_NAME: cryptotracker-prod

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint
    
    - name: Type check
      run: npm run type-check

  build-and-push:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push API image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -f docker/api/Dockerfile -t $ECR_REGISTRY/$ECR_REPOSITORY/api:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY/api:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY/api:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY/api:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY/api:latest
    
    - name: Build and push Web image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -f docker/web/Dockerfile -t $ECR_REGISTRY/$ECR_REPOSITORY/web:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY/web:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY/web:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY/web:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY/web:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name ${{ env.EKS_CLUSTER_NAME }} --region ${{ env.AWS_REGION }}
    
    - name: Deploy to Kubernetes
      run: |
        kubectl apply -k k8s/overlays/production
        kubectl rollout status deployment/api -n cryptotracker
        kubectl rollout status deployment/web -n cryptotracker
```

## Mobile App Deployment

### iOS Deployment

```yaml
# .github/workflows/ios-deploy.yml
name: iOS Deploy

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        npm ci
        cd apps/mobile/ios && pod install
    
    - name: Build iOS app
      run: |
        cd apps/mobile
        npx react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle
    
    - name: Archive and upload to App Store
      env:
        MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
        FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD: ${{ secrets.APP_SPECIFIC_PASSWORD }}
      run: |
        cd apps/mobile/ios
        fastlane release
```

### Android Deployment

```yaml
# .github/workflows/android-deploy.yml
name: Android Deploy

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build Android app
      run: |
        cd apps/mobile/android
        ./gradlew assembleRelease
    
    - name: Sign APK
      uses: r0adkll/sign-android-release@v1
      with:
        releaseDirectory: apps/mobile/android/app/build/outputs/apk/release
        signingKeyBase64: ${{ secrets.SIGNING_KEY }}
        alias: ${{ secrets.ALIAS }}
        keyStorePassword: ${{ secrets.KEY_STORE_PASSWORD }}
        keyPassword: ${{ secrets.KEY_PASSWORD }}
    
    - name: Upload to Play Store
      uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: ${{ secrets.SERVICE_ACCOUNT_JSON }}
        packageName: com.cryptotracker
        releaseFiles: apps/mobile/android/app/build/outputs/apk/release/app-release-signed.apk
        track: production
```

## Telegram Web App Deployment

### Telegram Bot Setup

```javascript
// scripts/setup-telegram-bot.js
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Set webhook
bot.telegram.setWebhook(`${process.env.API_URL}/telegram/webhook`);

// Set menu button
bot.telegram.setChatMenuButton({
  menu_button: {
    type: 'web_app',
    text: 'Open CryptoTracker',
    web_app: {
      url: process.env.TELEGRAM_WEB_APP_URL
    }
  }
});

// Set bot commands
bot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'portfolio', description: 'View your portfolio' },
  { command: 'help', description: 'Get help' }
]);
```

## Monitoring and Logging

### Prometheus Configuration

```yaml
# k8s/monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: ['cryptotracker']
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "CryptoTracker Production",
    "panels": [
      {
        "title": "API Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      }
    ]
  }
}
```

## Security Hardening

### Network Policies

```yaml
# k8s/security/network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: cryptotracker
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - podSelector:
        matchLabels:
          app: web
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 6379  # Redis
    - protocol: TCP
      port: 443   # HTTPS
    - protocol: TCP
      port: 53    # DNS
    - protocol: UDP
      port: 53    # DNS
```

### Pod Security Policies

```yaml
# k8s/security/pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: true
```

## Backup and Disaster Recovery

### Database Backup

```bash
#!/bin/bash
# scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="cryptotracker_backup_${DATE}.sql"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp ${BACKUP_FILE}.gz s3://cryptotracker-backups/postgres/${BACKUP_FILE}.gz

# Clean up old backups (keep last 30 days)
aws s3 ls s3://cryptotracker-backups/postgres/ | \
  awk '{print $4}' | \
  sort -r | \
  tail -n +31 | \
  xargs -I {} aws s3 rm s3://cryptotracker-backups/postgres/{}
```

### Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: 1 hour
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup Schedule**: 
   - Database: Every hour
   - Redis: Persistent with AOF
   - Application state: Stored in database
4. **Recovery Procedures**:
   - Automated failover for multi-AZ RDS
   - Kubernetes pod auto-recovery
   - Load balancer health checks
   - Cross-region backup replication

## Production Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance testing done
- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Monitoring configured
- [ ] Backup system tested

### Post-deployment
- [ ] Health checks passing
- [ ] Metrics flowing to monitoring
- [ ] Log aggregation working
- [ ] SSL certificate valid
- [ ] Performance baseline established
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team notified

This deployment guide provides a comprehensive approach to deploying CryptoTracker across all platforms with security, scalability, and reliability in mind.