//Import AWS
let AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const { datasetsHandler } = require("./database");
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // getting last 100 datapoints for each region
  const datasets = await datasetsHandler();

  //Parameters for calling endpoint
  let params = {
    EndpointName: `covid-${datasets[1].endpoint}-endpoint`,
    Body: JSON.stringify(datasets[1].data),
    ContentType: "application/json",
    Accept: "application/json",
  };
  //AWS class that will query endpoint
  let awsRuntime = new AWS.SageMakerRuntime({});
  awsRuntime.invokeEndpoint(params, (err, data) => {
    if (err) {
      console.error(
        "🚀 ~ file: index.js ~ line 22 ~ awsRuntime.invokeEndpoint ~ err",
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
      let responseData = JSON.parse(Buffer.from(data.Body).toString("utf8"));
      console.log(JSON.stringify(responseData));

      const dbParams = {
        TableName: "CovidPredictions",
        Item: {
          timestamp: Date.now(),
          region: datasets[1].region,
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
};
