process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import "missing-native-js-functions";
import { config } from "dotenv";
config();
import { FosscordServer } from "./Server";
import cluster from "cluster";
import os from "os";
const cores = os.cpus().length;

if (cluster.isMaster && process.env.production == "true") {
	console.log(`Primary ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < cores; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died, restart worker`);
		cluster.fork();
	});
} else {
	var port = Number(process.env.PORT);
	if (isNaN(port)) port = 1000;

	const server = new FosscordServer({ port });
	server.start().catch(console.error);

	// @ts-ignore
	global.server = server;
}
