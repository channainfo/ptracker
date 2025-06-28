# GitHub Actions + Terraform Blue-Green Deployment

## Overview

This document outlines a comprehensive CI/CD pipeline using GitHub Actions and Terraform for blue-green deployments across QA, Staging, and Production environments for CryptoTracker.

## Architecture Overview

```
GitHub Repository
├── .github/workflows/
│   ├── ci.yml                    # Continuous Integration
│   ├── deploy-qa.yml             # QA Deployment
│   ├── deploy-staging.yml        # Staging Deployment
│   ├── deploy-production.yml     # Production Blue-Green
│   └── destroy-environment.yml   # Environment Cleanup
├── terraform/
│   ├── modules/blue-green/       # Blue-Green Infrastructure
│   └── environments/
└── scripts/
    └── deployment/
```

## Blue-Green Deployment Strategy

### Infrastructure Components
```yaml
Blue-Green Architecture:
  Load Balancer: Application Load Balancer (ALB)
  Target Groups: 
    - Blue (Current Production)
    - Green (New Deployment)
  ECS Services:
    - Blue ECS Service
    - Green ECS Service
  Database: Shared (with migration strategy)
  Cache: Shared Redis cluster
  
Traffic Switching:
  Phase 1: 100% Blue, 0% Green
  Phase 2: 50% Blue, 50% Green (canary)
  Phase 3: 0% Blue, 100% Green (full switch)
  Rollback: Switch back to Blue instantly
```

## Terraform Blue-Green Module

### Blue-Green Infrastructure Module
```hcl
# terraform/modules/blue-green/main.tf
resource "aws_lb" "main" {
  name               = "${var.environment}-cryptotracker-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "production"

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-main-alb"
  }
}

# Blue Target Group (Current)
resource "aws_lb_target_group" "blue" {
  name     = "${var.environment}-blue-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    protocol            = "HTTP"
  }

  tags = {
    Environment = var.environment
    Color       = "blue"
  }
}

# Green Target Group (New Deployment)
resource "aws_lb_target_group" "green" {
  name     = "${var.environment}-green-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }

  tags = {
    Environment = var.environment
    Color       = "green"
  }
}

# ALB Listener with weighted routing
resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.ssl_certificate_arn

  default_action {
    type = "forward"
    
    forward {
      target_group {
        arn    = aws_lb_target_group.blue.arn
        weight = var.blue_weight
      }

      target_group {
        arn    = aws_lb_target_group.green.arn
        weight = var.green_weight
      }

      stickiness {
        enabled  = false
        duration = 1
      }
    }
  }
}

# Blue ECS Service
resource "aws_ecs_service" "blue" {
  name            = "${var.environment}-api-blue"
  cluster         = var.ecs_cluster_id
  task_definition = var.blue_task_definition_arn
  desired_count   = var.blue_desired_count

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets          = var.private_subnet_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.blue.arn
    container_name   = "api"
    container_port   = 3001
  }

  lifecycle {
    ignore_changes = [desired_count, task_definition]
  }

  tags = {
    Environment = var.environment
    Color       = "blue"
  }
}

# Green ECS Service
resource "aws_ecs_service" "green" {
  name            = "${var.environment}-api-green"
  cluster         = var.ecs_cluster_id
  task_definition = var.green_task_definition_arn
  desired_count   = var.green_desired_count

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets          = var.private_subnet_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.green.arn
    container_name   = "api"
    container_port   = 3001
  }

  lifecycle {
    ignore_changes = [desired_count, task_definition]
  }

  tags = {
    Environment = var.environment
    Color       = "green"
  }
}

# Traffic distribution variables
variable "blue_weight" {
  description = "Traffic weight for blue environment (0-100)"
  type        = number
  default     = 100
}

variable "green_weight" {
  description = "Traffic weight for green environment (0-100)"
  type        = number
  default     = 0
}

variable "blue_desired_count" {
  description = "Desired count for blue environment"
  type        = number
  default     = 3
}

variable "green_desired_count" {
  description = "Desired count for green environment"
  type        = number
  default     = 0
}
```

