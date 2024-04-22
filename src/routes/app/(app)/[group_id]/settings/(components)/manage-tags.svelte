<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { insert_tag_schema, tagsTable, update_tag_schema } from '$lib/schema';
	import CreateTagForm from './create-tag-form.svelte';
	import { flip } from 'svelte/animate';
	import { scale } from 'svelte/transition';
	import ManageTag from './manage-tag.svelte';
	export let create_tag_form: SuperValidated<Infer<typeof insert_tag_schema>>;
	export let update_tag_form: SuperValidated<Infer<typeof update_tag_schema>>;
	export let tags: (typeof tagsTable.$inferSelect)[] = [];
</script>

<Card.Root class="col-span-12 lg:col-span-8 lg:col-start-3">
	<Card.Header class="flex flex-row items-center justify-between gap-4">
		<div class="grid gap-2">
			<Card.Title>Tags</Card.Title>
			<Card.Description>Tags can be used to manage expenses more easily.</Card.Description>
		</div>
		<CreateTagForm data={create_tag_form} />
	</Card.Header>
	<Card.Content class="flex flex-wrap gap-1">
		{#each tags as tag (tag.id)}
			<div animate:flip transition:scale={{ start: 0.5, opacity: 0 }}>
				<ManageTag {tag} data={update_tag_form} />
			</div>
		{:else}
			<p class="text-xs text-muted-foreground italic">No tags created...</p>
		{/each}
	</Card.Content>
</Card.Root>
