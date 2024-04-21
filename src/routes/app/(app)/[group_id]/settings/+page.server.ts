import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { groupsTable, update_group_name_schema, update_group_currency_schema } from '$lib/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { isGroupMember, isGroupOwner } from '$lib/helpers';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { group } = isGroupMember(event);

	return {
		update_group_name_form: await superValidate(
			{ name: group.name ?? undefined },
			zod(update_group_name_schema),
			{ id: 'update-group-name-form' }
		),
		update_group_currency_form: await superValidate(
			{ currency: group.currency ?? undefined },
			zod(update_group_currency_schema),
			{ id: 'update-group-currency-form' }
		)
	};
};

export const actions: Actions = {
	'update-group-name': async (event) => {
		const { group } = isGroupMember(event);

		const update_group_name_form = await superValidate(event, zod(update_group_name_schema), {
			id: 'update-group-name-form'
		});

		if (!update_group_name_form.valid) {
			return fail(400, {
				update_group_name_form
			});
		}

		await event.locals.db
			.update(groupsTable)
			.set(update_group_name_form.data)
			.where(eq(groupsTable.id, group.id));

		return { update_group_name_form };
	},
	'update-group-currency': async (event) => {
		const { group } = isGroupMember(event);

		const update_group_currency_form = await superValidate(
			event,
			zod(update_group_currency_schema),
			{ id: 'update-group-currency-form' }
		);

		if (!update_group_currency_form.valid) {
			return fail(400, {
				update_group_currency_form
			});
		}

		await event.locals.db
			.update(groupsTable)
			.set(update_group_currency_form.data)
			.where(eq(groupsTable.id, group.id));

		return { update_group_currency_form };
	},
	'delete-group': async (event) => {
		const { group } = isGroupOwner(event);

		const formData = await event.request.formData();
		const confirm_group_name = formData.get('group_name');

		if (confirm_group_name !== group.name) {
			return fail(400, { message: 'Group name does not match' });
		}

		await event.locals.db.delete(groupsTable).where(eq(groupsTable.id, group.id));

		redirect(302, '/');
	}
};
