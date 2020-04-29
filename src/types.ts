export interface ExecutorOptions {
	driver: "github";
}

export interface GitHubExecutorOptions extends ExecutorOptions {
	token: string;
	source: string;
	destination: string;
	checkRateLimit: boolean;
	wait: number;
}
export interface CopyBoardParameters {
	sourceUrl: string;
	destinationUrl: string;
}

export interface CopyBoardResult {
}
