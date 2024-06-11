<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import UserActions from './(components)/user-actions.svelte';
	import GroupActions from './(components)/group-actions.svelte';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	export let data;
</script>

<main class="mx-auto grid w-full max-w-7xl grid-cols-12 gap-4 px-4 py-6 md:px-6 lg:gap-8 lg:px-8">
	<Card.Root class="col-span-12">
		<Card.Header>
			<Card.Title>Users</Card.Title>
			<Card.Description>All registered users.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head>Created</Table.Head>
						<Table.Head>Active sessions</Table.Head>
						<Table.Head><span class="sr-only">Actions</span></Table.Head>
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
							<Table.Cell>{user.created_at?.toLocaleString('sv-SE')}</Table.Cell>
							<Table.Cell>{user.sessions.length}</Table.Cell>
							<Table.Cell class="text-right">
								<UserActions {user} />
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
	<Card.Root class="col-span-12">
		<Card.Header>
			<Card.Title>Groups</Card.Title>
			<Card.Description>All groups created.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Group owner</Table.Head>
						<Table.Head>Created</Table.Head>
						<Table.Head><span class="sr-only">Actions</span></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.groups as group}
						<Table.Row>
							<Table.Cell class="font-medium">{group.name}</Table.Cell>
							<Table.Cell
								>{group.owner ? `${group.owner.name} (${group.owner.email})` : '-'}</Table.Cell
							>
							<Table.Cell>{group.created_at?.toLocaleString('sv-SE')}</Table.Cell>
							<Table.Cell class="text-right">
								<GroupActions {group} />
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
	<Card.Root class="col-span-12">
		<Card.Header>
			<Card.Title>Actions</Card.Title>
			<Card.Description></Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/delete-expired-sessions" use:enhance>
				<Button type="submit" variant="destructive">Delete expired sessions</Button>
			</form>
		</Card.Content>
	</Card.Root>
</main>
