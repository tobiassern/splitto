import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '$lib/schema';
import { dev } from '$app/environment';
import { TURSO_AUTH_TOKEN, TURSO_CONNECTION_URL } from '$env/static/private';
const client = createClient(
	dev ? { url: 'file:local.sqlite' } : { url: TURSO_CONNECTION_URL, authToken: TURSO_AUTH_TOKEN }
);
export const db = drizzle(client, { schema });
export type DB = typeof db;
