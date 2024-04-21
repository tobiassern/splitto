<script lang="ts">
	import { page } from '$app/stores';
	import Settings from 'lucide-svelte/icons/settings';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils';

	export let nav: { label: string; path: string; icon: typeof Settings };

	const href = `/${$page.params.group_id}${nav.path}`;
	$: isActive =
		nav.path === '/' ? $page.url.pathname + '/' === href : $page.url.pathname.startsWith(href);
</script>

<Tooltip.Root>
	<Tooltip.Trigger asChild let:builder>
		<a
			{href}
			class={cn(
				'group flex size-9 items-center justify-center rounded-full  transition-colors sm:size-8',
				isActive
					? 'bg-primary text-primary-foreground'
					: 'text-muted-foreground hover:text-foreground'
			)}
			use:builder.action
			{...builder}
		>
			<svelte:component this={nav.icon} class={cn('size-5')} />
			<span class="sr-only">{nav.label}</span>
		</a>
	</Tooltip.Trigger>
	<Tooltip.Content side="right">{nav.label}</Tooltip.Content>
</Tooltip.Root>
