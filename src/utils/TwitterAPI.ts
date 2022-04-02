import Twit, { Response } from "twit";
import "dotenv/config";
import moment from "moment";
import { RegionData } from "./Regions";
import { uploadTwitterData } from "./dbHandlers";

/* Interface of twitterApi response */
// type Location = {}
export interface Tweet {
  text: string;
  id: number;
  created_at: string;
  timestamp: number;
  region: string;
}
export interface Tweets {
  statuses: Array<Tweet>;
}
export interface TweetResponse {
  results: Tweets;
  region: RegionData;
}

export class TwitterAPI {
  T: Twit;
  tweets: Array<string> = [];

  constructor() {
    this.T = new Twit({
      consumer_key: String(process.env.REACT_APP_TWITTER_CONSUMER_KEY),
      consumer_secret: String(process.env.REACT_APP_TWITTER_API_SECRET),
      access_token: String(process.env.REACT_APP_TWITTER_ACCESS_TOKEN),
      access_token_secret: String(process.env.REACT_APP_TWITTER_ACCESS_SECRET),
      timeout_ms: 0,
      strictSSL: true,
    });
  }

  /**
   * searches tweets related to covid in a given region
   * @param location geocode of region includes lat and lng
   * @returns TwitterAPI response object
   */
  async fetchTweetsByLocation(region: RegionData): Promise<TweetResponse> {
    return this.T.get("search/tweets", {
      q: "covid",
      count: 50,
      geocode: `${region.coords.lat},${region.coords.lng},${region.coords.radius}`,
    })
      .then((response: { data: any }) => {
        const results: any = response.data;
        const tweets: TweetResponse = { results, region };
        return tweets;
      })
      .catch((err: any) => {
        throw err;
      });
  }

  /**
   * loops through array of tweets
   * @param tweets response object of Twitter API
   */
   uploadTweets(tweets: TweetResponse) {
    tweets.results.statuses.forEach((tweet) => {
      // destructured tweet object
      const { text, id, created_at } = tweet;
      // converting string date to unix timestamp
      const timestamp = moment(new Date(created_at)).unix();
      // uploading tweets to database table
      const regionName = tweets.region.name.replace("+", " ");

      uploadTwitterData({
        text,
        id,
        created_at,
        timestamp,
        region: regionName,
      });
    });
  }
}
