import { text, integer, sqliteTable, unique } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tagsTable, transactionSplitsTable, transactionsTable, userTable } from '.';
import { sql, relations } from 'drizzle-orm';
import { currencies } from '../currencies';
const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];

export const groupsTable = sqliteTable('groups', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
	name: text('name').notNull(),
	owner_id: integer('user_id', { mode: 'number' }).references(() => userTable.id, {
		onDelete: 'cascade'
	}),
	currency: text('currency', { enum: zodEnum(Object.keys(currencies)) })
		.notNull()
		.default('USD')
});

export const groupMembersTable = sqliteTable(
	'group_members',
	{
		id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
		group_id: integer('group_id', { mode: 'number' })
			.references(() => groupsTable.id, { onDelete: 'cascade' })
			.notNull(),
		user_id: integer('user_id', { mode: 'number' }).references(() => userTable.id, {
			onDelete: 'cascade'
		}),
		name: text('name').notNull(),
		email: text('email')
	},
	(t) => ({
		unq: unique().on(t.group_id, t.email),
		unq2: unique().on(t.group_id, t.user_id)
	})
);

export const groupsRelations = relations(groupsTable, ({ one, many }) => ({
	owner: one(userTable, {
		fields: [groupsTable.owner_id],
		references: [userTable.id]
	}),
	members: many(groupMembersTable),
	tags: many(tagsTable)
}));

export const groupMembersRelations = relations(groupMembersTable, ({ one, many }) => ({
	group: one(groupsTable, {
		fields: [groupMembersTable.group_id],
		references: [groupsTable.id]
	}),
	user: one(userTable, {
		fields: [groupMembersTable.user_id],
		references: [userTable.id]
	}),
	expenses: many(transactionsTable),
	expense_splits: many(transactionSplitsTable)
}));

export const insert_group_schema = createInsertSchema(groupsTable, {
	name: (schema) => schema.name.min(2)
}).omit({ id: true, owner_id: true });

export const insert_group_member_schema = createInsertSchema(groupMembersTable, {
	name: (schema) => schema.name.min(2),
	email: (schema) => schema.email.email().toLowerCase().nullable()
}).omit({ id: true, group_id: true });

export const update_group_name_schema = z.object({
	name: z.string().min(2)
});

export const update_group_currency_schema = z.object({
	currency: z.enum(zodEnum(Object.keys(currencies)))
});
