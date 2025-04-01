import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader(),
	Components = {
		Login: componentLoader.override('Login', './login'),
		Dashboard: componentLoader.add('Dashboard', './dashboard'),
		Edit: componentLoader.override('DefaultEditAction', './edit'),
	};

export { componentLoader, Components };
