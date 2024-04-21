<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { update_group_currency_schema } from '$lib/schema';
	import { currencies } from '$lib/currencies';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FormErrors from '$lib/components/form-errors/form-errors.svelte';
	import { toast } from 'svelte-sonner';

	export let data: SuperValidated<Infer<typeof update_group_currency_schema>>;

	const form = superForm(data, {
		validators: zodClient(update_group_currency_schema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Group currency updated');
			} else if (result.type === 'error') {
				toast.error(result.error ?? 'An error occurred');
			} else if (result.type === 'failure') {
				toast.error('An error occurred');
			}
		}
	});

	const { form: formData, enhance, delayed, errors } = form;

	$: selectedCurrency = $formData.currency
		? {
				label:
					Object.values(currencies).find((item) => item.code === $formData.currency)?.name ??
					'Unknown currency',
				value: $formData.currency
			}
		: undefined;
</script>

<Card.Root class="col-span-12 lg:col-span-8 lg:col-start-3">
	<Card.Header>
		<Card.Title>Currency</Card.Title>
	</Card.Header>
	<form method="POST" action="?/update-group-currency" class="contents" use:enhance>
		<Card.Content>
			<Form.Field {form} name="currency">
				<Form.Control let:attrs>
					<Select.Root
						selected={selectedCurrency}
						onSelectedChange={(v) => {
							v && ($formData.currency = v.value);
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
					<input hidden bind:value={$formData.currency} name={attrs.name} />
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
