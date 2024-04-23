<script lang="ts">
	import { page } from '$app/stores';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { applyAction, enhance } from '$app/forms';

	let confirm_email: string | undefined = undefined;
</script>

<form
	method="POST"
	use:enhance={({ cancel }) => {
		const confirmed = confirm(
			'Are you sure you want to delete your account? All groups where you are an owner will be deleted also!'
		);
		if (!confirmed) cancel();
		if (confirm_email !== $page.data.user?.email) {
			toast.error('Email not matching');
			cancel();
		}
		return async ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('Your account is deleted');
				applyAction(result);
			} else {
				toast.error('An error occurred');
			}
		};
	}}
	class="grid gap-4"
	action="?/delete-account"
>
	<div class="space-y-2">
		<Label>Delete your account</Label>
		<Input
			name="confirm-email"
			placeholder="Enter your email to confirm"
			bind:value={confirm_email}
		/>
		<div class="text-[0.8rem] text-muted-foreground">
			All groups where you are the owner will be deleted along with related data when you delete
			your account.
		</div>
	</div>
	<!-- <Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Email</Form.Label>
			<Input {...attrs} bind:value={$formData.name} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<FormErrors errors={$errors._errors} /> -->
	<div class="text-right">
		<Button type="submit" variant="destructive" disabled={$page.data.user?.email !== confirm_email}
			>Delete account</Button
		>
		<!-- <Form.Button class="gap-1"
			>Update{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
		> -->
	</div>
</form>
