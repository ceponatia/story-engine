# Story Engine - TODO & Reorganization Plan

## 1. FUNCTIONALITY TO FIX/RE-IMPLEMENT

### Low Priority Issues
- **Workspace Package Integration**: Proper integration throughout web app
- **Cloud Storage Migration**: Replace local file storage with cloud storage (AWS S3/Cloudinary)

## 2. FILES/FOLDERS TO REORGANIZE FOR MONOREPO

### Current Structure Assessment
✅ **Well-Organized (Keep As-Is):**
- `/packages/` - Database-specific packages are properly segregated
- `/apps/web/` - Web application properly isolated
- `/docs/` - Documentation centralized
- `/database/` - Database scripts and migrations

### Reorganization Needed

#### Fix Import Paths
- **Problem**: Web app imports from relative paths instead of workspace packages
- **Solution**: Update all imports to use `@story-engine/package-name` format

#### Database-Specific Segregation
- **Postgres Package**: ✅ Already properly segregated in `/packages/postgres/`
- **MongoDB Package**: ✅ Already properly segregated in `/packages/mongodb/`
- **Redis Package**: ✅ Already properly segregated in `/packages/redis/`
- **Qdrant Package**: ✅ Already properly segregated in `/packages/qdrant/`

#### Shared Utilities
- **Problem**: Some utilities are database-specific but should be global
- **Solution**: Move truly global utilities to `/packages/utils/` or `/packages/sharedUtils/`

#### Validation Segregation
- **Current**: `/packages/validation/` exists but inconsistently used
- **Recommendation**: Maintain database-specific validation in respective packages, global validation in `/packages/validation/`

## 3. DATABASE ASSOCIATION VERIFICATION

### ✅ CORRECTLY ASSOCIATED

#### PostgreSQL (User & Adventure Data)
- **User accounts**: ✅ Properly stored in PostgreSQL via Better Auth
- **Adventure records**: ✅ Correctly in PostgreSQL `/packages/postgres/src/repositories/adventure.repository.ts`
- **Adventure messages**: ✅ Correctly in PostgreSQL for chat history
- **Adventure characters**: ✅ Correctly in PostgreSQL for adventure-specific data

#### MongoDB (Object Data)
- **Character objects**: ✅ Correctly stored in MongoDB `/packages/mongodb/src/repositories/character.repository.ts`
- **Location objects**: ✅ Correctly associated with MongoDB
- **Setting objects**: ✅ Correctly associated with MongoDB
- **Future objects** (items, clothing, etc.): ✅ Should continue using MongoDB

#### Redis (Sessions/Cache)
- **Session data**: ✅ Correctly configured for Redis
- **Cache layer**: ✅ Properly associated with Redis

#### Qdrant (Vector Storage)
- **RAG embeddings**: ✅ Correctly associated with Qdrant
- **Vector search**: ✅ Properly configured for Qdrant

### Issues Found
- **Import Path Problems**: Repositories reference wrong database managers
- **Type Mismatches**: MongoDB repos import PostgreSQL types
- **Missing Connections**: Database managers not properly connected to web app

## 4. OVER-ENGINEERING ASSESSMENT

### Areas of Over-Engineering
- **Repository Interfaces**: 233 lines of interfaces for simple CRUD operations
- **Multiple Abstraction Layers**: IRepository, IRepositoryWithCache, IAdvancedRepository
- **Complex Factory Patterns**: Registry systems not currently utilized  
- **Extensive Metrics**: Health monitoring for single-user application
- **Transaction Support**: Implemented but unused
- **Circuit Breaker Patterns**: For basic database operations

### Simplification Opportunities
- **Repository Pattern**: Simplify to basic CRUD operations
- **Database Manager**: Consider direct connections instead of multi-database manager
- **Configuration**: DatabaseConfig class overly complex for current needs
- **Interface Reduction**: Eliminate unused abstraction layers

## 5. SECURITY REVIEW

### ✅ Strong Areas
- Better Auth implementation with proper session management
- File upload validation (type, size limits)
- Environment variable validation
- SSL configuration in production

### ⚠️ Areas of Concern
- Missing input validation in many forms
- No rate limiting on API endpoints
- File upload stores locally (noted as TODO)
- No visible CSRF protection

## 6. IMMEDIATE ACTION ITEMS

### Phase 1 (Critical - Application Won't Run)
1. Fix database manager import chain
2. Update MongoDB repository imports to use proper workspace packages
3. Fix auth helper postgres pool import
4. Create missing character actions file
5. Fix postgres repository import paths

### Phase 2 (Functionality Restoration)
1. Restore missing character parser functionality
2. Fix avatar upload component path
3. Add proper input validation
4. Align types between database implementations

### Phase 3 (Optimization)
1. Simplify over-engineered repository patterns
2. Implement proper workspace package integration
3. Add security improvements (rate limiting, CSRF)
4. Migrate to cloud storage for file uploads

## 7. MONOREPO STRUCTURE RECOMMENDATIONS

### Keep Current Structure
- Database packages properly segregated by database type
- Web app isolated in `/apps/web/`
- Shared utilities in `/packages/sharedUtils/`
- Validation appropriately distributed

### Required Changes
- Fix import paths to use proper workspace package names
- Ensure all packages export proper barrel files (`index.ts`)
- Update tsconfig paths to align with workspace structure
- Fix database manager connections between packages and web app

## 8. REMAINING ISSUES (Post-Import Refactoring)

### TypeScript Configuration Issues
- **Problem**: Package `tsconfig.json` files have malformed `composite` settings
- **Symptoms**: Duplicate `compilerOptions` blocks, missing closing braces
- **Affected packages**: postgres, mongodb, redis, qdrant, adventures, ai, auth, validation, utils, world, types
- **Solution**: Fix all package tsconfig files to have proper `composite: true` setting

### Missing Dependencies & Broken Imports
- **ValidatedLLMService**: Referenced in `llm.ts` but doesn't exist in validation package
- **Multi-DB Manager**: Referenced in `llm.ts` but file doesn't exist
- **Character Parser**: Several imports in `character.state.ts` may not exist in target packages
- **AI Functions**: Dynamic imports in `llm.ts` may not resolve correctly

### Web App Configuration Issues
- **Missing Next.js**: Web app build fails with "Cannot find module 'next/dist/bin/next'"
- **Node Modules**: Web app dependencies not properly installed
- **Build Dependencies**: Package dependencies not properly linked for build process

### Package Export Issues
- **Inconsistent Exports**: Some packages may not export all required functions/classes
- **Type Exports**: Some type imports may not be properly exported from barrel files
- **Missing Utilities**: Some utility functions referenced in imports may not exist

### Database Connection Issues
- **MongoDB Connection**: Generic type constraints causing build failures
- **Repository Base Classes**: Missing methods like `safeObjectId` and `getCurrentTimestamp`
- **Database Manager**: Integration between packages and web app still needs work

### File Path Issues
- **Relative Imports**: Some packages still contain relative imports to web app paths
- **Missing Files**: Several referenced files in domain/characters package don't exist
- **Circular Dependencies**: Potential circular imports between packages

### Build System Issues
- **Turbo Configuration**: Build system not properly configured for monorepo structure
- **Package Dependencies**: Workspace dependencies not properly declared
- **TypeScript References**: Project references in tsconfig causing build conflicts

## 9. CONCLUSION

✅ **COMPLETED**: Workspace package integration is complete - all web app imports now use proper `@story-engine/*` aliases

⚠️ **REMAINING**: Build system and package configuration issues need to be resolved for the application to compile and run properly. The import refactoring revealed deeper structural issues that require additional fixes to the build infrastructure and package dependencies.