"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterAPI = void 0;
const twit_1 = __importDefault(require("twit"));
require("dotenv/config");
const moment_1 = __importDefault(require("moment"));
const dbHandlers_1 = require("./dbHandlers");
class TwitterAPI {
    T;
    tweets = [];
    constructor() {
        this.T = new twit_1.default({
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
    async fetchTweetsByLocation(region) {
        return this.T.get("search/tweets", {
            q: "covid",
            count: 50,
            geocode: `${region.coords.lat},${region.coords.lng},${region.coords.radius}`,
        })
            .then((response) => {
            const results = response.data;
            const tweets = { results, region };
            return tweets;
        })
            .catch((err) => {
            throw err;
        });
    }
    /**
     * loops through array of tweets
     * @param tweets response object of Twitter API
     */
    extractTweets(tweets) {
        tweets.results.statuses.forEach((tweet) => {
            // destructured tweet object
            const { text, id, created_at } = tweet;
            // converting string date to unix timestamp
            const timestamp = (0, moment_1.default)(new Date(created_at)).unix();
            // uploading tweets to database table
            const regionName = tweets.region.name.replace("+", " ");
            (0, dbHandlers_1.uploadTwitterData)({
                text,
                id,
                created_at,
                timestamp,
                region: regionName,
            });
        });
    }
}
exports.TwitterAPI = TwitterAPI;
