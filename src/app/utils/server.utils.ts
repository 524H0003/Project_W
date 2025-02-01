import fastifyCookie from '@fastify/cookie';
import fastifySession, { CookieOptions } from '@fastify/session';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Faculty } from 'university/faculty/faculty.entity';
import { Student } from 'university/student/student.entity';
import { Employee } from 'enterprise/employee/employee.entity';
import { EventTag } from 'event/tag/tag.entity';
import { Notification } from 'notification/notification.entity';
import { Event } from 'event/event.entity';
import { EventCreator } from 'event/creator/creator.entity';
import fastifyHelmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';
import { User } from 'user/user.entity';
import { Hook } from 'app/hook/hook.entity';
import { IRefreshResult } from 'auth/strategies/refresh.strategy';
import { ConfigService } from '@nestjs/config';
import { AppService } from 'app/app.service';

declare module 'fastify' {
	interface FastifyRequest {
		user: User;
		hook: Hook;
		refresh: IRefreshResult;
		token: object;
	}

	interface Session {
		redirectTo: string;
	}
}

export type CookieProps = {
	name: string;
	password: string;
};

export async function registerServerPlugins(
	fastify: FastifyInstance,
	{ password = (32).string, name = (6).string }: Partial<CookieProps>,
) {
	const secret = password,
		cookieOptions: CookieOptions = {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
		};

	await fastify
		.register(fastifyHelmet, {
			contentSecurityPolicy: {
				directives: {
					defaultSrc: [`'self'`, 'unpkg.com'],
					styleSrc: [
						`'self'`,
						`'unsafe-inline'`,
						'cdn.jsdelivr.net',
						'fonts.googleapis.com',
						'unpkg.com',
					],
					fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
					imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
					scriptSrc: [
						`'self'`,
						`https: 'unsafe-inline'`,
						`cdn.jsdelivr.net`,
						`'unsafe-eval'`,
					],
				},
			},
		})
		.register(fastifyCookie, {
			secret,
			parseOptions: cookieOptions,
		})
		.register(fastifySession, {
			secret,
			// ! Cautious: Session's cookie secure must set false. If not, AdminJS crash
			cookie: { secure: false },
			cookieName: name,
		});
}

export async function initiateAdmin(
	appService: AppService,
	config: ConfigService,
	server: any,
	cookie: CookieProps,
) {
	const {
		AdminJS,
		adminRouter,
		getCustomResource,
		Database,
		generalDisplay,
		componentLoader,
		Components,
	} = await import('../admin/index.mjs');

	AdminJS.registerAdapter({
		Resource: getCustomResource(appService),
		Database,
	});

	const admin = new AdminJS({
		resources: [
			Enterprise,
			Faculty,
			Student,
			Employee,
			EventTag,
			Event,
			Notification,
			EventCreator,
		].map((i) => generalDisplay(i)),
		dashboard: { component: Components.Dashboard },
		componentLoader,
	});

	await adminRouter(admin, server, appService, config, cookie);
}
