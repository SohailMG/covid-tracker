const AWS = require("aws-sdk");
const buildPredictionData = require("./plotData.js")

exports.handler = async (event) => {
    
    console.log(JSON.stringify(event));
    
    const predictions = event.Records[0].dynamodb.NewImage.predictions.S;
    const {mean,quantiles,samples} = (JSON.parse(predictions)).predictions[0]
    const preds = [mean,quantiles["0.9"],quantiles["0.1"]]
    const res = await buildPredictionData(preds);
    console.log(res);


    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
