<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { tagsTable, update_tag_schema } from '$lib/schema';
	import { page } from '$app/stores';
	import { Input } from '$lib/components/ui/input/index.js';
	import { enhance as skEnhance } from '$app/forms';

	import * as Form from '$lib/components/ui/form';
	import { type SuperValidated, type Infer, superForm, numberProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	export let data: SuperValidated<Infer<typeof update_tag_schema>>;
	export let tag: typeof tagsTable.$inferSelect;

	let open = false;

	const form = superForm(data, {
		id: `update-tag-form-${tag.id}`,
		validators: zodClient(update_tag_schema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Tag updated');
				open = false;
			} else if (result.type === 'error') {
				toast.error(result.error ?? 'An error occurred');
			} else if (result.type === 'failure') {
				toast.error('An error occurred');
			}
		}
	});

	const { form: formData, enhance, delayed, submitting } = form;

	let deleteFormEl: HTMLFormElement;

	onMount(() => {
		$formData.id = tag.id;
		$formData.label = tag.label;
	});

	const monthlyBudgetProxy = numberProxy(form, 'monthly_budget', { empty: 'null' });
</script>

<form bind:this={deleteFormEl} method="POST" action="?/delete-tag" use:skEnhance hidden>
	<input value={tag.id} name="tag_id" />
</form>
<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger>
		<Badge>{tag.label}</Badge>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start">
		<DropdownMenu.Group>
			<DropdownMenu.Label>
				<p>{tag.label}</p>
				<p class="text-xs font-normal">
					Budget: {#if tag.monthly_budget}{Intl.NumberFormat('sv-SE', {
							currency: $page.data.group?.currency ?? undefined,
							style: 'currency'
						}).format(Number(tag.monthly_budget ?? 0))}{:else}<span
							class="italic text-muted-foreground">Not set</span
						>{/if}
				</p>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item href="/{$page.data.group?.id}/expenses?tag={tag.id}"
				>View expenses</DropdownMenu.Item
			>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>Update tag</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent fitViewport={true}>
					<form class="grid gap-1 p-1" method="POST" action="?/update-tag" use:enhance>
						<input value={tag.id} name="id" hidden />
						<Form.Field {form} name="label">
							<Form.Control let:attrs>
								<Form.Label>Label</Form.Label>
								<Input {...attrs} bind:value={$formData.label} placeholder="My tag" />
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="monthly_budget">
							<Form.Control let:attrs>
								<Form.Label>Monthly budget</Form.Label>
								<Input {...attrs} bind:value={$monthlyBudgetProxy} placeholder="0.00" />
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Button size="sm" class="gap-1" disabled={$submitting}
							>Update{#if $delayed}<LoaderCircle class="size-4 animate-spin" />{/if}</Form.Button
						>
					</form>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
			<DropdownMenu.Separator />
			<DropdownMenu.Item on:click={() => deleteFormEl.requestSubmit()}>Remove</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
