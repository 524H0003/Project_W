import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader(),
	Components = {
		Login: componentLoader.override('Login', './login'),
	};

export { componentLoader, Components };
