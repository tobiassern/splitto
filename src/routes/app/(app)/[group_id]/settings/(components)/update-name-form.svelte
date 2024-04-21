<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as Form from '$lib/components/ui/form';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { update_group_name_schema } from '$lib/schema';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FormErrors from '$lib/components/form-errors/form-errors.svelte';
	import { toast } from 'svelte-sonner';

	export let data: SuperValidated<Infer<typeof update_group_name_schema>>;

	const form = superForm(data, {
		validators: zodClient(update_group_name_schema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Group name updated');
			} else if (result.type === 'error') {
				toast.error(result.error ?? 'An error occurred');
			} else if (result.type === 'failure') {
				toast.error('An error occurred');
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;
</script>

<Card.Root class="col-span-12 lg:col-span-8 lg:col-start-3">
	<Card.Header>
		<Card.Title>Group Name</Card.Title>
	</Card.Header>
	<form class="contents" use:enhance method="POST" action="?/update-group-name">
		<Card.Content>
			<Form.Field {form} name="name">
				<Form.Control let:attrs>
					<Input {...attrs} bind:value={$formData.name} placeholder="Group name" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<FormErrors errors={$errors._errors} />
		</Card.Content>
		<Card.Footer class="border-t px-6 py-4">
			<Form.Button type="submit" class="flex gap-1"
				>Update{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</Card.Footer>
	</form>
</Card.Root>
