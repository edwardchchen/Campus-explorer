import ValidateHelper from "./ValidateHelper";

export default class ValidateOPTIONSHelper {
	public validateHelperTemp!: ValidateHelper;

	public isQueryObject(object: any): boolean { // check if the query is a valid object
		if (typeof object !== "object") { // should be an object
			return false;
		} else if (object instanceof Array) { // should be a json object
			return false;
		} else if (object === undefined) { // shouldn't be undefined
			return false;
		} else {
			return object !== null;
		}
	}

	public validateOptionsField(option: any, validateHelper: ValidateHelper): boolean {
		this.validateHelperTemp = validateHelper;
		if (!this.isQueryObject(option)) {
			return false;
		} else if (Object.keys(option).length < 1) {
			return false;
		} else if (Object.keys(option).length === 1) {
			if (!(Object.keys(option)[0] === "COLUMNS")) {
				return false;
			}
			return this.validateColumnField(Object.values(option)[0]);
		} else if (Object.keys(option).length === 2) {
			if (!(Object.keys(option)[0] === "COLUMNS") || !(Object.keys(option)[1] === "ORDER")) {
				return false;
			} else if (!this.validateColumnField(Object.values(option)[0])) {
				return false;
			} else {
				return this.validateOrderField(Object.values(option)[1]);
			}
		} else {
			return false;
		}
	}

	public validateColumnField(column: any): boolean {
		if (!(column instanceof Array)) {
			return false;
		} else if (column.length < 1) {
			return false;
		} else {
			for (let singleAttribute of Object.values(column)) {
				if (!this.validateAttribute(singleAttribute)) {
					if (this.validateHelperTemp.requireTransformation) {
						if (!this.validateHelperTemp.transformationColumn.includes(singleAttribute)) {
							this.validateHelperTemp.transformationColumn.push(singleAttribute);
							this.validateHelperTemp.allColumnField.push(singleAttribute); // pushing the unrecognizable attribute into columnField for future use
							return true;
						} else {
							return false; // there is duplicate in naming
						}
					}
					return false;
				}
			}
		}
		return true;
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
			if (this.checkIfIDandAddAttributeToColumn(array)) { // this can filter the ROOM and COURSE queries
				this.validateHelperTemp.allColumnField.push(array[1]);
				this.validateHelperTemp.dataSetField.push(array[1]);
				return true;
			} else {
				return false;
			}
		}
	}

	public checkIfIDandAddAttributeToColumn(array: any[]): boolean {
		if (this.validateHelperTemp.validateDataSetID(array[0])) {
			if (this.validateHelperTemp.isCourseQuery &&
				(this.validateHelperTemp.whereCourseMathField.includes(array[1]) ||
				this.validateHelperTemp.whereCourseStringField.includes(array[1]))) {
				return true;
			} else {
				return this.validateHelperTemp.isRoomQuery &&
					(this.validateHelperTemp.whereRoomMathField.includes(array[1]) ||
				this.validateHelperTemp.whereRoomStringField.includes(array[1]));
			}
		} else {
			return false;
		}
	}

	public validateOrderField(order: any): boolean {
		// if (typeof order === "string") { // should now be an array
		if (order instanceof Array) { // do we must have it be length of 2? or can it be one?
			if ((Object.keys(order).length === 2) && (Object.keys(order)[0] === "dir"
				&& Object.keys(order)[1] === "keys")) {
				if (!this.validateOrderDir(Object.values(order)[0])) {
					return false;
				}
				if (!this.validateOrderKeys(Object.values(order)[1])) {
					return false;
				}
			}
			this.validateHelperTemp.requiresOrder = true;
			return true;
		} else if (typeof order === "string") {
			if (this.validateHelperTemp.transformationColumn.includes(order)) {
				this.validateHelperTemp.requiresOrder = true;
				this.validateHelperTemp.orderBy.push(order);
				return true;
			}
			let array: string[];
			array = order.split("_");
			if (array.length !== 2) {
				return false;
			}
			if (!this.validateHelperTemp.validateDataSetID(array[0])) {
				return false;
			}
			let ret: boolean = this.validateHelperTemp.dataSetField.includes(array[1]);
			this.validateHelperTemp.requiresOrder = true; // means that sorting is required in execution
			this.validateHelperTemp.orderBy.push(array[1]);
			return ret;
		} else {
			return false;
		}
	}

	public validateOrderDir (dir: any): boolean {
		if (typeof dir === "string") {
			if (dir === "UP") {
				this.validateHelperTemp.orderDirection = "UP";
				return true;
			} else if (dir === "DOWN") {
				this.validateHelperTemp.orderDirection = "DOWN";
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	public validateOrderKeys (keys: any): boolean {
		if (keys instanceof Array) {
			for (let singleKey of keys) {
				if (this.validateHelperTemp.transformationColumn.includes(singleKey)){
					this.validateHelperTemp.requiresOrder = true;
					this.validateHelperTemp.orderBy.push(singleKey);
				} else {
					let array: string[];
					array = singleKey.split("_");
					if (array.length !== 2) {
						return false;
					}
					if (!this.validateHelperTemp.validateDataSetID(array[0])) {
						return false;
					}
					let ret: boolean = this.validateHelperTemp.dataSetField.includes(array[1]);
					this.validateHelperTemp.requiresOrder = true; // means that sorting is required in execution
					this.validateHelperTemp.orderBy.push(array[1]);
					if (!ret) {
						return false;
					}
				}
			}
		} else {
			return false;
		}
		return true; // reach here if all keys are within columnField
	}
}
