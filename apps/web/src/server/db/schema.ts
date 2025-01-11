// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `golive_${name}`);

export const userTypeEnum = pgEnum("user_type_enum", ["student", "teacher"]);

export const users = createTable("users", {
  id: varchar("id", { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // user details
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  type: userTypeEnum("user_type").notNull().default("student"),
});

export const accounts = createTable(
  "accounts",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    index("account_user_id_idx").on(account.userId),
  ],
);

export const sessions = createTable(
  "sessions",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires_at").notNull(),
  },
  (session) => [index("session_user_id_idx").on(session.userId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  usersToCourses: many(usersToCourses),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const courses = createTable(
  "courses",
  {
    id: varchar("id", { length: 255 })
      .$defaultFn(() => createId())
      .primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).default(""),
    authorId: varchar("author_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    tags: varchar("tags", { length: 255 }).array().default([]),
  },
  (course) => [
    index("course_author_id_idx").on(course.authorId),
    index("course_tags_idx").on(course.tags),
  ],
);

export const usersToCourses = createTable(
  "users_to_courses",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    courseId: varchar("course_id", { length: 255 })
      .notNull()
      .references(() => courses.id),
  },
  (link) => [
    primaryKey({
      columns: [link.userId, link.courseId],
    }),
  ],
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
  author: one(users, {
    fields: [courses.authorId],
    references: [users.id],
  }),
  usersToCourses: many(usersToCourses),
}));

export const usersToCoursesRelations = relations(usersToCourses, ({ one }) => ({
  user: one(users, {
    fields: [usersToCourses.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [usersToCourses.courseId],
    references: [courses.id],
  }),
}));
