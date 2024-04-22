<script lang="ts">
	import File from 'lucide-svelte/icons/file';
	import ListFilter from 'lucide-svelte/icons/list-filter';
	import { page } from '$app/stores';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { goto } from '$app/navigation';

	const fruits = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'blueberry', label: 'Blueberry' },
		{ value: 'grapes', label: 'Grapes' },
		{ value: 'pineapple', label: 'Pineapple' }
	];

	export let data;

	let selectedGroupMember = $page.url.searchParams.get('member')
		? {
				value: $page.url.searchParams.get('member') as string,
				label:
					data.group.members.find(
						(member) => member.id === Number($page.url.searchParams.get('member'))
					)?.name ?? ('Unknown member' as string)
			}
		: undefined;
	let weekly_budget_percentage = Number(
		((Number(-(data.total_week?.amount ?? 0)) / (data.group.weekly_budget ?? 0)) * 100).toFixed(0)
	);
	let monthly_budget_percentage = Number(
		((Number(-(data.total_month?.amount ?? 0)) / (data.group.monthly_budget ?? 0)) * 100).toFixed(0)
	);
</script>

<div class="col-span-12 grid auto-rows-max items-start gap-4 md:gap-8">
	<div class="flex justify-start gap-3 items-center">
		<Select.Root
			bind:selected={selectedGroupMember}
			onSelectedChange={(val) => {
				const newUrl = new URL($page.url);
				if (val?.value) {
					newUrl.searchParams.set('member', String(val.value));
				} else {
					newUrl.searchParams.delete('member');
				}
				goto(newUrl);
			}}
		>
			<Select.Trigger class="w-40">
				<Select.Value placeholder="Select a member" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Group members</Select.Label>
					<Select.Item value={null} label="All members">All members</Select.Item>
					{#each data.group.members as member}
						<Select.Item value={member.id} label={member.name}>{member.name}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="favoriteFruit" />
		</Select.Root>
	</div>
	<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
		<Card.Root class="sm:col-span-2">
			<Card.Header class="pb-3">
				<Card.Title>Get Started</Card.Title>
				<Card.Description class="max-w-lg text-balance leading-relaxed">
					Introducing Our Dynamic Orders Dashboard for Seamless Management and Insightful Analysis.
				</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button>Create New Expense</Button>
			</Card.Footer>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description class="flex items-center justify-between gap-2"
					>This Week{#if data.group.weekly_budget && weekly_budget_percentage > 100}<Badge
							variant="destructive">Over budget</Badge
						>{/if}</Card.Description
				>
				<Card.Title class="text-3xl"
					>{Intl.NumberFormat('sv-SE', {
						currency: data.group.currency,
						style: 'currency',
						maximumFractionDigits: 0
					}).format(Number(data.total_week?.amount ? -data.total_week?.amount : 0))}</Card.Title
				>
			</Card.Header>
			{#if data.group.weekly_budget}
				<Card.Content>
					<div class="text-xs text-muted-foreground">
						{weekly_budget_percentage}% of weekly budget
					</div>
				</Card.Content>
				<Card.Footer>
					<Tooltip.Root>
						<Tooltip.Trigger class="w-full">
							<Progress value={weekly_budget_percentage} aria-label="{weekly_budget_percentage}%" />
						</Tooltip.Trigger>
						<Tooltip.Content>
							Total budget: {Intl.NumberFormat('sv-SE', {
								currency: data.group.currency,
								style: 'currency',
								maximumFractionDigits: 0
							}).format(Number(data.group.weekly_budget ?? 0))}
						</Tooltip.Content>
					</Tooltip.Root>
				</Card.Footer>
			{:else}
				<Card.Content>
					<div class="text-xs text-muted-foreground">
						Set a weekly group budget to keep track
					</div></Card.Content
				>
			{/if}
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description class="flex items-center justify-between gap-2"
					>This Month{#if data.group.monthly_budget && monthly_budget_percentage > 100}<Badge
							variant="destructive">Over budget</Badge
						>{/if}</Card.Description
				>
				<Card.Title class="text-3xl"
					>{Intl.NumberFormat('sv-SE', {
						currency: data.group.currency,
						style: 'currency',
						maximumFractionDigits: 0
					}).format(Number(data.total_month?.amount ? -data.total_month.amount : 0))}</Card.Title
				>
			</Card.Header>
			{#if data.group.monthly_budget}
				<Card.Content>
					<div class="text-xs text-muted-foreground">
						{monthly_budget_percentage}% of monthly budget
					</div>
				</Card.Content>
				<Card.Footer>
					<Tooltip.Root>
						<Tooltip.Trigger class="w-full">
							<Progress
								value={monthly_budget_percentage}
								aria-label="{monthly_budget_percentage}% increase"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>
							Total budget: {Intl.NumberFormat('sv-SE', {
								currency: data.group.currency,
								style: 'currency',
								maximumFractionDigits: 0
							}).format(Number(data.group.monthly_budget ?? 0))}
						</Tooltip.Content>
					</Tooltip.Root>
				</Card.Footer>
			{:else}
				<Card.Content>
					<div class="text-xs text-muted-foreground">
						Set a monthly group budget to keep track
					</div></Card.Content
				>
			{/if}
		</Card.Root>
	</div>
	<Card.Root>
		<Card.Header class="px-7">
			<Card.Title>Tags</Card.Title>
			<Card.Description>Expenses per tags.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Tag</Table.Head>
						<Table.Head>Monthly budget</Table.Head>
						<Table.Head>Total spent</Table.Head>
						<Table.Head><span class="sr-only">Actions</span></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.tags_amount as tag_amount}
						<Table.Row>
							<Table.Cell class="font-medium">
								{tag_amount.label}
							</Table.Cell>
							<Table.Cell
								>{#if tag_amount.monthly_budget}
									{@const tag_amount_monthly_budget_percentage = Number(
										(
											(Number(tag_amount.amount ? -tag_amount.amount : 0) /
												(tag_amount.monthly_budget ?? 0)) *
											100
										).toFixed(0)
									)}
									<Tooltip.Root>
										<Tooltip.Trigger class="w-full text-left">
											{Intl.NumberFormat('sv-SE', {
												currency: data.group.currency,
												style: 'currency'
											}).format(Number(tag_amount.monthly_budget ?? 0))}
											<Progress
												class="max-w-48"
												value={tag_amount_monthly_budget_percentage}
												aria-label="{tag_amount_monthly_budget_percentage}%"
											/>
										</Tooltip.Trigger>
										<Tooltip.Content>
											{tag_amount_monthly_budget_percentage}% of budget used
										</Tooltip.Content>
									</Tooltip.Root>
								{:else}<span class="italic text-muted-foreground">No budget set</span
									>{/if}</Table.Cell
							>
							<Table.Cell>
								{Intl.NumberFormat('sv-SE', {
									currency: data.group.currency,
									style: 'currency'
								}).format(Number(tag_amount.amount ? -tag_amount.amount : 0))}
							</Table.Cell>
							<Table.Cell class="text-right"
								><Button
									href="/{data.group.id}/expenses?tag={tag_amount.id}"
									size="sm"
									variant="outline">View expenses</Button
								></Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
