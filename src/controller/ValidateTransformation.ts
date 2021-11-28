import ValidateHelper from "./ValidateHelper";

export default class ValidateTransformation {

	public applyMathFields: string[];
	public applyAllFields: string = "COUNT";
	public validateHelper!: ValidateHelper;
	public groupByColumns: string[] = [];
	public requireCount: boolean = false;
	public allColumns: string[] = []; // Fields in Groupby and Apply, to be used to check against the allColumn in ValidateHelper
	public transformationMap: Map<string, string> = new Map<string, string>();
	public applyField: string[] = []; // this is to be used to append with the dataSetColumns
	private applyKeyFieldNames: string[] = [];
	private allCourseFields: string[] =
		["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];

	private allRoomFields: string[] =
		["lat", "lon", "seats", "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

	constructor() {
		this.applyMathFields = ["MAX", "MIN", "AVG", "SUM"];
	}

	public validateAllTransformation(query: any, validateHelperLocal: ValidateHelper): boolean {
		this.validateHelper = validateHelperLocal;
		if (!this.isQueryObject(query)) {
			return false;
		}
		if (Object.keys(query).length === 2) { // must have length 2 if it is a valid transformation
			if (Object.keys(query)[0] === "GROUP" && Object.keys(query)[1] === "APPLY") {
				if (!(this.validateGroup(Object.values(query)[0]) && this.validateApply(Object.values(query)[1]))) {
					return false;
				} // this is the only case for true
				// if (this.allColumns !== this.validateHelper.allColumnField) {
				// 	return false;
				// }
				for (let field of this.validateHelper.allColumnField) {
					if (!(this.allColumns.includes(field))) {
						return false;
					}
				}


				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}

	}

	public isQueryObject(object: any): boolean { // check if the query is a valid object
		if (typeof object !== "object") { // should be an object
			return false;
		} else if (object instanceof Array) { // should be a json object
			return false;
		} else if (object === undefined) { // shouldn't be undefined
			return false;
		} else if (object === null) { // cannot be a null type
			return false;
		} else {
			return true;
		}
	}

	public isFieldObject(object: any): boolean { // check if the query is a valid object
		if (typeof object !== "object") { // should be an object
			return false;
		} else if (object === undefined) { // shouldn't be undefined
			return false;
		} else if (object === null) { // cannot be a null type
			return false;
		} else {
			return true;
		}
	}

	public validateGroup(group: any): boolean {
		if (group instanceof Array) {
			if (group.length === 0) {
				return false;
			}
			for (let singleGroupBy of group) {
				if (this.validateHelper.transformationColumn.includes(singleGroupBy)) { // I think group cannot have the applyKey, but this can be for applykey validation
					return false;
					// this.groupByColumns.push(singleGroupBy); // might not run here because transformation column doesn't exist in groupby
					// this.allColumns.push(singleGroupBy);
				} else if (this.validateAttribute(singleGroupBy)) { // break into array of two by "_" and check array[1]
					let array: string[] = singleGroupBy.split("_");
					let attribute: string = array[1];
					this.groupByColumns.push(attribute);
					this.allColumns.push(attribute);
				} else {
					return false;
				}
			}
			// if (JSON.stringify(this.groupByColumns) !== JSON.stringify(this.validateHelper.dataSetField
			// 	|| JSON.stringify((this.validateHelper.transformationColumn)))) {
			// 	return false;
			// }
			// if (this.groupByColumns !== this.validateHelper.dataSetField) {
			// 	// If a GROUP is present, all COLUMNS terms must correspond to either GROUP keys or to applykeys defined in the APPLY block.
			// 	return false;
			// }
			return true;
		} else {
			return false;
		}
	}

	public validateAttribute(attribute: any): boolean {
		if (!(typeof attribute === "string")) {
			return false;
		}
		let array: string[];
		array = attribute.split("_");
		if (array.length !== 2) {
			return false;
		} else {
			if (array[0] !== this.validateHelper.findID()) { // ID shouldn't be "", should contain something
				return false;
			} else {
				if (this.validateHelper.isCourseQuery && this.allCourseFields.includes(array[1])) {
					return true;
				} else if (this.validateHelper.isRoomQuery && this.allRoomFields.includes(array[1])) {
					return true;
				} else {
					return false;
				}
			}
		}
	}

	public validateApply(apply: any): boolean {
		if (apply instanceof Array) {
			if (apply.length === 0) {
				if (this.validateHelper.transformationColumn.length >= 1) {
					return false;
				}
				this.validateHelper.requireApply = false;
				return true;
			}
			for (let singleApplyColumn of apply) { // each applyKey in apply
				if (this.validateInnerApplyColumn(singleApplyColumn) === false) {
					return false; // The applykeys should be in Transformation column
				}
			}
			this.validateHelper.requireApply = true;
			return true;
		} else {
			return false;
		}
	}

	public validateInnerApplyColumn (inner: any): boolean {
		if (!this.isQueryObject(inner)) {
			return false;
		} else if (!(Object.keys(inner).length === 1)) {
			return false;
		} else if (!this.validateHelper.transformationColumn.includes(Object.keys(inner)[0]) &&
			this.validateHelper.transformationColumn.length !== 0) {
			return false;
		} else {
			if (!this.validateApplyFieldsAndIDAttributeField(Object.values(inner)[0])) {
				return false;
			} else {
				if (this.allColumns.includes(Object.keys(inner)[0])) {
					return false;
				}
				this.allColumns.push(Object.keys(inner)[0]);
				return true;
			}
		}
	}

	public validateApplyFieldsAndIDAttributeField (field: any): boolean {
		if (!this.isQueryObject(field)) { // check if it is a valid object
			return false;
		} else if (Object.keys(field).length !== 1) { // if length of the key isn't 1 then it is invalid
			return false;
		} else if (this.applyMathFields.includes(Object.keys(field)[0])) {
			return this.validateMathAttribute(Object.values(field)[0]);

		} else if (this.applyAllFields === Object.keys(field)[0]) {
			return this.validateCountAttribute(Object.values(field)[0]);
		} else {
			return false; // has something else
		}
	}

	public validateMathAttribute (attribute: any): boolean {
		if (!(typeof attribute === "string")) {
			return false;
		}
		let array: string[];
		array = attribute.split("_");
		if (array.length !== 2) {
			return false;
		} else {
			if (array[0] !== this.validateHelper.findID()) { // ID shouldn't be "", should contain something
				return false;
			} else {
				if (this.validateHelper.isCourseQuery) {
					if (this.validateHelper.whereCourseMathField.includes(array[1])) {
						this.applyField.push(array[1]);
						return true;
					} else {
						return false;
					}
				} else if (this.validateHelper.isRoomQuery) {
					if (this.validateHelper.whereRoomMathField.includes(array[1])) {
						this.applyField.push(array[1]);
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			}
		}
	}

	public validateCountAttribute (attribute: any): boolean {
		if (!(typeof attribute === "string")) {
			return false;
		}
		let array: string[];
		array = attribute.split("_");
		if (array.length !== 2) {
			return false;
		} else {
			if (array[0] !== this.validateHelper.findID()) { // ID shouldn't be "", should contain something
				return false;
			} else {
				if (this.validateHelper.isCourseQuery) {
					if (this.validateHelper.whereCourseMathField.includes(array[1]) ||
						this.validateHelper.whereCourseStringField.includes(array[1])) {
						this.applyField.push(array[1]);
						this.requireCount = true;
						return true;
					} else {
						return false;
					}
				} else if (this.validateHelper.isRoomQuery) {
					if (this.validateHelper.whereRoomMathField.includes(array[1]) ||
						this.validateHelper.whereRoomStringField.includes(array[1])) {
						this.applyField.push(array[1]);
						this.requireCount = true;
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			}
		}
	}

}
