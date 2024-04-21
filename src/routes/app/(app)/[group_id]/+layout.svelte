<script lang="ts">
	import AppShell from './(components)/app-shell.svelte';
	import { CreateExpense } from '$lib/components/create-expense';
	import { CreateGroupMember } from '$lib/components/create-group-member';
	import { CreateSettlement } from '$lib/components/create-settlement';
	export let data;
</script>

<AppShell user={data.user}>
	<slot />
</AppShell>
<CreateExpense data={data.create_expense_form} />
<CreateGroupMember data={data.create_group_member_form} />
<CreateSettlement data={data.create_settlement_form} />
