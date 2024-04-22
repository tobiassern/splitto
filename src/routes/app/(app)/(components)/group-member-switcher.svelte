<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Selected } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { groupMembersTable, userTable } from '$lib/schema';
	import { page } from '$app/stores';
	import * as Avatar from '$lib/components/ui/avatar';
	import { getInitials } from '$lib/helpers';
	import { goto } from '$app/navigation';

	type Member = typeof groupMembersTable.$inferSelect;
	interface ExtendedMember extends Member {
		user?: typeof userTable.$inferSelect;
	}
	export let members: ExtendedMember[];

	let selectedMember = $page.url.searchParams.get('member')
		? {
				value: $page.url.searchParams.get('member') as string,
				label:
					members.find((member) => member.id === Number($page.url.searchParams.get('member')))
						?.name ?? ('Unknown member' as string)
			}
		: undefined;

	const handleSelectedChange = (e: Selected<string> | undefined) => {
		const newUrl = new URL($page.url);
		if (e?.value) {
			newUrl.searchParams.set('member', String(e.value));
		} else {
			newUrl.searchParams.delete('member');
		}
		goto(newUrl);
	};
</script>

<Select.Root portal={null} bind:selected={selectedMember} onSelectedChange={handleSelectedChange}>
	<Select.Trigger
		class={cn(
			'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0'
		)}
		aria-label="Select member"
	>
		<span class="pointer-events-none">
			{#if selectedMember}
				{@const selectedMemberFull = members.find(
					(member) => Number(member.id) === Number(selectedMember?.value)
				)}
				{#if selectedMemberFull}
					<Avatar.Root class="aspect-square size-6 min-w-6">
						{#if selectedMemberFull?.user?.avatar_url}
							<Avatar.Image
								src={selectedMemberFull.user.avatar_url}
								alt={selectedMemberFull.user?.name ?? selectedMemberFull.name}
							/>
						{/if}
						<Avatar.Fallback class="text-xs"
							>{getInitials(
								selectedMemberFull.user?.name ?? selectedMemberFull.name
							)}</Avatar.Fallback
						>
					</Avatar.Root>
				{/if}
			{/if}
			<span class={cn('ml-2')}>
				{selectedMember?.label ?? 'Select member'}
			</span>
		</span>
	</Select.Trigger>
	<Select.Content sameWidth={false} align="start">
		<Select.Group>
			<Select.Item value={null} label="All members">
				<div
					class="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground"
				>
					All members
				</div>
			</Select.Item>
			{#each members as member}
				<Select.Item value={member.id} label={member.name}>
					<div
						class="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground"
					>
						<Avatar.Root class="aspect-square size-6 min-w-6">
							{#if member.user?.avatar_url}
								<Avatar.Image src={member.user.avatar_url} alt={member.user?.name ?? member.name} />
							{/if}
							<Avatar.Fallback class="text-xs"
								>{getInitials(member.user?.name ?? member.name)}</Avatar.Fallback
							>
						</Avatar.Root>
						{member.name}
					</div>
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
	<Select.Input hidden name="member" />
</Select.Root>
