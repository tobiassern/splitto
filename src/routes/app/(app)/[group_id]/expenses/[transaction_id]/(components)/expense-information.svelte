<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { transactionsTable, groupMembersTable, transactionSplitsTable } from '$lib/schema';
	import { page } from '$app/stores';
	type Transaction = typeof transactionsTable.$inferSelect;
	type TransactionSplit = typeof transactionSplitsTable.$inferSelect;
	interface ExtendedTransactionSplit extends TransactionSplit {
		group_member: typeof groupMembersTable.$inferSelect;
	}
	interface ExtendedTransaction extends Transaction {
		group_member: typeof groupMembersTable.$inferSelect;
		splits: ExtendedTransactionSplit[];
	}

	export let transaction: ExtendedTransaction;
</script>

<div class="grid gap-3">
	<div class="grid gap-3">
		<div class="font-semibold">Who paid</div>
		<dl class="grid gap-3">
			<div class="flex items-center justify-between">
				<dt class="text-muted-foreground">Name</dt>
				<dd>{transaction.group_member.name}</dd>
			</div>
			<div class="flex items-center justify-between">
				<dt class="text-muted-foreground">Email</dt>
				<dd>
					<a href="mailto:">{transaction.group_member.email ?? '-'}</a>
				</dd>
			</div>
		</dl>
	</div>
	<Separator class="my-4" />
	{#if transaction.type === 'expense'}
		<div class="font-semibold">Splits</div>
		<ul class="grid gap-3">
			{#each transaction.splits.filter((split) => split.type === 'credit') as split}
				<li class="flex items-center justify-between">
					<span class="text-muted-foreground">
						{split.group_member.name}
					</span>
					<span>
						{Intl.NumberFormat('sv-SE', {
							style: 'currency',
							currency: $page.data.group?.currency
						}).format(split.amount)}</span
					>
				</li>
			{/each}
			<li class="flex items-center justify-between font-semibold">
				<span class="text-muted-foreground">Total</span>
				<span
					>{Intl.NumberFormat('sv-SE', {
						style: 'currency',
						currency: $page.data.group?.currency
					}).format(
						transaction.splits.reduce((acc, curr) => {
							if (curr.type === 'credit') return acc;
							return acc + curr.amount;
						}, 0)
					)}</span
				>
			</li>
		</ul>
	{:else}
		<div class="grid gap-3">
			<div class="font-semibold">To whom</div>
			{#each transaction.splits.filter((split) => split.type === 'credit') as split}
				<dl class="grid gap-3">
					<div class="flex items-center justify-between">
						<dt class="text-muted-foreground">Name</dt>
						<dd>{split.group_member.name}</dd>
					</div>
					<div class="flex items-center justify-between">
						<dt class="text-muted-foreground">Email</dt>
						<dd>
							<a href="mailto:">{split.group_member.email ?? '-'}</a>
						</dd>
					</div>
				</dl>
			{/each}
		</div>
		<Separator class="my-4" />
		<div class="grid gap-3">
			<div class="font-semibold">Amount</div>
			<dl class="grid gap-3">
				<div class="flex items-center justify-between">
					<dt class="text-muted-foreground">Total</dt>
					<dd>
						{Intl.NumberFormat('sv-SE', {
							style: 'currency',
							currency: $page.data.group?.currency
						}).format(
							transaction.splits.reduce((acc, curr) => {
								if (curr.type === 'credit') return acc;
								return acc + curr.amount;
							}, 0)
						)}
					</dd>
				</div>
			</dl>
		</div>
	{/if}
</div>
