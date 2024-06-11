import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
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

export const notificationsLogTable = sqliteTable('notifications_log', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	created_at: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
	device_id: integer('device_id').references(() => userDevicesTable.id, { onDelete: 'set null' }),
	payload: text('payload'),
	http_status_response: integer('http_status_response'),
	success: integer('success', { mode: 'boolean' }),
	error_message: text('error_message')
});
