<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import { FormErrors } from '$lib/components/form-errors';
	import { superForm } from 'sveltekit-superforms';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { sign_in_schema } from '$lib/schema';
	import autoAnimate from '@formkit/auto-animate';
	import { toast } from 'svelte-sonner';
	import PageTitle from '$lib/components/page-title/page-title.svelte';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(sign_in_schema),
		onResult: ({ result }) => {
			if (result.type === 'error') {
				toast.error(result.error ?? 'An error occurred');
			} else if (result.type === 'failure') {
				toast.error('An error occurred');
			}
		}
	});

	const { form: formData, enhance, errors, delayed, submitting } = form;
</script>

<PageTitle text="Sign in" />
<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Sign In</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form class="grid gap-4" method="POST" action="?/sign-in-email" use:enhance use:autoAnimate>
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
			<Form.Button class="w-full" disabled={$submitting}
				>Sign in{#if $delayed}<LoaderCircle class="ml-2 size-4 animate-spin" />{/if}</Form.Button
			>
		</form>

		<div class="mt-4 text-center text-sm">
			Don&apos;t have an account?
			<a href="/sign-up" class="underline"> Sign up </a>
		</div>
	</Card.Content>
</Card.Root>
