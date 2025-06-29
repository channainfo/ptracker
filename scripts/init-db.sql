-- Initialize CryptoTracker Database
-- This script sets up the basic database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable TimescaleDB extension for time-series data
-- CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create basic database schema
CREATE SCHEMA IF NOT EXISTS public;

-- Set up database for TypeORM migrations
-- The actual schema will be created by TypeORM migrations