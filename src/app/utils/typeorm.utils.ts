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

export type FindOptionsWithCustom<T> = DeepPartial<T> & {
	deep?: number;
	relations?: string[];
};

/**
 * Sensitive infomations in entity
 */
export class SensitiveInfomations extends BaseEntity {
	/**
	 * @ignore
	 */
	constructor() {
		super();
	}

	// Sensitive Infomations
	/**
	 * Unique identifier
	 */
	@PrimaryGeneratedColumn('uuid') id: string;
}

/**
 * Generic database requests
 */
export class DatabaseRequests<T extends BaseEntity> {
	/**
	 * @ignore
	 */
	private relations: string[];

	/**
	 * @ignore
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
		const { deep = 1, relations = [''], ...newOptions } = options || {};
		return this.repo.find({
			where: <FindOptionsWhere<T>>newOptions,
			relations: this.relations
				.map((i) => i.split('.').slice(0, deep).join('.'))
				.filter((i) => relations.some((j) => i.includes(j)))
				.filter((value, index, self) => self.indexOf(value) === index),
		});
	}

	/**
	 * Finding an object
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
	 * Saving an object
	 * @param {DeepPartial<T>} entity - the saving object
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<T>} the object from database
	 */
	protected save(entity: DeepPartial<T>, options?: SaveOptions): Promise<T> {
		return this.repo.save(entity, options);
	}

	/**
	 * Deleting an object
	 * @param {FindOptionsWhere<T>} criteria - the deleting object
	 */
	protected async delete(criteria: FindOptionsWhere<T>) {
		await this.repo.delete(criteria);
	}

	/**
	 * Updating an object
	 * @param {DeepPartial<T>} entity - the updating object
	 * @param {QueryDeepPartialEntity<T>} updatedEntity - function's option
	 */
	protected async update(
		entity: DeepPartial<T>,
		updatedEntity?: QueryDeepPartialEntity<T>,
	) {
		await this.repo.update(entity as FindOptionsWhere<T>, updatedEntity);
	}

	/**
	 * Get object from id
	 * @param {string} id - the object's id
	 * @param {FindOptionsWithCustom<T>} options - function's option
	 * @return {Promise<T>} found object
	 */
	id(id: string, options?: FindOptionsWithCustom<T>): Promise<T> {
		return this.findOne({ id, ...options });
	}
}
