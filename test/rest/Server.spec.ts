import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiHttp from "chai-http";
import Response = ChaiHttp.Response;
import * as fs from "fs-extra";
const persistDir = "./data";
const datasetContents = new Map<string, string>();

// Reference any datasets you've added to test/resources/archives here and they will
// automatically be loaded in the 'before' hook.
const datasetsToLoad: {[key: string]: string} = {
	courses: "./test/resources/archives/courses.zip",
	rooms: "./test/resources/archives/rooms.zip"
};

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;
	let SERVER_URL = "http://localhost:4321";
	use(chaiHttp);

	before(function () {
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);

		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		server.start().then(() => {
			console.log("starts");
		}).catch(function (err: Error) {
			console.log(err);
		});
	});

	after(function () {
		// TODO: stop server here once!
		server.stop();
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
			return chai.request(SERVER_URL)
				.put("/dataset/id/courses")
				.send(datasetContents.get("courses") ?? "")
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
	it("LIST test for dataset", function () {
		try {
			return chai.request("http://localhost:4321")
				.get("/echo/hello")
				.then(function (res: Response) {
					// some logging here please!
					console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

});
