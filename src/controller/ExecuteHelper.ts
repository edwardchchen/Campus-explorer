import ValidateHelper from "./ValidateHelper";
import Icourse from "./Icourse";
import {Course} from "./Course";
import {InsightDataset, InsightError, ResultTooLargeError} from "./IInsightFacade";

export default class ExecuteHelper {
	private whereMathField: string[] = ["avg", "pass", "fail", "audit", "year"];
	private whereStringField: string[] = ["dept", "id", "instructor", "title", "uuid"];
	private allFields: string[] = ["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];
	private filteredListofCourses: any[] = [];
	private verifiedDataset: Course[];
	private id: string;
	private validateHelper: ValidateHelper;
	private columnRequiredToBeRemoved: string[];


	constructor() {
		this.verifiedDataset = [];
		this.id = "";
	}

	public columnsNotIncluded(): void { // output a list of columns that should be removed in Course due to OPTIONS not specifying them
		this.columnRequiredToBeRemoved = this.allFields.filter((x) => !this.validateHelper.columnField.includes(x));
	}


	public executeAndOrder(id: string, dataSet: Icourse[], validateHelper: ValidateHelper, query: any): Promise<any> { // return a filtered list of courses
		// first filter list and then if it is more than 5000 in length reject, otherwise
		// second if there is order then order by specified column
		this.id = id;
		this.validateHelper = validateHelper;
		this.columnsNotIncluded();
		try{
			this.verifiedDataset = this.filterEachCourse(query, dataSet);
			if (this.verifiedDataset.length > 5000) {
				return Promise.reject(new ResultTooLargeError(this.verifiedDataset.length));
			}
			if (this.validateHelper.requiresOrder) {
				return Promise.resolve(this.orderSort());
			} else {
				return Promise.resolve(this.verifiedDataset);
			}

		}catch (e){
			return Promise.reject(new InsightError());
		}
	}

	private andFilter(queryField: any, curDataSet: Course[]): Course[] {
		let finalFilteredDataset: Course [] = curDataSet;
		for (let keys of queryField) {
			finalFilteredDataset = this.filterEachCourse(keys, finalFilteredDataset);
		}
		return finalFilteredDataset;
	}
	private orFilter(queryField: any, curDataSet: Course[]): Course[] {
		let combinedDataset: Course[] = [];
		let innerkey = Object.values(queryField);
		for (let keys of innerkey) {
			let tempDataset = this.filterEachCourse(keys, curDataSet);
			combinedDataset = [...tempDataset, ...combinedDataset]; // destructuring and combining without duplicate
			// https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
		}
		return combinedDataset;
	}
	private notFilter(where: any, curDataSet: Course[]): Course[] {
		let listRequiredToNotBeIncluded = this.filterEachCourse(Object.values(where)[0], curDataSet);
		let filteredArray: Course[];
		filteredArray = this.verifiedDataset.filter((x) => !listRequiredToNotBeIncluded.includes(x));
		return filteredArray;
	}

	private eqFilter(attribute: string, filteredListCourses: Course[], num: number): Course[] {
		for (let singleCourse of this.verifiedDataset) {
			if (singleCourse[attribute] === num) {
				let copiedSingleCourse: Course = singleCourse;
				this.deleteField(copiedSingleCourse); // make sure it is the copied course
				filteredListCourses.push(copiedSingleCourse);
			}
		}
		return filteredListCourses;
	}


	// listOfCourses: Course
	private filterEachCourse(queryField: any, curDataSet: Course[]): Course[] {
		let where: any = queryField.WHERE;
		let key: string = Object.keys(where)[0];
		let InnerLTStatement: any = Object.values(where)[0]; // example: "courses_avg": 92
		let num: number = Object.values(InnerLTStatement)[0] as number; // this would be 92
		let IDAndAttribute = Object.keys(InnerLTStatement)[0]; // this would be "courses_avg"
		let array: string[] = IDAndAttribute.split("_");
		let attribute: string = array[1]; // avg
		let filteredListCourses: Course[] = [];
		if (key === "AND") {// it was verified that the length is at least 1
			return this.andFilter(queryField,curDataSet);
		} else if (key === "OR") {
			return this.orFilter(InnerLTStatement,curDataSet);
		} else if (key === "NOT") {
			return this.notFilter(where,curDataSet);
		} else if (key === "IS") {
			let str: string = Object.values(InnerLTStatement)[0] as string;
			let Strattribute: string = array[1]; // avg
			for (let singleCourse of this.verifiedDataset) {
				if (singleCourse[Strattribute] === str) {
					let copiedSingleCourse: Course = singleCourse;
					this.deleteField(copiedSingleCourse); // make sure it is the copied course
					filteredListCourses.push(copiedSingleCourse);
				}
			}
			return filteredListCourses;
		} else if (key === "EQ") {
			return this.eqFilter(attribute,filteredListCourses,num);
		} else if (key === "GT") {
			for (let singleCourse of this.verifiedDataset) {
				if (singleCourse[attribute] > num) {
					let copiedSingleCourse: Course = singleCourse;
					this.deleteField(copiedSingleCourse);
					filteredListCourses.push(copiedSingleCourse);
				}
			}
			return filteredListCourses;
		} else if (key === "LT") {
			for (let singleCourse of this.verifiedDataset) {
				if (singleCourse[attribute] < num) {
					let copiedSingleCourse: Course = singleCourse;
					this.deleteField(copiedSingleCourse); // make sure it is the copied course
					filteredListCourses.push(copiedSingleCourse);
				}
			}
			return filteredListCourses;
		} else {
			return this.filteredListofCourses; // should actually just return error, should change it later
		}
	}


	private deleteField(course: Course): void { // delete the fields in a course that are not specified in OPTIONS
		for (let column of this.columnRequiredToBeRemoved) {
			delete course[column];
		}
	}

	private orderSort(): Course[] { // sorts the Course[] based on if it is comparing num or string
		if (this.whereMathField.includes(this.validateHelper.orderBy)) {
			// sort in ascending order
			this.filteredListofCourses.sort((a, b) =>{
				return a[this.validateHelper.orderBy] - b[this.validateHelper.orderBy];
			});
			return this.filteredListofCourses;
		} else if (this.whereStringField.includes(this.validateHelper.orderBy)) {
			// sort by a-z
			this.filteredListofCourses.sort((a, b) =>{
				return a[this.validateHelper.orderBy].localeCompare(b[this.validateHelper.orderBy]);
			});
			return this.filteredListofCourses;
		}
		return this.filteredListofCourses;
	}

	private arrayUnique(array: Course[]) { // function taken from https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
		let a = array.concat();
		for (let i = 0; i < a.length; ++i) {
			for (let j = i + 1; j < a.length; ++j) {
				if (a[i] === a[j]) {
					a.splice(j--, 1);
				}
			}

			return a;
		}
	}
}
