import React, { useState, useEffect, useRef } from "react";
import Flags from "country-flag-icons/react/3x2";
import Logo from "./components/Logo";
import { GraphData } from "./utils/DataInterface";
import AWS from "aws-sdk";
import DataBox from "./components/DataBox";
type totals = { totalCases: number; totalDeaths: number };
AWS.config.update({
  region: "us-east-1",
  credentials: {
    accessKeyId: String(process.env.REACT_APP_aws_access_key_id),
    secretAccessKey: String(process.env.REACT_APP_aws_secret_access_key),
    sessionToken: String(process.env.REACT_APP_aws_session_token),
  },
});

function App() {
  const [covidData, setCovidData] = useState<any>([]);
  const [totalData, setTotalData] = useState<totals | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(
      "wss://0p40kzqqce.execute-api.us-east-1.amazonaws.com/prod"
    );
    ws.current.onopen = () => {
      console.log("ws opened");

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
    ws.current.onclose = () => console.log("ws closed");

    const wsCurrent = ws.current;

    return () => {
      wsCurrent.close();
    };
  }, []);

  useEffect(() => {
    if (!ws.current) return;
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log(
        "🚀 ~ file: App.tsx ~ line 48 ~ useEffect ~ message",
        message
      );
      setCovidData((prev: any) => [...prev, message]);
      console.log(covidData);
      const totals = getTotals(message);
      setTotalData(totals);
    };
  }, [covidData]);

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
    <div className="App">
      <header className="flex items-center p-4 justify-between">
        <div className="self-start">
          <Logo />
        </div>
        <h1 className="text-blue-800 text-xl">
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
              fill-rule="nonzero"
            />
          </svg>
          <select className="border border-gray-300 rounded-full font-bold text-gray-200 h-10 pl-5 pr-10 bg-blue-800 hover:border-gray-400 focus:outline-none appearance-none">
            <option>England</option>
            <option>Wales</option>
            <option>Scotland</option>
            <option>Northern Ireland</option>
          </select>
        </div>
      </header>
      {covidData && (
        <main className="flex items-center justify-center p-4">
          <div className="flex items-center">
            <DataBox
              label={"Total Cases"}
              color={"text-red-600"}
              totalData={totalData?.totalCases}
            />
            <hr className="w-32 border-dotted bg-red-800 " />
            <DataBox
              label={"Total Deaths"}
              color={"text-red-800"}
              totalData={totalData?.totalDeaths}
            />
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
