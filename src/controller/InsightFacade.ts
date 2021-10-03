import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import QueryEngine from "./QueryEngine";
import * as fs from "fs-extra";
import * as JSZip from "jszip";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

	public dataSets: any[]; // Assume that this is the list of sections in the database after add Dataset
	// Question: is this how we can store dataSets after addDataset?
	public qe: QueryEngine;


	constructor() {
		console.trace("InsightFacadeImpl::init()");
		this.dataSets = [];
		this.qe = new QueryEngine();

	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.reject("Not implemented.");
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}


	// Return a list based on the query specified, need to take in a .json query first, parse it (what does this mean?)
	// Remember whatever I am parsing and whatever I am storing are different. I need to parse then store
	// Step 1: Function needs to turn .json into something readable (parsing?) Is this DataProcessor's job?
	// Should we have a .ts for DataSetProcessor? What is best to store .json things (Object or Tree? Or Tree within Object because
	// PerformQuery and other functions behave differently? Is it true that we should have an object that stores all class objects from
	// the zip dataset file, then we have the PerformQuery function that goes into the "OBJECT" and "FILTER" the classes into InsightFacade array
	// Step 2: Validate the query and see if it is syntactically and semantically correct
	// Step 3: after checking that the query is valid, write code to find the desired subset from all dataset that matches the query
	//         can reduce the .json
	// Step 4: return the subset? In InsightFacade array format?
	// Involve recursion

	public performQuery(query: any): Promise<any[]> { // shouldn't I return InsightDataset?
		// Should I do a JSON.Parse? Or just Object.Keys(query), what is query really?
		return this.qe.runQuery(query, this.dataSets); // should I take in a Dataset object as parameter as well? Otherwise how can I have the file for fillter?
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
