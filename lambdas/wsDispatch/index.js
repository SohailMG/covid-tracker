/* eslint-disable no-unused-vars */
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const db = require("./database");
const CONN_ENDPOINT = "0p40kzqqce.execute-api.us-east-1.amazonaws.com/prod/";

const client = new AWS.ApiGatewayManagementApi({ endpoint: CONN_ENDPOINT });

// sends data to a single user
const dispatchToOne = async (connId, data) => {
  try {
    await client
      .postToConnection({
        ConnectionId: connId,
        Data: JSON.stringify(data),
      })
      .promise();
    console.log(
      "[dispatchData] => Data successfully sent to client with ID : ",
      connId
    );
  } catch (err) {
    console.log(err);
  }
};
// sends data to all connected users
const dispatchToAll = async (connIds, data) => {
  try {
    connIds.map(async ({ ConnectionId: connId }) => {
      await dispatchToOne(connId, data);
    });
  } catch (err) {
    console.log(
      "[dispatchData] => Error while dispatching data to all users ",
      err
    );
  }
};

exports.handler = async (event) => {
  // const sentiment = (await db.getTableData("TweetsSentiment")).Items;
  // const predictions = (await db.getTableData("CovidPredictions")).Items;
  // const covidData = await db.queryTableData();

  // if new user is connected
  if (event.requestContext) {
      const sentiment = await db.queryTableWithLimit("TweetsSentiment",event.body.data,100)
      console.log("[Sentiment] =>  ", sentiment)
    
  }
  // if there is new predictions/sentiment data
  if (event.Records) {
    // if only predictions table updated
    if (event.Records[0].eventSourceARN.includes("CovidPredictions")) {
      // extract new records from event
      const { region, timestamp, predictions } =
        event.Records[0].dynamodb.NewImage;
      // fetching updated covid data for updated region
      const covidData = await db.queryTableData("CovidStats", region.S);
      // fetching connection ids of connected users
      const { Items: connIds } = await db.getTableData("WebSocketClients");
      await dispatchToAll(connIds, { covidData, predictions,event:"predictions" });
    }
    // if only tweets sentiment table updated
    else {
      // extracting sentiment for each added tweet
      const sentiment = event.Records.map((record) => {
        if (
          record.eventName === "INSERT" &&
          record.eventSourceARN.includes("TweetsSentiment")
        ) {
          const { region, sentiment } = record.dynamodb.NewImage;
          return { sentiment, region };
        }
        return false;
      });
      const { Items: connIds } = await db.getTableData("WebSocketClients");
      await dispatchToAll(connIds, { sentiment, event: "sentiment" });
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
  return response;
};
