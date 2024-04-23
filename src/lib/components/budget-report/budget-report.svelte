<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Progress } from '$lib/components/ui/progress/index.js';

	export let type: 'week' | 'month';
	export let amount: string | null;
	export let budget: number | undefined | null;
	export let currency: string;

	$: budget_percentage =
		budget !== null && budget !== undefined && amount
			? Number((((amount ? Number(-amount) : 0) / budget) * 100).toFixed(0))
			: 0;
</script>

<Card.Root>
	<Card.Header class="pb-2">
		<Card.Description class="flex items-center justify-between gap-2"
			><span>This {type === 'week' ? 'Week' : 'Month'}</span>
			{#if budget && budget_percentage && budget_percentage > 100}
				<Badge variant="destructive">Over budget</Badge>
			{/if}
		</Card.Description>
		<Card.Title class="text-3xl">
			{Intl.NumberFormat('sv-SE', {
				currency: currency,
				style: 'currency',
				maximumFractionDigits: 0
			}).format(Number(amount ? -amount : 0))}
		</Card.Title>
	</Card.Header>
	{#if typeof budget === 'number'}
		<Card.Content>
			<div class="text-xs text-muted-foreground">
				{budget_percentage}% of {type === 'week' ? 'weekly' : 'monthly'} budget
			</div>
		</Card.Content>
		<Card.Footer>
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
		</Card.Footer>
	{:else}
		<Card.Content>
			<div class="text-xs text-muted-foreground">
				Set a {type === 'week' ? 'weekly' : 'monthly'} budget to keep track
			</div>
		</Card.Content>
	{/if}
</Card.Root>
