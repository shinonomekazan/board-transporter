import * as types from "./types";
import Driver from "./Driver";
import * as Octokit from "@octokit/rest";

type ListColumns = Octokit.Octokit.ProjectsListColumnsResponse;

function wait(ms: number): Promise<void> {
	if (ms === 0) return Promise.resolve();
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

interface ParsedProjectUrl {
	type: "repository" | "orgs" | "users";
	org?: string;
	repository?: string;
	user?: string;
	projectNumber: number;
}

export default class implements Driver {
	readonly client: Octokit.Octokit;
	readonly wait: number;

	constructor(tokenOrClient: string | Octokit.Octokit, wait: number) {
		// TODO: sourceとdestinationで別々のトークンで扱えるとベスト（GitHub to gheなどができるため）
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
		const sourceProject = await this.findProjectByParsedUrl(this.parseUrl(params.sourceUrl));
		const desitinationProject = await this.findProjectByParsedUrl(this.parseUrl(params.destinationUrl));
		await wait(this.wait);
		const result:  types.CopyBoardResult = {
		}
		const sourceColumns = await this.client.projects.listColumns({
			project_id: sourceProject.id,
		});
		await wait(this.wait);
		const destinationColumns = await this.client.projects.listColumns({
			project_id: desitinationProject.id,
		});
		console.log("get target cards..");
		const cards = await this.getTargetCards(sourceColumns.data, destinationColumns.data);
		console.log(`copy cards.. (target card count: ${cards.length})`);
		let registeredCardCount = 0;
		for (let i = 0; i < cards.length; i++) {
			const card = cards[i];
			if (card.type === "card") {
				// TODO: destination column内に同一のnoteがあるかを見て重複チェックをしてもいいが、今はやってない
				await this.client.projects.createCard({
					column_id: card.columnId,
					note: card.note,
				});
				registeredCardCount++;
			} else {
				try {
					await this.client.projects.createCard({
						column_id: card.columnId,
						content_id: card.contentId,
						content_type: "Issue",
					});
					registeredCardCount++;
				} catch (error) {
					if (error.name === "HttpError" && error.status === 422) {
						// この場合、既に登録済なのでスルーする
					} else {
						throw error;
					}
				}
			}
			await wait(this.wait);
		}
		console.log(`copy finished! (${registeredCardCount} card copied)`);
		return result;
	}

	async getTargetCards(sourceColumns: ListColumns, destinationColumns: ListColumns) {
		const result = [];
		for (let i = 0; i < sourceColumns.length; i++) {
			const sourceColumn = sourceColumns[i];
			const destinationColumnOrNull = destinationColumns.find((column) => column.name === sourceColumn.name);
			const cards = await this.client.projects.listCards({
				archived_state: "not_archived",
				column_id: sourceColumn.id,
			});
			for (let j = 0; j < cards.data.length; j++) {
				const card = cards.data[j];
				await wait(this.wait);
				const contentIdOrClosed = await this.getContentIdOrClosed(card);
				if (contentIdOrClosed === true) continue;
				if (destinationColumnOrNull == null) {
					throw new Error(`Column ${sourceColumn.name} not found`);
				}
				if (contentIdOrClosed === false) {
					result.push({
						columnId: destinationColumnOrNull.id,
						type: "card",
						note: card.note
					});
				} else {
					result.push({
						columnId: destinationColumnOrNull.id,
						type: "issue",
						contentId: contentIdOrClosed,
					});
				}
			}
			await wait(this.wait);
		}
		return result;
	}

	async getContentIdOrClosed(card: Octokit.Octokit.ProjectsGetCardResponse) {
		if (card.archived) {
			return true;
		}
		if (card.content_url == null) {
			return false;
		}
		const parsedUrl = this.parseContentUrl(card.content_url);
		const issue = await this.client.issues.get({
			owner: parsedUrl.org,
			repo: parsedUrl.repo,
			issue_number: parsedUrl.number,
		});
		if (issue.data.state === "closed") {
			return true;
		}
		return issue.data.id;
	}

	async findProjectByParsedUrl(parsedUrl: ParsedProjectUrl) {
		const projects = await this.listProjectsByParsedUrl(parsedUrl);

		const targetProjects = projects.data.filter((project) => project.number === parsedUrl.projectNumber);
		if (targetProjects.length === 0 || targetProjects.length > 1) {
			throw new Error("Invalid project url");
		}
		return targetProjects[0];
	}

	listProjectsByParsedUrl(parsedUrl: ParsedProjectUrl) {
		if (parsedUrl.type === "orgs") {
			return this.client.projects.listForOrg({
				org: parsedUrl.org!,
			});
		}
		if (parsedUrl.type === "users") {
			return this.client.projects.listForUser({
				username: parsedUrl.user!,
			});
		}
		return this.client.projects.listForRepo({
			owner: parsedUrl.org!,
			repo: parsedUrl.repository!,
		});
	}

	parseContentUrl(url: string) {
		// https://api.github.com/repos/tsugehara/note/issues/7'
		const urls = url.split("/");
		if (urls.length !== 8) {
			throw new Error(`Invalid content url: ${url}`);
		}
		return {
			org: urls[4],
			repo: urls[5],
			number: parseInt(urls[7], 10),
		};
	}

	parseUrl(url: string): ParsedProjectUrl {
		// TODO: もうちょっとちゃんとparseしたい
		const urls = url.split("/");
		// orgs: https://github.com/orgs/${organization}/projects/${projectNumber}
		// repository: https://github.com/${organization}/${repository}/projects/${projectNumber}
		// users: https://github.com/users/${user}/projects/${projectNumber}
		if (urls[3] === "orgs") {
			return {
				type: "orgs",
				org: urls[4],
				projectNumber: parseInt(urls[6], 10),
			};
		}
		if (urls[3] === "users") {
			return {
				type: "users",
				user: urls[4],
				projectNumber: parseInt(urls[6], 10),
			};
		}
		return {
			type: "repository",
			org: urls[3],
			repository: urls[4],
			projectNumber: parseInt(urls[6], 10),
		};
	}

	async getRateLimit() {
		const rateLimit = await this.client.rateLimit.get();
		return {
			core: rateLimit.data.resources.core,
			rate: rateLimit.data.rate,
		};
	}
}
