<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Button } from '../ui/button';

	export let title: string;
	export let budget_type: string;
	export let set_budget_link: string;
	export let amount: number | string | null;
	export let budget: number | undefined | null;
	export let currency: string;

	$: budget_percentage =
		budget !== null && budget !== undefined && amount
			? Number((((amount ? Number(-amount) : 0) / budget) * 100).toFixed(0))
			: 0;
</script>

<Card.Root>
	<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
		<Card.Title class="text-sm font-medium">{title}</Card.Title>
		{#if budget && budget_percentage && budget_percentage > 100}
			<Badge variant="destructive">Over budget</Badge>
		{/if}
	</Card.Header>
	<Card.Content>
		<div class="text-2xl font-bold">
			{Intl.NumberFormat('sv-SE', {
				currency: currency,
				style: 'currency',
				maximumFractionDigits: 0
			}).format(Number(amount ? -amount : 0))}
		</div>
		{#if typeof budget === 'number'}
			<p class="text-xs text-muted-foreground">{budget_percentage}% of {budget_type}</p>
			<Tooltip.Root>
				<Tooltip.Trigger class="w-full">
					<Progress value={budget_percentage} aria-label="{budget_percentage}%" />
				</Tooltip.Trigger>
				<Tooltip.Content>
					Total budget: {Intl.NumberFormat('sv-SE', {
						currency: currency,
						style: 'currency',
						maximumFractionDigits: 0
					}).format(Number(budget ?? 0))}
				</Tooltip.Content>
			</Tooltip.Root>
		{:else}
			<div class="text-right">
				<Button href={set_budget_link} size="sm" variant="outline">Set budget</Button>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
