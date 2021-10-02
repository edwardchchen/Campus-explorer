import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.trace("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (InsightDatasetKind.Courses) {
			let zip = new JSZip();
			// more files !
			zip.loadAsync("UEsDBAoDAAAAAJxs8T...AAAAAA==", {base64: true})
				.then((r) => console.log(r));

		} else {
			return Promise.reject("Invalid InsightDataSetKind");
		}
		return Promise.resolve(["LDUH."]);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: any): Promise<any[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
