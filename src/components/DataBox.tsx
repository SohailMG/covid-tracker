import React, { ReactPropTypes, useEffect, useState } from "react";
import { LineChart, Line, Tooltip, AreaChart, Area } from "recharts";
import { CovidTableData } from "../utils/DataInterface";
import { CovidData } from "../utils/OpenDataApi";
import moment from "moment";

type Props = {
  totalData: number | undefined;
  label: string;
  color: string;
  dataVal: string;
  covidData: CovidTableData[];
};

function DataBox({ totalData, label, color, covidData, dataVal }: Props) {
  const [days, setDays] = useState(10);
  const [options, setOptions] = useState<number[]>([]);

  const graphData = covidData.map(
    ({ daily_cases, timestamp, daily_deaths }) => ({
      name: moment.unix(timestamp).format("yyyy-mm-dd"),
      daily_cases,
      daily_deaths,
    })
  );

  useEffect(() => {
    const totalDays = Number((covidData.length / 10).toFixed());
    const options = new Array(totalDays)
      .fill(0)
      .map((_, index: number) => (index + 1) * 10);
    console.log(totalDays);
    setOptions(options);
  }, [covidData.length]);

  return (
    <div className="flex flex-col items-center border border-dotted border-gray-700 shadow-md rounded-md overflow-hidden">
      <h1 className={`font-bold text-lg`} style={{ color: color }}>
        {label}
      </h1>
      <h1 className="text-gray-200 font-extrabold text-xl">
        {totalData?.toLocaleString()}
      </h1>
      <div className="flex mt-2 space-x-1">
        <label htmlFor="days" className="text-gray-400 text-sm">
          Last{" "}
        </label>
        <select
          className="border-2 border-dotted border-gray-400 rounded-md"
          id="days"
          onChange={(e) => setDays(Number(e.target.value))}
        >
          {options.map((num) => (
            <option className="font-semibold text-sm text-center" value={num}>
              {num}
            </option>
          ))}
        </select>
        <label htmlFor="days" className="text-gray-400 text-sm">
          Days{" "}
        </label>
      </div>

      <AreaChart
        width={200}
        height={100}
        data={graphData.slice(0, days)}
        margin={{
          top: 5,
          right: 0,
          left: 0,
        }}
      >
        <Area type="monotone" dataKey={dataVal} stroke={color} fill={color} />
      </AreaChart>
    </div>
  );
}

export default DataBox;
