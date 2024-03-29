import React, { useState, useEffect, useRef, useCallback } from "react";
import Flags from "country-flag-icons/react/3x2";
import Logo from "./components/Logo";
import { GraphData } from "./resources/DataInterface";
import AWS from "aws-sdk";
import DataBox from "./components/DataBox";
import SentimentPie from "./components/SentimentPie";
import { SkeletonView } from "./components/SkeletonView";
import RegionGraph from "./components/RegionGraph";
import VaccinationsChart from "./components/VaccinationsChart";
import DeathsLineChart from "./components/DeathsLineChart";

AWS.config.update({
  region: "us-east-1",
  credentials: {
    accessKeyId: String(process.env.REACT_APP_aws_access_key_id),
    secretAccessKey: String(process.env.REACT_APP_aws_secret_access_key),
    sessionToken: String(process.env.REACT_APP_aws_session_token),
  },
});

const URL = "wss://4l9y6ww7j5.execute-api.us-east-1.amazonaws.com/prod";

function App() {
  const [graphData, setGraphData] = useState<any>({
    sentiment: null,
    predictions: null,
    covidData: null,
  });
  const [testData, settestData] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("England");
  const [ws, setWs] = useState(new WebSocket(URL));

  // requests data for given region
  function requestRegionData(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedRegion(e.target.value);
    // sending a request to apigateway w
    ws.send(JSON.stringify({ action: "dispatchData", data: e.target.value }));
  }

  useEffect(() => {
    // setting up websocket
    ws.onopen = () => {
      console.log("[WS] => WebSocket Connected ");
      ws.send(JSON.stringify({ action: "dispatchData", data: selectedRegion }));
    };

    // receiving data from websocket
    ws.onmessage = (message) => {
      // storing data in state
      const data = JSON.parse(message.data);
      console.log("[WS]=> Message received: ", data);
      const current = { ...graphData };
      const key = Object.keys(data)[0];
      current[key] = data[key];
      setGraphData(current);
      settestData((prev) => [...prev, data]);
    };

    return () => {
      ws.onclose = () => {
        console.log("WebSocket Disconnected");
        setWs(new WebSocket(URL));
      };
    };
  }, [ws.onmessage, ws.onopen, ws.onclose, ws, selectedRegion, graphData]);

  return (
    <div className="App bg-gray-800 min-h-screen">
      <header className="flex items-center p-4 justify-between">
        <div className="self-start">
          <Logo />
        </div>
        <h1 className="text-gray-200 text-xl">
          <b>Covid-19 </b>UK Overview
        </h1>
        {/* Dropdown menu */}
        <div className="relative inline-flex">
          <svg
            className="w-2 h-2 absolute top-0 right-0 m-4 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 412 232"
          >
            <path
              d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
              fill="#648299"
              fillRule="nonzero"
            />
          </svg>
          <select
            value={selectedRegion}
            onChange={(e) => requestRegionData(e)}
            className="border border-gray-700 rounded-full font-bold text-gray-200 h-10 pl-5 pr-10 bg-gray-800 hover:bg-gray-800 text-center focus:outline-none appearance-none"
          >
            <option value={"England"}>England 🏴󠁧󠁢󠁥󠁮󠁧󠁿</option>
            <option value={"Wales"}>Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿</option>
            <option value={"Scotland"}>Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿</option>
            <option value={"Northern Ireland"}>
              Northern Ireland 🏴󠁧󠁢󠁮󠁩󠁲󠁿
            </option>
          </select>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center p-4">
        {/* Top section charts */}
        {graphData.covidData ? (
          <div className="flex items-end space-x-2">
            {/* Daily deaths chart component */}
            <DataBox
              key={Math.random()}
              covidData={graphData?.covidData}
              color={"#ca0000c8"}
              dataVal={"daily_deaths"}
              label={"Total Deaths"}
            />
            {/* Sentiment pie chart */}
            {graphData.sentiment && (
              <SentimentPie
                key={Math.random()}
                sentiment={graphData?.sentiment}
              />
            )}
            {/* Daily cases chart component */}
            <DataBox
              key={Math.random()}
              covidData={graphData?.covidData}
              color={"#21BDD1"}
              dataVal={"daily_cases"}
              label={"Total Cases"}
            />
          </div>
        ) : (
          <SkeletonView />
        )}
        {/* Covid Cases & Predictions line chart */}
        {graphData.covidData && graphData.predictions && (
          <RegionGraph
            covidData={graphData?.covidData}
            predictions={
              JSON.parse(graphData?.predictions.predictions).predictions
            }
            key={Math.random()}
          />
        )}
        {/* Covid deaths line chart */}
        {graphData.covidData && (
          <DeathsLineChart
            covidData={graphData.covidData}
            key={Math.random()}
          />
        )}
        {/* Covid vaccines bubble chart */}
        {graphData.covidData && (
          <VaccinationsChart
            covidData={graphData.covidData}
            key={Math.random()}
          />
        )}
      </main>
    </div>
  );
}

export default App;
