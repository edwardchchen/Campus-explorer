import ValidateHelper from "./ValidateHelper";
import Icourse from "./Icourse";
import {Course} from "./Course";
import {InsightDataset, InsightError, ResultTooLargeError} from "./IInsightFacade";
import Decimal from "decimal.js";


export default class QueryTransformationHelper {

	private passedInDataset: Course[];
	private groupByMap!: Map<string[], Course[]>;
	private course!: Course;
	private vh: ValidateHelper = new ValidateHelper();
	private localQuery: any;
	constructor() {
		this.passedInDataset = [];
	}


	public transformAllQuery (validateHelper: ValidateHelper, filteredDataset: Course[], query: any): any[] {
		this.vh = validateHelper;
		this.passedInDataset = filteredDataset;
		this.localQuery = query;
		let transformations: any = query["TRANSFORMATIONS"];
		let dataSetTransform =
			this.multipleGroupByArray(filteredDataset,validateHelper.validateTransformation.groupByColumns);
		dataSetTransform = this.transformApply(dataSetTransform, validateHelper.dataSetField, transformations["APPLY"]);
		return dataSetTransform;
	}


	// public groupBy(courses: Course[], keyGetter): Map<string,string> {
	// 	const map = new Map();
	// 	list.forEach((item) => {
	// 		const key = keyGetter(item);
	// 		const collection = map.get(key);
	// 		if (!collection) {
	// 			map.set(key, [item]);
	// 		} else {
	// 			collection.push(item);
	// 		}
	// 	});
	// 	return map;
	// }

	// idea from Stack Overflow:
	// https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
	public multipleGroupByArray(dataArray: Course[], groupPropertyArray: string[]): any[][]{ // type correct?
		let groups: {[value: string]: any[]}  = {};
		dataArray.forEach((item) => {
			let category: string = "";
			for (let property of groupPropertyArray) {
				category = category + ", " + item[property]; // [dept, id] "Math, 2" "121"
			}
			// get value from the Group Column, then check fields and get the value of those in string
			const group = category;
				// JSON.stringify(groupPropertyArray(item));
			groups[group] = groups[group] || [];
			groups[group].push(item);
		});
		return Object.keys(groups).map(function(group) {
			return groups[group];
			// optional return groups:
		});
	}

	private transformApply (groupByData: any[][], columnDataSetKeys: string[], applyKeys: any[]): any[] {
		return groupByData.map((singleArray) => { // for each array in the filtered list
			let finalList: { [key: string]: any } = {};
			for (let key of columnDataSetKeys) { // for example if key is dept, then it should be in the single array
				finalList[this.vh.findID() + "_" + key] = singleArray[0][key];
			}
			for (let singleApplyKey of applyKeys) {
				let applyKeyName = Object.keys(singleApplyKey)[0];
				let innerApplykeyObject: any = Object.values(singleApplyKey)[0];
				let applyKeyType = Object.keys(innerApplykeyObject)[0];
				let temp: any = Object.values(innerApplykeyObject)[0];
				let array: string[] = temp.split("_");
				let applyKeyField: any = array[1];
				const result = this.applyKeyCalculation(applyKeyType, applyKeyField, singleArray);
				finalList[applyKeyName] = result;
			}
			return finalList;
		});
	}

	private calculateMax (singleArray: any[], key: string): number {
		let Max: number = -1; // we are assuming that the array will have at least length 1
		for (let singleCourse of singleArray) {
			if (singleCourse[key] > Max) {
				Max = singleCourse[key];
			}
		}
		return Max;
	}

	private calculateMin (singleArray: any[], key: string): number {
		let Min: number = 101; // we are assuming that the array will have at least length 1
		for (let singleCourse of singleArray) {
			if (singleCourse[key] < Min) {
				Min = singleCourse[key];
			}
		}
		return Min;
	}

	private calculateAvg (singleArray: any[], key: string): number {
		let total: Decimal = new Decimal(0);
		for (let singleCourse of singleArray) {
			let tempDecimal = new Decimal(singleCourse[key]);
			total = total.add(tempDecimal);
		}
		const avg = total.toNumber() / singleArray.length;
		return Number(avg.toFixed(2));
	}

	private calculateSum (singleArray: any[], key: string): number {
		let total: number = 0;
		for (let singleCourse of singleArray) {
			total = total + singleCourse[key];
		}
		return Number(total.toFixed(2));
	}

	private calculateCount (singleArray: any[], key: string): number {
		let countObject: {[value: string]: any};
		countObject = {};
		for (let singleCourse of singleArray) {
			if (!countObject[singleCourse[key]]) {
				countObject[singleCourse[key]] = true;
			}
		}
		let result: number = Object.entries(countObject).length;
		return result;
	}

	private applyKeyCalculation(applyKeyType: string, applyKeyField: string, singleArray: any[]): number {
		if (applyKeyType === "COUNT") {
			return this.calculateCount(singleArray, applyKeyField);
		} else if (applyKeyType === "AVG") {
			return this.calculateAvg(singleArray, applyKeyField);
		} else if (applyKeyType === "SUM") {
			return this.calculateSum(singleArray, applyKeyField);
		} else if (applyKeyType === "MAX") {
			return this.calculateMax(singleArray, applyKeyField);
		} else if (applyKeyType === "MIN") {
			return this.calculateMin(singleArray, applyKeyField);
		} else {
			throw Error("should be one of the above applyKeyTypes");
		}
	}
}
