import type { RequestEvent } from '@sveltejs/kit';
import { buildPushPayload, type PushSubscription } from '@block65/webcrypto-web-push';
import { and, desc, eq, inArray, isNotNull } from 'drizzle-orm';
import { groupMembersTable, notificationsLogTable, userDevicesTable } from '$lib/schema';
import { PRIVATE_VAPID_KEY, VAPID_SUBJECT } from '$env/static/private';
import { PUBLIC_VAPID_KEY } from '$env/static/public';

const deleteIfExpired = async (event: RequestEvent, deviceId: number) => {
	const lastSuccess = await event.locals.db.query.notificationsLogTable.findMany({
		where: and(
			eq(notificationsLogTable.device_id, deviceId),
			eq(notificationsLogTable.success, false)
		),
		orderBy: desc(notificationsLogTable.created_at),
		limit: 3
	});

	if (lastSuccess.length === 0) {
		console.log(`Removing expired subscription for device ${deviceId}`);
		await event.locals.db.delete(userDevicesTable).where(eq(userDevicesTable.id, deviceId));
	}
};

const sendNotification = async (
	subscription: PushSubscription,
	data: { message: string; url?: string }
) => {
	console.log(subscription);

	try {
		const payload = await buildPushPayload(
			{
				data,
				options: {
					ttl: 86400
				}
			},
			subscription,
			{
				subject: VAPID_SUBJECT,
				publicKey: PUBLIC_VAPID_KEY,
				privateKey: PRIVATE_VAPID_KEY
			}
		);

		const res = await fetch(subscription.endpoint, payload);
		return {
			ok: res.status === 201,
			status: res.status,
			body: res.body
		};
	} catch (err) {
		const msg = `Could not send notification: ${err}`;
		console.error(msg);
		return {
			ok: false,
			status: undefined,
			body: msg
		};
	}
};

const sendNotificationToDevices = async (
	event: RequestEvent,
	devices: (typeof userDevicesTable.$inferSelect)[],
	data: { message: string; url?: string }
) => {
	console.log('## SEND NOTIFICATION TO DEVICES  ##');
	devices.forEach(async (device) => {
		const subscription = JSON.parse(device.subscription);
		const res = await sendNotification(subscription, data);

		if (!res.ok) {
			console.error(
				`Failed to send notification to device ${device.id}: ${res.body} (${res.status}).
		${JSON.stringify(res)}`
			);
		}

		await event.locals.db.insert(notificationsLogTable).values({
			device_id: device.id,
			data: data,
			http_status_response: res.status,
			success: res.ok,
			error_message: !res.ok ? String(res.body) : null
		});

		// remove expired subscription
		if (res.status === 410) {
			await event.locals.db.delete(userDevicesTable).where(eq(userDevicesTable.id, device.id));
		} else if (!res.ok) {
			await deleteIfExpired(event, device.id);
		}
	});
};

export const notifyUser = async (
	event: RequestEvent,
	userID: number,
	data: { message: string; url?: string }
) => {
	console.log('## NOTIFY USER ## ', userID);

	const devices = await event.locals.db.query.userDevicesTable.findMany({
		where: eq(userDevicesTable.user_id, userID)
	});

	console.log('## DEVICES ## ', devices);

	await sendNotificationToDevices(event, devices, data);
};

export const notifyGroupMembers = async (
	event: RequestEvent,
	data: { message: string; url?: string },
	group_members: number[]
) => {
	const users = await event.locals.db.query.groupMembersTable.findMany({
		where: and(inArray(groupMembersTable.id, group_members), isNotNull(groupMembersTable.user_id)),
		columns: {
			user_id: true
		}
	});

	console.log(users);
	for (const user of users) {
		if (user.user_id) await notifyUser(event, user.user_id, data);
	}
};
