
let AWS = require("aws-sdk");

//Create new DocumentClient
let documentClient = new AWS.DynamoDB.DocumentClient();


//Returns all of the connection IDs
module.exports.getTableData = async (tableName) => {
    try{
        
    let params = {
        TableName: tableName
    };
    const data = await documentClient.scan(params).promise();
    return data
    }catch(e){
        console.log("ERROR -> ", e);
        
    }
};

module.exports.queryTableData = async(tableName,partKey)=>{
    const params = {
      TableName: tableName,
      ExpressionAttributeNames: { "#region": "region", "#timestamp": "timestamp" }, // avoiding reserved keywords exceptions
      KeyConditionExpression: "#region = :rgn and #timestamp < :startDate",
      ExpressionAttributeValues: {
        ":rgn": partKey,
        ":startDate": Date.now(),
      },
      ScanIndexForward: true, // ascending order
    };
    
    const { Items: covidData } = await documentClient.query(params).promise();
    return covidData;
    
    
    
}

module.exports.queryTableWithLimit = async(tableName,partKey,limit)=>{
   const params = {
     TableName: tableName,
     IndexName: "region-timestamp-index",
     KeyConditionExpression: "#region = :pkey and #timestamp < :skey",
     ExpressionAttributeValues: {
       ":pkey": partKey,
       ":skey": Date.now(),
     },
     ExpressionAttributeNames: {
       "#region": "region",
       "#timestamp": "timestamp",
     },
     ScanIndexForward: true,
     Limit: limit,
   };

   const { Items: covidData } = await documentClient.query(params).promise();
   return covidData;
}

module.exports.queryPredictions = async(partKey)=>{
 const params = {
   TableName: "CovidPredictions",
   ExpressionAttributeNames: { "#region": "region", "#timestamp": "timestamp" }, // avoiding reserved keywords exceptions
   KeyConditionExpression: "#region = :rgn and #timestamp < :startDate",
   ExpressionAttributeValues: {
     ":rgn": partKey,
     ":startDate": Date.now(),
   },
   ScanIndexForward: false, // ascending order
   Limit:1,
 };

 const { Items: covidData } = await documentClient.query(params).promise();
 return covidData[0];


}

