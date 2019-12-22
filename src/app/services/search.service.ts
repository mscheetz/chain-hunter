import { Injectable } from "@angular/core";
import { Observable, Subject } from 'rxjs';

import { SearchSpec } from '../classes/ChainHunter/search-spec.class';
import { ResultType } from '../classes/Enums';

@Injectable()
export class SearchService {
    constructor() {
        this.searchSubject = new Subject<SearchSpec>();
        this.newSearch = this.searchSubject.asObservable();
    }

    newSearch: Observable<SearchSpec>;
    private searchSubject: Subject<SearchSpec>;
    private searchDetail: SearchSpec = null;

    setSearchSpec(chain: string, type: ResultType, searcher: string) {
        this.searchDetail = new SearchSpec();

        this.searchDetail.chain = chain;
        this.searchDetail.type = type;
        this.searchDetail.searchString = searcher
        
        this.searchSubject.next(this.searchDetail);
    }

    getSearchSpec(): SearchSpec {
        const search = this.searchDetail;
        this.clearSearchSpec();

        return search;
    }

    clearSearchSpec() {
        this.searchDetail = null;
    }
}