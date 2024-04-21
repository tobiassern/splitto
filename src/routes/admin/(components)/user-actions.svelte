<script lang="ts">
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { userTable } from '$lib/schema';

	let deleteFormEl: HTMLFormElement;

	export let user: typeof userTable.$inferSelect;
</script>

<form
	bind:this={deleteFormEl}
	class="hidden"
	method="POST"
	action="?/delete-user"
	use:enhance={({ cancel }) => {
		const confirmed = confirm('Are you sure you want to delete this user?');
		if (!confirmed) cancel();

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('User deleted');
				update();
			} else {
				toast.error(
					result.type === 'error' && result.error.message
						? result.error.message
						: 'An error occurred'
				);
			}
		};
	}}
>
	<input name="user_id" value={user.id} />
</form>
<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} size="icon" variant="ghost" class="h-8 w-8">
			<EllipsisVertical class="h-3.5 w-3.5" />
			<span class="sr-only">More</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label class="font-normal">
			<div class="flex flex-col space-y-1">
				{#if user.name}<p class="text-sm font-medium leading-none">
						{user.name}
					</p>{/if}
				<p class="text-xs leading-none text-muted-foreground">{user.email}</p>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>Edit</DropdownMenu.Item>
		<DropdownMenu.Item>Export</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item on:click={() => deleteFormEl.requestSubmit()}>Remove</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
