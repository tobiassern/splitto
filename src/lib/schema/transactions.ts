import { text, integer, sqliteTable, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import { relations, sql } from 'drizzle-orm';
import { groupMembersTable, groupsTable } from './groups';

export const transactionsTable = sqliteTable('transactions', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
	type: text('type', { enum: ['expense', 'settlement'] }).notNull(),
	when: integer('when', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
	label: text('label'),
	group_id: integer('group_id', { mode: 'number' })
		.references(() => groupsTable.id, { onDelete: 'cascade' })
		.notNull(),
	group_member_id: integer('group_member_id', { mode: 'number' })
		.references(() => groupMembersTable.id)
		.notNull()
});

export const transactionSplitsTable = sqliteTable('transaction_splits', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	type: text('type', { enum: ['debit', 'credit'] }).notNull(),
	transaction_id: integer('transaction_id', { mode: 'number' })
		.references(() => transactionsTable.id, { onDelete: 'cascade' })
		.notNull(),
	amount: real('amount').notNull(),
	group_member_id: integer('group_member_id', { mode: 'number' })
		.references(() => groupMembersTable.id)
		.notNull()
});

export const tagsTable = sqliteTable('tags', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	label: text('label').notNull(),
	monthly_budget: real('monthly_budget'),
	group_id: integer('group_id', { mode: 'number' })
		.references(() => groupsTable.id, { onDelete: 'cascade' })
		.notNull()
});

export const transactionTagsTable = sqliteTable(
	'transaction_tags',
	{
		tag_id: integer('tag_id', { mode: 'number' })
			.references(() => tagsTable.id, { onDelete: 'cascade' })
			.notNull(),
		transaction_id: integer('transaction_id', { mode: 'number' })
			.references(() => transactionsTable.id, { onDelete: 'cascade' })
			.notNull()
	},
	(table) => {
		return {
			unq: primaryKey({ columns: [table.tag_id, table.transaction_id] })
		};
	}
);

export const transactionsRelations = relations(transactionsTable, ({ one, many }) => ({
	group: one(groupsTable, {
		fields: [transactionsTable.group_id],
		references: [groupsTable.id]
	}),
	group_member: one(groupMembersTable, {
		fields: [transactionsTable.group_member_id],
		references: [groupMembersTable.id]
	}),
	splits: many(transactionSplitsTable),
	tags: many(transactionTagsTable)
}));

export const transactionTagsRelations = relations(transactionTagsTable, ({ one }) => ({
	transaction: one(transactionsTable, {
		fields: [transactionTagsTable.transaction_id],
		references: [transactionsTable.id]
	}),
	tag: one(tagsTable, {
		fields: [transactionTagsTable.tag_id],
		references: [tagsTable.id]
	})
}));

export const tagsRelations = relations(tagsTable, ({ many, one }) => ({
	transaction_tags: many(transactionTagsTable),
	group: one(groupsTable, {
		fields: [tagsTable.group_id],
		references: [groupsTable.id]
	})
}));

export const transactionSplitsRelations = relations(transactionSplitsTable, ({ one }) => ({
	transaction: one(transactionsTable, {
		fields: [transactionSplitsTable.transaction_id],
		references: [transactionsTable.id]
	}),
	group_member: one(groupMembersTable, {
		fields: [transactionSplitsTable.group_member_id],
		references: [groupMembersTable.id]
	})
}));

export const create_expense_schema = z
	.object({
		label: z.string().nullable(),
		group_member_id: z.number().int().positive(),
		amount: z.coerce.number().positive(),
		when: z.string(),
		tags: z.number().int().array(),
		splits: z
			.object({
				group_member_id: z.number().int().positive(),
				name: z.string().min(2),
				email: z.preprocess((val) => (val ? val : null), z.string().email().nullable()),
				amount: z.coerce.number().nonnegative().nullable(),
				enabled: z.boolean().default(true)
			})
			.array()
	})
	.superRefine((data, ctx) => {
		const splitsAmount = data.splits.reduce((acc, split) => {
			return acc + (split.amount ?? 0);
		}, 0);

		if (splitsAmount > data.amount) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'The sum of all splits is greater than the total amount',
				path: ['splits']
			});
		}
		if (splitsAmount < data.amount) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'The sum of all splits is less than the total amount',
				path: ['splits']
			});
		}
		if (!data.splits.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Need to add at least one person',
				path: ['splits']
			});
		} else {
			data.splits.forEach((split, idx) => {
				if (split.group_member_id === null && split.email) {
					if (
						data.splits.filter(
							(filter_split) => filter_split.email && filter_split.email === split.email
						).length >= 2
					) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: 'Email is already used',
							path: ['splits', idx, 'email']
						});
					}
				}
			});
		}
		return data;
	});

export const create_settlement_schema = z.object({
	label: z.string().default('Settlement'),
	from_id: z.number().int().positive(),
	to_id: z.number().int().positive(),
	amount: z.coerce.number(),
	when: z.string()
});

export const insert_tag_schema = z.object({
	label: z.string().min(2),
	monthly_budget: z.coerce.number().nullable()
});

export const update_tag_schema = z.object({
	monthly_budget: z.coerce.number().nullable(),
	label: z.string().min(2),
	id: z.coerce.number().int()
});
