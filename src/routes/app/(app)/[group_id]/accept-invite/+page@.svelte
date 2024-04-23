<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	export let data;
</script>

<PageTitle text="Accept invite" />
<main class="mx-auto flex min-h-dvh w-full max-w-2xl items-center p-4 md:p-8">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>You have been invited to {data.group_invite.group.name}</Card.Title>
			<Card.Description
				>Group owner: {data.group_invite.group.owner?.name} ({data.group_invite.group.owner
					?.email})</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				action="?/accept-invite"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							toast.success('Invite accepted');
						} else {
							toast.error('An error occurred');
						}
						applyAction(result);
					};
				}}
			>
				<Button class="w-full" type="submit">Accept invite</Button>
			</form>
		</Card.Content>
	</Card.Root>
</main>
