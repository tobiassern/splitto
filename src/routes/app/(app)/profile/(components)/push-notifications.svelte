<!-- <script lang="ts">
	import { browser } from '$app/environment';
</script>

{#if browser}
	{#if 'PushManager' in window}
		Push works
	{:else}
		Push doesn't work
	{/if}
{/if} -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_VAPID_KEY } from '$env/static/public';
	import { enhance } from '$app/forms';
	let permissionGranted: boolean | null = null;
	let isSubscribed: boolean = false;

	const requestNotificationPermission = () => {
		Notification.requestPermission().then((permission) => {
			if (permission === 'granted') {
				new Notification('You are now subscribed to notifications!');
				permissionGranted = true;
			}
		});
	};

	const sendSubscriptionToServer = async (subscription: PushSubscription) => {
		try {
			const res = await fetch('/profile/notifications', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ subscription })
			});
			if (!res.ok)
				throw new Error(`Error saving subscription on server: ${res.statusText} (${res.status})`);
		} catch (error) {
			console.error('Error saving subscription on server:', error);
			unsubscribe();
		}
	};

	const checkSubscriptionStatus = async () => {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			console.log('Subscription:', subscription);
			const exists = subscription !== null;
			if (exists) {
				// just to make sure the subscription is saved on the server
				sendSubscriptionToServer(subscription);
			}
			return exists;
		}
		return false;
	};

	const subscribeUser = async () => {
		if ('serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: PUBLIC_VAPID_KEY
				});
				isSubscribed = true;
				console.log('Subscription:', JSON.stringify(subscription));
				console.log(subscription);
				sendSubscriptionToServer(subscription);
			} catch (err) {
				console.error('Error subscribing:', err);
			}
		}
	};

	const unsubscribe = async () => {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			if (subscription) {
				await subscription.unsubscribe();
				isSubscribed = false;
			}
		}
	};

	onMount(async () => {
		permissionGranted = Notification.permission === 'granted';
		if (permissionGranted) {
			isSubscribed = await checkSubscriptionStatus();

			if (!isSubscribed) {
				await subscribeUser();
			}
		}
	});
</script>

<div>
	{#if permissionGranted === null}
		<p>Checking permissions...</p>
	{:else if permissionGranted === false}
		<button class="button" type="button" on:click={requestNotificationPermission}
			>Enable notifications</button
		>
	{:else}
		<p>
			You have enabled notification permissions. Remove the permission in your browser settings...
		</p>
		<p>Subscribed to push notifications: <b>{isSubscribed}</b></p>
		{#if isSubscribed}
			<!--
		<div class="mt-4">
			<form method="post" action="?/testNotification">
				<button class="button" type="submit">Test Notification</button>
			</form>
		</div> -->
			<div>
				<button class="button" type="button" on:click={unsubscribe}>Unsubscribe</button>
			</div>
			<div class="mt-4">
				<form
					method="post"
					action="?/testNotification"
					use:enhance={() => {
						return async ({ result, update }) => {
							console.log(result);
						};
					}}
				>
					<button class="button" type="submit">Test Notification</button>
				</form>
			</div>
		{:else}
			<button on:click={subscribeUser}>Subscribe</button>
		{/if}
	{/if}
</div>
