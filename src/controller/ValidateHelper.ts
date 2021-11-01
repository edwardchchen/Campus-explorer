import ValidateTransformation from "./ValidateTransformation";
import ValidateOPTIONSHelper from "./ValidateOPTIONSHelper";
export default class ValidateHelper {
	public whereCourseMathField: string[] = ["avg", "pass", "fail", "audit", "year"];
	public whereCourseStringField: string[] = ["dept", "id", "instructor", "title", "uuid"];
	public whereRoomMathField: string[] = ["lat", "lon", "seats"];
	public whereRoomStringField: string[] = ["fullname", "shortname", "number", "name", "address",
		"type", "furniture", "href"];

	public isRoomQuery: boolean = false;
	public isCourseQuery: boolean = false;
	private queryID: string;
	private result: boolean; // result for the validateAllQuery
	public allColumnField: string[] = []; // all columns include both Transformation and DataSet Columns
	public dataSetField: string[] = [];
	public transformationColumn: string[] = []; // there can be more than one transformation attributes but they all have to appear in Transformation
	public requiresOrder: boolean;
	public orderBy: string[] = []; // Order by records which column will be sorted after determined valid
	public requireTransformation: boolean;
	public validateTransformation: ValidateTransformation;
	public validateHelperHelper: ValidateOPTIONSHelper;
	constructor() {
		this.result = true;
		this.queryID = "";
		this.requiresOrder = false;
		this.transformationColumn = [];
		this.requireTransformation = false;
		this.validateTransformation = new ValidateTransformation();
		this.validateHelperHelper = new ValidateOPTIONSHelper();
	}

	public findID(): string {
		return this.queryID;
	}

	public validateAllQuery(query: any): boolean {
		if (!this.isQueryObject(query)) { // check if the object is undefined or null
			return false;
		} else if (Object.keys(query).length < 1) { // meaning the object is empty
			return false;
		}
		if (!this.hasValidFields(query)) { // has correct length of 1 and has WHERE and OPTION fields
			return false;
		}
		if (!this.validateWhereField(query["WHERE"])) { // goes to check WHERE field
			return false;
		}
		if (!this.validateHelperHelper.validateOptionsField(this, query["OPTIONS"])){
			return false;
		}
		// if (!this.validateOptionsField(query["OPTIONS"])) { // goes to check OPTIONS field
		// 	return false;
		// }
		if (this.requireTransformation) {
			if (!this.validateTransformationField(query["TRANSFORMATIONS"])) {
				return false;
			}
		}
		return true; // result should be true by default unless set to false by one of the above reasons
	}

	public validateTransformationField(query: any): boolean {
		return this.validateTransformation.validateAllTransformation(query, this);
	}

	public hasValidFields(query: any): boolean {
		if ((Object.keys(query).length === 2) &&
			(Object.keys(query)[0] === "WHERE" && Object.keys(query)[1] === "OPTIONS")) {
			return true;
		}
		if ((Object.keys(query).length === 2) &&
			(Object.keys(query)[0] === "WHERE" && Object.keys(query)[1] === "OPTIONS" &&
				Object.keys(query)[2] === "TRANSFORMATIONS")) {
			this.requireTransformation = true;
			return true;
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
		} else {
			return object !== null;
		}
	}

	public validateWhereField(where: any): boolean { // validate WHERE field with helper functions
		if (!this.isQueryObject(where)) { // return false if the format of the inner query is wrong
			return false;
		} else if (Object.keys(where).length < 1) { // if WHERE is empty should be ok and return true and no filter
			return true;
		} else {
			return this.validateFirstWhereFilters(where); // goes here only if there is something within the WHERE clause
		}
	}

	public validateFirstWhereFilters(where: any): boolean { // check the first key within the WHERE clause, should only have length 1
		let listFilter: string[] = ["LT", "GT", "EQ", "AND", "OR", "NOT", "IS"];
		if (!(Object.keys(where).length === 1)) {
			return false;
		} else if (!listFilter.includes(Object.keys(where)[0])) { // if the filter isn't one of the valid filters return false
			return false;
		} else {
			return this.validateInnerFilter(where); // else check inner filter
		}
	}

	public validateInnerFilter(where: any): boolean { // check each possible filter
		let filter: string = Object.keys(where)[0];
		if (filter === "LT" || filter === "GT" || filter === "EQ") {
			return this.validateLTGTEQ(Object.values(where)[0]);
		} else if (filter === "AND") {
			return this.validateAND(Object.values(where)[0]);
		} else if (filter === "OR") {
			return this.validateOR(Object.values(where)[0]);
		} else if (filter === "NOT") {
			return this.validateNOT(Object.values(where)[0]);
		} else if (filter === "IS") {
			return this.validateIS(Object.values(where)[0]);
		} else {
			return false; // shouldn't reach here because where should be one of the filter types
		}
	}

