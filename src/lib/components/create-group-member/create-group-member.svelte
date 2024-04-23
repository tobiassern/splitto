<script lang="ts" context="module">
	import { writable } from 'svelte/store';
	export const showCreateGroupMemberForm = writable(false);
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as Form from '$lib/components/ui/form';
	import {
		type SuperValidated,
		type Infer,
		superForm,
		stringProxy,
	} from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { insert_group_member_schema } from '$lib/schema';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FormErrors from '$lib/components/form-errors/form-errors.svelte';
	import { toast } from 'svelte-sonner';

	export let data: SuperValidated<Infer<typeof insert_group_member_schema>>;

	const form = superForm(data, {
		validators: zodClient(insert_group_member_schema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Person added');
				$showCreateGroupMemberForm = false;
			} else if (result.type === 'error') {
				toast.error(result.error ?? 'An error occurred');
			} else if (result.type === 'failure') {
				toast.error('An error occurred');
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;
	const email = stringProxy(form, 'email', { empty: 'null' });

</script>

<Dialog.Root bind:open={$showCreateGroupMemberForm}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add Person</Dialog.Title>
		</Dialog.Header>
		<form
			class="grid items-start gap-4"
			use:enhance
			method="POST"
			action="/{$page.params.group_id}/persons/?/create"
		>
			<Form.Field {form} name="name">
				<Form.Control let:attrs>
					<Form.Label>Name</Form.Label>
					<Input {...attrs} bind:value={$formData.name} placeholder="John Doe" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="email">
				<Form.Control let:attrs>
					<Form.Label>Email</Form.Label>
					<Input {...attrs} bind:value={$email} placeholder="m@example.com" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<FormErrors errors={$errors._errors} />

			<Form.Button type="submit" class="flex gap-1"
				>Add{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</form>
	</Dialog.Content>
</Dialog.Root>
