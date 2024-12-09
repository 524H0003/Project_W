import { ApolloDriver } from '@nestjs/apollo';
import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { SqlModule } from 'app/module/sql.module';
import { AuthMiddleware } from 'auth/auth.middleware';
import { loadEnv } from './config.module';
import { JwtModule } from '@nestjs/jwt';
import { SignService } from 'auth/auth.service';
import { MailerService } from '@nestjs-modules/mailer';

@Global()
@Module({
	imports: [
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			autoSchemaFile: 'src/schema.gql',
			sortSchema: true,
			playground: false,
		}),
		JwtModule.register({ global: true }),
		loadEnv,
		SqlModule('test'),
	],
	providers: [
		SignService,
		{ provide: MailerService, useValue: { sendMail: jest.fn() } },
	],
	exports: [MailerService],
})
export class TestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('/');
	}
}
