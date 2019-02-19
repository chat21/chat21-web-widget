# Enabling authenticated visitors in the Chat widget

Require Widget Javascript API v2

## Overview

You can configure your widget to authenticate visitors using the Javascript API and JWT token.

When you configure the Chat widget to use authenticated visitors, you get the following benefits:

* Ability to have higher confidence and security that the visitor/customer you or your agents are talking to is the real deal

* Support for cross device/browser identification. The visitor can be viewed as the same person if or when they choose to use a different device or browser when the custom ID is specified in the authentication call.

## Generating a Chat shared secret

To configure your widget for visitor authentication, you need a shared secret. A shared secret is a security setting, intended to be generated, copied, and pasted into a communication with your engineering team, or directly into your codebase, in a single sitting. It should not be entered into a browser.

Only Chat administrators can configure visitor authentication settings.

To generate the shared secret required for authenticated visitors

* Open the Dashboard and go to Project Name > Project Settings.
* Scroll down to the Visitor Authentication section and click the Generate button.

<img src="https://raw.githubusercontent.com/Tiledesk/tiledesk-docs/master/docs/tiledesk-project-settings.png"/>

Note:The shared secret is intended to remain secure. As a result, it will only appear in full one time. If you don’t have access to the shared secret and need the full secret to create your token, you can reset the secret by clicking the 'Generate' button.
Regenerating a new shared secret will revoke the previous token. If you have concerns the shared secret has been compromised, you should regenerate a new one. If you need to rotate the keys, you should schedule it when Chat is offline because regenerating the secret cause visitors to be disconnected from the widget.

Once you have generated the shared secret, use it to create a JWT token (Learn more about JWT) that you'll add to your Web Widget snippet.

## Creating a JWT token

To create a JWT token and add the code to the Chat  snippet

1) Construct a server-side payload of data for the JWT token. This needs to have the following information:

* **name**: Customer's name

* **email**: Customer's email

* **external_id**: alphanumeric string, unique to identifying the customer. Once set for the customer, this value cannot be changed. We recommend that you use your system's unique user ID for this field. For example, user-123456. 

* **iat**: Integer value of the current timestamp, in seconds. Some functions in specific languages i.e. JavaScript's Date.now() return milliseconds, so please make sure you convert to seconds. Iat for Chat authentication permits up to two minutes clock skew.

* **exp**: Integer value of the current timestamp, in seconds. This value indicates when this JWT token will expire. The value is permitted to be up to a maximum of 10 minutes from the iat value.

2) Use the code samples below to generate the server side JWT token .

3) Use the window.tiledesk.signInWithCustomToken Javascript API to provide a function which supplies a fresh JWT every time it is invoked. Below is a code example:

```
window.tiledesk.signInWithCustomToken("<JWT_TOKEN_HERE_GENERATED_SERVER_SIDE>");
```

Example:

```
window.tiledesk.signInWithCustomToken("JWT 12345678...");
```

## Generate JWT Token Server Side

Your token needs to be dynamically generated from the server-side on page load. Find the template below that fits your language needs. Customize the sample as needed, making sure to replace the #{details} with your own information.

If none of these samples match your needs, JWT has a more extensive list of [JWT libraries](https://jwt.io/#libraries-io) to explore.

### NodeJS

Install [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken):

```
npm install jsonwebtoken --save-dev
```

Then, generate a token using the shared secret:

```
var jwt = require('jsonwebtoken'); 
var payload = {
  name: '#{customerName}',
  email: '#{customerEmail}',
  iat: #{timestamp},
  exp: #{timestamp+expiration time},
  external_id: '#{externalId}'
};
var token = jwt.sign(payload, '#{yourSecret}');
```

### PHP
Download [PHP-JWT](https://github.com/firebase/php-jwt):

```
composer require firebase/php-jwt
```

Generate a token using the shared secret:

```
use \Firebase\JWT\JWT;
$payload = {
  'name' => '#{customerName}' ,
  'email' => '#{customerEmail}',
  'iat' => #{timestamp},
  'exp'=> #{timestamp+expiration time},
  'external_id' => '#{externalId}'
};
$token = JWT::encode($payload, '#{yourSecret}');
```

# About the agent experience with authenticated visitors

A few things are updated in the Chat dashboard when an agent starts chatting with an authenticated visitor.

First, the agent will be able to tell the visitor is authenticated by the authenticated checkmark overlay on the visitor's avatar.

<img src="https://raw.githubusercontent.com/Tiledesk/tiledesk-docs/master/docs/authuser.png"/>