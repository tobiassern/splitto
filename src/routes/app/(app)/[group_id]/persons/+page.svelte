<script lang="ts">
	import { page } from '$app/stores';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import { getInitials } from '$lib/helpers';
	import { showCreateGroupMemberForm } from '$lib/components/create-group-member/create-group-member.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PersonActions from './(components)/person-actions.svelte';
	export let data;
</script>

<Card.Root class="col-span-12 lg:col-span-8 lg:col-start-3">
	<Card.Header class="flex flex-row items-center">
		<div class="grid gap-2">
			<Card.Title>Group Members</Card.Title>
		</div>
		<Button size="sm" on:click={() => ($showCreateGroupMemberForm = true)} class="ml-auto gap-1">
			Add
			<PlusIcon class="size-4" />
		</Button>
	</Card.Header>
	<Card.Content class="grid gap-8">
		{#if data.group?.members}
			{#each data.group.members as member}
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<Avatar.Root class="hidden h-9 w-9 sm:flex">
							{#if member.user?.avatar_url}
								<Avatar.Image src={member.user.avatar_url} alt={member.user?.name ?? member.name} />
							{/if}
							<Avatar.Fallback>{getInitials(member.user?.name ?? member.name)}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid gap-1">
							<p class="text-sm font-medium leading-none">
								{member.name}{#if data.group.owner_id === member.user_id}<Badge
										class="ml-2"
										variant="secondary">Owner</Badge
									>{/if}
								{#if member.user_id === $page.data.user?.id}<Badge class="ml-2">You</Badge>{/if}
								{#if !member.user_id && member.email}<Badge class="ml-2">Invited</Badge>{/if}
								{#if member.user_id && data.group.owner_id !== member.user_id}<Badge
										class="ml-2"
										variant="secondary">Member</Badge
									>{/if}
							</p>
							<p class="text-sm text-muted-foreground">
								{member.user?.email ?? member.email ?? '-'}
							</p>
						</div>
					</div>
					<PersonActions {member} />
				</div>
			{/each}
		{/if}
	</Card.Content>
</Card.Root>
