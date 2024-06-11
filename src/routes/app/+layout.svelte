<script lang="ts">
	import { PUBLIC_LOGROCKET_KEY } from '$env/static/public';
	import LogRocket from 'logrocket';
	import { ModeWatcher } from 'mode-watcher';

	import { Toaster } from '$lib/components/ui/sonner';
	import { browser, dev } from '$app/environment';
	import { onMount } from 'svelte';

	export let data;

	$: if (data.user?.id && PUBLIC_LOGROCKET_KEY)
		LogRocket.identify(data.user.id.toString(), { name: data.user.name });

	onMount(() => {
		if (!dev && PUBLIC_LOGROCKET_KEY) {
			LogRocket.init(PUBLIC_LOGROCKET_KEY);
		}
	});
</script>

<svelte:head>
	<!-- {#if !dev} -->
	<link rel="manifest" href="manifest.json" />
	<!-- {/if} -->
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</svelte:head>

<ModeWatcher />
<Toaster />

<slot />

<style lang="postcss">
	:global(body) {
		@apply bg-muted/40;
	}
</style>
