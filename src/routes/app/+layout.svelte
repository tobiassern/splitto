<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';

	import { Toaster } from '$lib/components/ui/sonner';

	export let data;
</script>

<svelte:head>
	<link rel="manifest" href="%sveltekit.assets%/manifest.json" />
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
