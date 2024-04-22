<script lang="ts">
	import { page } from '$app/stores';
	import PlusCircled from 'svelte-radix/PlusCircled.svelte';
	import Check from 'svelte-radix/Check.svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover/';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';

	export let filterValues: string[] = [];
	export let name: string;
	export let title: string;
	export let options: { value: string; label: string }[] = [];
	export let searchParam: string;

	let open = false;
	let isTainted = false;

	function handleSelect(currentValue: string) {
		isTainted = true;
		if (Array.isArray(filterValues) && filterValues.includes(currentValue)) {
			filterValues = filterValues.filter((v) => v !== currentValue);
		} else {
			filterValues = [...(Array.isArray(filterValues) ? filterValues : []), currentValue];
		}
	}
</script>

<select multiple {name} hidden>
	{#each options as option}
		<option value={option.value} selected={filterValues.includes(option.value)}
			>{option.label}</option
		>
	{/each}
</select>
<Popover.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen && isTainted) {
			const newUrl = new URL($page.url);
			if (filterValues.length) {
				newUrl.searchParams.delete(searchParam);
				filterValues.forEach((filterValue) => {
					newUrl.searchParams.append(searchParam, filterValue);
				});
			} else {
				newUrl.searchParams.delete(searchParam);
			}
			goto(newUrl);
		}
		isTainted = false;
	}}
>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="sm" class="h-8 border-dashed">
			<PlusCircled class="mr-2 h-4 w-4" />
			{title}
			{#if filterValues.length > 0}
				<Separator orientation="vertical" class="mx-2 h-4" />
				<div class="flex space-x-1">
					{#if filterValues.length > 3}
						<Badge class="rounded-sm px-1 font-normal">
							{filterValues.length}
							Selected
						</Badge>
					{:else}
						{#each filterValues as option (option)}
							<Badge class="rounded-sm px-1 font-normal">
								{options.find((opt) => opt.value === option)?.label}
							</Badge>
						{/each}
					{/if}
				</div>
			{/if}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0" align="start" side="bottom">
		<Command.Root>
			<Command.Input placeholder={title} />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group>
					{#each options as option}
						<Command.Item
							value={String(option.value)}
							onSelect={(currentValue) => {
								handleSelect(currentValue);
							}}
						>
							<div
								class={cn(
									'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
									filterValues.includes(option.value)
										? 'bg-primary text-primary-foreground'
										: 'opacity-50 [&_svg]:invisible'
								)}
							>
								<Check className={cn('h-4 w-4')} />
							</div>
							<span>
								{option.label}
							</span>
						</Command.Item>
					{/each}
				</Command.Group>
				{#if filterValues.length > 0}
					<Command.Group class="sticky bottom-0 bg-background pt-0">
						<Command.Separator class="mb-1" />
						<Command.Item
							class="justify-center text-center"
							onSelect={() => {
								filterValues = [];
								isTainted = true;
							}}
						>
							Clear filters
						</Command.Item>
					</Command.Group>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
