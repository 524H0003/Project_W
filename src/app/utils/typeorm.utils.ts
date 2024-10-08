import {
	BaseEntity,
	DeepPartial,
	FindOptionsWhere,
	PrimaryGeneratedColumn,
	Repository,
	SaveOptions,
} from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata.js';

export type FindOptionsWithCustom<T> = FindOptionsWhere<T> & {
	deep?: number;
	relations?: string[];
};

export class SensitiveInfomations extends BaseEntity {
	constructor() {
		super();
	}

	// Sensitive Infomations
	@PrimaryGeneratedColumn('uuid') id: string;
}

export class DatabaseRequests<T extends SensitiveInfomations> {
	relations: string[];

	constructor(protected repo: Repository<T>) {
		this.relations = [].concat(
			...this.repo.metadata.relations.map((i) => this.exploreEntityMetadata(i)),
		);
	}

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
			)
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

	protected find(options?: FindOptionsWithCustom<T>): Promise<T[]> {
		const { deep = 1, relations = [''], ...newOptions } = options || {};
		return this.repo.find({
			where: <FindOptionsWhere<T>>newOptions,
			relations: this.relations
				.map((i) => i.split('.').slice(0, deep).join('.'))
				.filter((i) => relations.some((j) => i.includes(j)))
				.filter((value, index, self) => self.indexOf(value) === index),
		});
	}

	protected findOne(options?: FindOptionsWithCustom<T>): Promise<T> {
		const { deep = 1, relations = [''], ...newOptions } = options || {};
		return this.repo.findOne({
			where: <FindOptionsWhere<T>>newOptions,
			relations: this.relations
				.map((i) => i.split('.').slice(0, deep).join('.'))
				.filter((i) => relations.some((j) => i.includes(j)))
				.filter((value, index, self) => self.indexOf(value) === index),
		});
	}

	protected save(entity: DeepPartial<T>, options?: SaveOptions) {
		return this.repo.save(entity, options) as Promise<T>;
	}

	protected delete(criteria: FindOptionsWhere<T>) {
		return this.repo.delete(criteria);
	}

	update(entity: DeepPartial<T>, options?: SaveOptions) {
		return this.save(entity, options);
	}

	id(id: string, options?: FindOptionsWithCustom<T>) {
		return this.findOne({ id, ...options });
	}

	all(options?: FindOptionsWithCustom<T>) {
		return this.find(options);
	}
}
