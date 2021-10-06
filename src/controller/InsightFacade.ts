import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import DataStore from "./DataStore";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public dataStore: DataStore
	constructor() {
		console.trace("InsightFacadeImpl::init()");
		this.dataStore = new DataStore();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.resolve(this.dataStore.addDataset(id, content, kind)).then((r) => {
			return r;
		});
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.resolve(this.dataStore.removeDataset(id)).then((r) => {
			return r;
		});
	}

	public performQuery(query: any): Promise<any[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(this.dataStore.listDatasets()).then((r) => {
			return r;
		});
	}
}
