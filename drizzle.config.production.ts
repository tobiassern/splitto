import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
	schema: './src/lib/schema',
	out: './drizzle/production',
	dialect: 'sqlite',
	driver: 'turso',
	dbCredentials: {
		url: process.env.TURSO_CONNECTION_URL ?? '',
		authToken: process.env.TURSO_AUTH_TOKEN
	},
	verbose: true,
	strict: true
} satisfies Config;
