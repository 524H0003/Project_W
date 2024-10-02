export class PayLoad {
	constructor(id: string) {
		this.id = id;
	}

	id!: string;

	toPlainObj() {
		return Object.assign({}, this);
	}
}
