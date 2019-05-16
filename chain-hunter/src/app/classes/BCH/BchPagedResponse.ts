export class BchPagedResponse<T> {
    constructor() {}

    public total_count: number;
    public page: number;
    public pagesize: number;
    public list: T[];
}