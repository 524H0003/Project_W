/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
import {
	ActionJSON,
	DifferentActionParams,
	useActionResponseHandler,
	TranslateFunctions,
	ModalFunctions,
	actionHref,
	actionHasDisabledComponent,
	ModalData,
} from 'adminjs';
import { NavigateFunction, Location } from 'react-router';
import { REFRESH_KEY } from './utils/append-force-refresh.js';
import { buildActionCallApiTrigger } from './build-action-api-call-trigger.js';

export type BuildActionClickOptions = {
	action: ActionJSON;
	params: DifferentActionParams;
	actionResponseHandler: ReturnType<typeof useActionResponseHandler>;
	navigate: NavigateFunction;
	translateFunctions: TranslateFunctions;
	modalFunctions: ModalFunctions;
	location?: Location;
};

export type BuildActionClickReturn = (event: any) => any | Promise<any>;

export const buildActionClickHandler = (
	options: BuildActionClickOptions,
): BuildActionClickReturn => {
	const {
			action,
			params,
			actionResponseHandler,
			navigate,
			modalFunctions,
			location,
		} = options,
		{ openModal } = modalFunctions,
		handleActionClick = async (
			event: React.MouseEvent<HTMLElement>,
		): Promise<Promise<any> | any> => {
			event.preventDefault();
			event.stopPropagation();

			const href = actionHref(action, params),
				callApi = buildActionCallApiTrigger({
					params,
					action,
					actionResponseHandler,
				});

			// Action has "component" option set to "false" explicitly in it's configuration
			if (actionHasDisabledComponent(action)) {
				if (action.guard) {
					const modalData: ModalData = {
						modalProps: {
							variant: 'danger',
							label: 'confirm',
							title: action.guard,
							subTitle: '',
						},
						type: 'confirm',
						resourceId: params.resourceId,
						confirmAction: callApi,
					};

					// If confirmation is required, action trigger should be handled in modal
					openModal(modalData);
					return;
				}

				// If no confirmation is required, call API
				await callApi();
				return;
			}

			// Default behaviour - you're navigated to action URL and logic is performed on it's route
			if (href) {
				const url = new URL(`relative:${href}`),
					hrefParams = new URLSearchParams(url.search),
					currentParams = new URLSearchParams(
						action.showInDrawer ? (location?.search ?? '') : '',
					);
				Object.entries(Object.fromEntries(currentParams.entries())).forEach(
					([key, value]) => {
						if (!hrefParams.has(key)) hrefParams.set(key, value);
					},
				);

				if (location?.pathname === url.pathname) {
					hrefParams.set(REFRESH_KEY, 'true');
				}

				await navigate({
					pathname: url.pathname,
					search: hrefParams.toString(),
				});
			}
		};

	return handleActionClick;
};
