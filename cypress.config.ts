import { defineConfig } from 'cypress';
import plugins from './cypress/plugins';

export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			plugins(on, config);
		},
	},
});
