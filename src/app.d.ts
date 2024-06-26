// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { DB } from '$lib/server/db';
import { groupMembersTable, groupsTable, tagsTable, userTable } from '$lib/schema';

type Group = typeof groupsTable.$inferSelect;
type Member = typeof groupMembersTable.$inferSelect;
type Tag = typeof tagsTable.$inferSelect;
interface ExtendedMember extends Member {
	user: typeof userTable.$inferSelect | null;
}
interface ExtendedGroup extends Group {
	owner: typeof userTable.$inferSelect;
	members: ExtendedMember[];
	tags: Tag[];
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
			groups?: ExtendedGroup[] | undefined | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
