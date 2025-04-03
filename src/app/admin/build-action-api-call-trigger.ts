import {
	ActionResponse,
	ActionJSON,
	DifferentActionParams,
	useActionResponseHandler,
} from 'adminjs';
import { AxiosResponse } from 'axios';
import { callActionApi } from './call-action-api.js';

export type CallApiFunction<K extends ActionResponse> = () => Promise<
	AxiosResponse<K>
>;

export type BuildActionCallApiTriggerOptions = {
	action: ActionJSON;
	params: DifferentActionParams;
	actionResponseHandler: ReturnType<typeof useActionResponseHandler>;
	search?: Location['search'];
};

export const buildActionCallApiTrigger = <K extends ActionResponse>(
	options: BuildActionCallApiTriggerOptions,
): CallApiFunction<K> => {
	const { action, params, actionResponseHandler, search } = options;
	const callApi: CallApiFunction<K> = () => {
		const promise = callActionApi(action, params, search);
		promise.then(actionResponseHandler).catch((error) => {
			throw error;
		});

		return promise as Promise<AxiosResponse<K>>;
	};
	return callApi;
};
