import { Field, ObjectType } from '@nestjs/graphql';
import {
	BaseEntity as TypeOrmBaseEntity,
	DeepPartial,
	FindOptionsWhere,
	PrimaryGeneratedColumn,
	Repository,
	PrimaryColumn,
	BeforeInsert,
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
	cache?: boolean;
};

/**
 * Non function properties
 */
export type NonFunctionProperties<T> = Pick<
	T,
	{ [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K }[keyof T]
>;

/**
 * Convert type from an array to a non array property
 */
export type NonArray<T> = T extends (infer U)[] ? U : T;

/**
 * Server entity base
 */
export abstract class BaseEntity extends TypeOrmBaseEntity {
	isNull() {
		return Object.keys(this).length == 0;
	}

	abstract id: string;
}

/**
 * Entity with generated id
 */
@ObjectType()
export class GeneratedId extends BaseEntity {
	// Sensitive Infomations
	/**
	 * Unique identifier
	 */
	@Field() @PrimaryGeneratedColumn('uuid') id: string;
}

/**
 * Entity with id from parent
 */
@ObjectType()
export class ParentId extends BaseEntity {
	/**
	 * Parent identifier
	 */
	@Field() @PrimaryColumn() id: string;

	/**
	 * Set id before insert
	 */
	@BeforeInsert() private setId() {
		this.id = this.pid;
	}

	/**
	 * Get parent identifier
	 */
	get pid() {
		throw new ServerException(
			'Fatal',
			'Method',
			'Implementation',
			new Error('Cannot find parent id'),
		);
	}

	/**
	 * @ignore
	 */
	set pid(x: string) {}
}

/**
 * Generic database requests
 */
export abstract class DatabaseRequests<T extends BaseEntity> {
	/**
	 * Entity relationships
	 */
	private relations: string[];

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
	 * Initiate database for entity
	 */
	constructor(
		private repo: Repository<T>,
		private ctor: new (...args: any[]) => T,
	) {
		this.relations = [].concat(
			...this.repo.metadata.relations.map((i) => this.exploreEntityMetadata(i)),
		);
	}

	// Read
	/**
	 * Get entity from id
	 * @param {string} id - the entity's id
	 * @return {Promise<T>} found entity
	 */
	public readonly id = (id: string): Promise<T> => {
		return this.findOne({
			id,
			cache: false,
		} as unknown as FindOptionsWithCustom<T>);
	};

	/**
	 * Finding objects
	 * @param {FindOptionsWithCustom<T>} options - function's option
	 * @return {Promise<T[]>} array of found objects
	 */
	public readonly find = async (
		options?: FindOptionsWithCustom<T>,
	): Promise<T[]> => {
		const {
				deep = 1,
				relations = [''],
				take = 10e10,
				skip = 0,
				order = undefined,
				cache = true,
				...newOptions
			} = options || {},
			findRelations = this.relations
				.map((i) => i.split('.').slice(0, deep).join('.'))
				.filter((i) => relations.some((j) => i.includes(j)))
				.filter((value, index, self) => self.indexOf(value) === index);

		return (
			await this.repo.find({
				where: <FindOptionsWhere<T>>new this.ctor(newOptions),
				take,
				skip,
				order,
				relations: findRelations,
				cache,
			})
		).map((i) => new this.ctor(i));
	};

	/**
	 * Finding an entity
	 * @param {FindOptionsWithCustom<T>} options - function's option
	 * @return {Promise<T>}
	 */
	public readonly findOne = async (
		options?: FindOptionsWithCustom<T>,
	): Promise<T> => {
		const {
				deep = 1,
				relations = [''],
				cache = true,
				...newOptions
			} = options || {},
			result = await this.repo.findOne({
				where: <FindOptionsWhere<T>>newOptions,
				relations: deep
					? this.relations
							.map((i) => i.split('.').slice(0, deep).join('.'))
							.filter((i) => relations.some((j) => i.includes(j)))
							.filter((value, index, self) => self.indexOf(value) === index)
					: undefined,
				cache,
			});
		return new this.ctor(result);
	};

	// Create
	/**
	 * Saving an entity
	 * @param {NonFunctionProperties<T>} entity - the saving entity
	 */
	protected readonly save = async (
		entity: DeepPartial<NonFunctionProperties<T>>,
	): Promise<T> => {
		const result = await this.repo.save(new this.ctor(entity));

		return new this.ctor(result);
	};

	public abstract assign(...args: any[]): Promise<T>;

	// Update
	/**
	 * Push an entity to field's array
	 * @param {string} id - the id of entity
	 * @param {K} field - the pushing field
	 * @param {NonArray<T[K]>} entity - the push entity
	 */
	public readonly push = async <K extends keyof T>(
		id: string,
		field: K,
		entity: NonArray<T[K]>,
	) => {
		const obj = await this.id(id);
		obj[field as unknown as string].push(entity);
		return this.save(obj);
	};

	/**
	 * Push many entities to field's array
	 * @param {string} id - the id of entity
	 * @param {K} field - the pushing field
	 * @param {T[K]} entities - the push entities
	 */
	public readonly pushMany = async <K extends keyof T>(
		id: string,
		field: K,
		entities: T[K],
	) => {
		const obj = await this.id(id);
		obj[field as unknown as string].push(entities);
		return this.save(obj);
	};

	/**
	 * Modify entity
	 * @param {string} id - entity indentifier string
	 * @param {DeepPartial<T>} update - update value
	 */
	public abstract modify(
		id: string,
		update: DeepPartial<T>,
		raw?: boolean,
	): Promise<void>;

	/**
	 * Updating entity
	 * @param {DeepPartial<T>} targetEntity - the target entity indentifier string
	 * @param {DeepPartial<T>} updatedEntity - function's option
	 */
	protected readonly update = async (
		targetEntity: FindOptionsWhere<T>,
		updatedEntity: DeepPartial<T>,
		raw: boolean = false,
	) => {
		if (!updatedEntity) return;

		await this.repo.update(
			targetEntity,
			(raw
				? updatedEntity
				: new this.ctor(updatedEntity)) as QueryDeepPartialEntity<T>,
		);
	};

	// Delete
	/**
	 * Removing an entity by identifier string
	 * @param {string} id - the entity identifier string
	 */
	public readonly remove = async (id: string): Promise<void> => {
		await this.repo.delete({ id } as unknown as FindOptionsWhere<T>);
	};
}
