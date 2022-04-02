import axios from "axios";
import moment from "moment";
import { uploadToS3 } from "./dbHandlers";
import { getFileData, writeToFile } from "./fileHandler";
const MY_SID = "M00716650";
const DatasetURI =
  "https://kdnuy5xec7.execute-api.us-east-1.amazonaws.com/prod/";
const endPoint = "synth-1-endpoint";

export interface Dataset {
  start: string | number;
  target: number[];
}
/** fetches synthetic dataset, constructs a test and train datasets
 * then uploads the datasets to s3 bucket
*/
export const syntheticHanlder = async () => {
  // fetching dataset
  const dataset = (await axios.get(DatasetURI + MY_SID)).data;
  // building test and train sets
  buildDatasets(dataset);
  // getting test and train sets from local files
  const testSetData = await getFileData("synth_test.json");
  const trainSetData = await getFileData("synth_train.json");
  // uploading test and train sets to S3 bucket
  uploadToS3("cst3130-synthetic-dataset", testSetData, "synth_test.json");
  uploadToS3("cst3130-synthetic-dataset", trainSetData, "synth_train.json");

};

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
