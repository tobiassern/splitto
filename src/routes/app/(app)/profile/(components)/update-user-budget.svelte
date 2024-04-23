<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { update_user_budget_schema } from '$lib/schema';
	import { type SuperValidated, type Infer, superForm, numberProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { FormErrors } from '$lib/components/form-errors';
	import { toast } from 'svelte-sonner';
	import { currencies } from '$lib/currencies';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card';
	export let data: SuperValidated<Infer<typeof update_user_budget_schema>>;

	const form = superForm(data, {
		validators: zodClient(update_user_budget_schema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Budget updated');
			} else {
				toast.error('An error occurred');
			}
		},
		resetForm: false
	});

	const { form: formData, enhance, delayed, errors } = form;

	const budgetAverageDailyProxy = numberProxy(form, 'budget_average_daily', { empty: 'null' });
	const budgetWeeklyProxy = numberProxy(form, 'budget_weekly', { empty: 'null' });
	const budgetMonthlyProxy = numberProxy(form, 'budget_monthly', { empty: 'null' });

	$: selectedCurrency = $formData.default_currency
		? {
				label:
					Object.values(currencies).find((item) => item.code === $formData.default_currency)
						?.name ?? 'Unknown currency',
				value: $formData.default_currency
			}
		: undefined;
</script>

<form method="POST" use:enhance class="contents" action="?/update-budget">
	<Card.Root>
		<Card.Header>
			<Card.Title>Budget</Card.Title>
		</Card.Header>
		<Card.Content>
			<Form.Field {form} name="budget_average_daily">
				<Form.Control let:attrs>
					<Form.Label>Budget average daily</Form.Label>
					<Input {...attrs} bind:value={$budgetAverageDailyProxy} type="number" class="max-w-sm" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="budget_weekly">
				<Form.Control let:attrs>
					<Form.Label>Budget weekly</Form.Label>
					<Input {...attrs} bind:value={$budgetWeeklyProxy} type="number" class="max-w-sm" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="budget_monthly">
				<Form.Control let:attrs>
					<Form.Label>Budget monthly</Form.Label>
					<Input {...attrs} bind:value={$budgetMonthlyProxy} type="number" class="max-w-sm" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="default_currency">
				<Form.Control let:attrs>
					<Form.Label>Default currency</Form.Label>
					<Select.Root
						selected={selectedCurrency}
						onSelectedChange={(v) => {
							v && ($formData.default_currency = v.value);
						}}
					>
						<Select.Trigger {...attrs} class="max-w-sm">
							<Select.Value placeholder="Select a currency" />
						</Select.Trigger>
						<Select.Content fitViewport class="overflow-y-scroll">
							{#each Object.values(currencies) as currency}
								<Select.Item value={currency.code} label={currency.name} />
							{/each}
						</Select.Content>
					</Select.Root>
					<input hidden bind:value={$formData.default_currency} name={attrs.name} />
					<Form.Description class="max-w-sm"
						>Only expenses from groups with the same currency will be calculated towards your
						budget.</Form.Description
					>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<FormErrors errors={$errors._errors} />
		</Card.Content>
		<Card.Footer class="justify-end">
			<Form.Button class="gap-1"
				>Update{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</Card.Footer>
	</Card.Root>
</form>
