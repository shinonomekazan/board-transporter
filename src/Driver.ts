import * as types from "./types";

export interface Driver {
	copyBoard(params: types.CopyBoardParameters): Promise<types.CopyBoardResult>;
	getRateLimit(): any;
}

export default Driver;
