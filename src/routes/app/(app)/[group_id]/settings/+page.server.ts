import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import {
	groupsTable,
	update_group_name_schema,
	update_group_currency_schema,
	tagsTable,
	insert_tag_schema,
	update_tag_schema,
	update_group_budget_schema
} from '$lib/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { isGroupMember, isGroupOwner } from '$lib/helpers';
import { fail, redirect, error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { group } = isGroupMember(event);

	return {
		create_tag_form: await superValidate(zod(insert_tag_schema), { id: 'create-tag-form' }),
		update_tag_form: await superValidate(zod(update_tag_schema), { id: 'update-tag-form' }),
		update_budget_form: await superValidate(group, zod(update_group_budget_schema), {
			id: 'update-budget-form'
		}),
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
	'update-group-budget': async (event) => {
		const { group } = isGroupMember(event);

		const update_budget_form = await superValidate(event, zod(update_group_budget_schema), {
			id: 'update-budget-form'
		});

		if (!update_budget_form.valid) {
			return fail(400, {
				update_budget_form
			});
		}

		await event.locals.db
			.update(groupsTable)
			.set(update_budget_form.data)
			.where(eq(groupsTable.id, group.id));

		return { update_budget_form };
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
	},
	'create-tag': async (event) => {
		const { group } = isGroupMember(event);

		const create_tag_form = await superValidate(event, zod(insert_tag_schema), {
			id: 'create-tag-form'
		});

		if (!create_tag_form.valid) {
			return fail(400, {
				create_tag_form
			});
		}

		await event.locals.db.insert(tagsTable).values({
			label: create_tag_form.data.label,
			group_id: group.id,
			monthly_budget: create_tag_form.data.monthly_budget
		});

		return { create_tag_form };
	},
	'update-tag': async (event) => {
		const { group } = isGroupMember(event);

		const update_tag_form = await superValidate(event, zod(update_tag_schema));

		if (!update_tag_form.valid) {
			return fail(400, {
				update_tag_form
			});
		}

		const result = await event.locals.db
			.update(tagsTable)
			.set({
				label: update_tag_form.data.label,
				monthly_budget: update_tag_form.data.monthly_budget
			})
			.where(and(eq(tagsTable.group_id, group.id), eq(tagsTable.id, update_tag_form.data.id)))
			.returning();

		console.log(result);

		return { update_tag_form };
	},
	'delete-tag': async (event) => {
		const { group } = isGroupMember(event);

		const formData = await event.request.formData();

		const tag_id = formData.get('tag_id');

		if (!tag_id) error(400, 'No tag ID provided');

		await event.locals.db
			.delete(tagsTable)
			.where(and(eq(tagsTable.group_id, group.id), eq(tagsTable.id, Number(tag_id))));

		return { success: true };
	}
};
