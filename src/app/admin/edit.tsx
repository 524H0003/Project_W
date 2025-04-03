import {
	Box,
	Button,
	DrawerContent,
	DrawerFooter,
	Icon,
} from '@adminjs/design-system';
import {
	ActionHeader,
	ActionProps,
	BasePropertyComponent,
	LayoutElementRenderer,
	RecordJSON,
	useTranslation,
} from 'adminjs';
import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { appendForceRefresh } from './utils/append-force-refresh.js';
import { getCsrfToken } from './utils.js';
import useRecord from './utils/use-record.js';
import { getActionElementCss } from './utils/css.utils.js';

const Edit: FC<ActionProps> = (props) => {
	const { record: initialRecord, resource, action } = props,
		{
			record,
			handleChange,
			submit: handleSubmit,
			loading,
			setRecord,
		} = useRecord(initialRecord, resource.id),
		{ translateButton } = useTranslation(),
		navigate = useNavigate(),
		submit = (event: React.FormEvent<HTMLFormElement>): boolean => {
			event.preventDefault();
			handleSubmit().then((response: any) => {
				if (response.data.redirectUrl) {
					navigate(appendForceRefresh(response.data.redirectUrl));
				}
			});
			return false;
		},
		contentTag = getActionElementCss(
			resource.id,
			action.name,
			'drawer-content',
		),
		formTag = getActionElementCss(resource.id, action.name, 'form'),
		footerTag = getActionElementCss(resource.id, action.name, 'drawer-footer'),
		buttonTag = getActionElementCss(resource.id, action.name, 'drawer-submit');

	useEffect(() => {
		if (initialRecord) {
			setRecord(initialRecord);
		}
	}, [initialRecord]);

	return (
		<Box
			as="form"
			onSubmit={submit}
			flex
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
			</DrawerFooter>
		</Box>
	);
};

export default Edit;
