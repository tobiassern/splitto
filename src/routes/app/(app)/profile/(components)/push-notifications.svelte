<script lang="ts">
	import { browser } from '$app/environment';
</script>

{#if browser}
	{#if 'PushManager' in window}
		Push works
	{:else}
		Push doesn't work
	{/if}
{/if}
