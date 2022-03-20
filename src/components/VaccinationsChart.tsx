import React, { useEffect, useState } from "react";
import { CovidTableData } from "../utils/DataInterface";
import Plot from "react-plotly.js";
import moment from "moment";
function VaccinationsChart({ covidData }: { covidData: CovidTableData[] }) {
  const [dataArr, setdataArr] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  useEffect(() => {
    buildGraphData();
  }, []);

  function buildGraphData() {
    const xAxes = covidData.map((data) =>
      moment.unix(data.timestamp).format("YYYY-MM-DD")
    );
    const dose1 = covidData.map((data) => data.dose1);
    const dose2 = covidData.map((data) => data.dose2);
    const booster = covidData.map((data) => data.booster);
    const vaccines = [
      { name: "Dose 1", data: dose1, fill: "tozeroy" },
      { name: "Dose 2", data: dose2, fill: "tonexty" },
      { name: "Booster", data: booster, fill: "tonextx" },
    ];
    const dataArr = vaccines.map((vaccine) => ({
      name: vaccine.name,
      x: xAxes,
      y: vaccine.data,
      fill: vaccine.fill,
      type: "scatter",
      mode: "none",
    }));

    const startDate = xAxes[0];
    const endDate = xAxes[xAxes.length - 1];
    const last30Days = moment(endDate).subtract(30, "day");
    const initialRange = [last30Days, endDate];
    setStartDate(startDate);
    setEndDate(endDate);
    setDateRange(initialRange);
    setdataArr(dataArr);
  }

  return (
    <Plot
      data={dataArr}
      layout={{
        title: {
          text: "Vaccines taken in " + covidData[0].region,
          font: { color: "#cccc" },
        },
        width: 900,
        height: 500,
        font: { color: "#7FB5E3" },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "#202A37",
        xaxis: {
          range: dateRange,
          type: "date",
          rangeselector: {
            buttons: [
              {
                count: 1,
                label: "Past month",
                step: "month",
                stepmode: "backward",
              },
              {
                count: 12,
                label: "Past year",
                step: "month",
                stepmode: "backward",
              },
              { step: "all" },
            ],
          },
          color: "#cccc",
          rangeslider: { range: [String(startDate), String(endDate)] },
        },
        yaxis: {
          autorange: true,
          type: "linear",
          color: "#cccc",
        },
      }}
    />
  );
}

export default VaccinationsChart;
