'use strict';
const fetch = require('isomorphic-fetch');

class Optimizely{
  constructor(config){
      console.log("Internal API SDK v1.0");
      this.config = config;
  }

  log(msg, level = 2) {
    if (level <= this.config.logLevel){
      console.log(msg);
    }
  }

  /**
   * Call the teams API
   */
  async callTeams(endpoint, method = "GET", body = ""){
    var url = "https://teams.optimizely.com/api-exp/" + endpoint;
    var referer = 'https://teams.optimizely.com/accounts/' + this.config.accountId;

    this.log("Calling: " + url);
    this.log("Method: " + method);
    this.log("Body: " + body);
    this.log("Referer: " + referer);


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
          'X-CSRFToken': this.config.csrfToken,
          'Referer': referer
        }
      });
    };

    if(res.status === 200 || res.status === 202 || res.status === 201){
      this.log("Server Reply: 200 (Ok) for " + url);
    } else {
      this.log(res.status + " -- Something went wrong");
      this.log(res);
    }

    let jsonResponse = await res.json();

    return jsonResponse;
  }

  /**
   * Call our main APP's internal API
   */
  async callApp(endpoint, method = "GET", body = "", referer = ""){
    var url = "https://app.optimizely.com/api/v1/" + endpoint;

    this.log("Calling: " + url);
    this.log("Method: " + method);
    this.log("Body: " + body);
    this.log("Referer: " + referer);


    if (method === "GET") {
      var res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'cookie': this.config.cookie,
          'X-csrf-token': this.config.csrfToken
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
    };

    if(res.status === 200 || res.status === 202 || res.status === 201){
      this.log("Server Reply: 200 (Ok) for " + url);
    } else {
      this.log(res.status + " -- Something went wrong");
      this.log(res);
    }

    let jsonResponse = await res.json();

    return jsonResponse;
  }

  /**
   * Update the settings of a project. Requires a complete project settings object (check in network tab how that looks like)
   */
  async updateProjectSettings(projectSettings){
    log("Updating Project ..." + projectSettings.id);
    let res = await this.callApp("projects/" + projectSettings.id, "PUT", JSON.stringify(projectSettings));
  
    return res;
  }

  /**
   * Get billing info for the account. Includes Impressions by project, CSM, ...
   */
  async getBillingInfo(){
    this.log("Getting Billing Info ...");
    let res = await this.callApp("accounts/" + this.config.accountId + "/billing_info", "GET");

    return res;
  }

  /**
   * Get projects that are active in the account. Good for looping through for actions
   */
  async getActiveProjects(){
    this.log("Getting Active Projects ...");
    let res = await this.callApp("/projects?filter=project_status:Active", "GET");

    return res;
  }

  /**
   * Get projects that are eligible for program management
   */
  async getTeamProjects(){
    this.log("getting all projects from teams");
  
    let body = '[{"method":"GET","url":"/api-exp/optimizely-x/projects/?account_id=' + this.config.accountId + '&explicit=true&fields=primary_team_id,name,is_classic,platform,sdks&status=active","headers":{"Accept":"application/json, text/plain, */*","X-CSRFToken":"' + this.config.csrfToken + '"}},{"method":"GET","url":"/api-exp/users/?account_id=' + this.config.accountId + '&explicit=true&fields=first_name,last_name,full_name,email","headers":{"Accept":"application/json, text/plain, */*","X-CSRFToken":"' + this.config.csrfToken + '"}}]';
    let res = await this.callTeams("batch/", "POST", body);

    return res;
  }

  /**
   * Create a program management team. Returns the team.
   */
  async createTeam(name, projectId){
    this.log("Creating team ..." + name + " with project " + projectId);
  
    let body = '[{"method":"POST","url":"/api-exp/teams/?BATCHED_REQUEST_NAME=create-team&fields=memberships","body":"{\\"name\\":\\"' + name + '\\",\\"account_id\\":\\"' + this.config.accountId + '\\"}","headers":{"Accept":"application/json, text/plain, */*","Content-Type":"application/json;charset=utf-8","X-CSRFToken":"' + this.config.csrfToken + '"}},{"method":"POST","url":"/api-exp/teams/%7Bresult=create-team:$.id%7D/tracked-projects/","body":"{\\"project_id\\":' + projectId + ',\\"team_id\\":\\"{result=create-team:$.id}\\",\\"is_primary\\":true,\\"is_active\\":true,\\"is_visible\\":true}","headers":{"Accept":"application/json, text/plain, */*","Content-Type":"application/json;charset=utf-8","X-CSRFToken":"' + this.config.csrfToken + '"}}]';
  
    let res = await this.callTeams("batch/", "POST", body);
  
    let team = JSON.parse(res[0].body);
  
    this.log("Attaching Collaborators...");
    await this.callTeams("teams/" + team.id + "/collaborators/", "POST", body);
  
    return team;
  }
  
  /**
   * Create a custom field for creating ideas
   */
  async createCustomIdeaField(label, teamId){
    this.log("creating custom field ..." + label + " for team " + teamId);
  
    let body = '{"companyId":' + teamId + ',"label":"' + label + '"}';
  
    let res = await this.callTeams("companies/" + teamId + "/custom-project-fields/", "POST", body);
  
    return res;
  }
  
  /**
   * Create a Program Management Site
   */
  async createSite(name, teamId){
    this.log("creating site ..." + name + " for team " + teamId);
  
    let body = '{"company_id":' + teamId + ',"name":"' + name + '"}';
  
    let site = await this.callTeams("sites/", "POST", body);
  
    return site;
  }
  
  /**
   * Create a touchpoint under a site
   */
  async createTouchpoint(name, teamId, siteId, url = ""){
    this.log("creating touchpoint ..." + name + " for team " + teamId);
  
    let body = '{"site_id":' + siteId + ',"url":"' + url + '","name":"' + name + '"}';
  
    let touchpoint = await this.callTeams("touchpoints/", "POST", body);
  
    return touchpoint;
  }
}

module.exports = Optimizely;