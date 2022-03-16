const AWS = require("aws-sdk");
const moment = require("moment");
const PLOTLY_UN = "SohailMG";
const PLOTLY_KEY = "3GGD83RZEgeALjRcw1lj";
const P = require("plotly")(PLOTLY_UN, PLOTLY_KEY);
const docClient = new AWS.DynamoDB.DocumentClient();

const titles = ["mean", "Predictions - 0.9", "Predictions - 0.1"];
const colors = ["#BEF4D7", "#ff0f2f", "#0fff5b"];

const params = {
  TableName: "CovidStats",
  ExpressionAttributeNames: { "#region": "region", "#timestamp": "timestamp" }, // avoiding reserved keywords exceptions
  KeyConditionExpression: "#region = :rgn and #timestamp < :startDate",
  ExpressionAttributeValues: {
    ":rgn": "Wales",
    ":startDate": Date.now(),
  },
  ScanIndexForward: true, // ascending order
};
module.exports.plotlyHandler = async (predictions) => {
  const { Items: covidData } = await docClient.query(params).promise();
  const dataset = covidData.map((data) => data.daily_cases);
  const startDate = moment
    .unix(covidData[0].timestamp)
    .format("YYYY-MM-DD hh:mm:ss");
  // graph options of original dataset
  const originalGraphData = buildOriginalData(dataset);
  // graph options of predictions
  const predictionGraphData = predictions.map((data, i) => {
    const xVals = [...dataset, ...data].map((x, i) => i);
    const yVals = [...dataset, ...data];
    return {
      x: xVals,
      y: yVals,
      type: "scatter",
      mode: "line",
      name: titles[i],
      marker: {
        color: colors[i],
        side: 12,
      },
    };
  });
  const plotlyObj = await plotData([...predictionGraphData,originalGraphData],graphOptions);

  return plotlyObj
};

async function plotData(data, graphOptions) {
  return new Promise((resolve, reject) => {
    P.plot(data, graphOptions, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function buildOriginalData(dataset) {
  const xVals = dataset.map((data, i) => i);
  const yVals = dataset;

  const data = {
    x: xVals,
    y: yVals,
    type: "scatter",
    mode: "line",
    name: "Original",
    marker: {
      color: "#159FFF",
      side: 12,
    },
  };
  return data;
}

const layout = {
  title: "Covid data for" + "England",
  font: {
    size: 25,
  },
  xaxis: {
    title: "Date (Days) ",
  },
  yaxis: {
    title: "Value",
  },
};
const graphOptions = {
  layout: layout,
  filename: "date-axes",
  fileopt: "overwrite",
};
