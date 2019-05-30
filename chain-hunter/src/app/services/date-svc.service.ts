import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class DateService{
    constructor() {}

    /**
     * conver unix time to utc time
     * 
     * @param timestamp Unix timestamp
     */
    unixToUTC(timestamp: number): string {
        var a = new Date(timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours() == 0 ? "00" : a.getHours();
        var min = a.getMinutes() == 0 ? "00" : a.getMinutes();
        var sec = a.getSeconds() == 0 ? "00" : a.getSeconds();
        var time = date + '-' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }
}