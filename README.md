# simple-voting-app

This is the code for the simple-voting-app.  
This project consists of a SAM App (backend) and an Amplify App (ui).

Within the backend app there are a number of functions contained within the directories and a SAM template that wires them up to a DynamoDB table and provides the minimal set of permissions needed to run the app.
The Amplify app is simply a voting UI to interact with the backend. Most of the code was taken from [The following GitHub repo](https://github.com/ppietris/vue-poll)

## Deploying to your account

### Pre-requisites

- node and npm installed
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed
- Amplify CLI installed and configured

### Deploy the backend app

If you prefer, you can install the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) and use it to package, deploy, and describe your application.  These are the commands you'll need to use:

```bash
cd backend

sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket REPLACE_THIS_WITH_YOUR_S3_BUCKET_NAME

sam deploy \
    --template-file packaged.yaml \
    --stack-name simple-voting-app \
    --capabilities CAPABILITY_IAM

aws cloudformation describe-stacks \
    --stack-name simple-voting-app --query 'Stacks[].Outputs'
```

### Deploy the WebSocket API with API Gateway

Create a new WebSockets API with API Gateway
API Name:
Route selection: $route.body.message

Configure routes: $connect, $disconnect, vote
Publish API

### Deploy the UI

```bash
cd ui/

# Download all the dependencies
npm install

amplify init
# Specify the following parameters
# Choose the type of app that you're building: javascript
# What javascript framework are you using: vue
# Source Directory Path:  src
# Distribution Directory Path: dist
# Build Command:  WS_API="wss://{YOUR-API-ID}.execute-api.{YOUR-REGION}.amazonaws.com/{STAGE}" npm run-script build

# Configure hosting
amplify hosting add

# Publish the app
amplify publish
```

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.
