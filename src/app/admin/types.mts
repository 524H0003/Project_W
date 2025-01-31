import { FilterElement } from 'adminjs';
import { FastifyReply, FastifyRequest } from 'fastify';

export type AuthenticationContext = {
	/**
	 * @description Authentication request object
	 */
	request: FastifyRequest;
	/**
	 * @description Authentication response object
	 */
	reply: FastifyReply;
};

export type FilterParser = {
	isParserForType: (filter: FilterElement) => boolean;
	parse: (
		filter: FilterElement,
		fieldKey: string,
	) => {
		filterKey: string;
		filterValue: any;
	};
};

export class WrongArgumentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'WrongArgumentError';
	}
}
