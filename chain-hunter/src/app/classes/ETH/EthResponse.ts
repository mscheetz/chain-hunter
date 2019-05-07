export class EthResponse<T> {
    constructor() {}

    status: string;
    message: string;
    result: T;
}