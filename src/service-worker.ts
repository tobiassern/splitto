// self.addEventListener('fetch', function () {
// 	return;
// });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('push', function (event: any) {
	const payload = event.data?.text() ?? 'no payload';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const registration = (self as any).registration as ServiceWorkerRegistration;
	event.waitUntil(
		registration.showNotification('Splitto', {
			body: payload
		})
	);
} as EventListener);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('notificationclick', (event: any) => {
	console.log('On notification click: ', event.notification);
	event.notification.close();

	// This looks to see if the current is already open and
	// focuses if it is
	// event.waitUntil(
	//   clients
	// 	.matchAll({
	// 	  type: "window",
	// 	})
	// 	.then((clientList) => {
	// 	  for (const client of clientList) {
	// 		if (client.url === "/" && "focus" in client) return client.focus();
	// 	  }
	// 	  if (clients.openWindow) return clients.openWindow("/");
	// 	}),
	// );
});
