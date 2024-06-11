self.addEventListener('fetch', function () {
	return;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('push', function (event: any) {
	console.log('## PUSH NOTIFICATION RECEIVED ##');
	const payload = event.data?.json() ?? 'no payload';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const registration = (self as any).registration as ServiceWorkerRegistration;
	event.waitUntil(
		registration.showNotification('Splitto', {
			body: payload.message,
			data: {
				url: payload.url
			}
		})
	);
} as EventListener);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('notificationclick', (event: any) => {
	console.log('On notification click: ', event.notification);
	event.notification.close();

	// This looks to see if the current is already open and
	// focuses if it is

	event.waitUntil(
		// clients.openWindow(event.data.url + "?notification_id=" + event.data.id)
		clients.openWindow(event.notification.data.url)
	);
});
