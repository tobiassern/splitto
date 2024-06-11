// import { addUserDevice, addUserToChannel } from '$lib/server/db/subscriptionDb';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import type { PushSubscription } from '@block65/webcrypto-web-push';
import type { RequestEvent } from '@sveltejs/kit';
import {
	// notificationsChannelUsersTable,
	// notifications_channels_table,
	userDevicesTable
} from '$lib/schema';
const addUserDevice = async (
	event: RequestEvent,
	userID: number,
	subscription: PushSubscription
) => {
	await event.locals.db
		.insert(userDevicesTable)
		.values({
			user_id: userID,
			subscription: JSON.stringify(subscription),
			endpoint: subscription.endpoint
		})
		.onConflictDoNothing();
};

// const addUserToChannel = async (event: RequestEvent, user_id: number, channelId: string) => {
// 	await event.locals.db
// 		.insert(notifications_channels_table)
// 		.values({ id: channelId })
// 		.onConflictDoNothing();

// 	await event.locals.db
// 		.insert(notifications_channel_users_table)
// 		.values({ channel_id: channelId, user_id: user_id })
// 		.onConflictDoNothing();
// };

export const POST = (async (event) => {
	console.log('## API / NOTIFICATION / SUBSCRIPTIONS  ##');
	const { locals, request } = event;
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const data = await request.json();

	if (!data.subscription) {
		console.log('No subscription passed to addSubscription', data);
		throw error(400, 'Bad Request');
	}

	await addUserDevice(event, locals.user.id, data.subscription);
	// await addUserToChannel(event, locals.user.id, 'general');

	return json({ success: true });
}) satisfies RequestHandler;
