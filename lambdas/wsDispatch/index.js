/* eslint-disable no-unused-vars */
const AWS = require("aws-sdk");
const db = require("./database");
const CONN_ENDPOINT = "4l9y6ww7j5.execute-api.us-east-1.amazonaws.com/prod/";

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
    connIds.map(async ({ connectionId: connId }) => {
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
    

  // if new user is connected
  if (event.requestContext) {
      console.log("ApiGateway Request")
      const reqBody = JSON.parse(event.body);
      const { connectionId: connId } = event.requestContext;
      const pKey = reqBody.data.includes("Northern") ? "northern+ireland" :reqBody.data.toLowerCase() ;
      const sentiment = await db.queryTableWithLimit("TweetsSentiment",pKey,150);
      const predictions = await db.queryPredictions(reqBody.data);
      const covidData = await db.queryTableData("CovidStats", reqBody.data.toLowerCase());
      await dispatchToOne(connId,  {sentiment});
      await dispatchToOne(connId,  {predictions})
      await dispatchToOne(connId,  {covidData})
      console.log("Data dispatched to client with id => ",connId)
     
  }
  // if there is new predictions/sentiment data
  if (event.Records) {
    console.log("Database update request")
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
      console.log(event)
      const { region, timestamp } =
        event.Records[0].dynamodb.NewImage;
      // extracting sentiment for each added tweet
      const sentiment = await db.queryTableWithLimit("TweetsSentiment",region.S,200);
      console.log(sentiment)
      const { Items: connIds } = await db.getTableData("WebSocketClients");
      await dispatchToAll(connIds, { sentiment, event: "update" });
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
  return response;
};
