import { TrxResponseStatus } from './TrxResponseStatus';

export class TrxResponse<T> {
    constructor() {}

    status: TrxResponseStatus;
    data: T
}