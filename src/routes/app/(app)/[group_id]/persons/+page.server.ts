import type { PageServerLoad, Actions } from './$types';
import { isGroupMember } from '$lib/helpers';
import { groupMembersTable, groupsTable } from '$lib/schema';
import { eq, and, ne } from 'drizzle-orm';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { insert_group_member_schema, update_group_member_schema } from '$lib/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { generateRandomString, alphabet } from 'oslo/crypto';

export const load: PageServerLoad = async (event) => {
	isGroupMember(event);

	return {
		update_group_member_form: await superValidate(zod(update_group_member_schema))
	};
};

export const actions: Actions = {
	create: async (event) => {
		const { group } = isGroupMember(event);
		const create_group_member_form = await superValidate(event, zod(insert_group_member_schema), {
			id: 'create-group-member-form'
		});

		if (!create_group_member_form.valid) {
			return fail(400, {
				create_group_member_form
			});
		}

		const [new_group_member, error] = await event.locals.db.transaction(async (tx) => {
			const existing_group_member = create_group_member_form.data.email
				? await tx.query.groupMembersTable.findFirst({
					where: and(
						eq(groupMembersTable.group_id, group.id),
						eq(groupMembersTable.email, create_group_member_form.data.email)
					)
				})
				: null;
			if (existing_group_member) return [null, 'Email already added'];
			const new_group_member = await tx.insert(groupMembersTable).values({
				name: create_group_member_form.data.name,
				email: create_group_member_form.data.email,
				group_id: group.id
			});
			return [new_group_member, null];
		});

		if (error) return setError(create_group_member_form, '', error);
		if (!new_group_member) return setError(create_group_member_form, '', 'Could not add person');

		return { create_group_member_form };
	},
	'activate-invite-link': async (event) => {
		const { group } = isGroupMember(event);
		const formData = await event.request.formData();
		const invite_link_active = formData.get('invite-link-active') ? true : false;
		console.log(invite_link_active);

		await event.locals.db.update(groupsTable).set({ invite_link_active }).where(eq(groupsTable.id, group.id));

		return { success: true }
	},
	'generate-invite-link-code': async (event) => {
		const { group } = isGroupMember(event);

		await event.locals.db.update(groupsTable).set({ invite_link_code: generateRandomString(6, alphabet('0-9')) }).where(eq(groupsTable.id, group.id));
	},
	'update-group-member': async (event) => {
		const { group } = isGroupMember(event);
		const update_group_member_form = await superValidate(event, zod(update_group_member_schema));

		if (!update_group_member_form.valid) {
			return fail(400, {
				update_group_member_form
			});
		}

		console.log(update_group_member_form.data)

		const [updated_group_member, error] = await event.locals.db.transaction(async (tx) => {
			const existing_group_member = update_group_member_form.data.email
				? await tx.query.groupMembersTable.findFirst({
					where: and(
						eq(groupMembersTable.group_id, group.id),
						eq(groupMembersTable.email, update_group_member_form.data.email),
						ne(groupMembersTable.id, update_group_member_form.data.id)
					)
				})
				: null;
			if (existing_group_member) return [null, 'Email already added'];
			const [updated_group_member] = await tx.update(groupMembersTable).set({
				name: update_group_member_form.data.name,
				email: update_group_member_form.data.email,
				weekly_budget: update_group_member_form.data.weekly_budget,
				monthly_budget: update_group_member_form.data.monthly_budget
			}).where(and(eq(groupMembersTable.group_id, group.id), eq(groupMembersTable.id, update_group_member_form.data.id))).returning()
			return [updated_group_member, null];
		});

		if (error) return setError(update_group_member_form, '', error);
		if (!updated_group_member) return setError(update_group_member_form, '', 'Could not update person');
		console.log(updated_group_member);
		return { update_group_member_form };
	},
	'leave-group': async (event) => {
		const { group, user } = isGroupMember(event);

		if (group.owner_id === user.id) error(400, "Group owner can't leave the group");

		await event.locals.db.update(groupMembersTable).set({ user_id: null, email: null }).where(and(eq(groupMembersTable.group_id, group.id), eq(groupMembersTable.user_id, user.id)));

		redirect(302, '/')

	}
};
