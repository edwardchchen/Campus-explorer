import {Course} from "./Course";
import ValidateHelper from "./ValidateHelper";
import QueryTransformationHelper from "./QueryTransformationHelper";
import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import {Room} from "./Room";

export default class RoomQueryExecuteHelper {

	private whereMathField: string[] = ["lat", "lon", "seats"];
	private whereStringField: string[] =
		["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

	private allFields: string[] =
		["lat", "lon", "seats", "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

	// private filteredListofCourses: any[] = [];
	// TODO change this from course to room
	private filteredDataset: Course[];
	private id: string;
	private validateHelper!: ValidateHelper;
	private columnRequiredToBeRemoved!: string[];
	private passedInDataset: Course[];
	private transformationHelper!: QueryTransformationHelper;


	constructor() {
		this.filteredDataset = [];
		this.id = "";
		this.passedInDataset = [];
		this.transformationHelper = new QueryTransformationHelper();
	}

	public columnsNotIncluded(): void { // output a list of columns that should be removed in Course due to OPTIONS not specifying them
		let dataSetFieldPlusApplyField: string[] =
			[...this.validateHelper.validateTransformation.applyField, ...this.validateHelper.dataSetField];
		this.columnRequiredToBeRemoved = this.allFields.filter((x) => !dataSetFieldPlusApplyField.includes(x));
	}


	public executeAndOrder(id: string, dataSet: Course[], validateHelper: ValidateHelper, query: any): Promise<any> { // return a filtered list of courses
		// first filter list and then if it is more than 5000 in length reject, otherwise
		// second if there is order then order by specified column
		this.id = id;
		this.validateHelper = validateHelper;
		this.columnsNotIncluded();
		this.passedInDataset = dataSet;
		try{
			this.filteredDataset = this.filterEachCourse(Object.values(query)[0], dataSet);
			if (this.filteredDataset.length > 5000) {
				return Promise.reject(new ResultTooLargeError(this.filteredDataset.length));
			}
			if (this.validateHelper.requireTransformation) {
				this.filteredDataset =
					this.transformationHelper.transformAllQuery(this.validateHelper, this.filteredDataset, query);
			}
			if (this.validateHelper.requiresOrder) {
				// this.filteredDataset = this.orderSort();
				this.filteredDataset = this.addIdIntoFields(this.filteredDataset);
				return Promise.resolve(this.filteredDataset);
			} else {
				this.filteredDataset = this.addIdIntoFields(this.filteredDataset);
				return Promise.resolve(this.filteredDataset);
			}

		}catch (e){
			return Promise.reject(new InsightError());
		}
	}

	private addIdIntoFields(courses: Course[]): Course[]{
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


	private ANDHelper (queryField: any, curDataSet: Course[], innerLTStatement: any): Course[] {
		let finalFilteredDataset: Course [] = curDataSet;
		for (let keys of innerLTStatement) {
			finalFilteredDataset = this.filterEachCourse(keys, finalFilteredDataset);
		}
		return finalFilteredDataset;
	}

	private ORHelper (queryField: any, curDataSet: Course[], innerLTStatement: any): Course[] {
		let combinedDataset: Course[] = [];
		for (let keys of innerLTStatement) {
			let tempDataset = this.filterEachCourse(keys, curDataSet);
			combinedDataset = [...tempDataset, ...combinedDataset]; // destructuring and combining without duplicate
		}
		return combinedDataset;
	}

	private NOTHelper (queryField: any, curDataSet: Course[], innerLTStatement: any): Course[] {
		let listRequiredToNotBeIncluded = this.filterEachCourse(Object.values(queryField)[0], curDataSet);
		let filteredArray: Course[];
		filteredArray = this.passedInDataset.filter((x) => !listRequiredToNotBeIncluded.includes(x));
		return filteredArray;
	}

	// listOfCourses: Course
	private filterEachCourse(queryField: any, curDataSet: Course[]): Course[] {
		let key: string = Object.keys(queryField)[0];
		let InnerLTStatement: any = Object.values(queryField)[0]; // example: "courses_avg": 92
		let num: number = Object.values(InnerLTStatement)[0] as number; // this would be 92
		let IDAndattribute = Object.keys(InnerLTStatement)[0]; // this would be "courses_avg"
		let array: string[] = IDAndattribute.split("_");
		let attribute: string = array[1]; // avg
		let filteredListCourses: Course[] = [];
		if (key === "AND") { // it was verified that the length is at least 1
			return this.ANDHelper(queryField, curDataSet, InnerLTStatement);
			// let finalFilteredDataset: Course [] = curDataSet;
			// for (let keys of InnerLTStatement) {
			// 	finalFilteredDataset = this.filterEachCourse(keys, finalFilteredDataset);
			// } return finalFilteredDataset;
		} else if (key === "OR") {
			return this.ORHelper(queryField, curDataSet, InnerLTStatement);
			// let combinedDataset: Course[] = [];
			// for (let keys of InnerLTStatement) {
			// 	let tempDataset = this.filterEachCourse(keys, curDataSet);
			// 	combinedDataset = [...tempDataset, ...combinedDataset]; // destructuring and combining without duplicate
			// } return combinedDataset;
		} else if (key === "NOT") {
			return this.NOTHelper(queryField, curDataSet, InnerLTStatement);
			// let listRequiredToNotBeIncluded = this.filterEachCourse(Object.values(queryField)[0], curDataSet);
			// let filteredArray: Course[];
			// filteredArray = this.passedInDataset.filter((x) => !listRequiredToNotBeIncluded.includes(x));
			// return filteredArray;
		} else if (key === "IS") {
			let str: string = Object.values(InnerLTStatement)[0] as string;
			let Strattribute: string = array[1]; // avg
			for (let singleCourse of curDataSet) {
				if (singleCourse[Strattribute] === str) {
					let copiedSingleCourse: Course = singleCourse;
					this.deleteField(copiedSingleCourse); // make sure it is the copied course
					filteredListCourses.push(copiedSingleCourse);
				}
			}
			return filteredListCourses;
		} else if (key === "EQ") {
			for (let singleCourse of curDataSet) {
				if (singleCourse[attribute] === num) {
					// let copiedSingleCourse: Course = singleCourse;
					let copiedSingleCourse: Course = Object.assign({}, singleCourse);
					this.deleteField(copiedSingleCourse); // make sure it is the copied course
					filteredListCourses.push(copiedSingleCourse);
				}
			}
			return filteredListCourses;
		} else if (key === "GT") {
			return this.GTHelper(curDataSet,attribute,num,filteredListCourses);
			// for (let singleCourse of curDataSet) {
			// 	if (singleCourse[attribute] > num) {
			// 		let copiedSingleCourse: Course = singleCourse;
			// 		this.deleteField(copiedSingleCourse);
			// 		filteredListCourses.push(copiedSingleCourse);
			// 	}
			// }
			// return filteredListCourses;
		} else { // (key === "LT")
			for (let singleCourse of curDataSet) {
				if (singleCourse[attribute] < num) {
					let copiedSingleCourse: Course = Object.assign({}, singleCourse);
					this.deleteField(copiedSingleCourse); // make sure it is the copied course
					filteredListCourses.push(copiedSingleCourse);
				}
			}
			return filteredListCourses;
		}
	}

	private GTHelper(curDataSet: any,attribute: any,num: any,filteredListCourses: any): any{
		for (let singleCourse of curDataSet) {
			if (singleCourse[attribute] > num) {
				let copiedSingleCourse: Course = singleCourse;
				this.deleteField(copiedSingleCourse);
				filteredListCourses.push(copiedSingleCourse);
			}
		}
		return filteredListCourses;

	}

	private deleteField(course: Course): void { // delete the fields in a course that are not specified in OPTIONS
		for (let column of this.columnRequiredToBeRemoved) {
			delete course[column];
		}
	}

	private orderSort(): any {
		return null;
		// if("" === this.validateHelper.orderDirection || this.validateHelper.orderDirection === "UP" ){
		// 	for(const attribute  of this.validateHelper.orderBy){
		// 		if (this.whereMathField.includes(attribute)) {
		// 			// sort in ascending order
		// 			this.filteredDataset.sort((a, b) =>{
		// 				return a[attribute] - b[attribute];
		// 			});
		// 			return this.filteredDataset;
		// 		} else if (this.whereStringField.includes(attribute)) {
		// 			// sort by a-z
		// 			this.filteredDataset.sort((a, b) =>{
		// 				return a[attribute].localeCompare(b[attribute]);
		// 			});
		// 			return this.filteredDataset;
		// 		}
		// 	}
		// }else if(this.validateHelper.orderDirection === "DOWN"){
		// 	for(const attribute  of this.validateHelper.orderBy){
		// 		if (this.whereMathField.includes(attribute)) {
		// 			// sort in ascending order
		// 			this.filteredDataset.sort((a, b) =>{
		// 				return b[attribute] - a[attribute];
		// 			});
		// 			return this.filteredDataset;
		// 		} else if (this.whereStringField.includes(attribute)) {
		// 			// sort by a-z
		// 			this.filteredDataset.sort((a, b) =>{
		// 				return b[attribute].localeCompare(a[attribute]);
		// 			});
		// 			return this.filteredDataset;
		// 		}
		// 	}
		// }
		// return this.filteredDataset;
	}

}
