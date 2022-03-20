"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenDataAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const dbHandlers_1 = require("./dbHandlers");
const fileHandler_1 = require("./fileHandler");
/* OpenDataAPI class for fetching covid-19 numerical data for UK regions */
class OpenDataAPI {
    AREA_TYPE;
    AREA_NAME;
    BASEURL = "https://api.coronavirus.data.gov.uk/v1/data?";
    filters;
    structure;
    covidData = [];
    constructor(areaName, areaType) {
        this.AREA_NAME = areaName;
        this.AREA_TYPE = areaType;
        this.filters = [`areaType=${areaType}`, `areaName=${areaName}`];
        // structure of data returned
        this.structure = {
            date: "date",
            region: "areaName",
            cases: "newCasesByPublishDate",
            deaths: "newDeaths28DaysByPublishDate",
            dose1: "newPeopleVaccinatedFirstDoseByPublishDate",
            dose2: "newPeopleVaccinatedSecondDoseByPublishDate",
            booster: "newPeopleVaccinatedThirdInjectionByPublishDate",
        };
    }
    /**
     * makes a GET request to the OpenData API endpoint
     * for the specified region
     * @returns array of CovidData
     */
    async fetchData() {
        const url = this.urlBuilder();
        return axios_1.default
            .get(url)
            .then((response) => {
            const results = response.data;
            return results.data;
        })
            .then((data) => {
            this.covidData = data;
            return data;
        });
    }
    // builds api request url
    urlBuilder() {
        const apiParams = `filters=${this.filters.join(";")}&structure=${JSON.stringify(this.structure)}`;
        const encodedParams = encodeURI(apiParams);
        return this.BASEURL + encodedParams;
    }
    // fetch data last modified date
    async fetchDateModified() {
        return axios_1.default
            .get("https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=nation;areaName=wales&structure=%7B%22name%22:%22areaName%22%7D")
            .then((response) => {
            return response.headers.date;
        });
    }
    static buildDatasets(covidData, region) {
        // creating traiing dataset
        const trainSet = covidData.slice(100);
        const testSet = covidData.slice(0, 100);
        const trainCases = trainSet.map((data) => data.cases);
        const trainStartDate = (0, moment_1.default)(trainSet[trainSet.length - 1].date).format("YYYY-MM-DD hh:mm:ss");
        // creating testing dataset
        const testCases = covidData.map((data) => data.cases);
        const testStartDate = (0, moment_1.default)(covidData[covidData.length - 1].date).format("YYYY-MM-DD hh:mm:ss");
        const trainFileDate = {
            fileName: `./datasets/covid-${region.toLowerCase()}-train.json`,
            data: {
                start: trainStartDate,
                target: trainCases,
            },
        };
        const testFileDate = {
            fileName: `./datasets/covid-${region.toLowerCase()}-test.json`,
            data: {
                start: testStartDate,
                target: testCases,
            },
        };
        const testSetData = {
            fileName: `./datasets/covid-${region.toLowerCase()}.json`,
            data: {
                start: (0, moment_1.default)(testSet[testSet.length - 1].date).format("YYYY-MM-DD hh:mm:ss"),
                target: testSet.map((data) => data.cases),
            },
        };
        // storing data to file
        (0, fileHandler_1.writeToFile)(trainFileDate);
        (0, fileHandler_1.writeToFile)(testFileDate);
        (0, fileHandler_1.writeToFile)(testSetData);
        // uploading data to s3 bucket
        (0, dbHandlers_1.uploadToS3)(`cst3130-covid-${region}-dataset`, testFileDate.data, `covid-${region}-test.json`);
        (0, dbHandlers_1.uploadToS3)(`cst3130-covid-${region}-dataset`, trainFileDate.data, `covid-${region}-train.json`);
    }
}
exports.OpenDataAPI = OpenDataAPI;
