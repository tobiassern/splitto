import type { Reroute } from '@sveltejs/kit';
import { PUBLIC_APP_HOSTNAME, PUBLIC_ADMIN_HOSTNAME } from '$env/static/public';

export const reroute: Reroute = ({ url }) => {
	if (url.hostname === PUBLIC_APP_HOSTNAME) {
		return '/app' + url.pathname;
	} else if (url.hostname === PUBLIC_ADMIN_HOSTNAME) {
		return '/admin' + url.pathname;
	} else {
		return '/site' + url.pathname;
	}
};
