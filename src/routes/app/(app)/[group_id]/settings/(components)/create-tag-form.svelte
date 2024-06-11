<script lang="ts">
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as Form from '$lib/components/ui/form';
	import { type SuperValidated, type Infer, superForm, numberProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { insert_tag_schema } from '$lib/schema';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FormErrors from '$lib/components/form-errors/form-errors.svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import PlusIcon from 'lucide-svelte/icons/plus';

	export let data: SuperValidated<Infer<typeof insert_tag_schema>>;

	let open = false;

	const form = superForm(data, {
		validators: zodClient(insert_tag_schema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Tag added');
				open = false;
			} else if (result.type === 'error') {
				toast.error(result.error ?? 'An error occurred');
			} else if (result.type === 'failure') {
				toast.error('An error occurred');
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} size="sm" class="gap-1">
			Add tag
			<PlusIcon class="h-4 w-4" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add Tag</Dialog.Title>
		</Dialog.Header>
		<form
			class="grid items-start gap-4"
			use:enhance
			method="POST"
			action="/{$page.params.group_id}/settings/?/create-tag"
		>
			<Form.Field {form} name="label">
				<Form.Control let:attrs>
					<Form.Label>Label</Form.Label>
					<Input {...attrs} bind:value={$formData.label} placeholder="My tag" />
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
