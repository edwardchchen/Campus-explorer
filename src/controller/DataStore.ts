import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import JSZip from "jszip";

export default class DataStore{
	// public dataSets: InsightDataset[]


	constructor() {
		// this.dataSets = [];
	}
	private parseZip(results: JSZip) {
		let zip = new JSZip();
		let jsonArray: JSON[] = [];
		Object.keys(results.files).forEach(function (filename) {
			zip.files[filename].async("string")
				.then(function (fileData) {
					return jsonArray.push(JSON.parse(fileData));
				});
		});
		return jsonArray;


	}
	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (InsightDatasetKind.Courses) {
			let zip = new JSZip();
			const promises: any[] = [];

			// more files !
			zip.loadAsync(content, {base64: true})
				.then((r: JSZip) =>{
					return r;
				}).then((results: JSZip)=>{
					let jsonArray: JSON[] = [];
					Object.keys(results.files).forEach(function (filename) {
						promises.push(zip.files[filename].async("string"));
					});
					Promise.all(promises).then(function (data) {
						console.log(JSON.parse(data.toString()));
						// let lduh = JSON.parse(data.toString());
					// do something with data
					});


				});

		} else {
			return Promise.reject("Invalid InsightDataSetKind");
		}
		return Promise.resolve(["LDUH."]);

	}
}
