import { ResultType } from '../Enums';

export class SearchSpec {
    constructor() {}

    chain: string;
    type: ResultType;
    searchString: string;
}