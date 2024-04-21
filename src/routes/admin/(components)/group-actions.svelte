<script lang="ts">
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { groupsTable } from '$lib/schema';

	let deleteFormEl: HTMLFormElement;

	export let group: typeof groupsTable.$inferSelect;
</script>

<form
	bind:this={deleteFormEl}
	class="hidden"
	method="POST"
	action="?/delete-group"
	use:enhance={({ cancel }) => {
		const confirmed = confirm('Are you sure you want to delete this group?');
		if (!confirmed) cancel();
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Group deleted');
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
	<input name="group_id" value={group.id} />
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
				<p class="text-sm font-medium leading-none">
					{group.name}
				</p>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>Edit</DropdownMenu.Item>
		<DropdownMenu.Item>Export</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item on:click={() => deleteFormEl.requestSubmit()}>Remove</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