	public validateLTGTEQ(filter: any): boolean { // the procedure for checking LT, GT, and EQ is the same
		if (!this.isQueryObject(filter)) { // check if it is a valid object
			return false;
		} else if (Object.keys(filter).length !== 1) { // if length of the key isn't 1 then it is invalid
			return false;
		} else if (typeof Object.values(filter)[0] !== "number") { // if the type of its value isn't a number then invalid
			return false;
		} else {
			return this.validateNumberType(Object.keys(filter)[0]); // validate if the key for example courses_avg is valid
		}
	}

	public validateAND(filter: any): boolean { // validate AND, goes to recurrsion since the body after AND will have length 1 or more
		if (!(filter instanceof Array)) { // needs to be an array otherwise false
			return false;
		} else if (filter.length < 1) {
			return false;
		} else {
			for (let filters of filter) {
				if (!this.validateRestWhereFilters(filters)) {
					return false;
				}
			}
			return true;
		}
	}

	public validateOR(filter: any): boolean { // Validate for OR, checking inner OR functions
		if (!(filter instanceof Array)) {
			return false;
		} else if (filter.length < 1) {
			return false;
		} else {
			for (let filters of filter) {
				if (!this.validateRestWhereFilters(filters)) {
					return false;
				}
			}
			return true;
		}
	}

	public validateNOT(filter: any): boolean {
		return this.validateRestWhereFilters(filter);
	}

	public validateIS(filter: any): boolean {
		if (!this.isQueryObject(filter)) {
			return false;
		} else if (Object.keys(filter).length !== 1) { // if more than length 1 means invalid
			return false;
		} else if (!this.validateStringType(Object.keys(filter)[0])) {
			return false;
		} else if (typeof Object.values(filter)[0] !== "string") { // if value type isn't a string return false
			return false;
		} else {
			return this.validateRegType(Object.values(filter)[0]);
		}
	}

	public validateRestWhereFilters(rest: any): boolean {
		let listFilter: string[] = ["LT", "GT", "EQ", "AND", "OR", "NOT", "IS"];
		if (!this.isQueryObject(rest)) {
			return false;
		} else if (!(Object.keys(rest).length === 1)) {
			return false;
		} else if (!listFilter.includes(Object.keys(rest)[0])) {
			return false;
		} else {
			return this.validateInnerFilter(rest); // check inner filter
		}
	}

	public validateNumberType(filter: any): boolean { // need revision for formatting
		if (!this.validateIDFormat(filter)) {
			return false;
		}
		let array: string[];
		array = filter.split("_");
		if (this.whereCourseMathField.includes(array[1])) {
			if (!this.isCourseQuery) {
				if (!this.isRoomQuery) {
					this.isCourseQuery = true;
				} else {
					return false;
				}
			}
		} else if (this.whereRoomMathField.includes(array[1])){
			if (!this.isRoomQuery) {
				if (!this.isCourseQuery) {
					this.isRoomQuery = true;
				} else {
					return false;
				}
			}
		} else { // when both room and course don't have this attribute
			return false;
		}
		return this.validateDataSetID(array[0]);
	}

	public validateIDFormat(filter: any): boolean { // need revision for formatting
		let array: string[];
		array = filter.split("_");
		if (!(typeof array[0] === "string") && !(typeof array[1] === "string")) {
			return false;
		}
		return array.length === 2;
	}

	public validateDataSetID(id: string): boolean {
		if (this.queryID === "") { // no ID has been verified against yet
			this.queryID = id;
			return true;
		} else { // an ID exist but has to match the same queryID
			return this.queryID === id;
		}
	}

	public validateStringType(filter: any): boolean {
		if (!this.validateIDFormat(filter)) {
			return false;
		}
		let array: string[];
		array = filter.split("_");
		if (array.length === 1) {
			return false;
		}
		if (this.whereCourseStringField.includes(array[1])) {
			if (!this.isCourseQuery) {
				if (!this.isRoomQuery) {
					this.isCourseQuery = true;
				} else {
					return false;
				}
			}
		} else if (this.whereRoomStringField.includes(array[1])){
			if (!this.isRoomQuery) {
				if (!this.isCourseQuery) {
					this.isRoomQuery = true;
				} else {
					return false;
				}
			}
		} else { // when both room and course don't have this attribute
			return false;
		}
		return this.validateDataSetID(array[0]);
	}

	public validateRegType(regex: any): boolean {
		let expression = /^(\*){0,1}[^*]*(\*){0,1}$/;// can have * in the beginning or end, but not in the middle
		return expression.test(regex);
	}
}
