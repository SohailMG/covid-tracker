import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { CovidTableData } from "../resources/DataInterface";
import moment from "moment";

function DeathsLineChart({ covidData }: { covidData: CovidTableData[] }) {
  const [range, setRange] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [dataArr, setDataArr] = useState<any[]>([]);

  useEffect(() => {
    buildGraphData();
  }, []);

  function buildGraphData() {
    const deathsYVals = covidData.map((data) => data.daily_deaths); // number of cases
    const xVals = covidData.map((data) =>
      moment.unix(data.timestamp).format("YYYY-MM-DD")
    ); // daily dates for each yValue
    const deathsdata = {
      name: "Deaths",
      type: "scatter",
      mode: "lines",
      x: xVals,
      y: deathsYVals,
      line: { color: "#7FB5E3" },
    };

    // constructing date range for past 30 days
    const startDate = xVals[0];
    const endDate = xVals[xVals.length - 1];
    const last30Days = moment(endDate).subtract(60, "day").format("YYYY-MM-DD");
    const initialRange = [last30Days, endDate];
    const data = [deathsdata];

    setRange(initialRange);
    setStartDate(startDate);
    setEndDate(endDate);
    setDataArr(data);
  }

  return (
    <Plot
      data={dataArr}
      layout={{
        title: {
          text: "Covid Deaths in " + covidData[0].region,
          font: { color: "#cccc" },
        },
        width: 900,
        height: 500,
        font: { color: "#7FB5E3" },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "#202A37",
        xaxis: {
          range: range,
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

export default DeathsLineChart;
