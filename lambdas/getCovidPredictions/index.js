//Import AWS
let AWS = require("aws-sdk");
const { datasetsHandler } = require("./database");
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  if (event.Records[0].eventName === "INSERT") {
    
    const updatedRegion = event.Records[0].dynamodb.NewImage.region.S;
    // checking which region has been updated
    const datasets = await datasetsHandler();
    // extracting sagemaker endpoint for updated region
    const dataset = (datasets.find((dataset) => dataset.region.toLowerCase() === updatedRegion.toLowerCase()));
    //Parameters for calling endpoint
    const params = {
      EndpointName: `covid-${dataset.endpoint}-endpoint`,
      Body: JSON.stringify(dataset.data),
      ContentType: "application/json",
      Accept: "application/json",
    };
    
    //AWS class that will query endpoint
    let awsRuntime = new AWS.SageMakerRuntime({});
    awsRuntime.invokeEndpoint(params, (err, data) => {
      console.log("DATATATA")
      if (err) {
        console.log(
          "file: index.js ~ line 22 ~ awsRuntime.invokeEndpoint ~ err",
          err
          );
        //Return error response
        const response = {
          statusCode: 500,
          body: JSON.stringify("ERROR: " + JSON.stringify(err)),
        };
        return response;
      } else {
        //Successful response
        //Convert response data to JSON
        const responseData = JSON.parse(Buffer.from(data.Body).toString("utf8"));

        const dbParams = {
          TableName: "CovidPredictions",
          Item: {
            timestamp: Date.now(),
            region: dataset.region,
            predictions: JSON.stringify(responseData),
          },
        };
        
        // storing prediction into database
        docClient.put(dbParams, function (err, data) {
          if (err) return { statusCode: 500, body: "Database error" };

          const response = {
            statusCode: 200,
            body: JSON.stringify("Predictions stored."),
          };

          return response;
        });

        return { statusCode: 200, body: "Predictions stored" };
      }
    });
  }
};
