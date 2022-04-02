import { uploadCovidData, uploadTwitterData } from "./dbHandlers";
import { CovidData, OpenDataAPI } from "./OpenDataApi";
import { REGIONS } from "./Regions";
import { TweetResponse, TwitterAPI } from "./TwitterAPI";
import {syntheticHanlder as syntheticHandler} from "./synthetic";

// main program runner
async function main(): Promise<void> {
  const T = new TwitterAPI();
  // fetching covid data for all regions
  const [covidENG, covidWLS, covidSCT, covidNIL]: CovidData[][] =
    await Promise.all(
      REGIONS.map((region) =>
        new OpenDataAPI(region.name, "nation").fetchData()
      )
    );
  // fetching tweets for each region
  const [tweetsENG, tweetsWLS, tweetsSCT, tweetsNIL]: TweetResponse[] =
    await Promise.all(
      REGIONS.map((region) => new TwitterAPI().fetchTweetsByLocation(region))
    );

    // ---uploading synthetic datasets to S3 bucket---
    // syntheticHandler();

  /* --- building datasets for each regions
     and storing uploading them to s3 bucket --- */
  // OpenDataAPI.buildDatasets(covidENG,"eng")
  // OpenDataAPI.buildDatasets(covidNIL,"nil")
  // OpenDataAPI.buildDatasets(covidWLS,"wls")
  // OpenDataAPI.buildDatasets(covidSCT,"sct")

  // --- storing tweets to dynamodb table ---
  const regionsTweets: TweetResponse[] = [tweetsENG, tweetsWLS, tweetsSCT, tweetsNIL];
  storeRegionsTweets(regionsTweets,T);

  // --- storing covid data for each region to dynamodb table ---
  // const covidDatasets:CovidData[][] = [covidENG, covidWLS, covidSCT, covidNIL];
  // storeRecordsToTable(covidDatasets);
}

main();

// stores each covid data into dynamodb table
function storeRecordsToTable(covidDatasets: CovidData[][]) {
  for (let dataset of covidDatasets) {
    dataset.map((data) => uploadCovidData(data));
    console.log(
      "[DynamoDB] => Stored Covid Data for region [" + dataset[0].region + "]"
    );
  }
}

function storeRegionsTweets(regionsTweets: TweetResponse[], T: TwitterAPI) {
  regionsTweets.forEach((tweets) => {
    T.uploadTweets(tweets);
    console.log("[DynamoDB] => Stored Tweets for region [" + tweets.region.name + "]");
  });
}
