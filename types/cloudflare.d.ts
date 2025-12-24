// Cloudflare D1 Database 类型声明

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: object;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

// 扩展 process.env 类型
declare namespace NodeJS {
  interface ProcessEnv {
    DB?: unknown;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    NEXTAUTH_SECRET?: string;
    NEXTAUTH_URL?: string;
    R2_ACCOUNT_ID?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
    R2_BUCKET_NAME?: string;
    NEXT_PUBLIC_R2_PUBLIC_URL?: string;
    NEXT_PUBLIC_APP_URL?: string;
  }
}
