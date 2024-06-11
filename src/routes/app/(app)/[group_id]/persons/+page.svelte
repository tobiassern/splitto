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
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { PUBLIC_APP_HOSTNAME } from '$env/static/public';
	import Copy from 'lucide-svelte/icons/copy';
	import { toast } from 'svelte-sonner';
	import { applyAction, enhance } from '$app/forms';
	import { PageTitle } from '$lib/components/page-title';
	export let data;

	let inviteLinkActiveFormEl: HTMLFormElement;
</script>

<PageTitle text="Persons | {data.group.name}" />
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
								{member.user?.name ?? member.name}{#if data.group.owner_id === member.user_id}<Badge
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
					<PersonActions {member} update_group_member_form={data.update_group_member_form} />
				</div>
			{/each}
		{/if}
	</Card.Content>
</Card.Root>

<Card.Root class="col-span-12 lg:col-span-8 lg:col-start-3">
	<Card.Header>
		<Card.Title>Invite Members</Card.Title>
		<Card.Description
			>You can invite new members to your group by adding them and using an email. When they sign in
			/ sign up for Splitto they can then accept to join your group.</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<Card.Root>
			<Card.Header>
				<div class="space-y-1.5">
					<div class="flex items-center justify-between gap-2">
						<Card.Title>Invite link</Card.Title>
						<form
							bind:this={inviteLinkActiveFormEl}
							class="flex items-center space-x-2"
							method="POST"
							action="?/activate-invite-link"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') {
										toast.success(
											data.group.invite_link_active
												? 'Invite link activated'
												: 'Invite link deactivated'
										);
									}
								};
							}}
						>
							<Switch
								id="invite-link-active"
								name="invite-link-active"
								checked={data.group.invite_link_active ? true : false}
								onCheckedChange={(value) => {
									data.group.invite_link_active = value;
									setTimeout(() => {
										inviteLinkActiveFormEl.requestSubmit();
									}, 0);
								}}
							/>
							<Label for="invite-link-active">Activate</Label>
						</form>
					</div>
					<Card.Description
						>Or you can copy the following link and anyone with the link can join your group.</Card.Description
					>
				</div>
			</Card.Header>
			<Card.Content
				class="flex flex-col items-stretch justify-start gap-4 md:flex-row md:items-center"
			>
				<Button
					variant="secondary"
					class="items-center gap-1"
					disabled={!data.group.invite_link_active}
					on:click={() => {
						navigator.clipboard.writeText(
							`${$page.url.protocol}//${PUBLIC_APP_HOSTNAME}${$page.url.port ? `:${$page.url.port}` : ''}/join/${data.group.id}/${data.group.invite_link_code}`
						);
						toast('Invite link copied to clipboard');
					}}
				>
					<span>{PUBLIC_APP_HOSTNAME}/join/{data.group.id}/{data.group.invite_link_code}</span><Copy
						class="size-4"
					></Copy>
				</Button>
				<form
					method="POST"
					action="?/generate-invite-link-code"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								toast.success('Invite link code updated');
								update();
							}
							applyAction(result);
						};
					}}
				>
					<Button variant="outline" size="sm" class="w-full" type="submit">Generate new code</Button
					>
				</form>
			</Card.Content>
		</Card.Root>
	</Card.Content>
</Card.Root>
