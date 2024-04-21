<script lang="ts">
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';

	export let data;
</script>

<main class="mx-auto grid w-full max-w-7xl grid-cols-12 gap-4 px-4 py-6 md:px-6 lg:gap-8 lg:px-8">
	<Card.Root class="col-span-12">
		<Card.Header class="flex flex-row items-center">
			<div class="grid gap-2">
				<Card.Title>Users</Card.Title>
				<Card.Description>All registered users.</Card.Description>
			</div>
			<!-- <Button href="##" size="sm" class="ml-auto gap-1">
				View All
				<ArrowUpRight class="h-4 w-4" />
			</Button> -->
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Email</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.users as user}
						<Table.Row>
							<Table.Cell class="font-medium">
								{user.name}{#if user.super_admin}<Badge class="ml-2" variant="secondary"
										>Super Admin</Badge
									>{/if}
							</Table.Cell>
							<Table.Cell>
								{user.email}
								{#if !user.email_verified}<Badge variant="destructive" class="ml-2"
										>Not verified</Badge
									>{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
	<Card.Root class="col-span-12">
		<Card.Header class="flex flex-row items-center">
			<div class="grid gap-2">
				<Card.Title>Groups</Card.Title>
				<Card.Description>All groups created.</Card.Description>
			</div>
			<!-- <Button href="##" size="sm" class="ml-auto gap-1">
				View All
				<ArrowUpRight class="h-4 w-4" />
			</Button> -->
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Group owner</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.groups as group}
						<Table.Row>
							<Table.Cell class="font-medium">{group.name}</Table.Cell>
							<Table.Cell
								>{group.owner ? `${group.owner.name} (${group.owner.email})` : '-'}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</main>
