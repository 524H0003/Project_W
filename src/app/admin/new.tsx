import {
	Box,
	Button,
	DrawerContent,
	DrawerFooter,
	Icon,
} from '@adminjs/design-system';
import pick from 'lodash/pick.js';
import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useRecord from './utils/use-record.js';
import {
	ActionProps,
	BasePropertyComponent,
	LayoutElementRenderer,
	RecordJSON,
	useQueryParams,
	useTranslation,
} from 'adminjs';
import { getActionElementCss } from './utils/css.utils.js';
import ActionHeader from './action-header.js';
import { appendForceRefresh } from './utils/append-force-refresh.js';

const New: FC<ActionProps> = (props) => {
	const { record: initialRecord, resource, action } = props,
		{ record, handleChange, submit, loading, setRecord } = useRecord(
			initialRecord,
			resource.id,
		),
		{ translateButton } = useTranslation(),
		navigate = useNavigate(),
		{ parsedQuery, redirectUrl } = useQueryParams();

	useEffect(() => {
		if (initialRecord) {
			setRecord(initialRecord);
		}
	}, [initialRecord, parsedQuery]);

	useEffect(() => {
		if (parsedQuery) {
			const resourceProperties = pick(
				parsedQuery,
				Object.keys(resource.properties),
			);
			if (Object.keys(resourceProperties).length) {
				setRecord({
					...record,
					params: { ...record.params, ...resourceProperties },
				});
			}
		}
	}, [parsedQuery]);

	const handleSubmit = (event): boolean => {
			event.preventDefault();
			if (!event.currentTarget) return false;
			submit().then((response) => {
				if (response.data.redirectUrl) {
					navigate(appendForceRefresh(response.data.redirectUrl));
				}
				// if record has id === has been created
				if (
					response.data.record.id &&
					!Object.keys(response.data.record.errors).length
				) {
					handleChange({ params: {}, populated: {}, errors: {} } as RecordJSON);
				}
			});
			return false;
		},
		handleCancel = () => {
			if (redirectUrl) {
				window.location.href = redirectUrl;
			}
		},
		contentTag = getActionElementCss(
			resource.id,
			action.name,
			'drawer-content',
		),
		formTag = getActionElementCss(resource.id, action.name, 'form'),
		footerTag = getActionElementCss(resource.id, action.name, 'drawer-footer'),
		buttonTag = getActionElementCss(resource.id, action.name, 'drawer-submit'),
		cancelButtonTag = getActionElementCss(
			resource.id,
			action.name,
			'drawer-cancel',
		);

	return (
		<Box
			as="form"
			flex
			flexGrow={1}
			onSubmit={handleSubmit}
			flexDirection="column"
			data-css={formTag}
		>
			<DrawerContent data-css={contentTag}>
				{action?.showInDrawer ? <ActionHeader {...props} /> : null}
				{action.layout
					? action.layout.map((layoutElement, i) => (
							<LayoutElementRenderer
								// eslint-disable-next-line react/no-array-index-key
								key={i}
								layoutElement={layoutElement}
								{...props}
								where="edit"
								onChange={handleChange}
								record={record as RecordJSON}
							/>
						))
					: resource.editProperties.map((property) => (
							<BasePropertyComponent
								key={property.propertyPath}
								where="edit"
								onChange={handleChange}
								property={property}
								resource={resource}
								record={record as RecordJSON}
							/>
						))}
			</DrawerContent>
			<DrawerFooter data-css={footerTag}>
				<Box flex style={{ gap: 16 }}>
					{redirectUrl && (
						<Button
							variant="light"
							type="button"
							onClick={handleCancel}
							data-css={cancelButtonTag}
							data-testid="button-cancel"
						>
							{translateButton('cancel', resource.id)}
						</Button>
					)}
					<Button
						variant="contained"
						type="submit"
						data-css={buttonTag}
						data-testid="button-save"
						disabled={loading}
					>
						{loading ? <Icon icon="Loader" spin /> : null}
						{translateButton('save', resource.id)}
					</Button>
				</Box>
			</DrawerFooter>
		</Box>
	);
};

export default New;
