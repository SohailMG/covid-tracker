import React, { ReactPropTypes } from "react";
import { LineChart, Line, Tooltip } from "recharts";
import { CovidData } from "../utils/OpenDataApi";

type Props = {
  totalData: number | undefined;
  label: string;
  color: string;
  dataVal: string;
  covidData: CovidData[];
};

function DataBox({ totalData, label, color, covidData, dataVal }: Props) {
  return (
    <div className="flex flex-col items-center  shadow-md p-4 rounded-xl">
      <h1 className={`text-[${color}] font-bold text-lg`}>{label}</h1>
      <h1 className="text-gray-800 font-extrabold text-xl">
        {totalData?.toLocaleString()}
      </h1>
      <LineChart width={200} height={200} data={covidData.slice(0, 30)}>
        <Line type="monotone" dataKey={dataVal} stroke={color} activeDot />

        <Tooltip />
      </LineChart>
    </div>
  );
}

export default DataBox;
