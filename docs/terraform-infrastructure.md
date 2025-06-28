# Terraform Infrastructure Management

## Overview

This document outlines a comprehensive Terraform setup for managing CryptoTracker infrastructure across three environments: QA, Staging, and Production. The architecture follows best practices for scalability, security, and cost optimization.

## Project Structure

```
terraform/
├── environments/
│   ├── qa/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── outputs.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── outputs.tf
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       └── outputs.tf
├── modules/
│   ├── networking/
│   ├── ecs/
│   ├── rds/
│   ├── elasticache/
│   ├── msk/
│   ├── security/
│   ├── monitoring/
│   └── storage/
├── shared/
│   ├── backend.tf
│   ├── providers.tf
│   └── data.tf
└── scripts/
    ├── deploy.sh
    ├── destroy.sh
    └── plan.sh
```

## Environment Configuration

### QA Environment
```hcl
# environments/qa/terraform.tfvars
environment = "qa"
region      = "us-east-1"

# Networking
vpc_cidr = "10.1.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# ECS Configuration
api_service_count     = 1
api_service_cpu       = 512
api_service_memory    = 1024

websocket_service_count  = 1
websocket_service_cpu    = 256
websocket_service_memory = 512

sentiment_service_count  = 1
sentiment_service_cpu    = 2048
sentiment_service_memory = 4096

# Database
db_instance_class = "db.t3.micro"
db_allocated_storage = 20
db_backup_retention = 7
db_multi_az = false

# Cache
redis_node_type = "cache.t3.micro"
redis_num_nodes = 1

# Kafka
msk_instance_type = "kafka.t3.small"
msk_broker_count = 2

# Auto Scaling
api_min_capacity = 1
api_max_capacity = 3
websocket_min_capacity = 1
websocket_max_capacity = 2

# Cost optimization
enable_spot_instances = true
enable_scheduled_scaling = false
```

### Staging Environment
```hcl
# environments/staging/terraform.tfvars
environment = "staging"
region      = "us-east-1"

# Networking
vpc_cidr = "10.2.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# ECS Configuration
api_service_count     = 2
api_service_cpu       = 1024
api_service_memory    = 2048

websocket_service_count  = 2
websocket_service_cpu    = 512
websocket_service_memory = 1024

sentiment_service_count  = 2
sentiment_service_cpu    = 4096
sentiment_service_memory = 8192

# Database
db_instance_class = "db.t3.small"
db_allocated_storage = 100
db_backup_retention = 14
db_multi_az = true

# Cache
redis_node_type = "cache.t3.small"
redis_num_nodes = 2

# Kafka
msk_instance_type = "kafka.m5.large"
msk_broker_count = 3

# Auto Scaling
api_min_capacity = 2
api_max_capacity = 8
websocket_min_capacity = 2
websocket_max_capacity = 6

# Performance testing
enable_spot_instances = false
enable_scheduled_scaling = true
```

### Production Environment
```hcl
# environments/production/terraform.tfvars
environment = "production"
region      = "us-east-1"

# Networking
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# ECS Configuration
api_service_count     = 3
api_service_cpu       = 2048
api_service_memory    = 4096

websocket_service_count  = 3
websocket_service_cpu    = 1024
websocket_service_memory = 2048

sentiment_service_count  = 3
sentiment_service_cpu    = 8192
sentiment_service_memory = 16384

# ML Inference (EC2 with GPU)
ml_instance_type = "p4d.xlarge"
ml_min_capacity = 1
ml_max_capacity = 5

# Database
db_instance_class = "db.r6g.xlarge"
db_allocated_storage = 1000
db_max_allocated_storage = 10000
db_backup_retention = 30
db_multi_az = true
db_read_replicas = 2

# Cache
redis_node_type = "cache.r6g.large"
redis_num_nodes = 3
redis_cluster_mode = true

# Kafka
msk_instance_type = "kafka.m5.2xlarge"
msk_broker_count = 6
msk_storage_size = 1000

# Auto Scaling
api_min_capacity = 3
api_max_capacity = 20
websocket_min_capacity = 3
websocket_max_capacity = 15

# Production settings
enable_spot_instances = false
enable_scheduled_scaling = true
enable_encryption = true
enable_enhanced_monitoring = true
```

