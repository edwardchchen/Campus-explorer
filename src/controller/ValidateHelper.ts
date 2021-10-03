

export default class ValidateHelper {

	private result: boolean; // result for the validateAllQuery
	constructor() {
		this.result = true;
	}

	public validateAllQuery (query: any): boolean {
		if (this.isQueryObject (query) === false) {
			this.result = false;
		} else if (Object.keys(query).length < 1) { // meaning the object is empty
			return false;
		}
		if (this.hasValidFields (query) === false) { // has correct length of 1 and has WHERE and OPTION fields
			this.result = false;
		}
		if (this.validateWhereField(query[0]) === false) {
			this.result = false;
		}
		if (this.validateOptionsField(query[1]) === false) { // is this valid format?
			this.result = false;
		}
		return this.result;
	}

	public hasValidFields (query: any): boolean {
		if (this.hasCorrectLength(query) === false) {
			return false;
		}
		if (this.hasCorrectRootFields(query) === false) {
			return false;
		}
		return true;
	}

	public hasCorrectRootFields (query: any): boolean {
		if (Object.keys(query)[0] !== "WHERE" || Object.keys(query)[1] !== "OPTIONS") {
			return false;
		} else {
			return true;
		}
	}

	public hasCorrectLength (query: any): boolean {
		if (Object.keys(query).length !== 2) {
			return false;
		} else {
			return true;
		}
	}


	public isQueryObject(object: any): boolean {
		if (typeof object !== "object") { // should be an object
			return false;
		} else if (object.isArray()) { // should be a json object
			return false;
		} else if (object === undefined) { // shouldn't be undefined
			return false;
		}else if (object === null) { // cannot be a null type
			return false;
		} else {
			return true;
		}
	}

	public validateWhereField(where: any): boolean {
		if (this.isQueryObject(where) === false) { // return false if the format of the inner query is wrong
			return false;
		} else if (Object.keys(where).length < 1) { // if WHERE is empty should be ok and return true and no filter
			return true;
		} else {
			return this.validateFirstWhereFilters(where); // goes here only if there is something within the WHERE clause
		}

	}

	public validateFirstWhereFilters(where: any): boolean { // cannot be an invalid object type
		let listFilter: string[] = ["LT", "GT", "EQ", "AND", "OR", "NOT", "IS"];
		if (!(Object.keys(where).length === 1)) {
			return false;
		} else if (!listFilter.includes(Object.keys(where)[0])) { // if the filter isn't one of the valid filters
			return false;
		} else {
			return this.validateInnerFilter(where); // check inner filter
		}
	}

	public validateInnerFilter(where: any): boolean {
		let filter: string = Object.keys(where)[0];
		if (filter === "LT") {
			return this.validateLT(where[0]);
		} else if (filter === "GT") {
			return this.validateGT(where[0]);
		} else if (filter === "EQ") {
			return this.validateEQ(where[0]);
		} else if (filter === "AND") {
			return this.validateAND(where[0]);
		} else if (filter === "OR") {
			return this.validateOR(where[0]);
		} else if (filter === "NOT") {
			return this.validateNOT(where[0]);
		} else if (filter === "IS") {
			return this.validateIS(where[0]);
		} else {
			return false; // shouldn't reach here because where should be one of the filter types
		}
	}
	public validateLT(filter: any): boolean {
		if (!this.isQueryObject(filter)) {
			return false;
		} else if (Object.keys(filter).length < 1) { // if empty means invalid
			return false;
		} else if (Object.keys(filter).length !== 1 ) { // if more than length 1 means invalid
			return false;
		} else if (Object.values(filter)[0] === false ) { // how to make this work?
			return false;
		} else {
			return this.validateNumberType(Object.keys(filter)[0]);
		}
	}

	public validateGT(filter: any): boolean {
		return true;
	}

	public validateEQ(filter: any): boolean {
		return true;
	}

	public validateAND(filter: any): boolean {
		if (!(filter.isArray())) {
			return false;
		} else if (filter.length < 1) {
			return false;
		} else {
			for (let filters of filter) {
				if (this.validateRestWhereFilters(filters) === false) {
					return false;
				}
			}
			return true;
		}
		return true;
	}
	// Validate for OR, checking inner OR functions
	public validateOR(filter: any): boolean {
		if (!(filter.isArray())) {
			return false;
		} else if (filter.length < 1) {
			return false;
		} else {
			for (let filters of filter) {
				if (this.validateRestWhereFilters(filters) === false) {
					return false;
				}
			}
			return true;
		}
		return true;
	}

	public validateNOT(filter: any): boolean {
		return this.validateRestWhereFilters(filter);
	}

	public validateIS(filter: any): boolean {
		return true;
	}


	public validateRestWhereFilters(rest: any): boolean {
		let listFilter: string[] = ["LT", "GT", "EQ", "AND", "OR", "NOT", "IS"];
		if (!this.isQueryObject(rest)) {
			return false;
		} else if (Object.keys(rest).length < 1) {
			return false;
		} else if (!(Object.keys(rest).length === 1)) {
			return false;
		} else if (!listFilter.includes(Object.keys(rest)[0])) {
			return false;
		} else {
			return this.validateInnerFilter(rest); // check inner filter
		}
	}

	public validateNumberType(filter: any): boolean {
		return true;
	}


	public validateOptionsField(option: any): boolean {
		return true;
	}
}
