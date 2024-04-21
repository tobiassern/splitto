<script lang="ts">
	import UpdateNameForm from './(components)/update-name-form.svelte';
	import UpdateCurrencyForm from './(components)/update-currency-form.svelte';
	import DeleteGroupForm from './(components)/delete-group-form.svelte';

	export let data;
</script>

<UpdateNameForm data={data.update_group_name_form} />
<UpdateCurrencyForm data={data.update_group_currency_form} />
<DeleteGroupForm />
