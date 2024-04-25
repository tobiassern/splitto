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
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import DatePicker from '../date-picker/date-picker.svelte';
	import autoAnimate from '@formkit/auto-animate';
	import { Switch } from '$lib/components/ui/switch/index.js';

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

	$: selectedTags = $formData.tags
		? $formData.tags.map((tag) => {
				return {
					label: $page.data.group?.tags.find((_tag) => _tag.id === tag)?.label,
					value: tag
				};
			})
		: undefined;
</script>

<Dialog.Root bind:open={$showCreateExpenseForm}>
	<Dialog.Content class="max-h-[calc(100dvh_-_6rem)] overflow-y-scroll sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add expense</Dialog.Title>
		</Dialog.Header>
		<form
			class="grid items-start gap-1"
			use:enhance
			method="POST"
			action="/{$page.params.group_id}/expenses/?/create"
		>
			<Form.Field {form} name="amount">
				<Form.Control let:attrs>
					<Form.Label>How much?</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.amount}
						type="number"
						step="any"
						on:change={() => {
							const enabled_splits = $formData.splits.filter((split) => split.enabled).length;
							$formData.splits = $formData.splits.map((split) => {
								split.amount =
									split.enabled && $formData.amount ? $formData.amount / enabled_splits : null;
								return split;
							});
						}}
					/>
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
					<DatePicker bind:value={$formData.when} />
					<input hidden={true} {...attrs} bind:value={$formData.when} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="tags">
				<Form.Control let:attrs>
					<Form.Label>Tags</Form.Label>
					<Select.Root
						multiple
						selected={selectedTags}
						onSelectedChange={(v) => {
							v && ($formData.tags = v.map((val) => val.value));
						}}
					>
						<Select.Trigger {...attrs}>
							<Select.Value placeholder="Select tags" />
						</Select.Trigger>
						<Select.Content>
							{#if $page.data.group?.tags}
								{#each $page.data.group?.tags as tag}
									<Select.Item value={tag.id} label={tag.label} />
									{:else}
									<div class="text-xs py-1.5 px-2 text-muted-foreground">No tags created</div>
								{/each}
							{/if}
						</Select.Content>
					</Select.Root>
					<input hidden bind:value={$formData.group_member_id} name={attrs.name} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Fieldset {form} name="splits" class="my-3 grid gap-1">
				<Form.FieldErrors />
				<Form.Legend class="w-full border-b pb-1">Splits</Form.Legend>
				<div>
					<Button
						disabled={!$formData.amount}
						on:click={() => {
							if ($formData.amount) {
								if ($formData.amount) {
									$formData.splits = $formData.splits.map((split) => {
										split.amount = $formData.amount / $formData.splits.length;
										split.enabled = true;
										return split;
									});
								}
							}
						}}
						size="sm">All</Button
					>
					<Button
						on:click={() => {
							$formData.splits = $formData.splits.map((split) => {
								split.amount = null;
								split.enabled = false;
								return split;
							});
						}}
						size="sm">None</Button
					>
				</div>
				<div use:autoAnimate class="grid gap-2">
					{#each $formData.splits as split, i}
						<div class="-mx-3 rounded-md border px-3 py-2">
							<p class="text-sm">
								{split.name}{#if split.email}
									<span class="ml-1 text-muted-foreground">({split.email})</span>
								{/if}
							</p>
							<div class="mt-2 flex items-start justify-between gap-2">
								<Form.ElementField
									class="flex-1"
									{form}
									name="splits[{i}].amount"
									on:change={(data) => {
										console.log(data);
									}}
								>
									<Form.Control let:attrs>
										<Input
											{...attrs}
											bind:value={split.amount}
											type="number"
											placeholder="Amount"
											step="any"
										/>
									</Form.Control>

									<Form.FieldErrors />
								</Form.ElementField>
								<div class="flex h-9 items-center justify-end">
									<Switch
										name="splits[{i}].enabled"
										checked={split.enabled ? true : false}
										onCheckedChange={(value) => {
											split.enabled = value;
											if ($formData.amount) {
												const enabled_splits = $formData.splits.filter(
													(split) => split.enabled
												).length;
												$formData.splits = $formData.splits.map((split) => {
													split.amount = split.enabled ? $formData.amount / enabled_splits : null;
													return split;
												});
											}
										}}
									/>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<Button
					size="sm"
					class="w-full gap-1"
					variant="ghost"
					on:click={() => {
						$showCreateGroupMemberForm = true;
					}}><PlusIcon class="size-4" />Add person</Button
				>
				<Separator></Separator>
			</Form.Fieldset>
			<FormErrors errors={$errors._errors} />
			<Form.Button type="submit" class="flex w-full gap-1"
				>Add expense{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
			>
		</form>
	</Dialog.Content>
</Dialog.Root>
