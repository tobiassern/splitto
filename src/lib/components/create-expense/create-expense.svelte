<script lang="ts" context="module">
	import { writable } from 'svelte/store';
	export const showCreateExpenseForm = writable(false);
</script>

<script lang="ts">
	import { showCreateGroupMemberForm } from '../create-group-member/create-group-member.svelte';
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { create_expense_schema } from '$lib/schema';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import FormErrors from '$lib/components/form-errors/form-errors.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '../ui/button';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import { cn } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import { DatePicker } from '$lib/components/date-picker';
	import { type DateValue, parseDate } from '@internationalized/date';

	export let data: SuperValidated<Infer<typeof create_expense_schema>>;

	const form = superForm(data, {
		dataType: 'json',
		validators: zodClient(create_expense_schema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Expense added');
				$showCreateExpenseForm = false;
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;

	$: selectedGroupMember = $formData.group_member_id
		? {
				label: $page.data.group?.members.find((member) => member.id === $formData.group_member_id)
					?.name,
				value: $formData.group_member_id
			}
		: undefined;

	let whenValue: DateValue | undefined = $formData.when ? parseDate($formData.when) : undefined;

	$: console.log(whenValue);

	$: $formData.when = whenValue ? whenValue.toString() : '';
</script>

<Dialog.Root bind:open={$showCreateExpenseForm}>
	<Dialog.Content class="max-h-[calc(100dvh_-_6rem)] overflow-y-scroll sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add expense</Dialog.Title>
		</Dialog.Header>
		<form
			class="grid items-start gap-3"
			use:enhance
			method="POST"
			action="/{$page.params.group_id}/expenses/?/create"
		>
			<Form.Field {form} name="amount">
				<Form.Control let:attrs>
					<Form.Label>How much?</Form.Label>
					<Input {...attrs} bind:value={$formData.amount} type="number" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="label">
				<Form.Control let:attrs>
					<Form.Label>Label</Form.Label>
					<Input {...attrs} bind:value={$formData.label} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="group_member_id">
				<Form.Control let:attrs>
					<Form.Label>Who paid?</Form.Label>
					<Select.Root
						selected={selectedGroupMember}
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
							<Select.Separator></Select.Separator>
							<Button
								on:click={() => ($showCreateGroupMemberForm = true)}
								class="w-full gap-1"
								variant="ghost"><PlusIcon class="size-4" />Add person</Button
							>
						</Select.Content>
					</Select.Root>
					<input hidden bind:value={$formData.group_member_id} name={attrs.name} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="when">
				<Form.Control let:attrs>
					<Form.Label>When</Form.Label>
					<DatePicker bind:value={whenValue} />
					<input value={$formData.when} name={attrs.name} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Fieldset {form} name="splits" class="grid gap-1">
				<Form.FieldErrors />
				<Form.Legend class="w-full border-b pb-1">Splits</Form.Legend>
				{#each $formData.splits as split, i}
					<Form.ElementField
						{form}
						name="splits[{i}].amount"
						class={cn(!split.amount && 'opacity-50')}
						on:change={(data) => {
							console.log(data);
						}}
					>
						<Form.Control let:attrs>
							<Form.Label
								>{$page.data.group?.members.find((member) => member.id === split.group_member_id)
									?.name}</Form.Label
							>
							<Input {...attrs} bind:value={split.amount} type="number" placeholder="0.00" />
						</Form.Control>
						<Form.FieldErrors />
					</Form.ElementField>
				{/each}
				<Button
					size="sm"
					on:click={() => ($showCreateGroupMemberForm = true)}
					class="w-full gap-1"
					variant="ghost"><PlusIcon class="size-4" />Add person</Button
				>
			</Form.Fieldset>
			<Separator></Separator>
			<FormErrors errors={$errors._errors} />
			<Form.Button type="submit" class="flex w-full gap-1"
				>Add expense{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</form>
	</Dialog.Content>
</Dialog.Root>
