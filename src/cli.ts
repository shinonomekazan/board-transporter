import * as commander from "commander";
import "dotenv/config";
import * as types from "./types";
import * as readline from "readline";
import Driver from "./Driver";
import GitHubDriver from "./GitHubDriver";

async function executeCopyAction(options: types.GitHubExecutorOptions) {
	const prompt = new Prompt();
	try {
		if (! options.token) {
			options.token = await prompt.prompt("token?>");
			if (! options.token) throw new Error("Invalid token");
		}
		if (! options.source) {
			options.source = await prompt.prompt("source?>");
			if (! options.source) throw new Error("Invalid source");
		}
		if (! options.destination) {
			options.destination = await prompt.prompt("destination?>");
			if (! options.destination) throw new Error("Invalid destination");
		}
		const driver: Driver = new GitHubDriver(options.token, options.wait);
		const params: types.CopyBoardParameters = {
			sourceUrl: options.source,
			destinationUrl: options.destination,
		};
		console.log(`copy ${params.sourceUrl} to ${params.destinationUrl}`);
		// TODO: driverを直接実行しているけど本当はこうじゃない方がいいかな
		await driver.copyBoard(params);
	} catch (error) {
		console.error(error);
		process.exit(1);
	} finally {
		prompt.destroy();
	}
}

export async function run(argv: string[]) {
	// Note: あとでdriver option追加してもいい
	commander
		.option("-t, --token <access token>", "GitHub access token")
		.option("-w, --wait <wait>", "Wait time per command execution (milliseconds)")
		.command("copy <source> <destination>")
		.description("Copy open issues from Source board to Destination board")
		.action((source: string, destination: string) => {
			const options: types.GitHubExecutorOptions = {
				driver: "github",
				checkRateLimit: true,
				token: commander.token || process.env.GITHUB_TOKEN,
				source,
				destination,
				wait: parseInt(commander.wait || process.env.WAIT || 50, 10),
			};
			executeCopyAction(options);
		});
	commander.parse(argv);
}

class PromiseWrapper {
	resolve: (v: string) => void;
	reject: (error?: Error) => void;

	constructor(resolve: (v: string) => void, reject: (error?: Error) => void) {
		this.resolve = resolve;
		this.reject = reject;
	}
}

class Prompt {
	p: readline.Interface;
	current: PromiseWrapper | null;

	constructor() {
		this.p = readline.createInterface(process.stdin, process.stdout);
		this.p.on("line", this.onLine.bind(this));
		this.p.on("close", this.onClose.bind(this));
		this.current = null;
	}

	prompt(label: string): Promise<string> {
		if (this.current != null) {
			throw new Error("multiple call prompt");
		}
		return new Promise<string>((resolve, reject) => {
			this.current = new PromiseWrapper(
				resolve,
				reject,
			);
			this.p.setPrompt(label);
			this.p.prompt();
		});
	}

	onLine(line: string) {
		if (this.current == null) {
			throw new Error("Invalid prompt status");
		}
		const resolve = this.current.resolve;
		this.current = null;
		resolve(line);
	}

	onClose() {
		if (this.current == null) {
			return;
		}
		this.current = null;
	}

	destroy() {
		this.p.close();
	}
}
