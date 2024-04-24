<script lang="ts">
	import { page } from '$app/stores';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { applyAction, enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	let confirm_email: string | undefined = undefined;
</script>

<form
	method="POST"
	use:enhance={({ cancel }) => {
		if (confirm_email !== $page.data.user?.email) {
			toast.error('Email not matching');
			return cancel();
		}
		const confirmed = confirm(
			'Are you sure you want to delete your account? All groups where you are an owner will be deleted also!'
		);
		if (!confirmed) return cancel();

		return async ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('Your account is deleted');
				applyAction(result);
			} else {
				toast.error('An error occurred');
			}
		};
	}}
	class="contents"
	action="?/delete-account"
>
	<Card.Root class="col-span-12 lg:col-span-7">
		<Card.Header>
			<Card.Title>Delete your account</Card.Title>
		</Card.Header>
		<Card.Content>
			<Input
				name="confirm-email"
				placeholder="Enter your email to confirm"
				class="max-w-sm"
				bind:value={confirm_email}
			/>
			<div class="mt-1.5 max-w-sm text-[0.8rem] text-muted-foreground">
				All groups where you are the owner will be deleted along with related data when you delete
				your account.
			</div>
		</Card.Content>
		<Card.Footer class="justify-end border-t px-6 py-4">
			<Button type="submit" variant="destructive">Delete account</Button>
		</Card.Footer>
	</Card.Root>
</form>
