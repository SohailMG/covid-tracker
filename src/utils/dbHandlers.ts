import AWS from "aws-sdk";
import { CovidData } from "./OpenDataApi";
import moment from "moment";
import { Tweet } from "./TwitterAPI";
import { Dataset } from "./fileHandler";

AWS.config.update({
  region: "us-east-1",
});

const s3 = new AWS.S3();
const docClient = new AWS.DynamoDB.DocumentClient();

/* uploads data to DynamoDB table */
export function uploadCovidData(data: CovidData) {
  // destructured region data
  const { date, cases, deaths, dose1, dose2, region, booster } = data;

  // date string to timestamp
  const timestamp = moment(new Date(date)).unix();
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
      booster: booster === null ? 0 : booster,
    },
  };
  // inserting item into DynamoDB table
  docClient.put(params, function (err, data) {
    if (err) throw err;
  });
}

/* get data from DynamoDB table */
export async function getData(table: string) {
  try {
    const params = {
      TableName: table,
      Count: true,
    };
    const response = await docClient.scan(params).promise();
    return response;
  } catch (error) {
    console.error(error);
  }
}

/* upload twitter data to DynamoDB table */
export function uploadTwitterData(data: Tweet) {
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
    if (err) throw err;
  });
}

export function uploadToS3(
  bucketName: string,
  fileContent: Dataset,
  fileName: string
) {
  const params = {
    Bucket: bucketName,
    Key: fileName, // File name you want to save as in S3
    Body: JSON.stringify(fileContent),
  };
  // Uploading files to the bucket
  s3.upload(params, function (err: any, data: any) {
    if (err) {
      console.log("🚀 ~ file: dbHandlers.ts ~ line 78 ~ err", err);
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
}
