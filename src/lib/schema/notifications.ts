import { sqliteTable, text, integer, unique, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { userTable } from '.';

export const userDevicesTable = sqliteTable(
	'user_devices',
	{
		id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
		user_id: integer('user_id')
			.references(() => userTable.id, { onDelete: 'cascade' })
			.notNull(),
		subscription: text('subscription').notNull(),
		endpoint: text('endpoint').notNull()
	},
	(t) => {
		return {
			unq: unique().on(t.user_id, t.endpoint)
		};
	}
);

export const notificationsChannelsTable = sqliteTable('notifications_channels', {
	id: text('id').primaryKey(),
	created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`)
});

export const notificationsChannelUsers_table = sqliteTable(
	'notification_channel_users',
	{
		user_id: integer('user_id').references(() => userTable.id),
		channel_id: text('channel_id').references(() => notificationsChannelsTable.id)
	},
	(t) => {
		return {
			pk: primaryKey({ columns: [t.user_id, t.channel_id] })
		};
	}
);

export const notificationsLogTable = sqliteTable('notifications_log', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
	channel_id: text('channel_id').references(() => notificationsChannelsTable.id),
	device_id: integer('device_id').references(() => userDevicesTable.id, { onDelete: 'set null' }),
	payload: text('payload'),
	http_status_response: integer('http_status_response'),
	success: integer('success', { mode: 'boolean' }),
	error_message: text('error_message')
});
