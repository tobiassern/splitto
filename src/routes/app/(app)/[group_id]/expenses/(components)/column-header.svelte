<script lang="ts">
	import { page } from '$app/stores';
	import ArrowDown from 'svelte-radix/ArrowDown.svelte';
	import ArrowUp from 'svelte-radix/ArrowUp.svelte';
	import CaretSort from 'svelte-radix/CaretSort.svelte';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { goto } from '$app/navigation';

	let className: string | undefined | null = undefined;
	export let searchParam: string;

	$: sorting = $page.url.searchParams.get(searchParam);

	function handleAscSort() {
		const newUrl = new URL($page.url);
		newUrl.searchParams.set(searchParam, 'asc');
		goto(newUrl);
	}

	function handleDescSort() {
		const newUrl = new URL($page.url);
		newUrl.searchParams.set(searchParam, 'desc');
		goto(newUrl);
	}
</script>

<div class={cn('flex items-center', className)}>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button
				variant="ghost"
				builders={[builder]}
				size="sm"
				class="-ml-3 text-sm data-[state=open]:bg-accent"
			>
				<slot />
				{#if sorting === 'desc'}
					<ArrowDown class="ml-2 h-4 w-4" />
				{:else if sorting === 'asc'}
					<ArrowUp class="ml-2 h-4 w-4" />
				{:else}
					<CaretSort class="ml-2 h-4 w-4" />
				{/if}
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="start">
			<DropdownMenu.Item on:click={handleAscSort}>
				<ArrowUp class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
				Asc
			</DropdownMenu.Item>
			<DropdownMenu.Item on:click={handleDescSort}>
				<ArrowDown class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
				Desc
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
