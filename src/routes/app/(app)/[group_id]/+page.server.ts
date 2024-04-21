import type { PageServerLoad } from './$types';
import { isAuthenticated } from '$lib/helpers';

export const load: PageServerLoad = async (event) => {
	isAuthenticated(event);

	return {};
};
