<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import { type SuperValidated, type Infer, superForm, stringProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { update_group_member_schema } from '$lib/schema';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FormErrors from '$lib/components/form-errors/form-errors.svelte';
	import { groupMembersTable } from '$lib/schema';
	import { toast } from 'svelte-sonner';

	export let data: SuperValidated<Infer<typeof update_group_member_schema>>;
	export let member: typeof groupMembersTable.$inferSelect;
	export let open = false;

	const form = superForm(data, {
		resetForm: false,
		id: `update-group-member-form-${member.id}`,
		validators: zodClient(update_group_member_schema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Person updated');
				open = false;
			} else {
				toast.error('An error occurred');
			}
			console.log(result);
		}
	});

	const { form: formData, enhance, errors, delayed } = form;

	const emailProxy = stringProxy(form, 'email', { empty: 'null' });

	$: if (member) $formData = member;
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit person</Dialog.Title>
		</Dialog.Header>
		<form class="grid items-start gap-4" use:enhance method="POST" action="?/update-group-member">
			<input bind:value={$formData.id} name="id" hidden />
			<FormErrors errors={$errors._errors} />
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
					<Input {...attrs} bind:value={$emailProxy} placeholder="m@example.com" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button type="submit" class="flex gap-1"
				>Update{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</form>
	</Dialog.Content>
</Dialog.Root>
