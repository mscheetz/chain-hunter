import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AES } from 'node_modules/crypto-ts'

@Injectable({providedIn: 'root'})
export class HelperService{
    constructor() {}
    
    token: string = environment.token;

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
     * Get current unix timestamp
     */
    getUnixTimestamp(): number {
      const timestamp = Date.now();

      return timestamp;
    }

    /**
     * Get future unix timestamp
     * @param timeOffset offset amount
     * @param interval time interval
     */
    getFutureUnixTimestamp(timeOffset: number, interval: string): number {
      const timestamp = this.getUnixTimestamp();

      if(interval === "sec"){
        return timestamp + (timeOffset * 1000);
      } else if (interval == "min") {
        return timestamp + (timeOffset * 60 * 1000);
      } else if (interval == "hrs") {
        return timestamp + (timeOffset * 60 * 60 * 1000);
      } else if (interval == "days") {
        return timestamp + (timeOffset * 24 * 60 * 60 * 1000);
      }
    }

    /**
     * Get age of a timestamp
     * @param timestamp timestamp to compare
     * @param interval time interval to return
     */
    getTimestampAge(timestamp: number, interval: string): number {
      const currentTs = this.getUnixTimestamp();
      const diff = currentTs - timestamp;

      if(interval === "sec"){
        return diff/1000;
      } else if (interval == "min") {
        return diff/60/1000;
      } else if (interval == "hrs") {
        return diff/60/60/1000;
      } else if (interval == "days") {
        return diff/24/60/60/1000;
      }
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

    /**
     * Get request signature
     */
    requestSignature(): string {
      const timestamp = Date.now() * 1000;
      const cypher = AES.encrypt(timestamp.toString(), this.token);

      return cypher.toString();
    }
}