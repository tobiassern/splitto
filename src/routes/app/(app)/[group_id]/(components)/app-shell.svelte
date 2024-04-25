<script lang="ts">
	import AppNavigation from './app-navigation.svelte';

	export let user: import('lucia').User | null;
</script>

<div
	class="flex min-h-dvh w-full flex-col sm:pb-0 sm:pl-14"
	style="padding-bottom: calc(env(safe-area-inset-bottom) + 3.5rem);"
>
	<main class="mx-auto grid w-full max-w-7xl grid-cols-12 items-start gap-4 p-4 sm:p-6 md:gap-8">
		<slot />
	</main>
</div>
<AppNavigation {user} />
