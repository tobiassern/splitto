import type { PageServerLoad, Actions } from './$types';
import { isGroupMember } from '$lib/helpers';
import { create_transaction_schema } from '$lib/schema';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createTransaction } from '$lib/server/controllers/transactions';

export const load: PageServerLoad = async (event) => {
	isGroupMember(event);

	return {};
};

export const actions: Actions = {
	create: async (event) => {
		isGroupMember(event);

		const create_expense_form = await superValidate(event, zod(create_transaction_schema), {
			id: 'create-expense-form'
		});

		if (!create_expense_form.valid) {
			return fail(400, {
				create_expense_form
			});
		}

		const { error } = await createTransaction(event, create_expense_form.data);

		if (error) {
			return setError(create_expense_form, '', error);
		}

		return { create_expense_form };
	}
};
