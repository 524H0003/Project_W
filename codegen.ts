import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	overwrite: true,
	documents: 'src/**/*.graphql',
	schema: 'src/graphql/schema.gql',
	generates: {
		'src/graphql/graphql.ts': {
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