## Terraform Modules

### 1. Networking Module
```hcl
# modules/networking/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.environment}-igw"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.${var.environment == "production" ? 0 : var.environment == "staging" ? 2 : 1}.${count.index + 1}.0/24"
  availability_zone = var.availability_zones[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "public"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.${var.environment == "production" ? 0 : var.environment == "staging" ? 2 : 1}.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "${var.environment}-private-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "private"
  }
}

resource "aws_nat_gateway" "main" {
  count         = var.environment == "production" ? length(var.availability_zones) : 1
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name        = "${var.environment}-nat-${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_eip" "nat" {
  count  = var.environment == "production" ? length(var.availability_zones) : 1
  domain = "vpc"

  tags = {
    Name        = "${var.environment}-nat-eip-${count.index + 1}"
    Environment = var.environment
  }
}
```

### 2. ECS Module
```hcl
# modules/ecs/main.tf
resource "aws_ecs_cluster" "main" {
  name = "${var.environment}-cryptotracker-cluster"

  setting {
    name  = "containerInsights"
    value = var.environment == "production" ? "enabled" : "disabled"
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = var.enable_spot_instances ? 0 : 1
    weight            = var.enable_spot_instances ? 0 : 100
    capacity_provider = "FARGATE"
  }

  dynamic "default_capacity_provider_strategy" {
    for_each = var.enable_spot_instances ? [1] : []
    content {
      base              = 1
      weight            = 100
      capacity_provider = "FARGATE_SPOT"
    }
  }
}

# API Service
resource "aws_ecs_service" "api" {
  name            = "${var.environment}-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_service_count

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = var.private_subnet_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3001
  }

  depends_on = [aws_lb_listener.api]

  tags = {
    Environment = var.environment
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.environment}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_service_cpu
  memory                   = var.api_service_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "api"
      image = "${var.ecr_repository_url}/api:${var.image_tag}"
      
      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "PORT"
          value = "3001"
        }
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.database_url.arn
        },
        {
          name      = "REDIS_URL"
          valueFrom = aws_secretsmanager_secret.redis_url.arn
        }
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Environment = var.environment
  }
}
```

### 3. RDS Module
```hcl
# modules/rds/main.tf
resource "aws_db_instance" "main" {
  identifier     = "${var.environment}-cryptotracker-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = var.environment == "production" ? "gp3" : "gp2"
  storage_encrypted     = var.enable_encryption

  db_name  = "cryptotracker"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = var.db_backup_retention
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"

  multi_az               = var.db_multi_az
  publicly_accessible    = false
  deletion_protection    = var.environment == "production"

  performance_insights_enabled = var.environment == "production"
  monitoring_interval         = var.environment == "production" ? 60 : 0

  skip_final_snapshot = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "${var.environment}-cryptotracker-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  tags = {
    Environment = var.environment
  }
}

# Read Replicas for Production
resource "aws_db_instance" "read_replica" {
  count               = var.environment == "production" ? var.db_read_replicas : 0
  identifier          = "${var.environment}-cryptotracker-read-${count.index + 1}"
  replicate_source_db = aws_db_instance.main.identifier
  instance_class      = var.db_instance_class

  performance_insights_enabled = true
  monitoring_interval         = 60

  tags = {
    Environment = var.environment
    Type        = "read-replica"
  }
}
```

### 4. Auto Scaling Module
```hcl
# modules/autoscaling/main.tf
resource "aws_appautoscaling_target" "api" {
  max_capacity       = var.api_max_capacity
  min_capacity       = var.api_min_capacity
  resource_id        = "service/${var.cluster_name}/${var.api_service_name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "${var.environment}-api-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_policy" "api_memory" {
  name               = "${var.environment}-api-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Scheduled Scaling for Trading Hours
resource "aws_appautoscaling_scheduled_action" "scale_up" {
  count              = var.enable_scheduled_scaling ? 1 : 0
  name               = "${var.environment}-scale-up-trading-hours"
  service_namespace  = aws_appautoscaling_target.api.service_namespace
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension

  schedule = "cron(0 13 ? * MON-FRI *)"  # 9 AM EST Monday-Friday

  scalable_target_action {
    min_capacity = var.api_min_capacity * 2
    max_capacity = var.api_max_capacity
  }
}

resource "aws_appautoscaling_scheduled_action" "scale_down" {
  count              = var.enable_scheduled_scaling ? 1 : 0
  name               = "${var.environment}-scale-down-off-hours"
  service_namespace  = aws_appautoscaling_target.api.service_namespace
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension

  schedule = "cron(0 4 ? * TUE-SAT *)"  # 12 AM EST Tuesday-Saturday

  scalable_target_action {
    min_capacity = var.api_min_capacity
    max_capacity = var.api_max_capacity
  }
}
```

