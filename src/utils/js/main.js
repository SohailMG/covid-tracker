"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OpenDataApi_1 = require("./OpenDataApi");
const Regions_1 = require("./Regions");
const TwitterAPI_1 = require("./TwitterAPI");
// main program runner
async function main() {
    const T = new TwitterAPI_1.TwitterAPI();
    // fetching covid data for all regions
    const [covidENG, covidWLS, covidSCT, covidNIL] = await Promise.all(Regions_1.REGIONS.map((region) => new OpenDataApi_1.OpenDataAPI(region.name, "nation").fetchData()));
    // fetching tweets for each region
    const [tweetsENG, tweetsWLS, tweetsSCT, tweetsNIL] = await Promise.all(Regions_1.REGIONS.map((region) => new TwitterAPI_1.TwitterAPI().fetchTweetsByLocation(region)));
    /* building datasets for each regions
       and storing uploading them to s3 bucket */
    // OpenDataAPI.buildDatasets(covidENG,"eng")
    // OpenDataAPI.buildDatasets(covidNIL,"nil")
    // OpenDataAPI.buildDatasets(covidWLS,"wls")
    // OpenDataAPI.buildDatasets(covidSCT,"sct")
    // T.extractTweets(tweetsNIL);
    const covidDatasets = [covidENG, covidWLS, covidSCT, covidNIL];
    // storeRecordsToTable(covidDatasets);
}
main();
function storeRecordsToTable(covidDatasets) {
    for (let dataset of covidDatasets) {
        // plotlyHandler(covidENG);
        console.table(dataset);
        // dataset.map((data) => uploadCovidData(data));
        // console.log(
        //   "[DynamoDB] => Stored Covid Data for region [" + dataset[0].region + "]"
        // );
    }
}