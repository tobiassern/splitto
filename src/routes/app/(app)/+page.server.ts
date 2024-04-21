import { superValidate, setError } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { groupMembersTable, groupsTable, insert_group_schema } from '$lib/schema';
import { fail } from '@sveltejs/kit';
import { isAuthenticated } from '$lib/helpers';
import { redirect } from '@sveltejs/kit';
import { desc, eq, isNull, and } from 'drizzle-orm';
import { countryToCurrency } from '$lib/currencies';

export const load: PageServerLoad = async (event) => {
	const { user } = isAuthenticated(event);

	return {
		groups: await event.locals.db
			.select({
				name: groupsTable.name,
				id: groupsTable.id
			})
			.from(groupsTable)
			.leftJoin(groupMembersTable, eq(groupMembersTable.group_id, groupsTable.id))
			.where(eq(groupMembersTable.user_id, user.id))
			.orderBy(desc(groupsTable.created_at)),
		group_invites: await event.locals.db
			.select({
				name: groupsTable.name,
				id: groupsTable.id
			})
			.from(groupsTable)
			.leftJoin(groupMembersTable, eq(groupMembersTable.group_id, groupsTable.id))
			.where(and(eq(groupMembersTable.email, user.email), isNull(groupMembersTable.user_id)))
			.orderBy(desc(groupsTable.created_at)),
		create_group_form: await superValidate(
			{
				currency:
					countryToCurrency[
						(event.request.headers.get('CF-IPCountry') as keyof typeof countryToCurrency) ?? 'US'
					] ?? 'USD'
			},
			zod(insert_group_schema),
			{ errors: false }
		)
	};
};

export const actions: Actions = {
	'create-group': async (event) => {
		const { user } = isAuthenticated(event);
		const create_group_form = await superValidate(event, zod(insert_group_schema));

		if (!create_group_form.valid) {
			return fail(400, {
				create_group_form
			});
		}

		const new_group = await event.locals.db.transaction(async (tx) => {
			const [new_group] = await tx
				.insert(groupsTable)
				.values({
					name: create_group_form.data.name,
					owner_id: user.id,
					currency: create_group_form.data.currency
				})
				.returning();
			await tx
				.insert(groupMembersTable)
				.values({ group_id: new_group.id, user_id: user.id, name: user.name, email: user.email });

			return new_group;
		});

		if (!new_group) {
			return setError(create_group_form, '', 'Could not create group');
		}

		redirect(302, `/${new_group.id}`);
	}
};
