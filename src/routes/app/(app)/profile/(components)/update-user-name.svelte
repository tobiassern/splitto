<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { update_user_name_schema } from '$lib/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { FormErrors } from '$lib/components/form-errors';
	import { toast } from 'svelte-sonner';

	export let data: SuperValidated<Infer<typeof update_user_name_schema>>;

	const form = superForm(data, {
		validators: zodClient(update_user_name_schema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Name updated');
			} else {
				toast.error('An error occurred');
			}
		},
		resetForm: false
	});

	const { form: formData, enhance, delayed, errors } = form;
</script>

<form method="POST" use:enhance class="grid gap-4" action="?/update-name">
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<FormErrors errors={$errors._errors} />
	<div class="text-right">
		<Form.Button class="gap-1"
			>Update{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
		>
	</div>
</form>
