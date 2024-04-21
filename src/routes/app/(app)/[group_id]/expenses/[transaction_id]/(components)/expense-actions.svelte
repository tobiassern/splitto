<script lang="ts">
	import { page } from '$app/stores';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let deleteFormEl: HTMLFormElement;
</script>

<form
	bind:this={deleteFormEl}
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				toast.success('Expense removed');
				goto(`/${$page.params.group_id}/expenses`, { invalidateAll: true });
			}
		};
	}}
/>
<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} size="icon" variant="outline" class="h-8 w-8">
			<EllipsisVertical class="h-3.5 w-3.5" />
			<span class="sr-only">More</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item>Edit</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item on:click={() => deleteFormEl.requestSubmit()}>Remove</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
