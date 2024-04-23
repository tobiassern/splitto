<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { update_user_budget_schema } from '$lib/schema';
	import { type SuperValidated, type Infer, superForm, numberProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { FormErrors } from '$lib/components/form-errors';
	import { toast } from 'svelte-sonner';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { currencies } from '$lib/currencies';
	import * as Select from '$lib/components/ui/select/index.js';

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

	const budgetProxy = numberProxy(form, 'budget', { empty: 'null' });

	$: selectedCurrency = $formData.default_currency
		? {
				label:
					Object.values(currencies).find((item) => item.code === $formData.default_currency)?.name ??
					'Unknown currency',
				value: $formData.default_currency
			}
		: undefined;
</script>

<form method="POST" use:enhance class="grid gap-4" action="?/update-budget">
	<Form.Field {form} name="budget">
		<Form.Control let:attrs>
			<Form.Label>Budget</Form.Label>
			<Input {...attrs} bind:value={$budgetProxy} type="number" />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Fieldset {form} name="budget_per" class="space-y-3">
		<Form.Legend>Budget per</Form.Legend>
		<RadioGroup.Root bind:value={$formData.budget_per} class="flex flex-col space-y-1">
			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control let:attrs>
					<RadioGroup.Item value="week" {...attrs} />
					<Form.Label class="font-normal">Week</Form.Label>
				</Form.Control>
			</div>
			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control let:attrs>
					<RadioGroup.Item value="month" {...attrs} />
					<Form.Label class="font-normal">Month</Form.Label>
				</Form.Control>
			</div>
			<RadioGroup.Input name="budget_per" />
		</RadioGroup.Root>
		<Form.FieldErrors />
	</Form.Fieldset>
	<Form.Field {form} name="default_currency">
		<Form.Control let:attrs>
			<Form.Label>Default currency</Form.Label>
			<Select.Root
				selected={selectedCurrency}
				onSelectedChange={(v) => {
					v && ($formData.default_currency = v.value);
				}}
			>
				<Select.Trigger {...attrs}>
					<Select.Value placeholder="Select a currency" />
				</Select.Trigger>
				<Select.Content fitViewport class="overflow-y-scroll">
					{#each Object.values(currencies) as currency}
						<Select.Item value={currency.code} label={currency.name} />
					{/each}
				</Select.Content>
			</Select.Root>
			<input hidden bind:value={$formData.default_currency} name={attrs.name} />
			<Form.Description>Only expenses from groups with the same currency will be calculated towards your budget.</Form.Description>
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
