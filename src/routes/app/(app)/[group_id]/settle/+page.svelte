<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import HandCoins from 'lucide-svelte/icons/hand-coins';
	import { settlementFormStore } from '$lib/components/create-settlement/create-settlement.svelte';
	export let data;
</script>

<div class="col-span-12">
	<h3 class="font-semibold leading-none tracking-tight">Balances</h3>
	<ul class="-mx-3 flex snap-x gap-4 overflow-x-scroll px-3 py-2">
		{#each data.balances as balance}
			<Card.Root class="w-full min-w-56 max-w-56 snap-center">
				<Card.Header class="pb-2">
					<Card.Description>{balance.name}</Card.Description>
					<Card.Title class="text-2xl">{balance.amount ?? 0}</Card.Title>
				</Card.Header>
				<Card.Footer></Card.Footer>
			</Card.Root>
		{/each}
	</ul>
</div>
<div class="col-span-12">
	<h3 class="mb-2 font-semibold leading-none tracking-tight">Settlements</h3>
	<ul class="col-span-12 grid grid-cols-12 gap-4">
		{#each data.settles as settle}
			<Card.Root class="col-span-12 md:col-span-4 ">
				<Card.Header class="pb-2">
					<Card.Description class="text-lg"
						>{settle.from?.name} pays to {settle.to?.name}</Card.Description
					>
					<Card.Title class="text-3xl">{settle.amount ?? 0}</Card.Title>
				</Card.Header>
				<Card.Footer class="justify-end">
					<Button
						size="lg"
						class="gap-1"
						on:click={() =>
							($settlementFormStore = {
								show: true,
								from_id: settle.from?.id ?? null,
								to_id: settle.to?.id ?? null,
								amount: settle.amount
							})}><HandCoins class="size-4" />Settle</Button
					>
				</Card.Footer>
			</Card.Root>
		{/each}
	</ul>
</div>
