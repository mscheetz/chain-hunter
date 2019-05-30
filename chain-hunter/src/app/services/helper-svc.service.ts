import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class HelperService{
    constructor() {}

    /**
     * conver unix time to utc time
     * 
     * @param timestamp Unix timestamp
     */
    unixToUTC(timestamp: number): string {
      let dateTime = new Date(timestamp * 1000);
      let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      let year = dateTime.getFullYear();
      let month = months[dateTime.getMonth()];
      let hour = dateTime.getHours() == 0 ? "00" : dateTime.getHours();
      let min = dateTime.getMinutes() == 0 ? "00" : dateTime.getMinutes();
      let sec = dateTime.getSeconds() == 0 ? "00" : dateTime.getSeconds();
      let time = dateTime + '-' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec ;
      return time;
    }

    /**
     * Convert an exponential value to a number
     * 
     * @param x value to convert
     */
    exponentialToNumber(x) {
      if (Math.abs(x) < 1.0) {
        let e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10,e-1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
      } else {
          let e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10,e);
            x += (new Array(e+1)).join('0');
        }
      }
      return x;
    }

    /**
     * Comma up a big number
     * 
     * @param value value to comma up
     */
    commaBigNumber(value: string): string {
      let decimals = value.indexOf(".") >= 0 ? value.substr(value.indexOf(".")) : "";
      value = value.substr(0, value.length - decimals.length);
      let updatedValue = "";
      let charArray = Array.from(value);
      let pos = 0;

      for(let i = charArray.length - 1; i >= 0; i--) {
        pos++;
        updatedValue = charArray[i] + updatedValue;
        if(pos % 3 === 0) {
          updatedValue = "," + updatedValue;
        }
      }

      if(updatedValue.substr(0,1) === ",") {
        updatedValue = updatedValue.substr(1);
      }

      return updatedValue + decimals;
    }
}