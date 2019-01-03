// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

var AWS = require("aws-sdk");
AWS.config.update({
  region: process.env.AWS_REGION
});
var DDB = new AWS.DynamoDB({
  apiVersion: "2012-10-08"
});

exports.handler = async (event, context) => {
  const ENDPOINT = event.requestContext.domainName + '/' + event.requestContext.stage;
  const CONNECTION_ID = event.requestContext.connectionId;
  var dbParams = {
    TableName: process.env.TABLE_NAME,
    Item: {
      connectionId: {
        S: CONNECTION_ID
      },
      endpoint: {
        S: ENDPOINT
      }
    }
  };

  const snsParams = {
    Message: JSON.stringify([{
      connectionId: CONNECTION_ID,
      endpoint: ENDPOINT
    }]),
    TopicArn: process.env.TOPIC_ARN
  };

  try {
    await DDB.putItem(dbParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: "Failed to connect: " + JSON.stringify(err)
    };
  }

  // Create promise and SNS service object
  try {
    console.log("Notifying of connections to update");
    await new AWS.SNS({
      apiVersion: '2010-03-31'
    }).publish(snsParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: "Failed to connect: " + JSON.stringify(err)
    };
  }

  console.log("Connected");
  return {
    statusCode: 200,
    body: "Connected"
  };
};