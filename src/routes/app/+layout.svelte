<script lang="ts">
import { PUBLIC_LOGROCKET_KEY } from '$env/static/public';
	import LogRocket from 'logrocket';
	import { ModeWatcher } from 'mode-watcher';

	import { Toaster } from '$lib/components/ui/sonner';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!dev && PUBLIC_LOGROCKET_KEY) {
			LogRocket.init(PUBLIC_LOGROCKET_KEY);
		}
	});
</script>

<ModeWatcher />
<Toaster />

<slot />

<style lang="postcss">
	:global(body) {
		@apply bg-muted/40;
	}
</style>
