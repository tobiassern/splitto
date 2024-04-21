import type { Config } from 'drizzle-kit';
export default {
	schema: './src/lib/schema',
	out: './drizzle',
	driver: 'turso',
	dbCredentials: {
		url: 'file:./local.sqlite'
	},
	verbose: true,
	strict: true
} satisfies Config;
