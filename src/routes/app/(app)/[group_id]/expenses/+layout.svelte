<script lang="ts">
	import { page } from '$app/stores';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { showCreateExpenseForm } from '$lib/components/create-expense/create-expense.svelte';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { cn } from '$lib/utils';

	export let data;
</script>

<Card.Root class={cn('col-span-12', $page.params.transaction_id && 'lg:col-span-8')}>
	<Card.Header class="flex flex-row items-center">
		<div class="grid gap-2">
			<Card.Title>Expenses</Card.Title>
			<Card.Description>Recent expenses in your group.</Card.Description>
		</div>
		<Button on:click={() => ($showCreateExpenseForm = true)} size="sm" class="ml-auto gap-1">
			Add expense
			<PlusIcon class="size-4" />
		</Button>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>What</Table.Head>
					<Table.Head>Who</Table.Head>
					<Table.Head>When</Table.Head>
					<Table.Head class="text-center">Type</Table.Head>
					<Table.Head class="text-right">Amount</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#await data.transactions}
					<Table.Row>
						<Table.Cell>
							<LoaderCircle class="size-4 animate-spin" />
						</Table.Cell>
					</Table.Row>
				{:then transactions}
					{#each transactions as transaction}
						<Table.Row>
							<Table.Cell class="relative font-medium">
								<a href="/{$page.params.group_id}/expenses/{transaction.id}">
									<span class="absolute inset-0"></span>{transaction.label}
								</a>
							</Table.Cell>
							<Table.Cell class="relative">
								<a href="/{$page.params.group_id}/expenses/{transaction.id}">
									<span class="absolute inset-0"></span>{transaction.group_member.name}
								</a>
							</Table.Cell>
							<Table.Cell class="relative">
								<a href="/{$page.params.group_id}/expenses/{transaction.id}">
									<span class="absolute inset-0"></span>{transaction.when?.toLocaleDateString(
										'sv-SE'
									) ?? '-'}
								</a>
							</Table.Cell>
							<Table.Cell class="relative text-center">
								<a href="/{$page.params.group_id}/expenses/{transaction.id}">
									<span class="absolute inset-0"></span>
									{#if transaction.type === 'expense'}
										<Badge variant="secondary">Expense</Badge>
									{:else}
										<Badge>Settlement</Badge>
									{/if}
								</a>
							</Table.Cell>
							<Table.Cell class="relative text-right">
								<a href="/{$page.params.group_id}/expenses/{transaction.id}">
									<span class="absolute inset-0"></span>
									{Intl.NumberFormat('sv-SE', {
										style: 'currency',
										currency: data.group.currency
									}).format(
										transaction.splits.reduce((acc, curr) => {
											if (curr.type === 'debit') return acc + curr.amount;
											return acc;
										}, 0)
									)}
								</a>
							</Table.Cell>
						</Table.Row>
					{:else}
						<p class="py-2 px-2 text-muted-foreground italic">No expenses found...</p>
					{/each}
				{/await}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
<div class="col-span-12 lg:col-span-4">
	<slot></slot>
</div>
