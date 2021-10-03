import {InsightDatasetKind} from "./IInsightFacade";
import JSZip from "jszip";
import Course from "./Course";


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

	private isValidCourse(course: any): boolean {
		if(course.Subject !== null && course.Section !== null && course.Avg !== null && course.Professor !== null
			&& course.Title !== null && course.Pass !== null
			&& course.Fail  !== null && course.Audit !== null && course.id !== null && course.Year !== null
			&& course.Section !== "overall") {
			return true;
		}
		return false;
	}
	private convertJsonCourseIntoCourse(course: any) {
		if(this.isValidCourse(course)){
			return new Course(course.Subject, course.Section, course.Avg, course.Professor, course.Title,
				course.Pass, course.Fail, course.Audit, course.id, course.Year);
		}
		return null;

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
						let jsonArray: Course[] = [];
						data.forEach((value) => {
							if(this.isValidJson(value) && JSON.parse(value).result.length > 0 ) {
								let courseArray = JSON.parse(value).result;
								courseArray.forEach((course: any) => {
									let parsed = this.convertJsonCourseIntoCourse(course);
									if(parsed !== null){
										jsonArray.push(parsed);
									}
								});
							}
						});
						return jsonArray;
					});

				});

		} else {
			return Promise.reject("Invalid InsightDataSetKind");
		}
		return Promise.resolve(["LDUH."]);

	}
}
