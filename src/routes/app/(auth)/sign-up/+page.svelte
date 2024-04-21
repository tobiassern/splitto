<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import { FormErrors } from '$lib/components/form-errors';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { sign_up_schema } from '$lib/schema';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(sign_up_schema),
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('New account created');
			} else if (result.type === 'error') {
				toast.error(result.error ?? 'An error occurred');
			}
		}
	});

	const { form: formData, enhance, errors, delayed, submitting } = form;
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-xl">Sign Up</Card.Title>
		<Card.Description>Enter your information to create an account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" action="?/sign-up-email" class="grid gap-4" use:enhance>
			<div class="grid gap-2">
				<Form.Field {form} name="name">
					<Form.Control let:attrs>
						<Form.Label>Name</Form.Label>
						<Input {...attrs} bind:value={$formData.name} placeholder="John Doe" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<div class="grid gap-2">
				<Form.Field {form} name="email">
					<Form.Control let:attrs>
						<Form.Label>Email</Form.Label>
						<Input {...attrs} bind:value={$formData.email} placeholder="m@example.com" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<FormErrors errors={$errors._errors} />
			<Form.Button class="w-full"
				>Create an account{#if $delayed}<LoaderCircle
						class="ml-2 size-4 animate-spin"
					/>{/if}</Form.Button
			>
		</form>
		<div class="mt-4 text-center text-sm">
			Already have an account?
			<a href="/sign-in" class="underline"> Sign in </a>
		</div>
	</Card.Content>
</Card.Root>
