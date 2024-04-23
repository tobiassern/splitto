<script lang="ts">
	import { mediaQuery } from 'svelte-legos';
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Drawer from '$lib/components/ui/drawer';
	import { goto } from '$app/navigation';
	import ExpenseInformation from './(components)/expense-information.svelte';
	import ExpenseActions from './(components)/expense-actions.svelte';
	import ExpenseUpdatedAt from './(components)/expense-updated-at.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { PageTitle } from '$lib/components/page-title';

	export let data;
	let open = true;
	$: if (!open) goto(`/${$page.params.group_id}/expenses`);
	const isDesktop = mediaQuery('(min-width: 1024px)');
</script>

<PageTitle text="{data.transaction.label ?? '-'} | Expenses | {data.group.name}" />
{#if $isDesktop}
	<Card.Root class="overflow-hidden">
		<Card.Header class="grid gap-1 bg-muted/50">
			<div class="flex flex-row items-start">
				<div class="grid gap-0.5">
					<Card.Title class="group flex items-center gap-2 text-lg">
						{#if data.transaction.label}{data.transaction.label}{:else}<span
								class="italic text-muted-foreground">No label</span
							>{/if}
					</Card.Title>
					<Card.Description class="text-xs"
						>When: {data.transaction.when?.toLocaleDateString('sv-SE', {
							weekday: 'short',
							year: 'numeric',
							month: 'short',
							day: 'numeric'
						}) ?? '-'}</Card.Description
					>
				</div>
				<div class="ml-auto flex items-center gap-1">
					{#if data.transaction.type === 'settlement'}
						<Badge>Settlement</Badge>
					{/if}
					<ExpenseActions />
				</div>
			</div>
			<div class="flex gap-1">
				{#each data.transaction.tags as tag (tag.tag_id)}
					<Badge>{tag.tag.label}</Badge>
				{/each}
			</div>
		</Card.Header>
		<Card.Content class="p-6 text-sm">
			<ExpenseInformation transaction={data.transaction} />
		</Card.Content>
		<Card.Footer class="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
			<ExpenseUpdatedAt updated_at={data.transaction.updated_at} />
		</Card.Footer>
	</Card.Root>
{:else}
	<Drawer.Root bind:open>
		<Drawer.Content>
			<Drawer.Header class="flex flex-row items-start">
				<div class="grid gap-0.5">
					<Drawer.Title class="group flex items-center gap-2 text-lg"
						>{#if data.transaction.label}{data.transaction.label}{:else}<span
								class="italic text-muted-foreground">No label</span
							>{/if}</Drawer.Title
					>
					<Drawer.Description>Date: November 23, 2023</Drawer.Description>
				</div>
				<div class="ml-auto flex items-center gap-1">
					{#if data.transaction.type === 'settlement'}
						<Badge>Settlement</Badge>
					{/if}
					<ExpenseActions />
				</div>
			</Drawer.Header>
			<div class="px-4 py-6 text-sm">
				<ExpenseInformation transaction={data.transaction} />
			</div>
			<Drawer.Footer class="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
				<ExpenseUpdatedAt updated_at={data.transaction.updated_at} />
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}
