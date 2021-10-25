import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import JSZip from "jszip";
import {Course} from "./Course";


export default class DataStore{
	public dataSets: InsightDataset[]
	public dataMap: Map<string, Course[]> = new Map<string, Course[]>();


	constructor() {
		this.dataSets = [];
	}
	private static isValidJson(json: string): boolean {
		try {
			JSON.parse(json);
		} catch (e) {
			return false;
		}
		return JSON.parse(json).result.length > 0;


	}

	private static isValidCourse(course: any): boolean {
		return course.Subject !== null && course.Section !== null && course.Avg !== null && course.Professor !== null
			&& course.Title !== null && course.Pass !== null
			&& course.Fail !== null && course.Audit !== null && course.id !== null && course.Year !== null;

	}
	private static convertJsonCourseIntoCourse(course: any) {
		if(DataStore.isValidCourse(course)){
			const c: Course = {
				dept: course.Subject, // changed them to public instead of private, but you can add helper function later instead
				id: course.Course,
				avg: course.Avg,
				instructor: course.Professor,
				title: course.Title,
				pass: course.Pass,
				fail: course.Fail,
				audit: course.Audit,
				uuid: course.id,
				year: course.Year,
			};
			return c;
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
				return Promise.all(promises)
					.then((data) => {
						let jsonArray: Course[] = [];
						data.forEach((value) => {

							if(DataStore.isValidJson(value)) {
								let courseArray = JSON.parse(value).result;
								courseArray.forEach((course: any) => {
									let parsed = DataStore.convertJsonCourseIntoCourse(course);
									if(parsed !== null){
										jsonArray.push(parsed);
									}
								});
							}
						});
						if(jsonArray.length === 0){
							return Promise.reject(new InsightError());
						}
						this.dataMap.set(id,jsonArray);
						this.dataSets.push({id:id,kind:kind,numRows:jsonArray.length});
						let existingKeys: string[] = [];
						this.dataSets.forEach(function(val){
							existingKeys.push(val.id);
						});
						return existingKeys;
					});
			}).catch((e)=>{
				return Promise.reject(new InsightError());
			}).then((res: any)=>{
				return Promise.resolve(res);
			});
	}
	public removeDataset(id: string): Promise<string> {
		if(DataStore.isIdInvalid(id)){
			return Promise.reject(new InsightError("Invalid Id"));
		}
		if(!this.dataMap.get(id)){
			return Promise.reject(new NotFoundError());
		}
		for(let  i = 0;i < this.dataSets.length;i++){
			if(this.dataSets[i].id === id){
				delete this.dataSets[i];
				this.dataSets.splice(i, 1);
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
