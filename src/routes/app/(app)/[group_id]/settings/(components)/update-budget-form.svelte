<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as Form from '$lib/components/ui/form';
	import { type SuperValidated, type Infer, superForm, numberProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { update_group_budget_schema } from '$lib/schema';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FormErrors from '$lib/components/form-errors/form-errors.svelte';
	import { toast } from 'svelte-sonner';

	export let data: SuperValidated<Infer<typeof update_group_budget_schema>>;

	const form = superForm(data, {
		validators: zodClient(update_group_budget_schema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Group budget updated');
			} else if (result.type === 'error') {
				toast.error(result.error ?? 'An error occurred');
			} else if (result.type === 'failure') {
				toast.error('An error occurred');
			}
		}
	});

	const { enhance, errors, delayed } = form;

	const monthlyBudget = numberProxy(form, 'monthly_budget', { empty: 'null' });
	const weeklyBudget = numberProxy(form, 'weekly_budget', { empty: 'null' });
</script>

<Card.Root class="col-span-12 lg:col-span-8 lg:col-start-3">
	<Card.Header>
		<Card.Title>Group Budget</Card.Title>
	</Card.Header>
	<form class="contents" use:enhance method="POST" action="?/update-group-budget">
		<Card.Content>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<Form.Field {form} name="weekly_budget">
					<Form.Control let:attrs>
						<Form.Label>Weekly budget</Form.Label>
						<Input {...attrs} bind:value={$weeklyBudget} placeholder="Weekly budget" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="monthly_budget">
					<Form.Control let:attrs>
						<Form.Label>Monthly budget</Form.Label>
						<Input {...attrs} bind:value={$monthlyBudget} placeholder="Monthly budget" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<FormErrors errors={$errors._errors} />
		</Card.Content>
		<Card.Footer class="justify-end border-t px-6 py-4">
			<Form.Button type="submit" class="flex gap-1"
				>Update{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</Card.Footer>
	</form>
</Card.Root>
