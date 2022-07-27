"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbHandlers_1 = require("./dbHandlers");
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
    // ---uploading synthetic datasets to S3 bucket---
    // syntheticHandler();
    /* UNCOMMENT -> to build datasets for each regions
       and storing uploading them to s3 bucket */
    /* OpenDataAPI.buildDatasets(covidENG,"eng")
       OpenDataAPI.buildDatasets(covidNIL,"nil")
       OpenDataAPI.buildDatasets(covidWLS,"wls")
       OpenDataAPI.buildDatasets(covidSCT,"sct") */
    // UNCOMMENT -> to upload all tweets data to dynamodb table
    /* const regionsTweets: TweetResponse[] = [tweetsENG, tweetsWLS, tweetsSCT, tweetsNIL];
      storeRegionsTweets(regionsTweets,T); */
    T.uploadTweets(tweetsSCT);
    // UNCOMMENT -> to upload a single tweet
    /* uploadTwitterData({
       text: "Covid-19 is getting better and better here in scotland",
       id: 22113322,
       created_at: "2020-04-01T12:00:00Z",
       timestamp: 1586233600,
       region: "scotland",
     }); */
    // UNCOMMENT -> to stor covid data for each region to dynamodb table
    /* const covidDatasets:CovidData[][] = [covidENG, covidWLS, covidSCT, covidNIL];
       storeRecordsToTable(covidDatasets); */
}
main();
// stores each covid data into dynamodb table
function storeRecordsToTable(covidDatasets) {
    for (let dataset of covidDatasets) {
        dataset.map((data) => (0, dbHandlers_1.uploadCovidData)(data));
        console.log("[DynamoDB] => Stored Covid Data for region [" + dataset[0].region + "]");
    }
}
// stores each tweet data into dynamodb table
function storeRegionsTweets(regionsTweets, T) {
    regionsTweets.forEach((tweets) => {
        T.uploadTweets(tweets);
        console.log("[DynamoDB] => Stored Tweets for region [" + tweets.region.name + "]");
    });
}
