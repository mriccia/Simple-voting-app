// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');

// Add ApiGatewayManagementApi to the AWS namespace
require('aws-sdk/clients/apigatewaymanagementapi');

const ddb = new AWS.DynamoDB.DocumentClient();
const parse = AWS.DynamoDB.Converter.unmarshall;

exports.vote = async (event, context) => {

	const connectionId = event.requestContext.connectionId;
	const voteValue = JSON.parse(event.body).vote;
	console.log("Connection ID: ", connectionId, "Vote Value: ", voteValue);
	try {
		let result = await ddb.put({
			TableName: process.env.TABLE_NAME,
			Item: {
				connectionId: connectionId,
				pollId: "sample",
				voteValue: voteValue
			}
		}).promise();
		console.log(result);
	} catch (e) {
		console.error("Error during table put ", e);
		return {
			statusCode: 500,
			body: e.stack
		};
	}

	console.log("successfully added ", voteValue);
	return {
		statusCode: 200,
		body: 'Data sent.'
	};
}

exports.aggregate = async (event, context) => {
	console.log(event.Records);
	var arrayLength = event.Records.length;
	for (var i = 0; i < arrayLength; i++) {
		let record = event.Records[i];
		await updateCounter(record.dynamodb.OldImage, -1);
		await updateCounter(record.dynamodb.NewImage, 1);
	}
}

exports.send = async (event, context) => {

	let connectionsList = JSON.parse(event.Records[0].Sns.Message);
	const postData = await getResults(process.env.TABLE_NAME);
	const postCalls = connectionsList.map((connectionDetails) => {
		return postDataToWSConnection(connectionDetails.endpoint, connectionDetails.connectionId, JSON.stringify(postData.Items || []));
	});
	try {
		await Promise.all(postCalls);
	} catch (err) {
		console.log(err);
		return {
			statusCode: 500,
			body: "Error: " + JSON.stringify(err)
		};
	}
	return {
		statusCode: 200,
		body: "Success"
	}
}

exports.update = async (event, context) => {

	let connectionsData = await ddb.scan({
		TableName: process.env.TABLE_NAME
	}).promise();
	const snsParams = {
		Message: JSON.stringify(connectionsData.Items || []),
		TopicArn: process.env.TOPIC_ARN
	};
	
	try {
		console.log("Notifying of connections to update");
		await new AWS.SNS({
			apiVersion: '2010-03-31'
		}).publish(snsParams).promise();
	} catch (e) {
		return {
			statusCode: 500,
			body: e.stack
		};
	}
	return {
		statusCode: 200,
		body: "Success"
	}
}

function postDataToWSConnection(endpoint, connectionId, postData) {
	console.log("Posting data to WS");
	console.log("endpoint: ", endpoint);
	console.log("connection: ", connectionId);
	console.log("data", postData);
	const apigwManagementApi = new AWS.ApiGatewayManagementApi({
		apiVersion: '2018-11-29',
		endpoint: endpoint
	});
	return apigwManagementApi.postToConnection({
		ConnectionId: connectionId,
		Data: postData
	}).promise();
}

async function getResults(tableName) {
	var params = {
		TableName: tableName,
		ExpressionAttributeValues: {
			":poll": "sample"
		},
		KeyConditionExpression: "pollId = :poll",
	};

	let data = await ddb.query(params).promise();
	return data;
}

async function updateCounter(record, updateBy) {

	if (!record) {
		console.log("Record is null");
		return Promise.resolve();
	}
	const parsedRecord = parse(record);
	console.log(parsedRecord);

	return ddb.update({
		TableName: process.env.TABLE_NAME,
		Key: {
			pollId: parsedRecord.pollId,
			voteValue: parsedRecord.voteValue.toString()
		},
		UpdateExpression: 'ADD voteCounter :val',
		ExpressionAttributeValues: {
			':val': updateBy
		}
	}).promise();
}