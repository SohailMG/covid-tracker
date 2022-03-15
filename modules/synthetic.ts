import axios from "axios";
import moment from "moment";
import { uploadToS3 } from "./dbHandlers";
import { getFileData, writeToFile } from "./fileHandler";
import { plotData } from "./graphPlotter";
import { Dataset } from "./ML";
const MY_SID = "M00716650";
const DatasetURI =
  "https://kdnuy5xec7.execute-api.us-east-1.amazonaws.com/prod/";
const endPoint = "synth-1-endpoint";

const predictions = (async () => {
  const dataset = (await axios.get(DatasetURI + MY_SID)).data;
  buildDatasets(dataset);
  const testSetData = await getFileData("synth_test.json");
  const trainSetData = await getFileData("synth_train.json");
  uploadToS3("cst3130-synthetic-dataset",testSetData,"synth_test.json");
  uploadToS3("cst3130-synthetic-dataset", trainSetData, "synth_train.json");
  // const xVals = target.map((val: number, i: number) => i);
  // const plotlyResults = await plotData(MY_SID, xVals, target);
  // console.log(plotlyResults)
  // const testSet = getFileData("synthetic_test.json");
})();

function buildDatasets(dataset: Dataset) {
  const { start, target } = dataset;
  const trainSet: Dataset = { start, target: target.slice(0, 400) };

  const testStartDate = moment(start)
    .add(400, "h")
    .format("YYYY-MM-DD hh:mm:ss");
  const testSet: Dataset = { start: testStartDate, target: target.slice(400) };

  writeToFile({ fileName: "./datasets/synth_test.json", data: testSet });
  writeToFile({ fileName: "./datasets/synth_train.json", data: trainSet });
}

function getPredictions(data: Dataset) {
  const endPointData = {
    instances: [data],
    configuration: {
      num_samples: 50,
      output_types: ["mean", "quantiles", "samples"],
      quantiles: ["0.1", "0.9"],
    },
  };
}


