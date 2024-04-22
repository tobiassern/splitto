// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { DB } from '$lib/server/db';
import { groupMembersTable, groupsTable, tagsTable } from '$lib/schema';

type Group = typeof groupsTable.$inferSelect;
type Member = typeof groupMembersTable.$inferSelect;
interface ExtendedMember extends Member {
	user?: {
		id: number;
		email: string;
		name: string;
		avatar_url: string | null | undefined;
	} | null;
}
interface ExtendedGroup extends Group {
	members: ExtendedMember[];
	tags: typeof tagsTable$.$inferSelect[]
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: DB;
			lucia: import('lucia').Lucia;
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
			group?: ExtendedGroup | undefined | null;
		}
		interface PageData {
			group?: ExtendedGroup | undefined | null;
			user?: import('lucia').User | null | undefined;
			breadcrumbs?: { label: string; path?: string }[];
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
