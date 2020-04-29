import * as types from "./types";
import Driver from "./Driver";
import * as Octokit from "@octokit/rest";

function wait(ms: number): Promise<void> {
	if (ms === 0) return Promise.resolve();
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export default class implements Driver {
	readonly client: Octokit.Octokit;
	readonly wait: number;

	constructor(tokenOrClient: string | Octokit.Octokit, wait: number) {
		if (typeof tokenOrClient === "string") {
			this.client = new Octokit.Octokit({
				auth: tokenOrClient,
			});
		} else {
			this.client = tokenOrClient;
		}
		this.wait = wait;

	}

	async copyBoard(params: types.CopyBoardParameters): Promise<types.CopyBoardResult> {
		const result: types.CopyBoardResult = {
		}
		// TODO: implement here
		await wait(this.wait);
		return result;
	}

	async getRateLimit() {
		const rateLimit = await this.client.rateLimit.get();
		return {
			core: rateLimit.data.resources.core,
			rate: rateLimit.data.rate,
		};
	}
}
