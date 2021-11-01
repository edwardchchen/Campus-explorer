import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import JSZip from "jszip";
import {Course} from "./Course";
import {Room} from "./Room";
import GeoHelper from "./GeoHelper";

export default class DataStore{
	public dataSets: InsightDataset[]
	public dataMap: Map<string, Course[]> = new Map<string, Course[]>();
	public roomMap: Map<string, Room[]> = new Map<string, Room[]>();
	private requiredBuildings: Set<string> = new Set<string>();
	private parse5 = require("parse5");
	private geoHelper = new GeoHelper();
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
	}

	private extractAllBuildingNames(data: string[]): Set<string>{
		const locationNameSet = new Set<string>();
		const lduh = data[0].slice( data[0].indexOf( "<tbody>" ) + 8,data[0].indexOf( "</tbody>"));
		let parsed = this.parse5.parse(lduh);
		parsed = parsed.childNodes[0].childNodes[1].childNodes;
		parsed.forEach((element: any)=>{
			if(element.nodeName === "a"){
				let url = element.attrs[0].value;
				url = url.substring(url.lastIndexOf("/") + 1,  url.length);
				locationNameSet.add(url);
			}
		});
		return locationNameSet;
	}
	private extractRooms(data: string): Room[]{
		let res: Room[] = [];
		const roomInfo = data.slice( data.indexOf( "<tbody>" ) + 8,data.indexOf( "</tbody>"));
		const buildingInfo = data.slice( data.indexOf( "<div id=\"building-info\">" ),
			data.indexOf( "<div id=\"building-image\">"));
		let buildingName = buildingInfo.slice(buildingInfo.indexOf("<h2><span class=\"field-content\">") + 32,
			buildingInfo.indexOf("</span></h2>"));
		let address = buildingInfo.slice(buildingInfo.indexOf("</h2>\n" +
			"\t\t<div class=\"building-field\"><div class=\"field-content\">") + 63,
		buildingInfo.indexOf("</div></div>"));
		let parsed = this.parse5.parse(roomInfo);
		parsed = parsed.childNodes[0].childNodes[1].childNodes;
		for(let i = 1;i < parsed.length - 2;i += 4){
			let shortname, number,name,seats,type,furniture,href;
			if (parsed[i].nodeName === "a") {
				href = parsed[i].attrs[0].value;
				name = href.substring(href.lastIndexOf("/") + 1, href.length);
				name = name.replace("-","_");
				number = name.substr(name.indexOf("_") + 1,name.length);
				shortname = name.substr(0,name.indexOf("_"));
			}if(parsed[i + 1].nodeName === "#text"){
				let text = parsed[i + 1].value;
				text = text.replace(/(\r\n|\n|\r)/gm, "");
				let splitted = text.split("  ");
				let set  = new Set<string>(splitted);
				seats =  [...set][1];
				furniture =  [...set][2];
				type =  [...set][3];
			}
			if(!this.requiredBuildings.has(shortname)){
				return res;
			}
			res.push(DataStore.convertIntoRoom(buildingName,shortname,number,name,address,
				Number(seats),String(type),String(furniture),href));
		}
		return res;
	}
	private static convertIntoRoom(fullname: string, shortname: string, number: string, name: string, address: string,
		seats: number, type: string, furniture: string, href: string): Room{
		return {
			fullname: fullname,
			shortname: shortname,
			number: number,
			name: name,
			address: address,
			seats: seats,
			type: type,
			furniture: furniture,
			href: href,
			lat: 0,
			lon: 0
		};

	}
	private callApi(roomArray: Room[]): any {
		const promises: any[] = [];
		if(roomArray.length > 0) {
			let address = roomArray[0].address;
			promises.push(this.geoHelper.findCoordinates(address,null));
			return Promise.all(promises).then((data: any) => {
				return data;
			});
		}
	}

	public addRoomDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if(this.isInValid(id,kind)){
			return Promise.reject(new InsightError());
		}
		let zip = new JSZip();
		const promises: any[] = [];
		const roomPromises: any[] = [];
		return zip.loadAsync(content, {base64: true})
			.then((r: JSZip) =>{
				return r;
			}).then((results: JSZip)=>{
				Object.keys(results.files).forEach(function (filename) {
					if(filename === "rooms/index.htm"){
						promises.push(zip.files[filename].async("string"));
					}else{
						roomPromises.push(zip.files[filename].async("string"));
					}
				});
				return Promise.all(promises)
					.then((data: string[]) => {
						return this.extractAllBuildingNames(data);
					}).then((data: any) => {
						this.requiredBuildings = data;
						return Promise.all(roomPromises);
					})
					.then((data: string[]) => {
						// return this.callApi(this.extractRooms(data[10]));
						let rooms: Room[] = [];
						data.forEach((value)=>{
							if(value !== ""){
								rooms.push(...this.extractRooms(value));
							}
						});
						if(data.length === 0){
							return Promise.reject(new InsightError());
						}
						this.roomMap.set(id,rooms);
						this.dataSets.push({id:id,kind:kind,numRows:rooms.length});
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
