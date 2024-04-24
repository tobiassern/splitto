<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import UpdateUserName from './(components)/update-user-name.svelte';
	import UpdateUserBudget from './(components)/update-user-budget.svelte';
	import UpdateUserEmail from './(components)/update-user-email.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { enhance, applyAction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import autoAnimate from '@formkit/auto-animate';
	import { PageTitle } from '$lib/components/page-title';
	import DeleteUser from './(components)/delete-user.svelte';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import { afterNavigate } from '$app/navigation';
	import { cn } from '$lib/utils';
	export let data;

	let path: string = '/';

	afterNavigate((nav) => {
		console.log(nav);
		path = nav.from?.url.pathname ?? '/';
	});

	let scrollY: number;

	$: isScrolled = scrollY > 20 ? true : false;
</script>

<svelte:window bind:scrollY />
<PageTitle text="Profile" />
<main
	class="col-span-12 mx-auto grid max-w-7xl flex-1 grid-cols-12 items-start gap-4 p-4 sm:px-6 md:gap-8"
>
	<div class="sticky top-4 col-span-12">
		<Button
			href={path}
			size="sm"
			variant="outline"
			class={cn('ml-auto gap-1 transition-shadow', isScrolled && 'shadow-lg')}
			><ArrowLeft class="size-4" />Go back</Button
		>
	</div>
	<div class="col-span-12 flex flex-col gap-4 md:gap-8 lg:col-span-7">
		<UpdateUserName data={data.update_user_name_form} />
		<UpdateUserEmail data={data.update_user_email_form} />
		<UpdateUserBudget data={data.update_user_budget_form} />
		<DeleteUser />
	</div>
	<Card.Root class="col-span-12 lg:col-span-5">
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
									return async ({ result, update }) => {
										if (result.type === 'redirect') {
											toast.success('You are signed out');
										} else if (result.type === 'success') {
											toast.success('Session signed out');
											update();
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
