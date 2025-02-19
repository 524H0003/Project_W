import { Field, ObjectType } from '@nestjs/graphql';
import {
	BaseEntity,
	DeepPartial,
	FindOptionsWhere,
	PrimaryGeneratedColumn,
	Repository,
	SaveOptions,
} from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata.js';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

/**
 * Modified find option
 */
export type FindOptionsWithCustom<T> = (
	| DeepPartial<T>
	| FindOptionsWhere<T>
) & {
	deep?: number;
	take?: number;
	skip?: number;
	order?: object;
	relations?: string[];
};

/**
 * Non function properties
 */
type NonFunctionProperties<T> = DeepPartial<
	Pick<
		T,
		{
			[K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
		}[keyof T]
	>
>;

/**
 * Convert type from an array to a non array property
 */
export type NonArray<T> = T extends (infer U)[] ? U : T;

/**
 * Sensitive infomations in entity
 */
@ObjectType()
export class SensitiveInfomations extends BaseEntity {
	/**
	 * Initiate sensitive infomation
	 */
	constructor() {
		super();
	}

	// Sensitive Infomations
	/**
	 * Unique identifier
	 */
	@Field() @PrimaryGeneratedColumn('uuid') id: string;
}

/**
 * Generic database requests
 */
export class DatabaseRequests<T extends BaseEntity> {
	/**
	 * Entity relationships
	 */
	private relations: string[];

	/**
	 * Initiate database for entity
	 */
	constructor(protected repo: Repository<T>) {
		this.relations = [].concat(
			...this.repo.metadata.relations.map((i) => this.exploreEntityMetadata(i)),
		);
	}

	/**
	 * Exploring entity relationships
	 * @param {RelationMetadata} input - the entity with relationships
	 * @param {string} parentName - discovered relationships
	 * @param {string} avoidNames - relationships must be avoid
	 * @return {Array<string>} array of relationships
	 */
	private exploreEntityMetadata(
		input: RelationMetadata,
		parentName: string = '',
		avoidNames: string = '',
	): Array<string> {
		if (
			[input.propertyName].every(
				(i) =>
					parentName.split('.').includes(i) ||
					avoidNames.split('.').includes(i),
			) ||
			input.propertyName !== input.propertyPath
		)
			return [];
		const currentRelationName = parentName + input.propertyName;
		return [`${currentRelationName}`].concat(
			...input.inverseEntityMetadata.relations.map((i) =>
				this.exploreEntityMetadata(
					i,
					`${currentRelationName}.`,
					`${avoidNames}.${i.inverseSidePropertyPath}`,
				),
			),
		);
	}

	/**
	 * Finding objects
	 * @param {FindOptionsWithCustom<T>} options - function's option
	 * @return {Promise<T[]>} array of found objects
	 */
	find(options?: FindOptionsWithCustom<T>): Promise<T[]> {
		const {
				deep = 1,
				relations = [''],
				take = 50,
				skip = 0,
				order = undefined,
				...newOptions
			} = options || {},
			findRelations = this.relations
				.map((i) => i.split('.').slice(0, deep).join('.'))
				.filter((i) => relations.some((j) => i.includes(j)))
				.filter((value, index, self) => self.indexOf(value) === index);

		return this.repo.find({
			where: <FindOptionsWhere<T>>newOptions,
			take,
			skip,
			order,
			relations: findRelations,
		});
	}

	/**
	 * Finding an entity
	 * @param {FindOptionsWithCustom<T>} options - function's option
	 * @return {Promise<T>}
	 */
	findOne(options?: FindOptionsWithCustom<T>): Promise<T> {
		const { deep = 1, relations = [''], ...newOptions } = options || {};
		return this.repo.findOne({
			where: <FindOptionsWhere<T>>newOptions,
			relations: deep
				? this.relations
						.map((i) => i.split('.').slice(0, deep).join('.'))
						.filter((i) => relations.some((j) => i.includes(j)))
						.filter((value, index, self) => self.indexOf(value) === index)
				: undefined,
		});
	}

	/**
	 * Push an entity to field's array
	 * @param {string} id - the id of entity
	 * @param {K} field - the pushing field
	 * @param {NonArray<T[K]>} entity - the push entity
	 */
	async push<K extends keyof T>(id: string, field: K, entity: NonArray<T[K]>) {
		const obj = await this.id(id);
		obj[field as unknown as string].push(entity);
		return this.save(obj);
	}

	/**
	 * Push many entities to field's array
	 * @param {string} id - the id of entity
	 * @param {K} field - the pushing field
	 * @param {T[K]} entities - the push entities
	 */
	async pushMany<K extends keyof T>(id: string, field: K, entities: T[K]) {
		const obj = await this.id(id);
		obj[field as unknown as string].push(entities);
		return this.save(obj);
	}

	/**
	 * Saving entities
	 * @param {NonFunctionProperties<T>[]} entities - the saving entity
	 * @param {SaveOptions} options - function's option
	 */
	protected saveMany(
		entities: NonFunctionProperties<T>[],
		options?: SaveOptions,
	): Promise<T[]> {
		return this.repo.save(entities as DeepPartial<T>[], options);
	}

	/**
	 * Saving an entity
	 * @param {NonFunctionProperties<T>} entity - the saving entity
	 * @param {SaveOptions} options - function's option
	 */
	protected save(
		entity: NonFunctionProperties<T>,
		options?: SaveOptions,
	): Promise<T> {
		return this.repo.save(entity as DeepPartial<T>, options);
	}

	/**
	 * Create an entity
	 */
	protected create(entity: T): T {
		return this.repo.create(entity);
	}

	/**
	 * Assign an entity
	 */
	// eslint-disable-next-line tsEslint/no-unused-vars
	assign(...args: any): Promise<T> {
		throw new ServerException('Invalid', 'Method', 'Implementation');
	}

	/**
	 * Deleting an entity
	 * @param {FindOptionsWhere<T>} criteria - the deleting entity
	 */
	protected delete(criteria: FindOptionsWhere<T>) {
		return this.repo.delete(criteria);
	}

	/**
	 * Removing an entity
	 */
	// eslint-disable-next-line tsEslint/no-unused-vars
	remove(...args: any) {
		throw new ServerException('Invalid', 'Method', 'Implementation');
	}

	/**
	 * Updating entity
	 * @param {DeepPartial<T>} entity - the updating entity
	 * @param {QueryDeepPartialEntity<T>} updatedEntity - function's option
	 */
	protected update(
		entity: DeepPartial<T>,
		updatedEntity?: QueryDeepPartialEntity<T>,
	) {
		return this.repo.update(entity as FindOptionsWhere<T>, updatedEntity);
	}

	/**
	 * Modifying entity
	 */
	// eslint-disable-next-line tsEslint/no-unused-vars
	modify(...args: any): Promise<T> {
		throw new ServerException('Fatal', 'Method', 'Implementation');
	}

	/**
	 * Get entity from id
	 * @param {string} id - the entity's id
	 * @param {FindOptionsWithCustom<T>} options - function's option
	 * @return {Promise<T>} found entity
	 */
	id(id: string, options?: FindOptionsWithCustom<T>): Promise<T> {
		if (!id) throw new ServerException('Invalid', 'ID', '');
		return this.findOne({ id, ...options });
	}
}
