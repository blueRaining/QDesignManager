import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// 用于 Cloudflare Workers/Pages 环境
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// 类型定义
export type Database = ReturnType<typeof createDb>;

// 重新导出 schema
export * from "./schema";
