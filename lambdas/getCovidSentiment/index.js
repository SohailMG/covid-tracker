const AWS = require("aws-sdk");


let comprehend = new AWS.Comprehend();
let documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // looping through added records
    for (let record of event.Records) {
      const { eventName, dynamodb } = record;
        if(eventName == "INSERT"){
        // destructuring record data
        const { TweetId, region, content, timestamp } = dynamodb.NewImage;
        

        // performing sentiment analysis on each tweet
        const sentiment = await comprehend
          .detectSentiment({
            LanguageCode: "en",
            Text: content.S,
          })
          .promise();

        // storing tweet sentiment into dynamodb table
        const params = {
          TableName: "TweetsSentiment",
          Item: {
            TweetId: Number(TweetId.N),
            timestamp: Number(timestamp.N),
            region: region.S,
            sentiment: sentiment,
          },
        };
        console.log(sentiment)
        await documentClient.put(params).promise();
        return {statusCode:200,body:JSON.stringify("Successfully stored sentiment")}
        }
      
    }
  } catch (e) {
    console.log("[Sentiment] => Error Failed to analyse sentiment " + e);
  }
};
