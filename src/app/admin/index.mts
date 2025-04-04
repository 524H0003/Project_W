import {
	AdminJS,
	BaseRecord,
	Filter,
	FilterElement,
	flat,
	ParamsType,
	ResourceWithOptions,
} from 'adminjs';
import { AppService } from 'app/app.service.js';
import {
	BaseEntity,
	Between,
	LessThanOrEqual,
	Like,
	MoreThanOrEqual,
	Raw,
} from 'typeorm';
import { AuthenticationOptions, buildRouter } from '@adminjs/fastify';
import { Database, Resource } from '@adminjs/typeorm';
import { componentLoader, Components } from './components.mjs';
import { ConfigService } from '@nestjs/config';
import { withProtectedRoutesHandler } from './authentication/protected-routes.handler.mjs';
import { withLogin } from './authentication/login.handler.mjs';
import { withLogout } from './authentication/logout.handler.mjs';
import { withRefresh } from './authentication/refresh.handler.mjs';
import { cookieProps, FilterParser, WrongArgumentError } from './types.mjs';
import { HookGuard } from '../../auth/guards/hook.guard.js';

const uuidRegex =
		/^[0-9A-F]{8}-[0-9A-F]{4}-[5|4|3|2|1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
	MISSING_AUTH_CONFIG_ERROR =
		'You must configure either "authenticate" method or assign an auth "provider"',
	INVALID_AUTH_CONFIG_ERROR =
		'You cannot configure both "authenticate" and "provider". "authenticate" will be removed in next major release.',
	DefaultParser = {
		isParserForType: (filter: FilterElement) =>
			filter.property.type() === 'string',
		parse: (filter: FilterElement, fieldKey: string) => {
			if (
				uuidRegex.test(filter.value.toString()) ||
				filter.property['column'].type === 'uuid'
			) {
				return {
					filterKey: fieldKey,
					filterValue: Raw((alias) => `CAST(${alias} AS CHAR(36)) = :value`, {
						value: filter.value,
					}),
				};
			}
			return { filterKey: fieldKey, filterValue: Like(`%${filter.value}%`) };
		},
	},
	safeParseJSON = (json: string) => {
		try {
			return JSON.parse(json);
		} catch {
			return null;
		}
	},
	parsers: FilterParser[] = [
		{
			isParserForType: (filter) =>
				['boolean', 'number', 'float', 'object', 'array'].includes(
					filter.property.type(),
				),
			parse: (filter, fieldKey) => ({
				filterKey: fieldKey,
				filterValue: safeParseJSON(filter.value as string),
			}),
		},
		{
			isParserForType: (filter) => filter.property.type() === 'reference',
			parse: (filter) => {
				const [column] = filter.property['column'].propertyPath.split('.');
				return { filterKey: column, filterValue: filter.value };
			},
		},
		{
			isParserForType: (filter) => filter.property['column'].type === 'enum',
			parse: (filter, fieldKey) => ({
				filterKey: fieldKey,
				filterValue: filter.value,
			}),
		},
		{
			isParserForType: (filter) =>
				['date', 'datetime'].includes(filter.property.type()),
			parse: (filter, fieldKey) => {
				if (
					typeof filter.value !== 'string' &&
					filter.value.from &&
					filter.value.to
				) {
					return {
						filterKey: fieldKey,
						filterValue: Between(
							new Date(filter.value.from),
							new Date(filter.value.to),
						),
					};
				}
				if (typeof filter.value !== 'string' && filter.value.from) {
					return {
						filterKey: fieldKey,
						filterValue: MoreThanOrEqual(
							new Date(filter.value.from).toISOString(),
						),
					};
				}
				if (typeof filter.value !== 'string' && filter.value.to) {
					return {
						filterKey: fieldKey,
						filterValue: LessThanOrEqual(new Date(filter.value.to)),
					};
				}
				throw new Error('Cannot parse date filter');
			},
		},
		{
			isParserForType: (filter: any) => filter?.custom,
			parse: (filter, fieldKey) => ({
				filterKey: fieldKey,
				filterValue: filter['custom'],
			}),
		},
	],
	convertFilter = (filterObject: Filter) => {
		if (!filterObject) {
			return {};
		}
		const { filters } = filterObject ?? {};
		const where = {};
		Object.entries(filters ?? {}).forEach(([fieldKey, filter]) => {
			const parser = parsers.find((p) => p.isParserForType(filter));
			if (parser) {
				const { filterValue, filterKey } = parser.parse(filter, fieldKey);
				where[filterKey] = filterValue;
			} else {
				const { filterValue, filterKey } = DefaultParser.parse(
					filter,
					fieldKey,
				);
				where[filterKey] = filterValue;
			}
		});
		return where;
	},
	fullyHideActions = { list: false, edit: false, show: false },
	generalDisplay = (resource: any): ResourceWithOptions => ({
		resource,
		options: {
			properties: Object.assign(
				{},
				...[
					'hashedPassword',
					'eventCreator.user.hashedPassword',
					'user.hashedPassword',
				].map((i) => ({ [i]: { isVisible: fullyHideActions } })),
			),
		},
	}),
	adminRouter = async (
		admin: AdminJS,
		server: any,
		appService: AppService,
		config: ConfigService,
		{ name, password }: cookieProps,
	) =>
		customBuildAuthenticatedRouter(
			admin,
			{
				authenticate: async (email, password, { request, reply }) => {
					try {
						const canActivate = await new HookGuard().canActivate({
							switchToHttp: () => ({
								getRequest: () => request as any,
								getResponse: () => reply as any,
							}),
						} as unknown as any);

						if (email == config.get('ADMIN_EMAIL') && canActivate) {
							await appService.hook.validating(
								password,
								request['metaData'],
								request['hook'],
							);

							return { email, password };
						}
					} catch {}
					return null;
				},
				cookieName: name,
				cookiePassword: password,
			},
			server,
		),
	customBuildAuthenticatedRouter = async (
		admin: AdminJS,
		auth: AuthenticationOptions,
		fastifyApp: any,
	): Promise<void> => {
		const adminSessionId = 'adminUser';

		if (!auth.authenticate && !auth.provider) {
			throw new WrongArgumentError(MISSING_AUTH_CONFIG_ERROR);
		}

		if (auth.authenticate && auth.provider) {
			throw new WrongArgumentError(INVALID_AUTH_CONFIG_ERROR);
		}

		if (auth.provider) {
			admin.options.env = {
				...admin.options.env,
				...auth.provider.getUiProps(),
			};
		}

		await buildRouter(admin, fastifyApp);
		withProtectedRoutesHandler(fastifyApp, admin, adminSessionId);
		withLogin(fastifyApp, admin, auth, adminSessionId);
		withLogout(fastifyApp, admin, auth);
		withRefresh(fastifyApp, admin, auth, adminSessionId);
	},
	getCustomResource = (svc: AppService): typeof Resource =>
		class CustomResource extends Resource {
			private resourceName: string;

			constructor(model: typeof BaseEntity) {
				super(model);

				this.resourceName = model.name.uncapitalize;
			}

			isNumeric(value: any) {
				const stringValue = String(value).replace(/,/g, '.');
				if (isNaN(parseFloat(stringValue))) return false;
				return isFinite(Number(stringValue));
			}

			safeParseNumber(value: any) {
				if (this.isNumeric(value)) return Number(value);
				return value;
			}

			/** Converts params from string to final type */
			private customPrepareParams(params: {}) {
				const preparedParams = { ...params };
				this.properties().forEach((property) => {
					const param = flat.get(preparedParams, property.path());
					const key = property.path();
					if (param === undefined) {
						return;
					}
					const type = property.type();
					if (type === 'mixed') {
						preparedParams[key] = param;
					}
					if (type === 'number') {
						if (property.isArray()) {
							preparedParams[key] = param
								? param.map((p) => this.safeParseNumber(p))
								: param;
						} else {
							preparedParams[key] = this.safeParseNumber(param);
						}
					}
					if (type === 'reference') {
						if (param === null) {
							preparedParams[property.column.propertyName] = null;
						} else {
							const [ref, foreignKey] = property.column.propertyPath.split('.');
							const id =
								property.column.type === Number ? Number(param) : param;
							preparedParams[ref] = foreignKey ? { [foreignKey]: id } : id;
						}
					}
				});
				return preparedParams;
			}

			async find(filter: any, params: any) {
				const { limit = 10, offset = 0, sort = {} } = params;
				const { direction, sortBy } = sort;
				const instances = await svc[this.resourceName].find({
					...convertFilter(filter),
					take: limit,
					skip: offset,
					order: { [sortBy]: (direction || 'asc').toUpperCase() },
					cache: false,
				});
				return instances.map(
					(instance: ParamsType) => new BaseRecord(instance, this),
				);
			}

			async findOne(id: string) {
				const instance = await svc[this.resourceName].id(id);

				if (!instance) return null;

				return new BaseRecord(instance, this);
			}

			async update(id: string, params = {}) {
				const instance = await svc[this.resourceName].id(id);

				if (!instance) throw new Error('Instance not found.');

				const preparedParams = flat.unflatten(this.customPrepareParams(params));
				Object.keys(preparedParams).forEach((paramName) => {
					if (typeof instance[paramName] !== 'undefined')
						instance[paramName] = preparedParams[paramName];
				});

				await svc[this.resourceName].modify(id, instance);
				return svc[this.resourceName].id(id);
			}

			delete(id: string) {
				return svc[this.resourceName].remove(id);
			}

			create(params = {}) {
				const unflattenedParams = this.customPrepareParams(params);

				params = {};
				Object.keys(unflattenedParams).forEach((i) => {
					let name = i.split('.').at(-1);
					if (name === 'hashedPassword') name = 'password';
					if (unflattenedParams[i]) params[name] = unflattenedParams[i];
				});

				return svc[this.resourceName].assign(params);
			}
		};

export {
	AdminJS,
	getCustomResource,
	adminRouter,
	Database,
	generalDisplay,
	Components,
	componentLoader,
};
