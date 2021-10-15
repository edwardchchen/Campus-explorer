export interface Course {
	dept: string; // changed them to public instead of private, but you can add helper function later instead
	id: string;
	avg: number;
	instructor: string;
	title: string;
	pass: number;
	fail: number;
	audit: number;
	uuid: string;
	year: number;
	[key: string]: any;
}
