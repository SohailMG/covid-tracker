"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = exports.uploadTwitterData = exports.getData = exports.uploadCovidData = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const moment_1 = __importDefault(require("moment"));
aws_sdk_1.default.config.update({
    region: "us-east-1",
});
const s3 = new aws_sdk_1.default.S3();
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
/* uploads data to DynamoDB table */
function uploadCovidData(data) {
    // destructured region data
    const { date, cases, deaths, dose1, dose2, region } = data;
    // date string to timestamp
    const timestamp = (0, moment_1.default)(new Date(date)).unix();
    // table item structure
    const params = {
        TableName: "CovidStats",
        Item: {
            region: region.toLowerCase(),
            timestamp: timestamp,
            daily_cases: cases,
            daily_deaths: deaths,
            dose1: dose1 === null ? 0 : dose1,
            dose2: dose2 === null ? 0 : dose2,
        },
    };
    // inserting item into DynamoDB table
    docClient.put(params, function (err, data) {
        if (err)
            throw err;
    });
}
exports.uploadCovidData = uploadCovidData;
/* get data from DynamoDB table */
async function getData(table) {
    try {
        const params = {
            TableName: table,
            Count: true,
        };
        const response = await docClient.scan(params).promise();
        return response;
    }
    catch (error) {
        console.error(error);
    }
}
exports.getData = getData;
/* upload twitter data to DynamoDB table */
function uploadTwitterData(data) {
    const params = {
        TableName: "CovidTweets",
        Item: {
            TweetId: data.id,
            timestamp: data.timestamp,
            region: data.region,
            content: data.text,
        },
    };
    // inserting item into DynamoDB table
    docClient.put(params, function (err, data) {
        if (err)
            throw err;
    });
}
exports.uploadTwitterData = uploadTwitterData;
function uploadToS3(bucketName, fileContent, fileName) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: JSON.stringify(fileContent),
    };
    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
        if (err) {
            console.log("🚀 ~ file: dbHandlers.ts ~ line 78 ~ err", err);
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
}
exports.uploadToS3 = uploadToS3;
