import { Field, ObjectType } from '@nestjs/graphql';
import { validation } from 'auth/auth.utils';
import {
	BaseEntity as TypeOrmBaseEntity,
	DeepPartial,
	FindOptionsWhere,
	PrimaryGeneratedColumn,
	Repository,
	PrimaryColumn,
	BeforeInsert,
	FindOneOptions,
} from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata.js';

/**
 * Extend find options
 */
export type FindExtendOptions = {
	deep?: number;
	order?: object;
	relations?: string[];
	cache?: boolean;
	writeLock?: boolean;
};

/**
 * Extend find options for many
 */
export type FindExtendOptionsMany = FindExtendOptions & {
	take?: number;
	skip?: number;
};

/**
 * Saving options
 */
export type SaveOptions = { raw?: boolean; validate?: boolean };

/**
 * Extended find where
 */
export type FindWhereExtended<T, K> = FindOptionsWhere<T> & K;

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
	public readonly id = (
		id: string,
		options?: FindExtendOptions,
	): Promise<T> => {
		if (id == null) throw new ServerException('Invalid', 'ID', '');

		return this.findOne({
			...options,
			id,
			cache: false,
		} as unknown as FindWhereExtended<T, FindExtendOptions>);
	};

	/**
	 * Finding objects
	 * @param {FindOptionsWithCustom<T>} options - function's option
	 * @return {Promise<T[]>} array of found objects
	 */
	public readonly find = async (
		options?: FindWhereExtended<T, FindExtendOptionsMany>,
	): Promise<T[]> => {
		const {
				deep = 1,
				relations: requestRelation = [''],
				take = 10e10,
				skip = 0,
				order = undefined,
				cache = true,
				writeLock = false,
				...entity
			} = options || {},
			{ ctor, relations: coreRelations } = this,
			relations = coreRelations
				.map((i) => i.split('.').slice(0, deep).join('.'))
				.filter((i) => requestRelation.some((j) => i.includes(j)))
				.filter((value, index, self) => self.indexOf(value) === index),
			where = new ctor(entity) as FindOptionsWhere<T>,
			lock: FindOneOptions['lock'] = writeLock
				? { mode: 'pessimistic_write' }
				: undefined;

		return (
			await this.repo.find({ where, take, skip, order, relations, cache, lock })
		).map((i) => new ctor(i));
	};

	/**
	 * Finding an entity
	 * @param {FindWhereExtended<T>} options - function's option
	 * @return {Promise<T>}
	 */
	public readonly findOne = async (
		options?: FindWhereExtended<T, FindExtendOptions>,
	): Promise<T> => {
		const {
				deep = 1,
				relations: requestRelation = [''],
				order = undefined,
				cache = true,
				writeLock = false,
				...entity
			} = options || {},
			{ ctor, relations: coreRelations } = this,
			relations = coreRelations
				.map((i) => i.split('.').slice(0, deep).join('.'))
				.filter((i) => requestRelation.some((j) => i.includes(j)))
				.filter((value, index, self) => self.indexOf(value) === index),
			where = new ctor(entity) as FindOptionsWhere<T>,
			lock: FindOneOptions['lock'] = writeLock
				? { mode: 'pessimistic_write' }
				: undefined;

		return new this.ctor(
			await this.repo.findOne({ where, order, relations, cache, lock }),
		);
	};

	/**
	 * Get total of entity
	 * @return {Promise<number>}
	 */
	public readonly total = async (): Promise<number> => {
		return this.repo.count();
	};

	// Create
	/**
	 * Saving an entity
	 * @param {NonFunctionProperties<T>} entity - the saving entity
	 */
	protected readonly save = async (
		entity: DeepPartial<NonFunctionProperties<T>>,
		options?: SaveOptions,
	): Promise<T> => {
		if (entity == null) throw new ServerException('Invalid', 'Input', '');

		const { raw: r = false, validate: v = true } = options || {},
			forgedEntity = r ? entity : new this.ctor(entity);

		return new this.ctor(
			await this.repo.save(
				(v ? await validation(forgedEntity) : forgedEntity) as DeepPartial<T>,
			),
		);
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
		await this.update({ id } as FindOptionsWhere<T>, obj);
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
		await this.update({ id } as FindOptionsWhere<T>, obj);
	};

	/**
	 * Modify entity
	 * @param {string} id - entity indentifier string
	 * @param {DeepPartial<T>} update - update value
	 */
	public abstract modify(
		id: string,
		update: DeepPartial<T>,
		options?: SaveOptions,
	): Promise<void>;

	/**
	 * Updating entity
	 * @param {DeepPartial<T>} targetEntity - target entity
	 * @param {DeepPartial<T>} updatedEntity - updated entity
	 */
	protected readonly update = async (
		targetEntity: FindOptionsWhere<T>,
		updatedEntity: DeepPartial<T>,
		options?: SaveOptions,
	) => {
		if (
			updatedEntity != null &&
			Object.keys(updatedEntity).length &&
			targetEntity != null &&
			Object.keys(targetEntity).length &&
			(await this.find(targetEntity)).length
		)
			await this.save({ ...targetEntity, ...updatedEntity }, options);
	};

	// Delete
	/**
	 * Removing an entity by identifier string
	 * @param {string} id - the entity identifier string
	 */
	public readonly remove = async (id: string): Promise<void> => {
		if (id == null) throw new ServerException('Invalid', 'ID', '');

		await this.repo.delete({ id } as unknown as FindOptionsWhere<T>);
	};
}
