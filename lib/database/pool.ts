import { Pool } from 'pg';

export interface DatabasePoolConfig {
  connectionString: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  ssl?: boolean | object;
}

export interface PoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}

/**
 * Centralized database connection pool manager
 * Consolidates multiple uncoordinated pools into single, well-managed instance
 * Combines robust configuration from auth.ts with SSL handling from connection.ts
 */
export class DatabasePoolManager {
  private static instance: Pool | null = null;
  private static shutdownInitiated = false;

  /**
   * Get the singleton database pool instance
   * Uses dependency injection pattern for Better Auth compatibility
   */
  static getPool(): Pool {
    if (!this.instance) {
      this.instance = this.createPool();
      this.setupLifecycleManagement();
    }
    return this.instance;
  }

  /**
   * Create pool with consolidated configuration
   * Adopts auth.ts connection management + connection.ts SSL handling
   */
  private static createPool(): Pool {
    const config: DatabasePoolConfig = {
      connectionString: process.env.DATABASE_URL!,
      max: 20, // From auth.ts - prevents resource exhaustion
      idleTimeoutMillis: 30000, // From auth.ts - 30 seconds
      connectionTimeoutMillis: 2000, // From auth.ts - 2 seconds
      ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false  // Local development mock - TODO: Enable for production
      } : false,
    };

    const pool = new Pool(config);

    // Centralized error handling (improved from connection.ts)
    pool.on('error', (err) => {
      console.error('Database pool error:', err.message);
      // Log error but allow graceful handling - no process.exit(-1)
    });

    // Connection monitoring
    pool.on('connect', () => {
      console.debug('New database connection established');
    });

    pool.on('remove', () => {
      console.debug('Database connection removed from pool');
    });

    return pool;
  }

  /**
   * Setup centralized lifecycle management
   * Prevents duplicate signal handlers and ensures proper cleanup
   */
  private static setupLifecycleManagement(): void {
    if (this.shutdownInitiated) return;

    const gracefulShutdown = async (signal: string) => {
      if (this.shutdownInitiated) return;
      this.shutdownInitiated = true;

      console.log(`Received ${signal}, closing database pool gracefully...`);
      
      try {
        if (this.instance) {
          await this.instance.end();
          this.instance = null;
          console.log('Database pool closed successfully');
        }
      } catch (error) {
        console.error('Error closing database pool:', error);
      }
      
      process.exit(0);
    };

    // Register signal handlers once
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  /**
   * Get pool statistics for monitoring
   */
  static getPoolStats(): PoolStats | null {
    if (!this.instance) return null;

    return {
      totalCount: this.instance.totalCount,
      idleCount: this.instance.idleCount,
      waitingCount: this.instance.waitingCount,
    };
  }

  /**
   * Test database connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      const pool = this.getPool();
      await pool.query('SELECT NOW()');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Force pool cleanup (for testing/emergency use)
   */
  static async forceShutdown(): Promise<void> {
    if (this.instance) {
      await this.instance.end();
      this.instance = null;
      this.shutdownInitiated = false;
    }
  }

  /**
   * Backward compatibility: maintain getDatabase() interface
   */
  static getDatabase(): Pool {
    return this.getPool();
  }
}

// Export convenience functions for backward compatibility
export function getDatabase(): Pool {
  return DatabasePoolManager.getDatabase();
}

export async function testConnection(): Promise<boolean> {
  return DatabasePoolManager.testConnection();
}

// Default export for existing imports
export default getDatabase;