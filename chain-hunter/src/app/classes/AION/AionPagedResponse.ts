import { AionResponse } from './AionResponse';
import { AionPage } from './AionPage';

export class AionPagedResponse<T> extends AionResponse<T> {
    page: AionPage;
}