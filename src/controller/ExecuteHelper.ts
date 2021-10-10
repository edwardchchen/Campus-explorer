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
		this.columnRequiredToBeRemoved = this.allFields.filter((x) => !this.validateHelper.columnField.includes(x) );
	}


	public executeAndOrder (id: string, dataSet: Icourse[], validateHelper: ValidateHelper, query: any): Promise<any>{ // return a filtered list of courses
		// first filter list
		// second if there is order then order by specified column
		this.id = id;
		this.validateHelper = validateHelper;
		this.columnsNotIncluded();
		return new Promise<any[]>((resolve, reject) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// the .then doesn't work somehow, need to change later
			(this.verifiedDataset = this.filterEachCourse(query, dataSet)).then(() => {
				if (this.verifiedDataset.length > 5000) {
					reject(new ResultTooLargeError(this.verifiedDataset.length));
				}
				if (this.validateHelper.requiresOrder) {
					resolve (this.orderSort());
				} else {
					resolve(this.verifiedDataset);
				}

			}).catch(reject ("shouldn't reach here"));

		});
	}

  // listOfCourses: Course
	// eslint-disable-next-line max-lines-per-function
	private filterEachCourse(queryField: any, curDataSet: Course[]): Course[] {
		let where: any = queryField.WHERE;
		let key: string = Object.keys(where)[0];
		let InnerLTStatement: any = Object.values(where)[0]; // example: "courses_avg": 92
		let num: number = Object.values(InnerLTStatement)[0] as number; // this would be 92
		let IDAndattribute = Object.keys(InnerLTStatement)[0]; // this would be "courses_avg"
		let array: string[] = IDAndattribute.split("_");
		let attribute: string = array[1]; // avg
		let filteredListCourses: Course[] = [];
		if (key === "AND") { // probably need a promise here
			let filteredDataset1 = this.filterEachCourse(Object.values(where)[0], curDataSet); // this goes first
			let finalFilteredDataset = this.filterEachCourse(Object.values(where)[1], filteredDataset1); // this goes next
			return finalFilteredDataset;
		} else if (key === "OR") {
			let filteredDataset1 = this.filterEachCourse(Object.values(where)[0], curDataSet);
			let filteredDataset2 = this.filterEachCourse(Object.values(where)[1], curDataSet);
			let combinedDataset = filteredDataset1.concat(filteredDataset2); // need to make unique also
			return combinedDataset;
		} else if (key === "NOT") {
			let listRequiredToNotBeIncluded = this.filterEachCourse(Object.values(where)[0], curDataSet);
			let filteredArray: Course[];
			filteredArray = this.verifiedDataset.filter((x) => !listRequiredToNotBeIncluded.includes(x) );
			return filteredArray;
		} else if (key === "IS") {
			let str: string = Object.values(InnerLTStatement)[0] as string;
			let Strattribute: string = array[1]; // avg
			for (let singleCourse of this.verifiedDataset) {
				if (singleCourse[Strattribute] === str) {
					let copiedSingleCourse: Course = singleCourse;
					this.deleteField(copiedSingleCourse); // make sure it is the copied course
					filteredListCourses.push(copiedSingleCourse);
				}
			} return filteredListCourses;
		} else if (key === "EQ") {
			for (let singleCourse of this.verifiedDataset) {
				if (singleCourse[attribute] === num) {
					let copiedSingleCourse: Course = singleCourse;
					this.deleteField(copiedSingleCourse); // make sure it is the copied course
					filteredListCourses.push(copiedSingleCourse);
				}
			} return filteredListCourses;
		} else if (key === "GT") {
			for (let singleCourse of this.verifiedDataset) {
				if (singleCourse[attribute] > num) {
					let copiedSingleCourse: Course = singleCourse;
					this.deleteField(copiedSingleCourse);
					filteredListCourses.push(copiedSingleCourse);
				}
			} return filteredListCourses;
		} else if (key === "LT") {
			for (let singleCourse of this.verifiedDataset) {
				if (singleCourse[attribute] < num) {
					let copiedSingleCourse: Course = singleCourse;
					this.deleteField(copiedSingleCourse); // make sure it is the copied course
					filteredListCourses.push(copiedSingleCourse);
				}
			} return filteredListCourses;
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
			return this.filteredListofCourses; // filler output you should change it
		} else if (this.whereStringField.includes(this.validateHelper.orderBy)) {
			return this.filteredListofCourses; // filler output you should change it
		} else {
			return this.filteredListofCourses; // shouldn't reach here, should report an error actually
		}
	}

}
