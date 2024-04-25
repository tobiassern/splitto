<script>
	import { dev } from "$app/environment";

</script>
<svelte:head>
	{#if !dev}
	<link rel="manifest" href="manifest.json" />
	{/if}
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</svelte:head>
<slot />
