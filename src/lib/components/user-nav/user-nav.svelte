<script lang="ts">
	import { page } from '$app/stores';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { getInitials } from '$lib/helpers';
	import { PUBLIC_SITE_HOSTNAME } from '$env/static/public';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import MoonIcon from 'lucide-svelte/icons/moon';
	import SunIcon from 'lucide-svelte/icons/sun';
	import MonitorIcon from 'lucide-svelte/icons/monitor';
	import { setMode } from 'mode-watcher';

	export let user: import('lucia').User | null;

	let signOutFormEl: HTMLFormElement;

	const generateSitePath = (path: string) => {
		return `${$page.url.protocol}//${PUBLIC_SITE_HOSTNAME}${$page.url.port ? `:${$page.url.port}` : ''}${path}`;
	};
</script>

<form bind:this={signOutFormEl} method="POST" action="/sign-out" hidden />
{#if user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button
				variant="outline"
				size="icon"
				class="overflow-hidden rounded-full"
				builders={[builder]}
			>
				<Avatar.Root class="size-9 overflow-hidden rounded-full">
					{#if user.avatar_url}
						<Avatar.Image src={user.avatar_url} alt={user.name} />
					{/if}
					<Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
				</Avatar.Root>
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Label class="font-normal">
				<div class="flex flex-col space-y-1">
					{#if user.name}<p class="text-sm font-medium leading-none">
							{user.name}
						</p>{/if}
					<p class="text-xs leading-none text-muted-foreground">{user.email}</p>
				</div>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item href="/">Switch group</DropdownMenu.Item>
			<DropdownMenu.Item href="/profile">Profile</DropdownMenu.Item>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger
					>Theme<SunIcon class="ml-2 size-4 dark:hidden" />
					<MoonIcon class="ml-2 hidden size-4 dark:block" /></DropdownMenu.SubTrigger
				>
				<DropdownMenu.SubContent>
					<DropdownMenu.Item on:click={() => setMode('light')}
						><SunIcon class="mr-2 size-4" />Light</DropdownMenu.Item
					>
					<DropdownMenu.Item on:click={() => setMode('dark')}
						><MoonIcon class="mr-2 size-4" />Dark</DropdownMenu.Item
					>
					<DropdownMenu.Item on:click={() => setMode('system')}
						><MonitorIcon class="mr-2 size-4" />System</DropdownMenu.Item
					>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
			<DropdownMenu.Item
				href={generateSitePath('/support')}
				class="items-center justify-between gap-1"
				target="_blank">Support<ExternalLink class="size-4" /></DropdownMenu.Item
			>
			<DropdownMenu.Separator />

			<DropdownMenu.Item on:click={() => signOutFormEl.requestSubmit()}>Sign out</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
