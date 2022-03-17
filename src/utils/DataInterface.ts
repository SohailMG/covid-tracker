import { Predictions } from "aws-sdk/clients/forecastqueryservice";

export interface CovidData {
  timestamp: number;
  region: string;
  daily_cases: number;
  daily_deaths: number;
  dose1: number | null;
  dose2: number | null;
}
interface SentScore {
  Mixed: number;
  Negative: number;
  Neutral: number;
  Positive: number;
}
export interface Sentiment {
  Sentiment: string;
  SentimentScore: SentScore;
}
export interface TwitterSentiment {
  timestamp: number;
  region: string;
  sentiment: Sentiment;
}
type Quantiles = { "0.1": number[]; "0.9": number[] };
export interface _Predictions {
  mean: number[];
  quantiles: Quantiles;
  samples: number[];
}
export interface CovidPredictions {
  region: string;
  timestamp: number;
  predictions: _Predictions;
}

export interface GraphData {
  covidData: CovidData[];
  predictions: CovidPredictions;
  sentiment: TwitterSentiment[];
}
