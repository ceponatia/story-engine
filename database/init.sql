-- PostgreSQL + pgvector initialization for Story Engine
-- This file runs first during container initialization

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";