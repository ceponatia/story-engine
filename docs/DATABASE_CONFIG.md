# DATABASE_CONFIG.md

> This application uses a multi-database architecture for optimized separation of concerns. It is a Node.js + TypeScript + Next.js app powered by the Mistral:Instruct model via Ollama, designed to simulate an AI-driven roleplaying game.

---

## 🗃️ Overview

| Database    | Purpose |
|-------------|---------|
| **PostgreSQL** | Primary store for user accounts, authentication data, structured transactional records |
| **MongoDB**    | Dynamic storage for game entities like characters, locations, settings (flexible schema) |
| **Redis**      | Ephemeral cache, in-memory session and temporary data store |
| **Qdrant**     | Vector store for semantic retrieval in RAG pipeline (LLM context injection) |

---

## 🔗 PostgreSQL

- **Client Init:** `lib/postgres/pool.ts`
- **Config:** `lib/postgres/config.ts`
- **Access Pattern:** Uses a pooled client and query runner abstraction.
- **Use Case:** Authentication, user profiles, structured logs.

```ts
// pool.ts
export const pool = new Pool({ connectionString });
```

> ⚠️ **Claude:** Do not rewrite the pool configuration logic. This is used in multiple dependent modules and supports connection pooling and token-aware routing.

---

## 🍃 MongoDB

- **Client Init:** `lib/postgres/mongodb.ts`
- **Repositories:** Modular logic per entity (e.g., `mongodb-location.repository.ts`, `mongodb-setting.repository.ts`)
- **Use Case:** All game world data (characters, settings, locations). Migration in progress from PostgreSQL.

```ts
// mongodb.ts
export const db = client.db(process.env.MONGODB_NAME);
```

> ⚠️ **Claude:** Only use MongoDB for domain objects like characters, settings, and locations. Do not store users here.

---

## 🧠 Redis

- **Init File:** `lib/postgres/redis.ts`
- **Use Case:** Caching, token store, ephemeral data, LLM output storage (if needed)
- **Connection Mode:** Initialized with `createClient()` and environment-driven config

```ts
// redis.ts
const redis = createClient({ url: process.env.REDIS_URL });
```

> 🔐 Redis may be used for temporary memory buffers or action locking. Future integration with message queues possible.

---

## 🧬 Qdrant

- **Init File:** `lib/postgres/qdrant.ts`
- **Use Case:** Vector storage for AI memory, message embeddings, context retrieval
- **Client:** `QdrantClient` with REST transport
- **Collections:** Created dynamically if missing using `ensureCollection`

```ts
// qdrant.ts
export const client = new QdrantClient({ url: QDRANT_URL });
```

> ⚠️ **Claude:** Do not regenerate or reset Qdrant collections unless explicitly instructed. Embedding integrity is critical for memory.

---

## 🔀 Multi-DB Coordination

- **Orchestrator:** `lib/postgres/multi-db-manager.ts`  
  Bridges access between MongoDB and PostgreSQL depending on model type

- **Coordinator:** `lib/postgres/transaction-coordinator.ts`  
  Abstracts transactional logic across databases (e.g., syncing a new character creation across Postgres and Mongo)

---

## 🔧 Environment Variables (Required)

| Variable          | Description                          |
|------------------|--------------------------------------|
| `DATABASE_URL`    | PostgreSQL connection string         |
| `MONGODB_URI`     | MongoDB connection URI               |
| `REDIS_URL`       | Redis connection string              |
| `QDRANT_URL`      | Qdrant server address                |
| `QDRANT_API_KEY`  | *(optional)* for secure deployments  |

---

## 🧠 Developer Notes

- This architecture is evolving — currently mid-migration from PostgreSQL → MongoDB for entity data.
- The structure is designed to separate user data (SQL) from dynamic worldbuilding (NoSQL).
- Redis and Qdrant are supporting systems used for performance and contextual relevance respectively.

---

## 🛡️ Claude Instructions

> Before any action:
- Check this file and `CURRENT_TASK.md` to see which database a feature belongs to.
- Never refactor or duplicate config files (`pool.ts`, `mongodb.ts`, `qdrant.ts`) unless explicitly told to.
- Follow entity-domain separation rules:
  - Users and auth → PostgreSQL  
  - Characters, settings, locations → MongoDB  
  - Memory/context embeddings → Qdrant  
  - Cache/session/temp data → Redis
