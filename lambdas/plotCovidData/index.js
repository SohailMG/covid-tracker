const AWS = require("aws-sdk");
const {plotlyHandler} = require("./plotData.js")

exports.handler = async (event) => {

console.log(JSON.stringify(event))
    // extract newly added predictions from event object
    const predictions = event.Records[0].dynamodb.NewImage.predictions.S;
    const {mean,quantiles,samples} = (JSON.parse(predictions)).predictions[0]
    const preds = [mean,quantiles["0.9"],quantiles["0.1"]]
    // plot data in graph
    const res = await plotlyHandler(preds);
    console.log(res);

    const response = {
        statusCode: 200,
        body: JSON.stringify(res),
    };
    return response;
};
