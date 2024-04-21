<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	export let errors: string[] | null | undefined;
</script>

{#if errors?.length}
	<Alert.Root variant="destructive">
		<TriangleAlert class="h-4 w-4" />
		<Alert.Title>Error</Alert.Title>
		{#each errors as error}
			<Alert.Description>{error}</Alert.Description>
		{/each}
	</Alert.Root>
{/if}
