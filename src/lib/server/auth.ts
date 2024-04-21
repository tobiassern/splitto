import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { sessionTable, userTable } from '$lib/schema';
import { db } from './db';

export function initializeLucia() {
	const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);
	return new Lucia(adapter, {
		getUserAttributes: (attributes) => {
			const userAttr: {
				name: string;
				avatar_url: string | null;
				email: string;
				is_super_admin?: boolean | undefined;
			} = {
				name: attributes.name,
				avatar_url: attributes.avatar_url,
				email: attributes.email
			};
			if (attributes.is_super_admin) userAttr.is_super_admin = true;
			return userAttr;
		},
		getSessionAttributes: (attributes) => {
			return {
				user_agent: attributes.user_agent
			};
		},
		sessionCookie: {
			attributes: {
				// set to `true` when using HTTPS
				secure: !dev,
				sameSite: 'lax'
				// domain: dev ? '.platform.localhost' : PUBLIC_HOST
				// domain: `.${PUBLIC_HOSTNAME}`
			}
		}
	});
}

declare module 'lucia' {
	interface Register {
		Lucia: ReturnType<typeof initializeLucia>;
		UserId: number;
		DatabaseUserAttributes: DatabaseUserAttributes;
		DatabaseSessionAttributes: {
			user_agent?: string | null;
		};
	}
}

interface DatabaseUserAttributes {
	email: string;
	name: string;
	avatar_url: string | null;
	is_super_admin?: boolean;
}
