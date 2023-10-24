'use strict';

require('dotenv').config();

/**
 * Require the dependencies
 * @type {*|createApplication}
 */
var express = require('express');
var app = express();
var path = require('path');
var OAuthClient = require('intuit-oauth');
var bodyParser = require('body-parser');
const cors = require('cors');
// const csurf = require("csurf");


/**
 * Configure View and Handlebars
 */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(cors());
// app.use(csrf());

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * App Variables
 * @type {null}
 */
var oauth2_token_json = null,
    redirectUri = '';


/**
 * Instantiate new Client
 * @type {OAuthClient}
 */

var oauthClient = null;


/**
 * Get the AuthorizeUri
 */

app.options('/authUri', cors());

// app.post('/authUri', urlencodedParser, function(req,res) {

//     console.log('Received POST request');
//     console.log('Request body:', req.body)

//     oauthClient = new OAuthClient({
//         clientId: req.query.json.clientId,
//         clientSecret: req.query.json.clientSecret,
//         environment: req.query.json.environment,
//         redirectUri: req.query.json.redirectUri
//     });

//     var authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting],state:'intuit-test'});

//     res.send(authUri);
// });

app.post('/authUri', urlencodedParser, function(req, res) {
    console.log('Received POST request');
    console.log('Request body:', req.body);
  
    // Extract client ID, client secret, environment, and redirect URI from the request body
    const { clientId, clientSecret, environment, redirectUri } = req.body;
  
    // Define the query parameters for the authorization URL
    const queryParams = {
      client_id: clientId,
      response_type: 'code',
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: redirectUri,
      state: 'security_token=138r5719ru3e1&url=' + encodeURIComponent(redirectUri),
    };
  
    // Generate the authorization URL by appending the query parameters
    var authUri = 'https://appcenter.intuit.com/connect/oauth2?' + Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  
    res.send(authUri);
  });
  
  

/**
 * Handle the callback to extract the `Auth Code` and exchange them for `Bearer-Tokens`
 */

app.get('/callback', function(req, res) {

    oauthClient.createToken(req.url)
       .then(function(authResponse) {
             oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
         })
        .catch(function(e) {
             console.error(e);
         });

    res.send('');

});


// app.get('/callback', function(req, res) {
//     const queryParams = new URLSearchParams(req.url);

//     // Check if the URL contains 'code', 'state', and 'realmId' parameters
//     if (queryParams.has('code') && queryParams.has('state') && queryParams.has('realmId')) {
//         const oauth2_token_json = queryParams.get('code');
//         const realmId = queryParams.get('realmId');

//         // Now, you have the 'code', 'state', and 'realmId', and you can use them for further processing.
//         // Implement the necessary logic for handling these parameters.

//         // For example, if you want to convert 'oauth2_token_json' to a JSON object and store it in local storage:
//         const oauth2TokenObject = JSON.parse(oauth2_token_json);
//         const realmIdTokenObject = JSON.parse(realmId);

//         // Store the JSON object in local storage for later access
//         localStorage.setItem('oauth2Token', JSON.stringify(oauth2TokenObject));
//         localStorage.setItem('realmId', JSON.stringify(realmId))

//         // You can now access the 'oauth2TokenObject' and 'realmId' in your client-side code.

//         // For example, to access the token:
//         const accessToken = oauth2TokenObject.access_token;

//         // For the realmId:
//         const accessRealmIdToken = realmIdTokenObject.accessRealmIdToken;

//         // For the 'state' parameter, you can use it for additional security checks or state validation.
//     } else {
//         // Handle the case where one or more parameters are missing or invalid.
//         console.error('Missing or invalid parameters in the URL.');
//     }
//     res.send('');
// });





/**
 * Display the token : CAUTION : JUST for sample purposes
 */
app.get('/retrieveToken', function(req, res) {
    res.send(oauth2TokenObject);
});


/**
 * Refresh the access-token
 */
app.get('/refreshAccessToken', function(req,res){

    oauthClient.refresh()
        .then(function(authResponse){
            console.log('The Refresh Token is  '+ JSON.stringify(authResponse.getJson()));
            oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
            res.send(oauth2_token_json);
        })
        .catch(function(e) {
            console.error(e);
        });


});

/**
 * getCompanyInfo ()
 */
app.get('/getCompanyInfo', function(req,res){


    var companyID = oauthClient.getToken().realmId;

    var url = oauthClient.environment == 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production ;

    oauthClient.makeApiCall({url: url + 'v3/company/' + companyID +'/companyinfo/' + companyID})
        .then(function(authResponse){
            console.log("The response for API call is :"+JSON.stringify(authResponse));
            res.send(JSON.parse(authResponse.text()));
        })
        .catch(function(e) {
            console.error(e);
        });
});


/**
 * Start server on HTTP
 */
const server = app.listen(process.env.PORT || 8000, () => {
    console.log(`Server listening on port ${server.address().port}`);
    redirectUri = `${server.address().port}` + '/callback';
    console.log('http://localhost:' + `${server.address().port}`);

});

