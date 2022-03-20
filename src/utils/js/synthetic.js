"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const dbHandlers_1 = require("./dbHandlers");
const fileHandler_1 = require("./fileHandler");
const MY_SID = "M00716650";
const DatasetURI = "https://kdnuy5xec7.execute-api.us-east-1.amazonaws.com/prod/";
const endPoint = "synth-1-endpoint";
const predictions = (async () => {
    const dataset = (await axios_1.default.get(DatasetURI + MY_SID)).data;
    buildDatasets(dataset);
    const testSetData = await (0, fileHandler_1.getFileData)("synth_test.json");
    const trainSetData = await (0, fileHandler_1.getFileData)("synth_train.json");
    (0, dbHandlers_1.uploadToS3)("cst3130-synthetic-dataset", testSetData, "synth_test.json");
    (0, dbHandlers_1.uploadToS3)("cst3130-synthetic-dataset", trainSetData, "synth_train.json");
    // const xVals = target.map((val: number, i: number) => i);
    // const plotlyResults = await plotData(MY_SID, xVals, target);
    // console.log(plotlyResults)
    // const testSet = getFileData("synthetic_test.json");
})();
function buildDatasets(dataset) {
    const { start, target } = dataset;
    const trainSet = { start, target: target.slice(0, 400) };
    const testStartDate = (0, moment_1.default)(start)
        .add(400, "h")
        .format("YYYY-MM-DD hh:mm:ss");
    const testSet = { start: testStartDate, target: target.slice(400) };
    (0, fileHandler_1.writeToFile)({ fileName: "./datasets/synth_test.json", data: testSet });
    (0, fileHandler_1.writeToFile)({ fileName: "./datasets/synth_train.json", data: trainSet });
}
function getPredictions(data) {
    const endPointData = {
        instances: [data],
        configuration: {
            num_samples: 50,
            output_types: ["mean", "quantiles", "samples"],
            quantiles: ["0.1", "0.9"],
        },
    };
}
