<script lang="ts">
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import { FormErrors } from '$lib/components/form-errors';
	import { superForm } from 'sveltekit-superforms';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { verify_email_schema } from '$lib/schema';
	import autoAnimate from '@formkit/auto-animate';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	export let data;

	const form = superForm(data.form, {
		validators: zodClient(verify_email_schema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('Sign in successful');
			} else if (result.type === 'error') {
				toast.error(result.error ?? 'An error occurred');
			} else if (result.type === 'failure') {
				toast.error('An error occurred');
			}
		}
	});

	const { form: formData, enhance, errors, delayed, submitting } = form;

	onMount(() => {
		$formData.email = $page.url.searchParams.get('email') ?? '';
		$formData.otp = $page.url.searchParams.get('code') ?? '';
	});
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Verify email</Card.Title>
		<Card.Description
			>An email have been sent to your inbox with an OTP (One-time password)</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form class="grid gap-4" method="POST" use:enhance action="?/verify-email" use:autoAnimate>
			<div class="grid gap-2">
				<Form.Field {form} name="email">
					<Form.Control let:attrs>
						<Form.Label>Email</Form.Label>
						<Input {...attrs} bind:value={$formData.email} placeholder="m@example.com" readonly />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<div class="grid gap-2">
				<Form.Field {form} name="otp">
					<Form.Control let:attrs>
						<Form.Label>OTP (One-time password)</Form.Label>
						<Input {...attrs} bind:value={$formData.otp} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<FormErrors errors={$errors._errors} />
			<Form.Button class="w-full" disabled={$submitting}
				>Verify{#if $delayed}<LoaderCircle class="ml-2 size-4 animate-spin" />{/if}</Form.Button
			>
		</form>

		<div class="mt-4 text-center text-sm">
			Didn't get an email?
			<a href="/sign-in" class="underline"> Go back </a>
		</div>
		<div class="mt-4 text-center text-sm">
			Don&apos;t have an account?
			<a href="/sign-up" class="underline"> Sign up </a>
		</div>
	</Card.Content>
</Card.Root>
