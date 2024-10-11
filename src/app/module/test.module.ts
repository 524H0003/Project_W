import { ApolloDriver } from '@nestjs/apollo';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { SqlModule } from 'app/module/sql.module';
import { AuthMiddleware } from 'auth/auth.middleware';
import { loadEnv } from './config.module';
import { JwtModule } from '@nestjs/jwt';
import { SignService } from 'auth/auth.service';

@Module({
	imports: [
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			autoSchemaFile: 'schema.gql',
			sortSchema: true,
			playground: false,
		}),
		JwtModule.register({ global: true }),
		loadEnv('test'),
		SqlModule('test'),
	],
	providers: [SignService],
})
export class TestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('/');
	}
}
