import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ==================== 用户相关表 ====================

// users 表：用户信息（Google OAuth）
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// accounts 表：OAuth 账户关联（NextAuth.js）
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => ({
  providerProviderAccountIdIdx: index("provider_provider_account_id_idx").on(table.provider, table.providerAccountId),
}));

// sessions 表：会话管理（NextAuth.js）
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
}));

// verification_tokens 表：验证令牌（NextAuth.js）
export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

// ==================== 分类表 ====================

// categories 表：模型分类
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== 模型相关表 ====================

// models 表：3D 模型核心表
export const models = sqliteTable("models", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),

  // 基本信息
  title: text("title").notNull(),
  description: text("description"),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),

  // R2 存储路径
  modelFileKey: text("model_file_key").notNull(),
  modelFileUrl: text("model_file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  fileFormat: text("file_format").notNull(),
  originalFileName: text("original_file_name"),

  // 缩略图
  thumbnailKey: text("thumbnail_key"),
  thumbnailUrl: text("thumbnail_url"),

  // 元数据
  polygonCount: integer("polygon_count"),
  vertexCount: integer("vertex_count"),
  textureCount: integer("texture_count"),
  animationCount: integer("animation_count").default(0),

  // 统计
  viewCount: integer("view_count").default(0),
  downloadCount: integer("download_count").default(0),

  // 时间戳
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index("models_user_id_idx").on(table.userId),
  categoryIdIdx: index("models_category_id_idx").on(table.categoryId),
  isPublicIdx: index("models_is_public_idx").on(table.isPublic),
  createdAtIdx: index("models_created_at_idx").on(table.createdAt),
}));

// ==================== 标签相关表 ====================

// tags 表：标签
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// model_tags 表：模型-标签关联（多对多）
export const modelTags = sqliteTable("model_tags", {
  modelId: text("model_id").notNull().references(() => models.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.modelId, table.tagId] }),
}));

// ==================== 自定义字段相关表 ====================

// custom_fields 表：自定义字段定义
export const customFields = sqliteTable("custom_fields", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  fieldName: text("field_name").notNull(),
  fieldType: text("field_type").notNull(), // 'text', 'number', 'select', 'date', 'url', 'boolean'
  fieldOptions: text("field_options"), // JSON 数组，用于 select 类型
  isRequired: integer("is_required", { mode: "boolean" }).default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  categoryIdIdx: index("custom_fields_category_id_idx").on(table.categoryId),
}));

// model_custom_data 表：模型自定义字段值
export const modelCustomData = sqliteTable("model_custom_data", {
  id: text("id").primaryKey(),
  modelId: text("model_id").notNull().references(() => models.id, { onDelete: "cascade" }),
  fieldId: text("field_id").notNull().references(() => customFields.id, { onDelete: "cascade" }),
  fieldValue: text("field_value").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  modelIdIdx: index("model_custom_data_model_id_idx").on(table.modelId),
  modelFieldUniqueIdx: index("model_custom_data_unique_idx").on(table.modelId, table.fieldId),
}));

// ==================== 关系定义 ====================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  models: many(models),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  models: many(models),
  customFields: many(customFields),
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  user: one(users, {
    fields: [models.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [models.categoryId],
    references: [categories.id],
  }),
  modelTags: many(modelTags),
  customData: many(modelCustomData),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  modelTags: many(modelTags),
}));

export const modelTagsRelations = relations(modelTags, ({ one }) => ({
  model: one(models, {
    fields: [modelTags.modelId],
    references: [models.id],
  }),
  tag: one(tags, {
    fields: [modelTags.tagId],
    references: [tags.id],
  }),
}));

export const customFieldsRelations = relations(customFields, ({ one, many }) => ({
  category: one(categories, {
    fields: [customFields.categoryId],
    references: [categories.id],
  }),
  modelCustomData: many(modelCustomData),
}));

export const modelCustomDataRelations = relations(modelCustomData, ({ one }) => ({
  model: one(models, {
    fields: [modelCustomData.modelId],
    references: [models.id],
  }),
  field: one(customFields, {
    fields: [modelCustomData.fieldId],
    references: [customFields.id],
  }),
}));

// ==================== 类型导出 ====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type CustomField = typeof customFields.$inferSelect;
export type NewCustomField = typeof customFields.$inferInsert;

export type ModelCustomData = typeof modelCustomData.$inferSelect;
export type NewModelCustomData = typeof modelCustomData.$inferInsert;
