<script lang="ts">
import { PUBLIC_MICROSOFT_CLARITY_KEY } from '$env/static/public';
	import { ModeWatcher } from 'mode-watcher';

	import { Toaster } from '$lib/components/ui/sonner';
	import { dev } from '$app/environment';
</script>

<ModeWatcher />
<Toaster />

<svelte:head>
	{#if !dev}
		<script type="text/javascript">
			(function (c, l, a, r, i, t, y) {
				c[a] =
					c[a] ||
					function () {
						(c[a].q = c[a].q || []).push(arguments);
					};
				t = l.createElement(r);
				t.async = 1;
				t.src = 'https://www.clarity.ms/tag/' + i;
				y = l.getElementsByTagName(r)[0];
				y.parentNode.insertBefore(t, y);
			})(window, document, 'clarity', 'script', PUBLIC_MICROSOFT_CLARITY_KEY);
		</script>
	{/if}
</svelte:head>
<slot />

<style lang="postcss">
	:global(body) {
		@apply bg-muted/40;
	}
</style>
