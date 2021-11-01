import http = require("http");
import {Course} from "./Course";
export interface GeoResponse {
	lat?: number;
	lon?: number;
	error?: string;
}


export default class GeoHelper{
	public addressMap: Map<string, GeoResponse> = new Map<string, GeoResponse>();
	private url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team127/"
	// code from here : https://stackoverflow.com/questions/38533580/nodejs-how-to-promisify-http-request-reject-got-called-two-times
	public findCoordinates(address: any, postData: any) {
		let urladdress = encodeURIComponent(address);
		let url = this.url + urladdress;

		return new Promise(function(resolve, reject) {
			let req = http.request(url, function(res: any) {
				// reject on bad status
				if (res.statusCode < 200 || res.statusCode >= 300) {
					return reject(new Error("statusCode=" + res.statusCode));
				}
				// cumulate data
				let body: any = [];
				res.on("data", function(chunk: any) {
					body.push(chunk);
				});
				// resolve on end
				res.on("end", function() {
					try {
						body = JSON.parse(Buffer.concat(body).toString());
					} catch(e) {
						reject(e);
					}
					body["address"] = address;
					resolve(body);
				});
			});
			// reject on request error
			req.on("error", function(err) {
				// This is not a "Second reject", just a different sort of failure
				reject(err);
			});
			if (postData) {
				req.write(postData);
			}
			// IMPORTANT
			req.end();
		});
	}

}
