# NAMING CONVENTIONS

## Component & Frontend Code
Component file names should use camelCase:

### Examples:
- avatarUpload.tsx
- quickActions.tsx

Use dot.case when it improves clarity:
Recommended for subtyped or role-specific components:
- character.form.tsx
- character.page.tsx
- dashboard.quickActions.tsx

## Component directories should mirror their filename prefixes:

components/
  character/
    character.form.tsx
    character.page.tsx
🧬 Database Fields & Types

## Database field names (MongoDB, PostgreSQL) must use snake_case, even in TypeScript interfaces:

### Examples:

interface Character {
  user_id: string;
  created_at: Date;
  avatar_url?: string;
  scents_aromas?: string;
}

This ensures consistency with real database documents and query APIs.

ESLint is configured to allow snake_case in object keys while enforcing camelCase elsewhere.