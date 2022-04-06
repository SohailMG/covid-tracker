const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const moment = require("moment");
const docClient = new AWS.DynamoDB.DocumentClient();

const regions = ["England", "Wales", "Scotland", "Northern Ireland"];

module.exports.datasetsHandler = async () => {
  // query the last 200 data points from each region
  const testDatasets = await getTestData();
  // building request body for each dataset
  const [eng, wls, sct, nil] = buildDatasets(testDatasets);

  return [
    { data: eng, endpoint: "eng", region: "England" },
    { data: wls, endpoint: "wls", region: "Wales" },
    { data: sct, endpoint: "sct", region: "Scotland" },
    { data: nil, endpoint: "nil", region: "Norther Ireland" },
  ];
};
// builds request body for given dataset to generate predictions
function buildDatasets(testDatasets) {
  try {
    return testDatasets.map((dataset) => {
      const target = dataset.map((data) => data.daily_cases);
      const startDate = moment
        .unix(dataset[dataset.length - 1].timestamp)
        .format("YYYY-MM-DD hh:mm:ss");

      const endpointData = {
        instances: [{ start: startDate, target: [...target].reverse() }],
        configuration: {
          num_samples: 50,
          output_types: ["mean", "quantiles", "samples"],
          quantiles: ["0.1", "0.9"],
        },
      };

      return endpointData;
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: database.js ~ line 44 ~ buildDatasets ~ error",
      error
    );
  }
}

// retrieves the last 200 data points for each region
async function getTestData() {
  return await Promise.all(
    regions.map(async (region) => {
      const params = {
        TableName: "CovidStats",
        ExpressionAttributeNames: {
          "#region": "region",
          "#timestamp": "timestamp",
        },
        KeyConditionExpression: "#region = :rgn and #timestamp < :startDate",
        ExpressionAttributeValues: {
          ":rgn": region.toLowerCase(),
          ":startDate": Date.now(),
        },
        ScanIndexForward: false,
        Limit: 200, // ascending order
      };

      const { Items: covidData } = await docClient.query(params).promise();
      return covidData;
    })
  );
}
