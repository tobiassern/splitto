<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import UpdateUserName from './(components)/update-user-name.svelte';
	import UpdateUserEmail from './(components)/update-user-email.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { enhance, applyAction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import autoAnimate from '@formkit/auto-animate';

	export let data;
</script>

<main
	class="col-span-1 mx-auto grid max-w-7xl flex-1 items-start gap-4 p-4 sm:px-6 md:gap-8 lg:grid-cols-3"
>
	<Card.Root class="col-span-1 lg:col-span-2">
		<Card.Header class="flex flex-row items-center">
			<div class="grid gap-2">
				<Card.Title>Your profile</Card.Title>
			</div>
			<Button href="/" size="sm" variant="outline" class="ml-auto gap-1">Go to app</Button>
		</Card.Header>
		<Card.Content class="grid gap-6">
			<UpdateUserName data={data.update_user_name_form} />
			<Separator />
			<UpdateUserEmail data={data.update_user_email_form} />
		</Card.Content>
	</Card.Root>
	<Card.Root class="col-span-1">
		<Card.Header>
			<Card.Title>Sessions</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-6" use:autoAnimate>
				{#each data.sessions as session (session.id)}
					<Card.Root>
						<Card.Header>
							<Card.Description class="flex items-center justify-between gap-2"
								><span>Expires: {new Date(session.expiresAt).toLocaleString()}</span
								>{#if data.session?.id === session.id}<Badge>Current</Badge>{/if}</Card.Description
							>
						</Card.Header>
						<Card.Content>
							<p class="text-xs">
								<span class="text-muted-foreground">User agent:</span>
								{session.user_agent ?? '-'}
							</p>
						</Card.Content>
						<Card.Footer class="justify-end">
							<form
								method="POST"
								action="?/sign-out-session"
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'redirect') {
											toast.success('You are signed out');
										} else if (result.type === 'success') {
											toast.success('Session signed out');
										} else {
											toast.error('An error occurred');
										}
										applyAction(result);
									};
								}}
							>
								<Button
									type="submit"
									size="sm"
									variant="outline"
									name="session_id"
									value={session.id}>Sign out session</Button
								>
							</form>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		</Card.Content>
		<Card.Footer class="justify-end">
			<form
				action="?/sign-out-all-sessions"
				method="POST"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'redirect') {
							toast.success('All sessions signed out');
						} else {
							toast.error('An error occurred');
						}
						applyAction(result);
					};
				}}
			>
				<Button size="sm" type="submit" variant="outline">Sign out all sessions</Button>
			</form>
		</Card.Footer>
	</Card.Root>
</main>
