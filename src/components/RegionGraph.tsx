import moment from "moment";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { CovidTableData, _Predictions } from "../utils/DataInterface";

const colors = ["#6F151D", "#8F5422", "#FAFA"];
const titles = ["Mean", "0.9 Quantiles", "0.1 Quantiles"];

function RegionGraph({
  covidData,
  predictions,
}: {
  covidData: CovidTableData[];
  predictions: _Predictions[];
}) {
  // states
  const [data, setData] = useState<any>({});
  const [layout, setLayout] = useState<any>({});
  const [predGraphData, setPredGraphData] = useState<any>([]);

  // building plotly graph data on page load
  useEffect(() => {
    buildGraphData();
  }, []);

  function buildGraphData() {
    // extracting x andy values from covid table data
    const yVals = covidData.map((data) => data.daily_cases); // number of cases
    const xVals = covidData.map((data) =>
      moment.unix(data.timestamp).format("YYYY-MM-DD")
    ); // daily dates for each yValue

    // calculating the 50th date after original data
    const _50thDate = moment
      .unix(covidData[covidData.length - 1].timestamp)
      .add(50, "day")
      .format("YYYY-MM-DD");

    // building prediction ploty data object
    const predictionsData = predictions.map((data) => {
      // constructing yVals of originalData + predictions data
      const meanVals = [...yVals, ...data.mean];
      const q09Vals = [...yVals, ...data.quantiles["0.9"]];
      const q01Vals = [...yVals, ...data.quantiles["0.1"]];

      // buidling array of dates of the 50 days after last data point
      let next50Dates = [];
      for (let i = 1; i < 50; i++) {
        const curr = moment(xVals[xVals.length - 1])
          .add(i, "day")
          .format("YYYY-MM-DD");
        next50Dates.push(curr);
      }
      // adding current xVals to future dates values
      const xAxes = [...xVals, ...next50Dates];
      // building array of data objects for each prediction object
      const predData = [meanVals, q01Vals, q09Vals].map((data, i) => ({
        name: titles[i],
        type: "scatter",
        mode: "lines",
        x: xAxes,
        y: data,
        line: { color: colors[i] },
      }));
      return predData;
    });

    // original data object
    const data = {
      name: "Original",
      type: "scatter",
      mode: "lines",
      x: xVals,
      y: yVals,
      line: { color: "#17BECF" },
    };
    setPredGraphData(predictionsData[0]);
    setData(data);

    // graph layout options
    const layout = {
      title: {
        text: "Covid cases for " + covidData[0].region,
        font: { color: "#cccc" },
      },
      width: 900,
      height: 500,
      font: { color: "#7FB5E3" },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "#202A37",
      xaxis: {
        range: [xVals[xVals.length - 30], _50thDate],
        type: "date",
        rangeselector: {
          buttons: [
            {
              count: 1,
              label: "Predictions",
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
        rangeslider: { range: [xVals[0], _50thDate] },
      },
      yaxis: {
        autorange: true,
        type: "linear",
        color: "#cccc",
      },
    };
    setLayout(layout);
  }

  return (
    <div className="mt-4">
      <Plot data={[...predGraphData, data]} layout={layout} />
    </div>
  );
}

export default RegionGraph;
