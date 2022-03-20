import React, { useState, useEffect, useRef } from "react";
import Flags from "country-flag-icons/react/3x2";
import Logo from "./components/Logo";
import { GraphData } from "./utils/DataInterface";
import AWS from "aws-sdk";
import DataBox from "./components/DataBox";
import Skeleton from "react-loading-skeleton";
import SentimentPie from "./components/SentimentPie";
import { SkeletonView } from "./components/SkeletonView";
import RegionGraph from "./components/RegionGraph";
type totals = { totalCases: number; totalDeaths: number };
type SetType = {
  [key: string]: any;
};
AWS.config.update({
  region: "us-east-1",
  credentials: {
    accessKeyId: String(process.env.REACT_APP_aws_access_key_id),
    secretAccessKey: String(process.env.REACT_APP_aws_secret_access_key),
    sessionToken: String(process.env.REACT_APP_aws_session_token),
  },
});

function App() {
  const [graphData, setGraphData] = useState<any>([]);
  const [totalData, setTotalData] = useState<totals | null>(null);
  const [mySet, setMySet] = useState<SetType[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("Scotland");
  const ws = useRef<WebSocket | null>(null);

  // requests data for given region
  function requestRegionData(e: React.ChangeEvent<HTMLSelectElement>) {
    setGraphData([]);
    setSelectedRegion(e.target.value);
    ws.current!.send(
      JSON.stringify({ action: "dispatchData", data: e.target.value })
    );
    ws.current!.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setGraphData((prev: any) => [...prev, message]);
    };
  }

  useEffect(() => {
    ws.current = new WebSocket(
      "wss://0p40kzqqce.execute-api.us-east-1.amazonaws.com/prod"
    );
    ws.current.onopen = () => {
      console.log("[WS] => Connection opened");

      let time = 1;
      const timeValue = setInterval(() => {
        time = time - 1;
        if (time <= 0) {
          clearInterval(timeValue);
        }
        ws.current!.send(
          JSON.stringify({ action: "dispatchData", data: "Scotland" })
        );
      }, 1000);
    };
    ws.current.onclose = () => console.log("[WS] => Connection closed");

    const wsCurrent = ws.current;

    return () => {
      wsCurrent.close();
    };
  }, []);

  useEffect(() => {
    if (!ws.current) return;
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log("[WS] => Message recieved from Api ", message);
      setGraphData((prev: any) => [...prev, message]);
      const totals = getTotals(message);
      setTotalData(totals);
    };
  }, [graphData]);

  function getTotals(data: GraphData) {
    const totalCases = data.covidData.reduce((prev, cur) => {
      return prev + cur.daily_cases;
    }, 0);
    const totalDeaths = data.covidData.reduce((prev, cur) => {
      return prev + cur.daily_deaths;
    }, 0);
    return { totalCases, totalDeaths };
  }

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
            <option>England</option>
            <option>Wales</option>
            <option>Scotland</option>
            <option>Northern Ireland</option>
          </select>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center p-4">
        {graphData.length > 2 ? (
          <div className="flex items-end space-x-2">
            <DataBox
              key={1}
              dataVal={"daily_cases"}
              covidData={[...graphData[2].covidData].reverse()}
              label={"Total Cases"}
              color={"#1E41AF"}
              totalData={totalData?.totalCases}
            />
            {graphData.length > 1 && (
              <SentimentPie sentiment={graphData[0].sentiment} />
            )}
            <DataBox
              key={2}
              dataVal={"daily_deaths"}
              covidData={[...graphData[2].covidData].reverse()}
              label={"Total Deaths"}
              color={"#ca0000c8"}
              totalData={totalData?.totalDeaths}
            />
          </div>
        ) : (
          <SkeletonView />
        )}

        {/* line graph visual */}
        {graphData.length > 2 && (
          <RegionGraph
            predictions={
              JSON.parse(graphData[1].predictions.predictions).predictions
            }
            covidData={graphData[2].covidData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
