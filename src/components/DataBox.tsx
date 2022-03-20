import React, { ReactPropTypes, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { CovidTableData } from "../utils/DataInterface";
import { CovidData } from "../utils/OpenDataApi";
import { MdCoronavirus } from "react-icons/md";
import { IoSkullSharp } from "react-icons/io5";
import CountUp from "react-countup";
import moment from "moment";

type Props = {
  totalData: number | undefined;
  label: string;
  color: string;
  dataVal: string;
  covidData: CovidTableData[];
};

function DataBox({ totalData, label, color, covidData, dataVal }: Props) {
  const [days, setDays] = useState(covidData.length);
  const [options, setOptions] = useState<number[]>([]);
  const [newTotal, setnewTotal] = useState<number | null>(null);

  const graphData = covidData.map(
    ({ daily_cases, timestamp, daily_deaths }) => ({
      name: moment.unix(timestamp).format("YYYY-MM-DD"),
      daily_cases,
      daily_deaths,
    })
  );

  useEffect(() => {
    const totalDays = Number((covidData.length / 10).toFixed());
    const options = new Array(totalDays)
      .fill(0)
      .map((_, index: number) => (index + 1) * 10);
    setnewTotal(
      covidData
        .slice(covidData.length - days)
        .reduce((prev, curr) => prev + curr[dataVal], 0)
    );
    setOptions(options);
  }, [covidData, covidData.length, dataVal, days]);

  return (
    <div className="flex flex-col items-center border border-dotted border-gray-700 shadow-md rounded-md overflow-hidden">
      <span className="flex items-center space-x-2">
        <h1 className={`font-bold text-lg`} style={{ color: color }}>
          {label}
        </h1>
        {label.includes("Cases") ? (
          <MdCoronavirus color="#ffff" />
        ) : (
          <IoSkullSharp color="#fff" />
        )}
      </span>
      <h1 className="text-gray-200 font-extrabold text-xl">
        <CountUp
          end={newTotal!}
          duration={2}
          formattingFn={(newTotal) => newTotal.toLocaleString()}
        />
      </h1>
      <div className="flex mt-2 space-x-1">
        <label htmlFor="days" className="text-gray-400 text-sm">
          Show
        </label>
        <select
          className=" rounded-md outline-none"
          id="days"
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option
            className="font-semibold text-sm text-center"
            value={covidData.length}
          >
            All
          </option>
          <option className="font-semibold text-sm text-center" value={7}>
            Past week
          </option>
          <option className="font-semibold text-sm text-center" value={360}>
            Past year
          </option>
          <option className="font-semibold text-sm text-center" value={30}>
            Past month
          </option>
        </select>
      </div>

      <AreaChart
        key={Math.random()}
        width={200}
        height={100}
        data={graphData.slice(graphData.length - days)}
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
