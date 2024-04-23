<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	export let data;
</script>

<main class="mx-auto flex min-h-dvh w-full max-w-2xl items-center p-4 md:p-8">
	<Card.Root class="w-full">
		<Card.Header class="flex flex-col items-start justify-between sm:flex-row sm:items-center">
			<div class="grid flex-1 gap-2">
				<Card.Title>Join {data.group.name}</Card.Title>
				<Card.Description
					>By clicking the join button you will become a member of this group.</Card.Description
				>
				{#if data.group.owner}
					<Card.Description
						>Group owner: {data.group.owner.name} ({data.group.owner.email})</Card.Description
					>
				{/if}
			</div>
		</Card.Header>
		<Card.Footer class="justify-end">
			<form method="POST" action="?/join-group">
				<Button type="submit">Join</Button>
			</form>
		</Card.Footer>
	</Card.Root>
</main>
