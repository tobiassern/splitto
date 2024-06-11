<script lang="ts" context="module">
	import { writable } from 'svelte/store';
	export const settlementFormStore = writable<{
		show: boolean;
		amount: number;
		from_id: null | number;
		to_id: null | number;
	}>({
		show: false,
		amount: 0,
		from_id: null,
		to_id: null
	});
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { create_transaction_schema } from '$lib/schema';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FormErrors from '$lib/components/form-errors/form-errors.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import DatePicker from '../date-picker/date-picker.svelte';

	export let data: SuperValidated<Infer<typeof create_transaction_schema>>;

	const form = superForm(data, {
		id: 'create-settlement-form',
		dataType: 'json',
		validators: zodClient(create_transaction_schema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Settlement added');
				$settlementFormStore = {
					show: false,
					amount: 0,
					from_id: null,
					to_id: null
				};
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;

	$: if ($settlementFormStore.to_id)
		$formData.splits[0] = {
			group_member_id: $settlementFormStore.to_id,
			amount: $settlementFormStore.amount,
			enabled: true
		};
	$: if ($settlementFormStore.from_id) $formData.group_member_id = $settlementFormStore.from_id;
	$: $formData.amount = $settlementFormStore.amount;

	$: selectedFrom = $formData.group_member_id
		? {
				label: $page.data.group?.members.find((member) => member.id === $formData.group_member_id)
					?.name,
				value: $formData.group_member_id
			}
		: undefined;

	$: selectedTo = $formData.splits[0]?.group_member_id
		? {
				label: $page.data.group?.members.find(
					(member) => member.id === $formData.splits[0]?.group_member_id
				)?.name,
				value: $formData.splits[0]?.group_member_id
			}
		: undefined;
</script>

<Dialog.Root bind:open={$settlementFormStore.show}>
	<Dialog.Content class="max-h-[calc(100dvh_-_6rem)] overflow-y-scroll sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add settlement</Dialog.Title>
		</Dialog.Header>
		<form
			class="grid items-start gap-3"
			use:enhance
			method="POST"
			action="/{$page.params.group_id}/settle/?/create"
		>
			<Form.Field {form} name="group_member_id">
				<Form.Control let:attrs>
					<Form.Label>Who paid?</Form.Label>
					<Select.Root
						selected={selectedFrom}
						onSelectedChange={(v) => {
							v && ($formData.group_member_id = v.value);
						}}
					>
						<Select.Trigger {...attrs}>
							<Select.Value placeholder="Select who paid" />
						</Select.Trigger>
						<Select.Content>
							{#if $page.data.group?.members}
								{#each $page.data.group?.members as member}
									<Select.Item value={member.id} label={member.name} />
								{/each}
							{/if}
						</Select.Content>
					</Select.Root>
					<input hidden bind:value={$formData.group_member_id} name={attrs.name} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Fieldset {form} name="splits" class="my-3 grid gap-1">
				{#each $formData.splits as split, i}
					<Form.Field {form} name="splits[{i}].group_member_id">
						<Form.Control let:attrs>
							<Form.Label>To whom?</Form.Label>
							<Select.Root
								selected={selectedTo}
								onSelectedChange={(v) => {
									v && (split.group_member_id = v.value);
								}}
							>
								<Select.Trigger {...attrs}>
									<Select.Value placeholder="Select to whom" />
								</Select.Trigger>
								<Select.Content>
									{#if $page.data.group?.members}
										{#each $page.data.group?.members as member}
											<Select.Item value={member.id} label={member.name} />
										{/each}
									{/if}
								</Select.Content>
							</Select.Root>
							<input hidden bind:value={split.group_member_id} name={attrs.name} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				{/each}
			</Form.Fieldset>

			<Form.Field {form} name="label">
				<Form.Control let:attrs>
					<Form.Label>Label</Form.Label>
					<Input {...attrs} bind:value={$formData.label} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="amount">
				<Form.Control let:attrs>
					<Form.Label>How much?</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.amount}
						type="number"
						step="any"
						on:change={(event) => {
							// @ts-ignore
							$formData.splits[0].amount = Number(event.target?.value);
						}}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="when">
				<Form.Control let:attrs>
					<Form.Label>When</Form.Label>
					<DatePicker bind:value={$formData.when} />
					<input hidden={true} {...attrs} bind:value={$formData.when} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Separator></Separator>
			<FormErrors errors={$errors._errors} />
			<Form.Button type="submit" class="flex w-full gap-1"
				>Add settlement{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</form>
	</Dialog.Content>
</Dialog.Root>
