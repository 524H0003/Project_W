import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader(),
	Components = {
		Login: componentLoader.override('Login', './login'),
		Dashboard: componentLoader.add('Dashboard', './dashboard'),
		Edit: componentLoader.override('DefaultEditAction', './edit'),
		BulkDelete: componentLoader.override(
			'DefaultBulkDeleteAction',
			'./bulk-delete',
		),
		ActionHeader: componentLoader.override('ActionHeader', './action-header'),
		StyledBackButton: componentLoader.override(
			'StyledBackButton',
			'./styled-back-button',
		),
		New: componentLoader.override('DefaultNewAction', './new'),
	};

export { componentLoader, Components };