### Blue-Green State Management
```hcl
# terraform/modules/blue-green/state.tf
resource "aws_ssm_parameter" "active_environment" {
  name  = "/${var.environment}/cryptotracker/active-environment"
  type  = "String"
  value = var.active_environment

  tags = {
    Environment = var.environment
    Purpose     = "blue-green-state"
  }
}

resource "aws_ssm_parameter" "deployment_version" {
  name  = "/${var.environment}/cryptotracker/deployment-version"
  type  = "String"
  value = var.deployment_version

  tags = {
    Environment = var.environment
    Purpose     = "deployment-tracking"
  }
}

variable "active_environment" {
  description = "Currently active environment (blue or green)"
  type        = string
  default     = "blue"
}

variable "deployment_version" {
  description = "Current deployment version"
  type        = string
}
```

## GitHub Actions Workflows

### 1. Continuous Integration
```yaml
# .github/workflows/ci.yml
name: Continuous Integration

on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20'
  PYTHON_VERSION: '3.11'

jobs:
  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cryptotracker_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd apps/api && npm ci

      - name: Run linting
        run: |
          npm run lint
          npm run type-check

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cryptotracker_test
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cryptotracker_test
          REDIS_URL: redis://localhost:6379

  test-sentiment-engine:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install dependencies
        run: |
          cd apps/sentiment-engine
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run Python tests
        run: |
          cd apps/sentiment-engine
          pytest tests/ -v --cov=src/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run Semgrep security scan
        uses: semgrep/semgrep-action@v1
        with:
          config: auto

  build-and-push:
    needs: [test-api, test-sentiment-engine, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ steps.login-ecr.outputs.registry }}/cryptotracker
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/api/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 2. QA Environment Deployment
```yaml
# .github/workflows/deploy-qa.yml
name: Deploy to QA

on:
  push:
    branches: [ develop ]
  workflow_dispatch:
    inputs:
      image_tag:
        description: 'Docker image tag to deploy'
        required: false
        default: 'latest'

