//Import AWS
let AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

//Data that we are going to send to endpoint
//REPLACE THIS WITH YOUR OWN DATA!
let endpointData = {
  instances: [
    {"start":"2020-04-18 08:00:00","target":[269.88629930082146,277.6629786766726,272.2268176553568,284.57759763802653,274.258419938039,276.38031468976135,293.4747860588892,288.9468466930741,305.2295200894599,317.23964803906046,301.61705826792286,306.5301536316281,328.97485714389654,336.8987454544306,321.1242587252202,322.9917229910615,312.06521723352625,307.0728004068291,299.96204371560077,324.2992548819722,313.6909611322826,293.49126228533316,290.8971926937398,284.5549067029409,301.1672947714264,295.96950657060756,283.7755519066919,301.93966642467416,298.1383574595444,311.09067772121443,312.3892474303323,300.7585156423752,310.24602754075363,307.39615750224124,326.7108300131593,320.86441919408253,324.34117030980156,333.6828434797676,337.51833711688914,348.96133312555395,345.9400825477949,329.0500455323502,319.4397578319259,332.7586339511322,327.3585910589942,320.52172286299015,318.18906625685526,306.7711171227853,314.23914546674143,288.4147923138318,293.54938312152126,292.8824394322077,312.1734629715166,322.9905807372562,321.07449641699634,325.6836079556087,313.02097179988004,319.3226544365954,319.71691806331756,332.70051860108975,357.812196837014,330.4507519413401,340.7953921966408,356.30914495246924,335.58564927994973,349.3218957088648,342.7566309709484,333.4846351145179,335.4715453091141,326.8732669131146,328.15291163730865,309.8009067871536,310.82434438311725,304.5930108459111,307.21798551302055,309.11247523546444,303.700151061746,308.92529574029294,309.3164471608797,321.7090699992883,350.4061128906526,343.4084760971524,351.01081027165424,341.34934352082183,366.06588697626546,341.50408573661025,366.7864284785002,367.225616692365,354.88032755668695,369.85280305200666,349.74575814375106,348.3328236520074,328.3824536550358,333.0400742843455,339.2031565942863,337.52504081269063,326.18466719400766,319.77644389090693,326.4925451333638,322.63906752998116]}
  ],
  configuration: {
    num_samples: 50,
    output_types: ["mean", "quantiles", "samples"],
    quantiles: ["0.1", "0.9"],
  },
};

//Name of endpoint
//REPLACE THIS WITH THE NAME OF YOUR ENDPOINT
const endpointName = "synth-2-endpoint";

//Parameters for calling endpoint
let params = {
  EndpointName: endpointName,
  Body: JSON.stringify(endpointData),
  ContentType: "application/json",
  Accept: "application/json",
};

//AWS class that will query endpoint
let awsRuntime = new AWS.SageMakerRuntime({});

//Handler for Lambda function
exports.handler = (event) => {
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
      console.log(JSON.stringify(responseData));

      let dbParams = {
        TableName: "SyntheticPredictions",
        Item: {
          timestamp: Date.now(),
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
      
      return {statusCode:200,body:"Predictions stored"}
    }
  });
};
