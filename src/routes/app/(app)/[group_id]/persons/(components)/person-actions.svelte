<script lang="ts">
	import { page } from '$app/stores';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { groupMembersTable } from '$lib/schema';
	import EditPersonForm from './edit-person-form.svelte';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { update_group_member_schema } from '$lib/schema';

	export let update_group_member_form: SuperValidated<Infer<typeof update_group_member_schema>>;
	export let member: typeof groupMembersTable.$inferSelect;
	let showEditForm = false;
	let deleteFormEl: HTMLFormElement;
	let leaveGroupFormEl: HTMLFormElement;
</script>

<form
	hidden
	bind:this={deleteFormEl}
	method="POST"
	action="?/delete-member"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Group member removed');
				update();
			} else {
				toast.error('An error occurred');
			}
		};
	}}
>
	<input name="member_id" value={member.id} />
</form>

<form
	hidden
	bind:this={leaveGroupFormEl}
	method="POST"
	action="?/leave-group"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('Left group');
				goto(`/`, { invalidateAll: true });
			} else {
				toast.error('An error occurred');
			}
		};
	}}
/>
<EditPersonForm bind:open={showEditForm} data={update_group_member_form} {member} />
<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} size="icon" variant="outline" class="h-8 w-8">
			<EllipsisVertical class="h-3.5 w-3.5" />
			<span class="sr-only">More</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label class="font-normal">
			<div class="flex flex-col space-y-1">
				{#if member.name}<p class="text-sm font-medium leading-none">
						{member.name}
					</p>{/if}
				<p class="text-xs leading-none text-muted-foreground">{member.email ?? '-'}</p>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />

		<DropdownMenu.Item
			on:click={() => (showEditForm = true)}
			disabled={member.user_id && member.user_id !== $page.data.user?.id ? true : false}
			>Edit</DropdownMenu.Item
		>
		{#if $page.data.group?.owner_id === $page.data.user?.id}
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				on:click={() => deleteFormEl.requestSubmit()}
				disabled={member.user_id === $page.data.user?.id}>Remove</DropdownMenu.Item
			>
		{:else if $page.data.user?.id === member.user_id}
			<DropdownMenu.Item on:click={() => leaveGroupFormEl.requestSubmit()}
				>Leave group</DropdownMenu.Item
			>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
