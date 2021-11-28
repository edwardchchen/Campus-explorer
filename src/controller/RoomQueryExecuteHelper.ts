import ValidateHelper from "./ValidateHelper";
import {InsightDataset, InsightError, ResultTooLargeError} from "./IInsightFacade";
import {Room} from "./Room";
import RoomQueryTransformationHelper from "./RoomQueryTransformationHelper";
export default class CourseQueryExecuteHelper {
	private whereMathField: string[] = ["lat", "lon", "seats"];
	private whereStringField: string[] =
		["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

	private allFields: string[] =
		["lat", "lon", "seats", "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

	private applyToken: string[] = ["MAX","MIN","AVG","COUNT","SUM"];

	private filteredDataset: Room[];
	private id: string;
	private validateHelper: ValidateHelper;
	private columnRequiredToBeRemoved: string[];
	private passedInDataset: Room[];
	private transformationHelper!: RoomQueryTransformationHelper;

	constructor() {
		this.filteredDataset = [];
		this.id = "";
		this.passedInDataset = [];
		this.transformationHelper = new RoomQueryTransformationHelper();
		this.columnRequiredToBeRemoved = [];
		this.validateHelper = new ValidateHelper();
	}

	public columnsNotIncluded(): void { // output a list of columns that should be removed in Room due to OPTIONS not specifying them
		let dataSetFieldPlusApplyField: string[] =
			[...this.validateHelper.validateTransformation.applyField, ...this.validateHelper.dataSetField,
				...this.validateHelper.validateTransformation.groupByColumns];
		this.columnRequiredToBeRemoved = this.allFields.filter((x) => !dataSetFieldPlusApplyField.includes(x));
	}


	public executeAndOrder(id: string, dataSet: Room[], validateHelper: ValidateHelper, query: any): Promise<any> {// return a filtered list of courses
		this.id = id;
		this.validateHelper = validateHelper;
		this.columnsNotIncluded();
		this.passedInDataset = dataSet;
		let tempDataset: Room[] = [];
		try{
			if (this.validateHelper.requireWhere === true) {
				this.filteredDataset = this.filterEachCourse(Object.values(query)[0], dataSet);
			} else {
				this.filteredDataset = dataSet;
			}
			if (this.filteredDataset.length > 5000 && !this.validateHelper.requireTransformation) {
				this.reset();
				return Promise.reject(new ResultTooLargeError(this.filteredDataset.length));
			}
			for (let singleCourse of this.filteredDataset) {
				let copiedSingleCourse: Room = JSON.parse(JSON.stringify(singleCourse));
				this.deleteField(copiedSingleCourse); // make sure it is the copied room
				tempDataset.push (copiedSingleCourse);
			}
			this.filteredDataset = tempDataset;
			if (this.validateHelper.requireTransformation) {
				this.filteredDataset =
					this.transformationHelper.transformAllQuery(this.validateHelper, this.filteredDataset, query);
				if (this.filteredDataset.length > 5000) {
					return Promise.reject(new ResultTooLargeError(this.filteredDataset.length));
				}
				if (this.validateHelper.requiresOrder) {
					this.filteredDataset = this.orderSort();
				}
				this.reset();
				return Promise.resolve(this.filteredDataset);
			}
			if (this.validateHelper.requiresOrder) {
				this.filteredDataset = this.orderSort();
				this.filteredDataset = this.addIdIntoFields(this.filteredDataset);
				this.reset();
				return Promise.resolve(this.filteredDataset);
			} else {
				this.filteredDataset = this.addIdIntoFields(this.filteredDataset);
				this.reset();
				return Promise.resolve(this.filteredDataset);
			}
		}catch (e){
			this.reset();
			return Promise.reject(new InsightError());
		}
	}

	private reset() {
		this.validateHelper.transformationColumn = [];
		this.validateHelper.allColumnField = [];
		this.validateHelper.dataSetField = [];
		this.validateHelper.orderBy = [];
		this.validateHelper.requiresOrder = false;
		this.validateHelper.requireTransformation = false;
		this.validateHelper.validateTransformation.groupByColumns = [];
	}

	private addIdIntoFields(courses: Room[]): Room[]{
		let keys: string[];
		let oldKeys: string[];
		if(courses.length > 0){
			keys = Object.keys(courses[0]);
			oldKeys = Object.keys(courses[0]);
			for(let i = 0;i < keys.length;i++){
				keys[i] = this.id + "_" + keys[i];
			}
			for(const element of courses){
				for(let j = 0;j < keys.length;j++){
					element[keys[j]] = element[oldKeys[j]];
					delete element[oldKeys[j]];
				}
			}
		}
		return this.filteredDataset;

	}


	private ANDHelper (queryField: any, curDataSet: Room[], innerLTStatement: any): Room[] {
		let finalFilteredDataset: Room [] = curDataSet;
		for (let keys of innerLTStatement) {
			finalFilteredDataset = this.filterEachCourse(keys, finalFilteredDataset);
		}
		return finalFilteredDataset;
	}

	private ORHelper (queryField: any, curDataSet: Room[], innerLTStatement: any): Room[] {
		let combinedDataset: Room[] = [];
		for (let keys of innerLTStatement) {
			let tempDataset = this.filterEachCourse(keys, curDataSet);
			combinedDataset = combinedDataset.concat(tempDataset);
			combinedDataset = [...new Set([...combinedDataset, ...tempDataset])];
			// https://codeburst.io/how-to-merge-arrays-without-duplicates-in-javascript-91c66e7b74cf
		}
		return combinedDataset;
	}

	private NOTHelper (queryField: any, curDataSet: Room[], innerLTStatement: any): Room[] {
		let listRequiredToNotBeIncluded = this.filterEachCourse(Object.values(queryField)[0], curDataSet);
		let filteredArray: Room[];
		filteredArray = this.passedInDataset.filter((x) => !listRequiredToNotBeIncluded.includes(x));
		// filteredArray = listRequiredToNotBeIncluded.filter(({ value: id1 }) =>
		// 	!this.filteredDataset.some(({ value: id2 }) => id2 === id1));
		return filteredArray;
	}

	// listOfRooms: Room
	private filterEachCourse(queryField: any, curDataSet: Room[]): Room[] {
		let key: string = Object.keys(queryField)[0];
		let InnerLTStatement: any = Object.values(queryField)[0]; // example: "courses_avg": 92
		let num: number = Object.values(InnerLTStatement)[0] as number; // this would be 92
		let IDAndattribute = Object.keys(InnerLTStatement)[0]; // this would be "courses_avg"
		let array: string[] = IDAndattribute.split("_");
		let attribute: string = array[1]; // avg
		let filteredListCourses: Room[] = [];
		if (key === "AND") { // it was verified that the length is at least 1
			return this.ANDHelper(queryField, curDataSet, InnerLTStatement);
		} else if (key === "OR") {
			return this.ORHelper(queryField, curDataSet, InnerLTStatement);
		} else if (key === "NOT") {
			return this.NOTHelper(queryField, curDataSet, InnerLTStatement);
		} else if (key === "IS") {
			let str: string = Object.values(InnerLTStatement)[0] as string;
			let Strattribute: string = array[1]; // avg
			const wildCard = new RegExp(`^${str.replace(/\*/g, "(.)*")}$`);
			for (let singleCourse of curDataSet) {
				if (wildCard.test(singleCourse[Strattribute])) {
					filteredListCourses.push(singleCourse);
				}
			}
			return filteredListCourses;
		} else if (key === "EQ") {
			for (let singleCourse of curDataSet) {
				if (singleCourse[attribute] === num) {
					filteredListCourses.push(singleCourse);
				}
			}
			return filteredListCourses;
		} else if (key === "GT") {
			return this.GTHelper(curDataSet,attribute,num,filteredListCourses);
		} else { // (key === "LT")
			for (let singleCourse of curDataSet) {
				if (singleCourse[attribute] < num) {
					filteredListCourses.push(singleCourse);
				}
			}
			return filteredListCourses;
		}
	}

	private GTHelper(curDataSet: any,attribute: any,num: any,filteredListCourses: any): any{
		for (let singleCourse of curDataSet) {
			if (singleCourse[attribute] > num) {
				filteredListCourses.push(singleCourse);
			}
		}
		return filteredListCourses;

	}

	private deleteField(room: Room): void { // delete the fields in a room that are not specified in OPTIONS
		for (let column of this.columnRequiredToBeRemoved) {
			delete room[column];
		}
	}

	private determineScoreAscending(attribute: any, a: any, b: any) {
		if (this.whereMathField.includes(attribute)) {
			return a[attribute] - b[attribute];
		} else if (this.whereStringField.includes(attribute)) {
			return a[attribute].localeCompare(b[attribute]);
		} else{
			return a[attribute] - b[attribute];
		}
	}

	private determineScoreDescending(attribute: any, a: any, b: any) {
		if (this.whereMathField.includes(attribute)) {
			return b[attribute] - a[attribute];
		} else if (this.whereStringField.includes(attribute)) {
			return b[attribute].localeCompare(a[attribute]);
		} else{
			return b[attribute] - a[attribute];
		}
	}

	private customCompareAscending(a: any, b: any): number {
		let first = this.determineScoreAscending(this.validateHelper.orderBy[0], a, b);
		if (first === 0) {
			for (let i = 1; i < this.validateHelper.orderBy.length; i++) {
				let score = this.determineScoreAscending(this.validateHelper.orderBy[i], a, b);
				if (score !== 0) {
					return score;
				}
				if (score === 0 && i === this.validateHelper.orderBy.length - 1) {
					return score;
				}
			}
		}
		return first;
	}

	private customCompareDescending(a: any, b: any): number {
		let first = this.determineScoreDescending(this.validateHelper.orderBy[0], a, b);
		if (first === 0) {
			for (let i = 1; i < this.validateHelper.orderBy.length; i++) {
				let score = this.determineScoreDescending(this.validateHelper.orderBy[i], a, b);
				if (score !== 0) {
					return score;
				}
				if (score === 0 && i === this.validateHelper.orderBy.length - 1) {
					return score;
				}
			}
		}
		return first;
	}

	private addIdIntoMathAndStringFields(){
		for(let i = 0; i < this.whereMathField.length;i++){
			this.whereMathField[i] = this.id + "_" + this.whereMathField[i];
		}
		for(let i = 0; i < this.whereStringField.length;i++){
			this.whereStringField[i] = this.id + "_" + this.whereStringField[i];
		}
	}

	private checkTransform(){
		if(this.validateHelper.requireTransformation && this.validateHelper.requiresOrder){
			for(let i = 0;i < this.validateHelper.orderBy.length;i++){
				if(this.allFields.includes(this.validateHelper.orderBy[i])){
					this.validateHelper.orderBy[i] = this.id + "_" + this.validateHelper.orderBy[i];
				}

			}
			this.addIdIntoMathAndStringFields();
		}
	}

	private orderSort(): Room[] {
		this.checkTransform();
		if ("" === this.validateHelper.orderDirection || this.validateHelper.orderDirection === "UP") {
			this.filteredDataset.sort((a, b) => {
				return this.customCompareAscending(a, b);
			});
			return this.filteredDataset;
		} else {
			this.filteredDataset.sort((a, b) => {
				return this.customCompareDescending(a, b);
			});
			return this.filteredDataset;
		}
	}
}
