<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { update_user_email_schema } from '$lib/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { FormErrors } from '$lib/components/form-errors';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';

	export let data: SuperValidated<Infer<typeof update_user_email_schema>>;

	const form = superForm(data, {
		validators: zodClient(update_user_email_schema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Email updated');
			} else {
				toast.error('An error occurred');
			}
		},
		resetForm: false
	});

	const { form: formData, enhance, delayed, errors } = form;
</script>

<form method="POST" use:enhance class="contents" action="?/update-email">
	<Card.Root>
		<Card.Header>
			<Card.Title>Email</Card.Title>
		</Card.Header>
		<Card.Content>
			<Form.Field {form} name="email">
				<Form.Control let:attrs>
					<Input {...attrs} bind:value={$formData.email} class="max-w-sm" />
				</Form.Control>
				<Form.FieldErrors />
				<Form.Description class="max-w-sm"
					>When updating your email you will be signed out from all other devices.</Form.Description
				>
			</Form.Field>
			<FormErrors errors={$errors._errors} />
		</Card.Content>
		<Card.Footer class="justify-end border-t px-6 py-4">
			<Form.Button class="gap-1"
				>Update{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</Card.Footer>
	</Card.Root>
</form>
