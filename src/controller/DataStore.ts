import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import JSZip from "jszip";
import Course from "./Course";


export default class DataStore{
	public dataSets: InsightDataset[]
	private dataMap: Map<string, Course[]> = new Map<string, Course[]>();


	constructor() {
		this.dataSets = [];
	}
	private static isValidJson(json: string): boolean {
		try {
			JSON.parse(json);
		} catch (e) {
			return false;
		}
		return true;
	}

	private static isValidCourse(course: any): boolean {
		return course.Subject !== null && course.Section !== null && course.Avg !== null && course.Professor !== null
			&& course.Title !== null && course.Pass !== null
			&& course.Fail !== null && course.Audit !== null && course.id !== null && course.Year !== null
			&& course.Section !== "overall";

	}
	private static convertJsonCourseIntoCourse(course: any) {
		if(DataStore.isValidCourse(course)){
			return new Course(course.Subject, course.Course, course.Avg, course.Professor, course.Title,
				course.Pass, course.Fail, course.Audit, course.id, course.Year);
		}
		return null;

	}
	private static isIdInvalid(id: string){
		let whiteSpaceRegex = new RegExp("[\\s]");
		let underscoreRegex = new RegExp("[_]");
		return whiteSpaceRegex.test(id) || underscoreRegex.test(id);
	}
	private isInValid(id: string,kind: InsightDatasetKind){
		if(DataStore.isIdInvalid(id)) {
			return true;
		}
		if(this.dataMap.get(id)) {
			return true;
		}
		if(kind === InsightDatasetKind.Rooms){
			return true;
		}
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if(this.isInValid(id,kind)){
			return Promise.reject(new InsightError());
		}
		let zip = new JSZip();
		const promises: any[] = [];
		return zip.loadAsync(content, {base64: true})
			.then((r: JSZip) =>{
				return r;
			}).then((results: JSZip)=>{
				Object.keys(results.files).forEach(function (filename) {
					promises.push(zip.files[filename].async("string"));
				});
				return Promise.all(promises).then((data) => {
					let jsonArray: Course[] = [];
					data.forEach((value) => {
						if(DataStore.isValidJson(value) && JSON.parse(value).result.length > 0 ) {
							let courseArray = JSON.parse(value).result;
							courseArray.forEach((course: any) => {
								let parsed = DataStore.convertJsonCourseIntoCourse(course);
								if(parsed !== null){
									jsonArray.push(parsed);
								}
							});
						}
					});
					this.dataMap.set(id,jsonArray);
					this.dataSets.push({id:id,kind:kind,numRows:jsonArray.length});
					let existingKeys: string[] = [];
					for (let key of this.dataMap.keys()) {
						existingKeys.push(key);
					}
					return existingKeys;
				});
			}).then((res: any)=>{
				return Promise.resolve(res);
			});
	}
	public removeDataset(id: string): Promise<string> {
		for(let  i = 0;i < this.dataSets.length;i++){
			if(this.dataSets[i].id === id){
				delete this.dataSets[i];
			}
		}
		if(this.dataMap.delete(id)){
			return Promise.resolve(id);
		}
		return Promise.reject(new NotFoundError());
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(this.dataSets);
	}

}
