[![npm version](https://badge.fury.io/js/%40chat21%2Fchat21-web-widget.svg)](https://badge.fury.io/js/%40chat21%2Fchat21-web-widget)

# chat21-web-widget

Chat21-web-widget is a Free Live Chat Widget built on Firebase with Angular5 that lets you support and chat with visitors and customers on your website. 
More information about web widget here : http://www.tiledesk.com

<img width="488" alt="dialogo_widgetchat_2" src="https://user-images.githubusercontent.com/32448495/37662363-35110862-2c57-11e8-8720-263d1ff96f29.jpg">

With Chat21-web-widget you can:
* Invite your website visitors to share feedback and suggestions to better understand their needs.
* Answer questions from website visitors instantly to increase trust
* Add a code snippet to your website easly 
* It's a HTML5 widget built with Google Firebase, Angular5 and Bootstrap

# Features
* Send a direct message to a preset user
* Receive realtime support from your team
* Form to enter the chat sentiment
* Configure the widget with company logo and colors
* Chat21 Web Widget is free and open source.

# Prerequisites #
* Install git: `https://git-scm.com/book/id/v2/Getting-Started-Installing-Git`
* Install Angular CLI with  `npm install -g @angular/cli`. More info here https://github.com/angular/angular-cli#installation
* A Firebase project. Create one free on `https://firebase.google.com`
* "Chat21 Firebase cloud functions" installed. Instructions:`https://github.com/chat21/chat21-cloud-functions`


# Installation

* Clone the repository with : ```git clone https://github.com/chat21/chat21-web-widget <YOUR_PATH>```
* Move to the downloaded project path ```cd <YOUR_PATH>```
* Compile the project with ```npm install```

[For Installing the Widget on your web site read the SDK page](docs/sdk.md)



## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

Build for production with :  `ng build --prod --base-href --output-hashing none`

## Widget in action 
To see this widget in action you can go on 'http://chat21.org'

# Deploy to AWS S3 (Optional)

Run : `aws s3 sync . s3://tiledesk-widget`

Or With a different AWS Profile: 

Run : `aws --profile f21 s3 sync . s3://tiledesk-widget`

If you use AWS Cloud Front enable gzip compression.

# Docker
docker image build -t tiledesk-web-widget .
 docker run -p 4200:80  tiledesk-web-widget
