//Import AWS
const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const { default: axios } = require("axios");
const moment = require("moment");
const { plotlyHandler } = require("./plotter");
const MY_SID = "M00716650";
const URL = "https://kdnuy5xec7.execute-api.us-east-1.amazonaws.com/prod/";
const docClient = new AWS.DynamoDB.DocumentClient();

//AWS class that will query endpoint
let awsRuntime = new AWS.SageMakerRuntime({});

//Handler for Lambda function
exports.handler = async (event) => {

    // fetching dataset
  const { start, target } = (await axios.get(URL + MY_SID)).data;
  const startDate = moment(start)
    .add(target.length - 100, "h")
    .format("YYYY-MM-DD hh:mm:ss");
    // extracting the last 100 datapoints
  const dataset = target.slice(target.length - 100);

  const endpointData = {
    instances: [{ start: startDate, target: dataset }],
    configuration: {
      num_samples: 50,
      output_types: ["mean", "quantiles", "samples"],
      quantiles: ["0.1", "0.9"],
    },
  };
  const params = {
    EndpointName: "synth-1-endpoint",
    Body: JSON.stringify(endpointData),
    ContentType: "application/json",
    Accept: "application/json",
  };

  //Call endpoint and handle response
  awsRuntime.invokeEndpoint(params, (err, data) => {
    if (err) {
      //An error occurred
      console.log(err, err.stack);

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
      plotlyHandler(target, responseData.predictions);

      return { statusCode: 200, body: "Predictions stored" };
    }
  });
};
