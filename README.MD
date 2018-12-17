# Optimizely Internal API SDK

Internal API wrapper for Optimizely. Enables functionality through an API that is not available through the REST API.

## Getting Started

1. Clone Repo
2. Run npm install
3. Require optimizely.js
4. Grab required info from the browser

- **App Cookie**  
Log into Optimizely app, go to network tab and find a call to our internal API (for example to the project settings). Check the cookie header and copy that string. That's your App cookie

- **App CSRF Token**  
Log into Optimizely app, go to network tab and find a call to our internal API (for example to the project settings). Check the CSRF Token header and copy that string. That's your App CSRF Token

- **Teams Cookie**  
Log into Optimizely app. Then go to program management. Go to network tab and find a call to our internal API (all calls that go to /batch). Check the Cookie header and copy that string. That's your Teams Cookie

- **Teams CSRF Token**  
Log into Optimizely app. Then go to program management. Go to network tab and find a call to our internal API (all calls that go to /batch). Check the CSRF Token header and copy that string. That's your Teams CSRF Token

5. Initialize with config template below

```javascript
var optly = new Optimizely({
    logLevel: 5, // currently not functional. Just ignore
    accountId: , // AccountID of the account you want to interact with
    AppCookie: "", // Cookie string for the Optimizely app, grabbed from the browser (see guide above)
    AppCsrfToken: "", // CSRF Token grabbed from the browser as string
    TeamsCookie: "", // Teams Cookie string grabbed from program management in the browser
    TeamsCsrfToken: "" // CSRF token for program management API grabbed from browser
});
```

## Supported Calls

- callTeams
- callApp
- updateProjectSettings
- getBillingInfo
- getActiveProjects
- getTeamProjects
- createTeam
- createCustomIdeaField
- createSite
- createTouchpoint

## Authors

* **Thilo Richter**