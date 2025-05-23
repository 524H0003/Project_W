import {
	CallHandler,
	ExecutionContext,
	Inject,
	mixin,
	NestInterceptor,
	Optional,
	Type,
} from '@nestjs/common';
import multer from 'fastify-multer';
import { Observable } from 'rxjs';
import type { MulterOptions } from './multer/options.interface';
import { transformException } from './multer/utils';

/**
 * File interceptor decorator
 *
 * @param {string} fieldName - request body field
 * @param {MulterOptions} localOptions - function options
 * @return {Type<NestInterceptor>}
 *
 * @publicApi
 */
export function FileInterceptor(
	fieldName?: string,
	localOptions?: MulterOptions,
): Type<NestInterceptor> {
	class MixinInterceptor implements NestInterceptor {
		protected multer: any;

		constructor(
			@Optional() @Inject('MULTER_MODULE_OPTIONS') options: MulterOptions = {},
		) {
			this.multer = multer({ ...options, ...localOptions });
		}

		async intercept(
			context: ExecutionContext,
			next: CallHandler,
		): Promise<Observable<any>> {
			const ctx = context.switchToHttp();

			await new Promise<void>((resolve, reject) =>
				this.multer[fieldName ? 'single' : 'none'](fieldName)(
					ctx.getRequest(),
					ctx.getResponse(),
					(err: any) => {
						if (err) {
							const error = transformException(err);
							return reject(error);
						}
						resolve();
					},
				),
			);
			return next.handle();
		}
	}
	const Interceptor = mixin(MixinInterceptor);
	return Interceptor;
}
