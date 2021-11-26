import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiHttp from "chai-http";
import * as fs from "fs-extra";
import Response = ChaiHttp.Response;
import chai = require("chai");
const persistDir = "./data";
const datasetContents = new Map<string, string>();

// Reference any datasets you've added to test/resources/archives here and they will
// automatically be loaded in the 'before' hook.
const datasetsToLoad: {[key: string]: string} = {
	courses: "./test/resources/archives/courses.zip",
	rooms: "./test/resources/archives/rooms.zip"
};
let dsBuffer: any;
let roomBuffer: any;

describe("Facade D3", function () {
	this.timeout(10000);

	let facade: InsightFacade;
	let server: Server;
	let SERVER_URL = "http://localhost:4321";

	use(chaiHttp);
	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		dsBuffer = fs.readFileSync(datasetsToLoad["courses"]);
		roomBuffer = fs.readFileSync(datasetsToLoad["rooms"]);

		// TODO: start server here once and handle errors properly
		// server.start().then((res)=>{
		// 	console.log(res);
		// }).catch((e)=>{
		// 	console.log(e);
		// });
	});

	after(function () {
		// TODO: stop server here once!
		// server.stop().then((res)=>{
		// 	console.log(res);
		// }).catch((e)=>{
		// 	console.log(e);
		// });
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	// Sample on how to format PUT requests
	it("PUT test for courses dataset", function () {
		try {
			console.log(dsBuffer);
			return chai.request(SERVER_URL)
				.put("/dataset/id/courses")
				.send(dsBuffer)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	it("PUT test for room dataset", function () {
		try {
			return chai.request(SERVER_URL)
				.put("/dataset/id/rooms")
				.send(roomBuffer)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("test ListDS", function () {
		try {
			return chai.request(SERVER_URL)
				.get("/datasets")
				.then(function (res: Response) {
					// some logging here please!
					console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
		}
	});

	it("ECHO", function () {
		try {
			return chai.request(SERVER_URL)
				.get("/echo/msg")
				.then(function (res: Response) {
					// some logging here please!
					console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});


});
