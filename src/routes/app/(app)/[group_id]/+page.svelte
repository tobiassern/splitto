<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import BudgetReport from '../(components)/budget-report.svelte';
	import GroupMemberSwitcher from '../(components)/group-member-switcher.svelte';

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
</script>

<div class="col-span-12 grid auto-rows-max items-start gap-4 md:gap-8">
	<div class="flex items-center justify-start gap-3">
		<GroupMemberSwitcher members={data.group.members} />
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
		<BudgetReport
			type="week"
			who={selectedGroupMember?.value ? 'person' : 'group'}
			amount={data.total_week?.amount}
			budget={selectedGroupMember?.value
				? data.group.members.find((member) => member.id === Number(selectedGroupMember?.value))
						?.weekly_budget
				: data.group.weekly_budget}
		/>
		<BudgetReport
			type="month"
			who={selectedGroupMember?.value ? 'person' : 'group'}
			amount={data.total_month?.amount}
			budget={selectedGroupMember?.value
				? data.group.members.find((member) => member.id === Number(selectedGroupMember?.value))
						?.monthly_budget
				: data.group.monthly_budget}
		/>
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
