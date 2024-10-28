import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from 'app.controller';
import { loadEnv } from 'app/module/config.module';
import { SqlModule } from 'app/module/sql.module';
import { AuthMiddleware } from 'auth/auth.middleware';
import { AuthModule } from 'auth/auth.module';
import { EnterpriseModule } from 'enterprise/enterprise.module';
import { UniversityModule } from 'university/university.module';

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
		// Core modules
		AuthModule,
		loadEnv,
		SqlModule('deploy'),
		// Application modules
		EnterpriseModule,
		UniversityModule,
	],
	controllers: [AppController],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('/');
	}
}
