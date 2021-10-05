import {InsightDataset, InsightError, ResultTooLargeError} from "./IInsightFacade";
import ValidateHelper from "./ValidateHelper";

export default class QueryEngine {

	private validateHelper: ValidateHelper;
	private tempDataSets: any;
	constructor() {
		this.validateHelper = new ValidateHelper();
	}
	public runQuery(query: any, dataSet: any[]): Promise<any[]>{ // return the list of InsightFacade
		return new Promise<any[]>((resolve, reject) => { // resolve goes to the then block,
			this.queryValidate(query).then(() => {
				this.tempDataSets = dataSet;
				let id: string;
				id = this.validateHelper.findID();
				// if (id === "") {
				// 	reject("id shouldn't be empty");
				// } else {
				// 	if (this.validateIDwithDataSet(id)) {
				// 		resolve(this.queryExecute(id, this.dataSets));
				// 	} else {
				// 		reject("id doesn't exist in dataSets");
				// 	}
				// }

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

	// public validateIDwithDataSet(id: string): boolean {
	//
	// }

	// private queryExecute {
	//
    // }


}
