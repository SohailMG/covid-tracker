import React, { ReactPropTypes } from "react";
type Props = { totalData: number | undefined; label: string; color: string };
function DataBox({ totalData, label, color }: Props) {
  return (
    <div className="flex flex-col items-center  shadow-md p-4 rounded-xl">
      <h1 className={`${color} font-bold text-lg`}>{label}</h1>
      <h1 className="text-gray-800 font-extrabold text-xl">
        {totalData?.toLocaleString()}
      </h1>
    </div>
  );
}

export default DataBox;
