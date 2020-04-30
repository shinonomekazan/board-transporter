import fetch from "node-fetch";

export default class GitHubClient {
	readonly token: string;

	constructor(token: string) {
		this.token = token;
	}

	async createProjectIssue(columnId: string, contentId: string) {
		const query = `mutation addProjectIssueToColumn {
	addProjectCard(input: {projectColumnId: "${columnId}", contentId: "${contentId}"}) {
		cardEdge {
			node {
				id
			}
		}
	}
}`;
		const result = await fetch("https://api.github.com/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: `Bearer ${this.token}`,
			},
			body: JSON.stringify({ query }),
		});
		const log = await result.json();
		console.log(log);
		return log;
	}
}
