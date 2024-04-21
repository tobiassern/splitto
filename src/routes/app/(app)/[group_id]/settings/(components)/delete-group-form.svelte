<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
</script>

<Card.Root class="col-span-12 lg:col-span-8 lg:col-start-3">
	<Card.Header>
		<Card.Title>Delete Group</Card.Title>
		<Card.Description>Deleting the group will remove all data connected to it.</Card.Description>
	</Card.Header>
	<form
		class="contents"
		method="POST"
		action="?/delete-group"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'redirect') {
					toast.success('Group deleted');
				} else if (result.type === 'failure') {
					if (result.data?.message) {
						toast.error(String(result.data.message));
					} else {
						toast.error('An unknown error occurred');
					}
				} else {
					toast.error('An unknown error occurred');
				}
				applyAction(result);
			};
		}}
	>
		<Card.Content>
			<Input type="text" name="group_name" placeholder="Group name" />
			<div class="mt-2 text-[0.8rem] text-muted-foreground">
				Confirm deletion of your group by writing the name of the group
			</div>
		</Card.Content>
		<Card.Footer class="border-t px-6 py-4">
			<Button type="submit" variant="destructive">Delete group</Button>
		</Card.Footer>
	</form>
</Card.Root>
