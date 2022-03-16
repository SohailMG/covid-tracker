import axios from "axios";
import moment from "moment";
import { uploadToS3 } from "./dbHandlers";
import { FileData, writeToFile } from "./fileHandler";
/* Interface for data types fetched from API server */
export interface CovidData {
  date: number | string;
  region: string;
  cases: number;
  deaths: number | null;
  dose1: number | null;
  dose2: number | null;
  booster: number | null;
}

/* OpenDataAPI class for fetching covid-19 numerical data for UK regions */
export class OpenDataAPI {
  AREA_TYPE: string;
  AREA_NAME: string;
  BASEURL: string = "https://api.coronavirus.data.gov.uk/v1/data?";
  filters: string[];
  structure: any;
  covidData: Array<CovidData> = [];

  constructor(areaName: string, areaType: string) {
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
  async fetchData(): Promise<CovidData[]> {
    const url: string = this.urlBuilder();
    return axios
      .get(url)
      .then((response) => {
        const results: any = response.data;
        return results.data;
      })
      .then((data) => {
        this.covidData = data;
        return data;
      });
  }

  // builds api request url
  urlBuilder(): string {
    const apiParams: string = `filters=${this.filters.join(
      ";"
    )}&structure=${JSON.stringify(this.structure)}`;
    const encodedParams: string = encodeURI(apiParams);

    return this.BASEURL + encodedParams;
  }

  // fetch data last modified date
  async fetchDateModified(): Promise<string> {
    return axios
      .get(
        "https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=nation;areaName=wales&structure=%7B%22name%22:%22areaName%22%7D"
      )
      .then((response) => {
        return response.headers.date;
      });
  }

  public static buildDatasets(covidData: CovidData[], region: string) {
    // creating traiing dataset
    const trainSet = covidData.slice(100);
    const testSet = covidData.slice(0, 100);
    const trainCases = trainSet.map((data) => data.cases);
    const trainStartDate = moment(trainSet[trainSet.length - 1].date).format(
      "YYYY-MM-DD hh:mm:ss"
    );
    // creating testing dataset
    const testCases = covidData.map((data) => data.cases);
    const testStartDate = moment(covidData[covidData.length - 1].date).format(
      "YYYY-MM-DD hh:mm:ss"
    );

    const trainFileDate: FileData = {
      fileName: `./datasets/covid-${region.toLowerCase()}-train.json`,
      data: {
        start: trainStartDate,
        target: trainCases,
      },
    };
    const testFileDate: FileData = {
      fileName: `./datasets/covid-${region.toLowerCase()}-test.json`,
      data: {
        start: testStartDate,
        target: testCases,
      },
    };

    const testSetData: FileData = {
      fileName: `./datasets/covid-${region.toLowerCase()}.json`,
      data: {
        start: moment(testSet[testSet.length - 1].date).format(
          "YYYY-MM-DD hh:mm:ss"
        ),
        target: testSet.map((data) => data.cases),
      },
    };

    // storing data to file
    writeToFile(trainFileDate);
    writeToFile(testFileDate);
    writeToFile(testSetData);

    // uploading data to s3 bucket
    uploadToS3(
      `cst3130-covid-${region}-dataset`,
      testFileDate.data,
      `covid-${region}-test.json`
    );
    uploadToS3(
      `cst3130-covid-${region}-dataset`,
      trainFileDate.data,
      `covid-${region}-train.json`
    );
  }
}
