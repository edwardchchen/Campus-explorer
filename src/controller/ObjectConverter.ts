import {Course} from "./Course";
import {Room} from "./Room";


export default class ObjectConverter{
	public static isValidCourse(course: any): boolean {
		return course.Subject !== null && course.Section !== null && course.Avg !== null && course.Professor !== null
			&& course.Title !== null && course.Pass !== null
			&& course.Fail !== null && course.Audit !== null && course.id !== null && course.Year !== null;

	}

	public static convertIntoRoom(fullname: string, shortname: string, number: string, name: string, address: string,
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


	public static convertJsonCourseIntoCourse(course: any) {
		if(this.isValidCourse(course)){
			const c: Course = {
				dept: course.Subject, // changed them to public instead of private, but you can add helper function later instead
				id: course.Course,
				avg: course.Avg,
				instructor: course.Professor,
				title: course.Title,
				pass: course.Pass,
				fail: course.Fail,
				audit: course.Audit,
				uuid: String(course.id),
				year: parseInt(course.Year, 10),
			};
			if(course.Section === "overall"){
				c.year = 1900;
			}
			return c;
		}

		return null;

	}


}
