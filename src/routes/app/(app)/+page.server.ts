import { superValidate, setError } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import {
	groupMembersTable,
	groupsTable,
	insert_group_schema
} from '$lib/schema';
import { fail } from '@sveltejs/kit';
import { isAuthenticated } from '$lib/helpers';
import { redirect } from '@sveltejs/kit';
import { desc, eq, isNull, and } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { user } = isAuthenticated(event);
	// const date = new Date();
	// const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
	// const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	// const daysSinceFirst = date.getDate();

	// const first = date.getDate() - date.getDay(); // First day is the day of the month - the day of the week
	// const last = first + 6; // last day is the first day + 6

	// const firstDayOfWeek = new Date(date.setDate(first));
	// const lastDayOfWeek = new Date(date.setDate(last));

	// const [total_month] = await event.locals.db
	// 	.select({
	// 		amount: sum(transactionSplitsTable.amount)
	// 	})
	// 	.from(transactionSplitsTable)
	// 	.leftJoin(transactionsTable, eq(transactionsTable.id, transactionSplitsTable.transaction_id))
	// 	.leftJoin(groupMembersTable, eq(groupMembersTable.id, transactionSplitsTable.group_member_id))
	// 	.leftJoin(userTable, eq(userTable.id, groupMembersTable.user_id))
	// 	.leftJoin(groupsTable, eq(groupsTable.id, transactionsTable.group_id))
	// 	.where(
	// 		and(
	// 			eq(transactionSplitsTable.type, 'credit'),
	// 			eq(transactionsTable.type, 'expense'),
	// 			eq(userTable.id, user.id),
	// 			eq(groupsTable.currency, user.default_currency),
	// 			between(transactionsTable.when, firstDayOfMonth, lastDayOfMonth)
	// 		)
	// 	)
	// 	.groupBy(userTable.id);

	// const [total_week] = await event.locals.db
	// 	.select({
	// 		amount: sum(transactionSplitsTable.amount)
	// 	})
	// 	.from(transactionSplitsTable)
	// 	.leftJoin(transactionsTable, eq(transactionsTable.id, transactionSplitsTable.transaction_id))
	// 	.leftJoin(groupMembersTable, eq(groupMembersTable.id, transactionSplitsTable.group_member_id))
	// 	.leftJoin(userTable, eq(userTable.id, groupMembersTable.user_id))
	// 	.leftJoin(groupsTable, eq(groupsTable.id, transactionsTable.group_id))

	// 	.where(
	// 		and(
	// 			eq(transactionSplitsTable.type, 'credit'),
	// 			eq(transactionsTable.type, 'expense'),
	// 			eq(userTable.id, user.id),
	// 			eq(groupsTable.currency, user.default_currency),
	// 			between(transactionsTable.when, firstDayOfWeek, lastDayOfWeek)
	// 		)
	// 	)
	// 	.groupBy(userTable.id);

	return {
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
				currency: user.default_currency
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
