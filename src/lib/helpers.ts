import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import { redirect, error } from '@sveltejs/kit';

export const isAuthenticated = (event: ServerLoadEvent | RequestEvent) => {
	if (!event.locals.user || !event.locals.session) {
		redirect(302, '/login');
	}

	if (event.params.group_id && !event.locals.group) {
		error(404);
	}

	return { user: event.locals.user, session: event.locals.session };
};

export const isGroupMember = (event: ServerLoadEvent | RequestEvent) => {
	const { user, session } = isAuthenticated(event);

	if (!event.params.group_id || !event.locals.group) {
		error(404, 'Is not group member');
	}

	return { user, session, group: event.locals.group };
};

export const isGroupOwner = (event: ServerLoadEvent | RequestEvent) => {
	const { user, session, group } = isGroupMember(event);

	if (group.owner_id !== user.id) {
		error(400, 'Is not group owner');
	}

	return { user, session, group };
};

export const isSuperAdmin = (event: ServerLoadEvent | RequestEvent) => {

	const { user, session } = isAuthenticated(event);
	console.log(user);
	if (!user.super_admin) error(403, 'Forbidden');
	
	return { user, session }
}

export const getInitials = (text: string | null) => {
	if (!text) return '';
	return text
		.split(' ')
		.map((txt) => txt[0]?.toUpperCase() ?? '')
		.join('');
};
