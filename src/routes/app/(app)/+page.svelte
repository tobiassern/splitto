<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import CreateGroup from './(components)/create-group.svelte';
	import { PageTitle } from '$lib/components/page-title';
	import { BudgetReport } from '$lib/components/budget-report';
	import { UserNav } from '$lib/components/user-nav';
	export let data;
</script>

<PageTitle text="My dashboard | Splitto" />

<main class="mx-auto grid w-full max-w-7xl grid-cols-12 items-start gap-4 p-4 sm:p-6 md:gap-8">
	<header class="col-span-12 text-right">
		<UserNav user={data.user} />
	</header>
	<div class="col-span-12 grid grid-cols-12 gap-4 md:gap-8">
		<div class="col-span-12 lg:col-span-3">
			<BudgetReport
				title="Average daily spending"
				budget_type="average daily budget"
				set_budget_link="/profile"
				amount={data.total_month?.amount
					? Number(data.total_month?.amount) / data.daysSinceFirst
					: 0}
				budget={data.user?.budget_average_daily}
				currency={data.user?.default_currency ?? ''}
			/>
		</div>
		<div class="col-span-12 lg:col-span-3">
			<BudgetReport
				title="This Week"
				budget_type="weekly budget"
				amount={data.total_week?.amount}
				budget={data.user?.budget_weekly}
				set_budget_link="/profile"
				currency={data.user?.default_currency ?? ''}
			/>
		</div>
		<div class="col-span-12 lg:col-span-3">
			<BudgetReport
				title="This Month"
				budget_type="monthly budget"
				amount={data.total_month?.amount}
				budget={data.user?.budget_monthly}
				set_budget_link="/profile"
				currency={data.user?.default_currency ?? ''}
			/>
		</div>
	</div>
	<Card.Root class="col-span-12">
		<Card.Header class="flex flex-col items-start justify-between sm:flex-row sm:items-center">
			<div class="grid flex-1 gap-2">
				<Card.Title>Groups</Card.Title>
				<Card.Description>Your groups and groups you are invited to.</Card.Description>
			</div>
			<CreateGroup data={data.create_group_form} />
		</Card.Header>
		<Card.Content>
			{#if data.groups.length || data.group_invites.length}
				<div class="space-y-4">
					{#each data.group_invites as group_invite}
						<Card.Root>
							<Card.Header class="flex flex-row items-center justify-between gap-2">
								<Card.Title class="flex items-center gap-2">
									<span>{group_invite.name}</span>
									<Badge variant="secondary">Invited</Badge>
								</Card.Title>
								<Button href="/{group_invite.id}/accept-invite" size="sm">Accept invite</Button>
							</Card.Header>
						</Card.Root>
					{/each}
					{#each data.groups as group}
						<Card.Root class="relative hover:bg-muted">
							<Card.Header>
								<Card.Title
									><a href="/{group.id}"><span class="absolute inset-0"></span>{group.name}</a
									></Card.Title
								>
							</Card.Header>
						</Card.Root>
					{/each}
				</div>
			{:else}
				<div class="my-6 flex flex-1 items-center justify-center">
					<div class="flex flex-col items-center gap-1 text-center">
						<h3 class="font-bold tracking-tight">You have no groups</h3>
						<p class="text-sm text-muted-foreground">
							You can start tracking your expenses as soon as you create a group.
						</p>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