jobs:
  deploy-qa:
    runs-on: ubuntu-latest
    environment: qa
    
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.5.7

      - name: Deploy QA Infrastructure
        run: |
          cd terraform/environments/qa
          terraform init
          terraform plan -var="image_tag=${{ github.event.inputs.image_tag || 'latest' }}"
          terraform apply -auto-approve -var="image_tag=${{ github.event.inputs.image_tag || 'latest' }}"

      - name: Run smoke tests
        run: |
          # Wait for deployment
          sleep 60
          # Run basic health checks
          curl -f https://qa-api.cryptotracker.com/health
          
      - name: Notify deployment status
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### 3. Production Blue-Green Deployment
```yaml
# .github/workflows/deploy-production.yml
name: Production Blue-Green Deployment

on:
  workflow_dispatch:
    inputs:
      image_tag:
        description: 'Docker image tag to deploy'
        required: true
      deployment_strategy:
        description: 'Deployment strategy'
        required: true
        default: 'blue-green'
        type: choice
        options:
          - blue-green
          - canary
          - immediate
      rollback:
        description: 'Rollback to previous version'
        required: false
        type: boolean
        default: false

env:
  AWS_REGION: us-east-1
  ENVIRONMENT: production

jobs:
  pre-deployment:
    runs-on: ubuntu-latest
    environment: production
    outputs:
      current-environment: ${{ steps.current-state.outputs.active-env }}
      target-environment: ${{ steps.target-state.outputs.target-env }}
      
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Get current active environment
        id: current-state
        run: |
          ACTIVE_ENV=$(aws ssm get-parameter --name "/production/cryptotracker/active-environment" --query "Parameter.Value" --output text)
          echo "active-env=$ACTIVE_ENV" >> $GITHUB_OUTPUT
          echo "Current active environment: $ACTIVE_ENV"

      - name: Determine target environment
        id: target-state
        run: |
          if [ "${{ steps.current-state.outputs.active-env }}" == "blue" ]; then
            echo "target-env=green" >> $GITHUB_OUTPUT
          else
            echo "target-env=blue" >> $GITHUB_OUTPUT
          fi

      - name: Validate deployment readiness
        run: |
          # Check if image exists
          aws ecr describe-images --repository-name cryptotracker --image-ids imageTag=${{ github.event.inputs.image_tag }}
          
          # Check database migration status
          # Run pre-deployment validations

  deploy-target-environment:
    needs: pre-deployment
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.5.7

      - name: Deploy to target environment
        run: |
          cd terraform/environments/production
          terraform init
          
          # Deploy new version to inactive environment
          terraform plan \
            -var="image_tag=${{ github.event.inputs.image_tag }}" \
            -var="${{ needs.pre-deployment.outputs.target-environment }}_desired_count=3" \
            -var="${{ needs.pre-deployment.outputs.target-environment }}_task_definition_arn=new_version" \
            -out=deployment.tfplan
            
          terraform apply deployment.tfplan

      - name: Health check target environment
        run: |
          # Wait for services to be healthy
          TARGET_ENV=${{ needs.pre-deployment.outputs.target-environment }}
          
          echo "Waiting for $TARGET_ENV environment to be healthy..."
          
          # Check ECS service health
          aws ecs wait services-stable \
            --cluster production-cryptotracker-cluster \
            --services production-api-$TARGET_ENV
          
          # Check target group health
          TG_ARN=$(aws elbv2 describe-target-groups \
            --names production-${TARGET_ENV}-tg \
            --query 'TargetGroups[0].TargetGroupArn' \
            --output text)
          
          # Wait for healthy targets
          timeout 300 bash -c '
            while true; do
              HEALTHY=$(aws elbv2 describe-target-health --target-group-arn '$TG_ARN' --query "length(TargetHealthDescriptions[?TargetHealth.State==\`healthy\`])")
              if [ "$HEALTHY" -ge 2 ]; then
                echo "Target group is healthy"
                break
              fi
              echo "Waiting for healthy targets... ($HEALTHY healthy)"
              sleep 10
            done
          '

      - name: Run smoke tests on target environment
        run: |
          # Direct health check to target group
          TARGET_ENV=${{ needs.pre-deployment.outputs.target-environment }}
          
          # Get ALB DNS name
          ALB_DNS=$(aws elbv2 describe-load-balancers \
            --names production-cryptotracker-alb \
            --query 'LoadBalancers[0].DNSName' \
            --output text)
          
          # Test health endpoint
          curl -f -H "Host: api.cryptotracker.com" https://$ALB_DNS/health
          
          # Test critical API endpoints
          curl -f -H "Host: api.cryptotracker.com" https://$ALB_DNS/api/v1/market/prices?symbols=BTC,ETH

  traffic-switch:
    needs: [pre-deployment, deploy-target-environment]
    runs-on: ubuntu-latest
    environment: production-traffic-switch
    
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.5.7

      - name: Canary deployment (10% traffic)
        if: github.event.inputs.deployment_strategy == 'canary'
        run: |
          cd terraform/environments/production
          terraform init
          
          # Switch 10% traffic to new environment
          if [ "${{ needs.pre-deployment.outputs.target-environment }}" == "green" ]; then
            terraform apply -auto-approve \
              -var="blue_weight=90" \
              -var="green_weight=10"
          else
            terraform apply -auto-approve \
              -var="blue_weight=10" \
              -var="green_weight=90"
          fi

      - name: Monitor canary metrics
        if: github.event.inputs.deployment_strategy == 'canary'
        run: |
          echo "Monitoring canary deployment for 10 minutes..."
          
          # Monitor error rates, response times, etc.
          for i in {1..20}; do
            # Check CloudWatch metrics
            ERROR_RATE=$(aws cloudwatch get-metric-statistics \
              --namespace AWS/ApplicationELB \
              --metric-name HTTPCode_Target_5XX_Count \
              --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
              --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
              --period 300 \
              --statistics Sum \
              --query 'Datapoints[0].Sum' \
              --output text)
            
            if [ "$ERROR_RATE" != "None" ] && [ "$ERROR_RATE" -gt 10 ]; then
              echo "High error rate detected: $ERROR_RATE"
              exit 1
            fi
            
            echo "Canary health check $i/20 - Error rate: ${ERROR_RATE:-0}"
            sleep 30
          done

      - name: Full traffic switch
        run: |
          cd terraform/environments/production
          
          # Switch 100% traffic to new environment
          if [ "${{ needs.pre-deployment.outputs.target-environment }}" == "green" ]; then
            terraform apply -auto-approve \
              -var="blue_weight=0" \
              -var="green_weight=100" \
              -var="blue_desired_count=0"
          else
            terraform apply -auto-approve \
              -var="blue_weight=100" \
              -var="green_weight=0" \
              -var="green_desired_count=0"
          fi

      - name: Update active environment state
        run: |
          aws ssm put-parameter \
            --name "/production/cryptotracker/active-environment" \
            --value "${{ needs.pre-deployment.outputs.target-environment }}" \
            --overwrite
          
          aws ssm put-parameter \
            --name "/production/cryptotracker/deployment-version" \
            --value "${{ github.event.inputs.image_tag }}" \
            --overwrite

      - name: Post-deployment validation
        run: |
          # Wait for traffic switch to complete
          sleep 60
          
          # Validate production is working
          curl -f https://api.cryptotracker.com/health
          curl -f https://api.cryptotracker.com/api/v1/market/prices?symbols=BTC,ETH
          
          # Check critical business metrics
          # Monitor for 5 minutes after switch

  cleanup-old-environment:
    needs: [pre-deployment, traffic-switch]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Scale down old environment
        run: |
          cd terraform/environments/production
          terraform init
          
          # Keep old environment running with 1 instance for quick rollback
          if [ "${{ needs.pre-deployment.outputs.current-environment }}" == "blue" ]; then
            terraform apply -auto-approve -var="blue_desired_count=1"
          else
            terraform apply -auto-approve -var="green_desired_count=1"
          fi

  notify:
    needs: [pre-deployment, deploy-target-environment, traffic-switch, cleanup-old-environment]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Notify deployment status
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          text: |
            Production Deployment ${{ job.status }}
            Image: ${{ github.event.inputs.image_tag }}
            Strategy: ${{ github.event.inputs.deployment_strategy }}
            Target Environment: ${{ needs.pre-deployment.outputs.target-environment }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 4. Rollback Workflow
```yaml
# .github/workflows/rollback-production.yml
name: Production Rollback