## Environment Main Configuration

### QA Environment
```hcl
# environments/qa/main.tf
terraform {
  required_version = ">= 1.5"
  
  backend "s3" {
    bucket         = "cryptotracker-terraform-state"
    key            = "qa/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "CryptoTracker"
      ManagedBy   = "Terraform"
    }
  }
}

module "networking" {
  source = "../../modules/networking"

  environment        = var.environment
  region            = var.region
  vpc_cidr          = var.vpc_cidr
  availability_zones = var.availability_zones
}

module "security" {
  source = "../../modules/security"

  environment = var.environment
  vpc_id      = module.networking.vpc_id
}

module "rds" {
  source = "../../modules/rds"

  environment     = var.environment
  vpc_id          = module.networking.vpc_id
  subnet_ids      = module.networking.private_subnet_ids
  security_groups = [module.security.rds_security_group_id]

  db_instance_class    = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_backup_retention  = var.db_backup_retention
  db_multi_az         = var.db_multi_az
  enable_encryption   = false  # Cost saving for QA
}

module "elasticache" {
  source = "../../modules/elasticache"

  environment     = var.environment
  vpc_id          = module.networking.vpc_id
  subnet_ids      = module.networking.private_subnet_ids
  security_groups = [module.security.elasticache_security_group_id]

  redis_node_type = var.redis_node_type
  redis_num_nodes = var.redis_num_nodes
}

module "ecs" {
  source = "../../modules/ecs"

  environment = var.environment
  region      = var.region

  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids

  api_service_count  = var.api_service_count
  api_service_cpu    = var.api_service_cpu
  api_service_memory = var.api_service_memory

  websocket_service_count  = var.websocket_service_count
  websocket_service_cpu    = var.websocket_service_cpu
  websocket_service_memory = var.websocket_service_memory

  sentiment_service_count  = var.sentiment_service_count
  sentiment_service_cpu    = var.sentiment_service_cpu
  sentiment_service_memory = var.sentiment_service_memory

  enable_spot_instances = var.enable_spot_instances
}

module "autoscaling" {
  source = "../../modules/autoscaling"

  environment = var.environment
  
  cluster_name       = module.ecs.cluster_name
  api_service_name   = module.ecs.api_service_name
  
  api_min_capacity = var.api_min_capacity
  api_max_capacity = var.api_max_capacity
  
  websocket_min_capacity = var.websocket_min_capacity
  websocket_max_capacity = var.websocket_max_capacity

  enable_scheduled_scaling = var.enable_scheduled_scaling
}
```

## Deployment Scripts

### Deploy Script
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=$1
ACTION=${2:-plan}

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment> [plan|apply|destroy]"
    echo "Environments: qa, staging, production"
    exit 1
fi

if [ ! -d "environments/$ENVIRONMENT" ]; then
    echo "Environment $ENVIRONMENT does not exist"
    exit 1
fi

cd "environments/$ENVIRONMENT"

echo "🚀 Running Terraform $ACTION for $ENVIRONMENT environment..."

