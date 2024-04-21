import type { PageServerLoad, Actions } from './$types';
import { isAuthenticated } from '$lib/helpers';

export const load: PageServerLoad = async (event) => {
	const { user } = isAuthenticated(event);

	// return { expenses: await event.locals.db.query}
	return {};
};
