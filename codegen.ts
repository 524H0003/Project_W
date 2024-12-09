import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	overwrite: true,
	documents: './graphql/**/*.graphql',
	schema: 'src/schema.gql',
	generates: {
		'src/compiled_graphql.ts': {
			plugins: [
				'typescript',
				'typescript-resolvers',
				'typescript-operations',
				'typescript-document-nodes',
			],
		},
	},
};

export default config;
