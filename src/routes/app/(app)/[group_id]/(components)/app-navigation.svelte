<script lang="ts">
	import Home from 'lucide-svelte/icons/home';
	import Banknote from 'lucide-svelte/icons/banknote';
	import Users from 'lucide-svelte/icons/users';
	import Settings from 'lucide-svelte/icons/settings';
	import HandCoins from 'lucide-svelte/icons/hand-coins';
	import NavItem from './nav-item.svelte';
	import { UserNav } from '$lib/components/user-nav';

	export let user: import('lucia').User | null;
	const navigation = [
		{ label: 'Overview', path: '/', icon: Home },
		{ label: 'Expenses', path: '/expenses', icon: Banknote },
		{ label: 'Settle', path: '/settle', icon: HandCoins },
		{ label: 'Persons', path: '/persons', icon: Users }
	];
</script>

<aside
	class="fixed bottom-0 left-0 z-30 flex h-[calc(env(safe-area-inset-bottom)_+_3.5rem)] w-full justify-center border-r border-t bg-background sm:h-dvh sm:w-14 sm:border-t-0"
>
	<nav
		class="flex items-center justify-between gap-6 px-4 sm:flex-col sm:justify-start sm:gap-4 sm:px-0 sm:py-4"
	>
		{#each navigation as nav}
			<NavItem {nav} />
		{/each}
		<div
			class="flex items-center justify-between gap-6 sm:flex-1 sm:flex-col sm:justify-end sm:gap-4"
		>
			<NavItem nav={{ label: 'Settings', path: '/settings', icon: Settings }} />

			<UserNav {user} />
		</div>
	</nav>
</aside>
