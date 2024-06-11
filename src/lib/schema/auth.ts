import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { currencies } from '../currencies';
import { generateRandomString, alphabet } from 'oslo/crypto';
import { relations } from 'drizzle-orm';
const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];

export const userTable = sqliteTable('user', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
	email: text('email').notNull().unique(),
	phone_number: text('phone_number'),
	name: text('name').notNull(),
	avatar_url: text('avatar_url'),
	super_admin: integer('super_admin', { mode: 'boolean' }),
	email_verified: integer('email_verified', { mode: 'boolean' }).default(false),
	default_currency: text('currency', { enum: zodEnum(Object.keys(currencies)) })
		.notNull()
		.default('USD')
});

export const userRelations = relations(userTable, ({ many }) => ({
	sessions: many(sessionTable)
}));
export const sessionTable = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: integer('user_id', { mode: 'number' })
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull(),
	user_agent: text('user_agent')
});

export const sessionRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.id]
	})
}));

export const emailVerificationTokensTable = sqliteTable('email_verification_tokens', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	code: text('code')
		.$defaultFn(() => generateRandomString(6, alphabet('0-9')))
		.notNull(),
	email: text('email').notNull(),
	user_id: integer('user_id', { mode: 'number' })
		.notNull()
		.references(() => userTable.id, {
			onDelete: 'cascade'
		}),
	created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`)
});

export const sign_up_schema = createInsertSchema(userTable, {
	email: (schema) => schema.email.email().toLowerCase(),
	name: (schema) => schema.name.min(2)
})
	.omit({ id: true })
	.extend({
		redirect_to: z.string().optional()
	});

export const sign_in_schema = z.object({
	email: z.string().email(),
	redirect_to: z.string().optional()
});

export const verify_email_schema = z.object({
	email: z.string().email(),
	otp: z.string().length(6),
	redirect_to: z.string().optional()
});

export const update_user_name_schema = z.object({
	name: z.string().min(2)
});

export const update_user_email_schema = z.object({
	email: z.string().email()
});

export const update_default_currency_schema = z.object({
	default_currency: z.enum(zodEnum(Object.keys(currencies)))
});
