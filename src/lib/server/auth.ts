import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { sessionTable, userTable } from '$lib/schema';
import { db } from './db';
import { PUBLIC_SITE_HOSTNAME } from '$env/static/public';

export function initializeLucia() {
	const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);
	return new Lucia(adapter, {
		getUserAttributes: (attributes) => {
			const userAttr: {
				name: string;
				avatar_url: string | null;
				email: string;
				super_admin?: boolean | undefined;
				budget_average_daily: DatabaseUserAttributes['budget_average_daily'];
				budget_weekly: DatabaseUserAttributes['budget_weekly'];
				budget_monthly: DatabaseUserAttributes['budget_monthly'];
				default_currency: DatabaseUserAttributes['default_currency'];
			} = {
				name: attributes.name,
				avatar_url: attributes.avatar_url,
				email: attributes.email,
				budget_average_daily: attributes.budget_average_daily,
				budget_weekly: attributes.budget_weekly,
				budget_monthly: attributes.budget_monthly,
				default_currency: attributes.default_currency
			};
			if (attributes.super_admin) userAttr.super_admin = true;
			return userAttr;
		},
		getSessionAttributes: (attributes) => {
			return {
				user_agent: attributes.user_agent
			};
		},
		sessionCookie: {
			attributes: {
				secure: !dev,
				sameSite: 'lax',
				domain: `.${PUBLIC_SITE_HOSTNAME}`
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

type DatabaseUserAttributes = typeof userTable.$inferSelect;
