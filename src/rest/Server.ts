import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import InsightFacade from "../controller/InsightFacade";
import {InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";
import {expect} from "chai";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	private static insightFacade: InsightFacade;


	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();
		Server.insightFacade = new InsightFacade();

		this.registerMiddleware();
		this.registerRoutes();

		// NOTE: you can serve static frontend files in from your express server
		// by uncommenting the line below. This makes files in ./frontend/public
		// accessible at http://localhost:<port>/
		// this.express.use(express.static("./frontend/public"))
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}


	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);

		// TODO: your other endpoints should go here
		this.express.put("/dataset/:id/:kind", Server.putDS);
		this.express.get("/datasets", Server.listDS);
		this.express.delete("/dataset/:id", Server.deleteDS);
		this.express.post("/query", Server.queryDS);

	}

	private static putDS(req: Request, res: Response){
		let reqJson = req.params;
		let reqKind = reqJson.kind.slice(1);
		let id  = reqJson.id.slice(1);
		let content;
		let kind;
		if(reqKind === "rooms"){
			kind = InsightDatasetKind.Rooms;
		}else if(reqKind === "courses"){
			kind = InsightDatasetKind.Courses;
		}else{
			res.status(400).json({error: new Error("wrong dataset kind")});
			return;
		}
		content = new (Buffer.alloc as any)(req.body.length,req.body,"base64").toString();
		Server.insightFacade.addDataset(id,content,kind).then((data) => {
			res.status(200).json({result: data});
		}).catch((err)=>{
			res.status(400).json({error: err});
		});
	}

	private static deleteDS(req: Request, res: Response){
		let reqJson = req.params;
		let id  = reqJson.id.slice(1);
		Server.insightFacade.removeDataset(id).then((data) => {
			res.status(200).json({result: data});
		}).catch((err)=>{
			if(err instanceof NotFoundError){
				res.status(404).json({error: err});

			}else{
				res.status(400).json({error: err});
			}
		});
	}

	private static queryDS(req: Request, res: Response){
		let query  = req.body;
		console.log(req);
		Server.insightFacade.performQuery(query).then((data) => {
			console.log(data);
			res.status(200).json({result: data});
		}).catch((err)=>{
			res.status(400).json({error: err});
		});

	}


	private static listDS(req: Request, res: Response){
		Server.insightFacade.listDatasets().then((data) => {
			console.log(data);
			res.status(200).json({result: data});
		});
	}

	// The next two methods handle the echo service.
	// These are almost certainly not the best place to put these, but are here for your reference.
	// By updating the Server.echo function pointer above, these methods can be easily moved.
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}
}
