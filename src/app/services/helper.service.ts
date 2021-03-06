import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AES } from 'node_modules/crypto-ts'
import { Interval } from '../classes/Enums';

@Injectable({providedIn: 'root'})
export class HelperService{
    constructor() {}
    
    token: string = environment.token;

    /**
     * validate an email address
     * 
     * @param email email to validate
     */
    validateEmail(email: string): boolean {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    /**
     * conver unix time to utc time
     * 
     * @param timestamp Unix timestamp
     * @param includeTime Include Time (default true)
     */
    unixToUTC(timestamp: number, includeTime: boolean = true): string {
      let dateTime = new Date(timestamp * 1000);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const day = dateTime.getDate();
      const year = dateTime.getFullYear();
      const month = months[dateTime.getMonth()];
      const hour = dateTime.getHours() == 0 ? "00" : dateTime.getHours();
      const min = dateTime.getMinutes() == 0 ? "00" : dateTime.getMinutes();
      const sec = dateTime.getSeconds() == 0 ? "00" : dateTime.getSeconds();
      let formatted = day + '-' + month + '-' + year;
      if(includeTime) {
        formatted +=  ' ' + hour + ':' + min + ':' + sec ;
      }
      return formatted;
    }

    /**
     * Convert a date to unix timestamp
     * @param date date to convert
     */
    getUnixTimestampFromDate(date: Date, timeZone: string = "UTC"): number {
      if(timeZone === "Eastern" ) {
        timeZone = "America/New_York";
      } else if (timeZone === "Pacific") {
        timeZone = "America/Los_Angeles";
      }
      const day = date.getDate();
      const year = date.getFullYear();
      let month = date.getMonth();
      const hour = date.getHours();
      const min = date.getMinutes();
      const sec = date.getSeconds();
      const newDate = new Date(year, month, day, hour, min, sec).toLocaleString('en-US', {timeZone: timeZone});
      //const formatted = `${year}-${month}-${day}T${hour}:${min}:${sec}.000Z`;

      const unix = new Date(newDate).valueOf()/1000;

      return unix;
    }

    /**
     * Get current unix timestamp
     */
    getUnixTimestamp(): number {
      const timestamp = Date.now();

      return timestamp;
    }

    /**
     * Round up/down a currency
     * @param value value to round
     */
    currencyRound(value: number): number {
      return Math.round(value * 1e2) / 1e2;
    }

    /**
     * Get future unix timestamp
     * @param timeOffset offset amount
     * @param interval time interval
     */
    getFutureUnixTimestamp(timeOffset: number, interval: Interval): number {
      const timestamp = this.getUnixTimestamp();

      if(interval === Interval.Second){
        return timestamp + (timeOffset * 1000);
      } else if (interval === Interval.Minute) {
        return timestamp + (timeOffset * 60 * 1000);
      } else if (interval === Interval.Hour) {
        return timestamp + (timeOffset * 60 * 60 * 1000);
      } else if (interval === Interval.Day) {
        return timestamp + (timeOffset * 24 * 60 * 60 * 1000);
      }
    }

    /**
     * Get age of a timestamp
     * @param timestamp timestamp to compare
     * @param interval time interval to return
     */
    getTimestampAge(timestamp: number, interval: Interval): number {
      const currentTs = this.getUnixTimestamp();
      const diff = currentTs - timestamp;

      if(interval === Interval.Second){
        return diff/1000;
      } else if (interval == Interval.Minute) {
        return diff/60/1000;
      } else if (interval == Interval.Hour) {
        return diff/60/60/1000;
      } else if (interval == Interval.Day) {
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

    /**
     * Confirm that a password and confirmation value match
     * 
     * @param password password value
     * @param confirmation password confirmation value
     * @param minLenth minimum length (default = 8)
     */
    passwordConfirm(password: string, confirmation: string, minLenth: number = 8): string {
      if(password.length < minLenth) {
        return "New password is less than 8 characters";
      }
      let match = false;
      if(password.length > 0 && confirmation.length > 0) {
        match = password === confirmation;
      } else {
        match = false;
      }

      if(!match) {
        return "Passwords to not match";
      }

      return null;
    }
}