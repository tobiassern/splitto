<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import HandCoins from 'lucide-svelte/icons/hand-coins';
	import { settlementFormStore } from '$lib/components/create-settlement/create-settlement.svelte';
	import { PageTitle } from '$lib/components/page-title';
	import CopyIcon from 'lucide-svelte/icons/copy';
	import { toast } from 'svelte-sonner';
	export let data;
</script>

<PageTitle text="Settle"></PageTitle>
<div class="col-span-12">
	<h3 class="font-semibold leading-none tracking-tight">Balances</h3>
	<ul class="-mx-3 flex snap-x gap-4 overflow-x-scroll px-3 py-2">
		{#each data.group_members as group_member}
			<Card.Root class="w-full min-w-56 max-w-56 snap-center">
				<Card.Header class="pb-2">
					<Card.Description>{group_member.name}</Card.Description>
					<Card.Title class="text-2xl"
						>{Intl.NumberFormat('sv-SE', {
							currency: data.group.currency,
							style: 'currency'
						}).format(Number(group_member.balance ?? 0))}</Card.Title
					>
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
					<Card.Title
						><Button
							variant="ghost"
							class="group/settleAmountBtn -mx-4 items-center gap-3 text-3xl"
							on:click={() => {
								if (settle.amount) {
									navigator.clipboard.writeText(String(settle.amount));
									toast('Amount copied to clipboard');
								}
							}}
							>{Intl.NumberFormat('sv-SE', {
								currency: data.group.currency,
								style: 'currency'
							}).format(settle.amount ?? 0)}<CopyIcon
								class="size-5 opacity-0 transition-opacity group-hover/settleAmountBtn:opacity-100"
							/></Button
						></Card.Title
					>
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