on:
  workflow_dispatch:
    inputs:
      rollback_reason:
        description: 'Reason for rollback'
        required: true
      target_version:
        description: 'Version to rollback to (optional)'
        required: false

jobs:
  emergency-rollback:
    runs-on: ubuntu-latest
    environment: production-emergency
    
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: us-east-1

      - name: Get current state
        id: current-state
        run: |
          ACTIVE_ENV=$(aws ssm get-parameter --name "/production/cryptotracker/active-environment" --query "Parameter.Value" --output text)
          echo "active-env=$ACTIVE_ENV" >> $GITHUB_OUTPUT
          
          if [ "$ACTIVE_ENV" == "blue" ]; then
            echo "rollback-env=green" >> $GITHUB_OUTPUT
          else
            echo "rollback-env=blue" >> $GITHUB_OUTPUT
          fi

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.5.7

      - name: Instant rollback
        run: |
          cd terraform/environments/production
          terraform init
          
          # Immediately switch traffic back
          if [ "${{ steps.current-state.outputs.rollback-env }}" == "green" ]; then
            terraform apply -auto-approve \
              -var="blue_weight=0" \
              -var="green_weight=100" \
              -var="green_desired_count=3"
          else
            terraform apply -auto-approve \
              -var="blue_weight=100" \
              -var="green_weight=0" \
              -var="blue_desired_count=3"
          fi

      - name: Update state
        run: |
          aws ssm put-parameter \
            --name "/production/cryptotracker/active-environment" \
            --value "${{ steps.current-state.outputs.rollback-env }}" \
            --overwrite

      - name: Validate rollback
        run: |
          sleep 30
          curl -f https://api.cryptotracker.com/health

      - name: Create incident
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Production Rollback - ${new Date().toISOString()}`,
              body: `
                ## Production Rollback Executed
                
                **Reason:** ${{ github.event.inputs.rollback_reason }}
                **Rolled back to:** ${{ steps.current-state.outputs.rollback-env }}
                **Executed by:** ${{ github.actor }}
                **Time:** ${new Date().toISOString()}
                
                ## Next Steps
                - [ ] Investigate root cause
                - [ ] Fix issues in develop branch
                - [ ] Plan next deployment
              `,
              labels: ['incident', 'production', 'rollback']
            });
```