case $ACTION in
    plan)
        terraform init -upgrade
        terraform plan -var-file="terraform.tfvars" -out="$ENVIRONMENT.tfplan"
        ;;
    apply)
        if [ ! -f "$ENVIRONMENT.tfplan" ]; then
            echo "❌ Plan file not found. Run 'plan' first."
            exit 1
        fi
        terraform apply "$ENVIRONMENT.tfplan"
        rm -f "$ENVIRONMENT.tfplan"
        ;;
    destroy)
        terraform init -upgrade
        terraform plan -destroy -var-file="terraform.tfvars" -out="$ENVIRONMENT-destroy.tfplan"
        read -p "⚠️  Are you sure you want to destroy $ENVIRONMENT? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            terraform apply "$ENVIRONMENT-destroy.tfplan"
            rm -f "$ENVIRONMENT-destroy.tfplan"
        else
            echo "Destroy cancelled"
            rm -f "$ENVIRONMENT-destroy.tfplan"
        fi
        ;;
    *)
        echo "Invalid action: $ACTION"
        echo "Valid actions: plan, apply, destroy"
        exit 1
        ;;
esac

echo "✅ Terraform $ACTION completed for $ENVIRONMENT"
```

### GitHub Actions Workflow
```yaml
# .github/workflows/terraform.yml
name: Terraform Infrastructure

on:
  push:
    branches: [ main, develop ]
    paths: [ 'terraform/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'terraform/**' ]

env:
  TF_VERSION: 1.5.7

jobs:
  terraform-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Format Check
        run: terraform fmt -check -recursive terraform/
      
      - name: Terraform Validate
        run: |
          for env in qa staging production; do
            cd terraform/environments/$env
            terraform init -backend=false
            terraform validate
            cd ../../..
          done

  terraform-plan-qa:
    if: github.ref == 'refs/heads/develop'
    needs: terraform-check
    runs-on: ubuntu-latest
    environment: qa
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Plan QA
        run: |
          cd terraform/environments/qa
          terraform init
          terraform plan -var-file="terraform.tfvars"

  terraform-apply-qa:
    if: github.ref == 'refs/heads/develop'
    needs: terraform-plan-qa
    runs-on: ubuntu-latest
    environment: qa
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Apply QA
        run: |
          cd terraform/environments/qa
          terraform init
          terraform apply -var-file="terraform.tfvars" -auto-approve

  terraform-plan-production:
    if: github.ref == 'refs/heads/main'
    needs: terraform-check
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: us-east-1
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Plan Production
        run: |
          cd terraform/environments/production
          terraform init
          terraform plan -var-file="terraform.tfvars"
```

## Cost Optimization Strategies

### Environment-Specific Optimizations
```hcl
# Cost optimization based on environment
locals {
  cost_optimizations = {
    qa = {
      use_spot_instances    = true
      single_az_deployment  = true
      minimal_monitoring    = true
      no_read_replicas     = true
      smaller_instances    = true
    }
    
    staging = {
      use_spot_instances   = false
      multi_az_deployment  = true
      basic_monitoring     = true
      single_read_replica  = true
      medium_instances     = true
    }
    
    production = {
      use_spot_instances   = false
      multi_az_deployment  = true
      full_monitoring      = true
      multiple_read_replicas = true
      optimized_instances  = true
    }
  }
}
```

### Resource Tagging Strategy
```hcl
# Consistent tagging for cost allocation
locals {
  common_tags = {
    Environment = var.environment
    Project     = "CryptoTracker"
    ManagedBy   = "Terraform"
    CostCenter  = var.environment == "production" ? "prod-ops" : "dev-ops"
    Owner       = "platform-team"
    BackupSchedule = var.environment == "production" ? "daily" : "weekly"
  }
}
```

## Security & Compliance

### Remote State Management
```hcl
# Backend configuration with encryption and locking
terraform {
  backend "s3" {
    bucket         = "cryptotracker-terraform-state"
    key            = "${var.environment}/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locks"
    encrypt        = true
    kms_key_id     = "alias/terraform-state-key"
  }
}
```

### Secrets Management
```hcl
# AWS Secrets Manager integration
resource "aws_secretsmanager_secret" "database_credentials" {
  name                    = "${var.environment}/cryptotracker/database"
  description             = "Database credentials for ${var.environment}"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "database_credentials" {
  secret_id = aws_secretsmanager_secret.database_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    host     = aws_db_instance.main.endpoint
    port     = aws_db_instance.main.port
    dbname   = aws_db_instance.main.db_name
  })
}
```

This Terraform setup provides a robust, scalable, and secure infrastructure management solution for your three-stage deployment pipeline, with proper cost optimization and environment-specific configurations.