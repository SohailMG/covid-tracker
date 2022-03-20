import { uploadCovidData } from "./dbHandlers";
import { CovidData, OpenDataAPI } from "./OpenDataApi";
import { REGIONS } from "./Regions";
import { TweetResponse, TwitterAPI } from "./TwitterAPI";

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


function storeRecordsToTable(covidDatasets: CovidData[][]) {
  for (let dataset of covidDatasets) {
    // plotlyHandler(covidENG);
    console.table(dataset);
    // dataset.map((data) => uploadCovidData(data));
    // console.log(
    //   "[DynamoDB] => Stored Covid Data for region [" + dataset[0].region + "]"
    // );
  }
}
