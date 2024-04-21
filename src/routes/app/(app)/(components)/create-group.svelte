<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import PlusIcon from 'lucide-svelte/icons/plus';

	import * as Form from '$lib/components/ui/form';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { insert_group_schema } from '$lib/schema';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FormErrors from '$lib/components/form-errors/form-errors.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { currencies } from '$lib/currencies';

	export let data: SuperValidated<Infer<typeof insert_group_schema>>;

	const form = superForm(data, {
		validators: zodClient(insert_group_schema)
	});

	const { form: formData, enhance, errors, delayed } = form;

	$: selectedCurrency = $formData.currency
		? {
				label:
					Object.values(currencies).find((item) => item.code === $formData.currency)?.name ??
					'Unknown currency',
				value: $formData.currency
			}
		: undefined;

	let open = false;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} size="sm" class="gap-1">
			Create group
			<PlusIcon class="h-4 w-4" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create group</Dialog.Title>
			<Dialog.Description>
				Make changes to your profile here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<form class="grid items-start gap-4" use:enhance method="POST" action="?/create-group">
			<FormErrors errors={$errors._errors} />
			<Form.Field {form} name="name">
				<Form.Control let:attrs>
					<Form.Label>Group name</Form.Label>
					<Input {...attrs} bind:value={$formData.name} placeholder="My group" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="currency">
				<Form.Control let:attrs>
					<Form.Label>Currency</Form.Label>
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
							{#each Object.entries(currencies) as [key, currency]}
								<Select.Item value={currency.code} label={currency.name} />
							{/each}
						</Select.Content>
					</Select.Root>
					<input hidden bind:value={$formData.currency} name={attrs.name} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Button type="submit" class="flex gap-1"
				>Create{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</form>
	</Dialog.Content>
</Dialog.Root>
