import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { loadEnv } from 'app/module/config.module';
import { SqlModule } from 'app/module/sql.module';
import { AuthMiddleware } from 'auth/auth.middleware';
import { AuthModule } from 'auth/auth.module';

@Module({
	imports: [
		// GraphQL and Apollo SandBox
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			// Avoid deprecated
			subscriptions: {
				'graphql-ws': true,
				'subscriptions-transport-ws': false,
			},
			// Code first
			autoSchemaFile: 'schema.gql',
			sortSchema: true,
			// Init Apollo SandBox
			playground: false,
			plugins: [ApolloServerPluginLandingPageLocalDefault()],
			includeStacktraceInErrorResponses: false,
			inheritResolversFromInterfaces: false,
		}),
		// Sub modules
		AuthModule,
		loadEnv('deploy'),
		SqlModule('deploy'),
	],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('/');
	}
}
