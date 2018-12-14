'use strict';
const fetch = require('isomorphic-fetch');


class Optimizely{
  constructor(config){
      console.log("v1.1");
      this.config = config;
      // Set cookie if in browser
      if (typeof window !== 'undefined') {
          this.config.cookie.split(";").map(function(str){
            let name = str.split("=")[0];
            let value = str.split("=")[1];

            this.log(name);
            this.log(value);

            this.setCookie(name, value, 1);
          });
      }
  }

  setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  log(msg, level = 2) {
    if (level <= this.config.logLevel){
      console.log(msg);
    }
  }

  async call(endpoint, method = "GET", body = "", api = "https://app.optimizely.com/api/v1/", referer){
    var url = api + endpoint;
    // log(url);

    if (method === "GET") {
      var res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'cookie': this.config.cookie,
          'X-CSRFToken': this.config.csrfToken
        }
      });
    } else {
      var res = await fetch(url, {
        method: method,
        body: body,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.config.cookie,
          'X-csrf-token': this.config.csrfToken,
          'Referer': referer
        }
      });
    }

    if(res.status === 200 || res.status === 202 || res.status === 201){
      this.log("200 (Ok)");
    } else {
      this.log(res.status + " -- Something went wrong");
      this.log(res);
    }

    let jsonResponse = await res.json();

    return jsonResponse;
  }

  async getImpressions(){
    this.log("Getting Impressions ...");
    let res = await this.call("accounts/" + this.config.accountId + "/billing_info", "GET");

    return res;
  }

}

if (typeof window === 'undefined') {
    module.exports = Optimizely;
} else {
    window.Optimizely = Optimizely;
}
