import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import JSZip from "jszip";

export default class DataStore{
	// public dataSets: InsightDataset[]
	private courses: Course[];
	private dataMap: Map<number, Course[]> = new Map<number, Course[]>();


	constructor() {
		// this.dataSets = [];
	}
	private isValidJson(json: string): boolean {
		try {
			JSON.parse(json);
		} catch (e) {
			return false;
		}
		return true;
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (InsightDatasetKind.Courses) {
			let zip = new JSZip();
			const promises: any[] = [];
			zip.loadAsync(content, {base64: true})
				.then((r: JSZip) =>{
					return r;
				}).then((results: JSZip)=>{
					Object.keys(results.files).forEach(function (filename) {
						promises.push(zip.files[filename].async("string"));
					});
					Promise.all(promises).then((data) => {
						let jsonArray: JSON[] = [];
						data.forEach((value) => {
							if(this.isValidJson(value)){
								jsonArray.push(JSON.parse(value));
							}
						});
						console.log(jsonArray);
						return jsonArray;
					});
				});

		} else {
			return Promise.reject("Invalid InsightDataSetKind");
		}
		return Promise.resolve(["LDUH."]);

	}
}
