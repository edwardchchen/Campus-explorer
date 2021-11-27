import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import ValidateHelper from "./ValidateHelper";
import CourseQueryExecuteHelper from "./CourseQueryExecuteHelper";
import {Course} from "./Course";
import DataStore from "./DataStore";
import {Room} from "./Room";
import RoomQueryExecuteHelper from "./RoomQueryExecuteHelper";

export default class QueryEngine {
	private validateHelper: ValidateHelper;
	private courseQueryExecuteHelper: CourseQueryExecuteHelper;
	private tempCourseDataSets: Map<string, Course[]>;
	private tempRoomDataSets: Map<string, Room[]>;
	private tempDataStore: DataStore;
	private roomQueryExecuteHelper: RoomQueryExecuteHelper;
	constructor() {
		this.tempCourseDataSets = new Map<string, Course[]>();
		this.tempRoomDataSets = new Map<string, Room[]>();
		this.validateHelper = new ValidateHelper();
		this.courseQueryExecuteHelper = new CourseQueryExecuteHelper();
		this.roomQueryExecuteHelper = new RoomQueryExecuteHelper();
		this.tempDataStore = new DataStore();
	}

	public runQuery(query: any, localDataStore: any): Promise<any[]> { // return the list of InsightFacade
		if (this.queryValidate(query)) {
			this.tempDataStore = localDataStore;
			let id: string;
			id = this.validateHelper.findID();
			if (id === "") {
				return Promise.reject(new InsightError("id shouldn't be empty"));
			} else {
				if (this.validateHelper.isCourseQuery) { // is Course
					if (this.validateCourseIDwithDataSet(id)) { // validating if the dataset exists with specified ID
						this.tempCourseDataSets = this.tempDataStore.dataMap;
						return Promise.resolve(this.courseQueryExecute(id, this.tempCourseDataSets.get(id), query)); // not sure if the resolve works?
					} else {
						return Promise.reject(new InsightError("id doesn't exist in dataSets"));
					}
				} else if (this.validateHelper.isRoomQuery){ // is ROOM
					if (this.validateRoomIDwithDataSet(id)) { // validating if the dataset exists with specified ID
						this.tempRoomDataSets = this.tempDataStore.roomMap;
						return Promise.resolve(this.roomQueryExecute(id, this.tempRoomDataSets.get(id), query)); // not sure if the resolve works?
					} else {
						return Promise.reject(new InsightError("id doesn't exist in dataSets"));
					}
				} else {
					return Promise.reject(new InsightError("error, should be either ROOM or COURSE query"));
				}
			}
		}
		return Promise.reject(new InsightError());
	}

	private queryValidate(query: any): boolean {
		return this.validateHelper.validateAllQuery(query);
	}

	private validateCourseIDwithDataSet(id: string): boolean {
		for (let singleInsightFacade of this.tempDataStore.dataSets) {
			if ((singleInsightFacade.kind === InsightDatasetKind.Courses) && (singleInsightFacade.id === id)) {
				return true;
			}
		}
		return false; // none of the IDs match with this criteria
	}

	private validateRoomIDwithDataSet(id: string): boolean {
		for (let singleInsightFacade of this.tempDataStore.dataSets) {
			if ((singleInsightFacade.kind === InsightDatasetKind.Rooms) && (singleInsightFacade.id === id)) {
				return true;
			}
		}
		return false; // none of the IDs match with this criteria
	}

	private courseQueryExecute(id: string, courseDataSet: any, query: any): Promise<any>{ // should return an array with correct result
		return this.courseQueryExecuteHelper.executeAndOrder(id, courseDataSet, this.validateHelper, query);
	}

	private roomQueryExecute(id: string, roomDataSet: any, query: any): Promise<any>{ // should return an array with correct result
		return this.roomQueryExecuteHelper.executeAndOrder(id, roomDataSet, this.validateHelper, query);
	}
}
