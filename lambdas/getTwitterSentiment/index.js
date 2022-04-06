const AWS = require("aws-sdk");

let comprehend = new AWS.Comprehend();
let documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // looping through added records
    const sentiments = await Promise.all(
      event.Records.slice(0,10).map(async (record)=>{
        if(record.eventName === "INSERT"){
          
        const {TweetId,content,region} = record.dynamodb.NewImage;
         const params = {
          Text: content.S,
          LanguageCode: "en",
        };
        const sentiment = await comprehend.detectSentiment(params).promise();
        return { TweetId:Number(TweetId.N), sentiment, region:region.S, timestamp: Date.now() };
        }
      }))
      sentiments.forEach(async ({ TweetId, sentiment, region, timestamp }) => {
      try {
        const params = {
          TableName: "TweetsSentiment",
          Item: {
            TweetId,
            sentiment,
            region,
            timestamp,
          },
        };
        const results = await documentClient.put(params).promise();
        console.log("Sentiment Stored for TweetId -> ", TweetId)
      } catch (error) {
        console.log("Database error", error);
      }});
      
  } catch (e) {
    console.log("[Sentiment] => Error Failed to analyse sentiment " + e);
  }
};
