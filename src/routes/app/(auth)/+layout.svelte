<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	export let data;
</script>

<main class="flex min-h-dvh items-center justify-center py-10">
	{#if data.user}
		<Card.Root class="mx-auto w-full max-w-sm">
			<Card.Header>
				<Card.Title class="text-2xl">You are already signed in</Card.Title>
				<Card.Description>You can logout in order to login to another account.</Card.Description>
			</Card.Header>
			<Card.Footer class="flex-col items-stretch gap-2">
				<Button href="/">Go to app</Button>
				<form class="contents" method="POST" action="/sign-out">
					<Button type="submit" variant="ghost">Sign out</Button>
				</form>
			</Card.Footer>
		</Card.Root>
	{:else}
		<slot />
	{/if}
</main>
