import {InsightDataset, InsightError, ResultTooLargeError} from "./IInsightFacade";
import ValidateHelper from "./ValidateHelper";
import ExecuteHelper from "./ExecuteHelper";
import {Course} from "./Course";

export default class QueryEngine {
	private validateHelper: ValidateHelper;
	private executeHelper: ExecuteHelper;
	private tempDataSets: Course;
	constructor() {
		this.validateHelper = new ValidateHelper();
		this.executeHelper = new ExecuteHelper();
	}
	public runQuery(query: any, dataSet: any): Promise<any[]>{ // return the list of InsightFacade
		return new Promise<any[]>((resolve, reject) => { // resolve goes to the then block,
			this.queryValidate(query).then(() => {
				this.tempDataSets = dataSet;
				let id: string;
				id = this.validateHelper.findID();
				if (id === "") {
					reject("id shouldn't be empty");
				} else {
					if (this.validateIDwithDataSet(id)) { // validating if the dataset exists with specified ID
						resolve (this.queryExecute(id, this.tempDataSets.get(id), query)); // not sure if the resolve works?
					} else {
						reject("id doesn't exist in dataSets");
					}
				}

				// get ID from the query and retrieve that ID from the dataset
				// var id = query.getID;
				// return this.queryExecute(query, dataSet); // execute query based on the ID of the query
			}).catch();

		}); // call queryValidate and then queryExecute, might want to make them different ts classes
	}


	private queryValidate(query: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this.validateHelper.validateAllQuery(query) === true) {
				//
				resolve();
			} else {
				reject(new InsightError("Query is Invalid"));
			}
		});

		// validate if it is a valid JSON object and not other types of objects
		// validate if it has the required fields
		// validate if the length of keys is correct
		// validate spelling for each key
		// validate WHERE
		// validate OPTION
		// validate if it can be successfully transformed into InsightFacade list
	}

	private validateIDwithDataSet(id: string): boolean {
		return this.tempDataSets.has(id);
	}

	private queryExecute(id: string, dataSet: any, query: any): Promise<any>{ // should return an array with correct result
		return this.executeHelper.executeAndOrder(id, dataSet, this.validateHelper, query);
		// figure out the WHERE clause
		// figure out with WHERE conditions, what columns need to be displayed
		// For each class section of that id, according to the WHERE condition, select the columns and add into the array
		// If there is ORDER, then in that array, use for each and order with some type of sorting


	}


}
