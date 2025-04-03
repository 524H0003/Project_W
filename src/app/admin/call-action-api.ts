import {
	ApiClient,
	ActionResponse,
	ActionJSON,
	DifferentActionParams,
} from 'adminjs';
import { AxiosResponse } from 'axios';
import { getCsrfToken } from './utils.js';

const api = new ApiClient();

export async function callActionApi<K extends ActionResponse>(
	action: ActionJSON,
	params: DifferentActionParams,
	search?: Location['search'],
): Promise<AxiosResponse<K>> {
	let promise: Promise<AxiosResponse<K>>;
	const { recordId, recordIds, resourceId } = params;

	/* Temporary workaround to avoid breaking changes.
    TODO: For v8 release, rewrite actions to support PUT & DELETE methods.
    Actions should have an option to configure a default method for action buttons. */
	let method = 'get';
	if (action.name === 'delete') {
		method = 'post';
	}

	switch (action.actionType) {
		case 'record':
			if (!recordId) {
				throw new Error('You have to specify "recordId" for record action');
			}
			promise = api.recordAction({
				resourceId,
				actionName: action.name,
				recordId,
				search,
				method,
				headers: {
					'csrf-token': await getCsrfToken('/admin'),
				},
			}) as any;
			break;
		case 'resource':
			promise = api.resourceAction({
				resourceId,
				actionName: action.name,
				method,
			}) as any;
			break;
		case 'bulk':
			if (!recordIds) {
				throw new Error('You have to specify "recordIds" for bulk action');
			}
			promise = api.bulkAction({
				resourceId,
				actionName: action.name,
				recordIds,
				search,
				method,
			}) as any;
			break;
		default:
			throw new Error('"actionType" should be either record, resource or bulk');
	}
	return promise;
}