## Deployment Scripts

### Traffic Management Script
```bash
#!/bin/bash
# scripts/deployment/traffic-switch.sh

set -e

ENVIRONMENT=$1
TARGET_COLOR=$2
TRAFFIC_PERCENTAGE=$3

if [ -z "$ENVIRONMENT" ] || [ -z "$TARGET_COLOR" ] || [ -z "$TRAFFIC_PERCENTAGE" ]; then
    echo "Usage: $0 <environment> <target_color> <traffic_percentage>"
    echo "Example: $0 production green 50"
    exit 1
fi

echo "🚦 Switching $TRAFFIC_PERCENTAGE% traffic to $TARGET_COLOR environment in $ENVIRONMENT"

cd "terraform/environments/$ENVIRONMENT"

if [ "$TARGET_COLOR" == "green" ]; then
    BLUE_WEIGHT=$((100 - TRAFFIC_PERCENTAGE))
    GREEN_WEIGHT=$TRAFFIC_PERCENTAGE
else
    BLUE_WEIGHT=$TRAFFIC_PERCENTAGE
    GREEN_WEIGHT=$((100 - TRAFFIC_PERCENTAGE))
fi

terraform apply -auto-approve \
    -var="blue_weight=$BLUE_WEIGHT" \
    -var="green_weight=$GREEN_WEIGHT"

echo "✅ Traffic switch completed: Blue $BLUE_WEIGHT% / Green $GREEN_WEIGHT%"
```

### Health Check Script
```bash
#!/bin/bash
# scripts/deployment/health-check.sh

ENVIRONMENT=$1
TARGET_GROUP_NAME=$2
REQUIRED_HEALTHY_TARGETS=${3:-2}

echo "🏥 Checking health of $TARGET_GROUP_NAME in $ENVIRONMENT"

# Get target group ARN
TG_ARN=$(aws elbv2 describe-target-groups \
    --names "$TARGET_GROUP_NAME" \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)

# Wait for healthy targets
TIMEOUT=300
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    HEALTHY_COUNT=$(aws elbv2 describe-target-health \
        --target-group-arn "$TG_ARN" \
        --query "length(TargetHealthDescriptions[?TargetHealth.State==\`healthy\`])")
    
    if [ "$HEALTHY_COUNT" -ge "$REQUIRED_HEALTHY_TARGETS" ]; then
        echo "✅ Target group is healthy ($HEALTHY_COUNT/$REQUIRED_HEALTHY_TARGETS targets healthy)"
        exit 0
    fi
    
    echo "⏳ Waiting for healthy targets... ($HEALTHY_COUNT/$REQUIRED_HEALTHY_TARGETS healthy)"
    sleep 10
    ELAPSED=$((ELAPSED + 10))
done

echo "❌ Health check timeout after ${TIMEOUT}s"
exit 1
```

## Monitoring and Alerting

### CloudWatch Alarms for Deployment
```hcl
# terraform/modules/monitoring/deployment-alarms.tf
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "${var.environment}-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors 5xx error rate"
  
  alarm_actions = [aws_sns_topic.deployment_alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

resource "aws_cloudwatch_metric_alarm" "high_response_time" {
  alarm_name          = "${var.environment}-high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "2"
  alarm_description   = "This metric monitors response time"
  
  alarm_actions = [aws_sns_topic.deployment_alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}
```

This comprehensive CI/CD pipeline with GitHub Actions and Terraform provides safe, automated blue-green deployments for your crypto platform with proper monitoring, rollback capabilities, and approval gates.