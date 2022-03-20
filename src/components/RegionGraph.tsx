import moment from "moment";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { CovidTableData, _Predictions } from "../utils/DataInterface";

const colors = ["#6F151D", "#8CC8FA", "#FAFA"];
const titles = ["Mean", "0.9 Quantiles", "0.1 Quantiles"];

function RegionGraph({
  covidData,
  predictions,
}: {
  covidData: CovidTableData[];
  predictions: _Predictions[];
}) {
  console.log(predictions);
  const [data, setData] = useState<any>({});
  const [layout, setLayout] = useState<any>({});
  const [predGraphData, setPredGraphData] = useState<any>([]);

  useEffect(() => {
    buildOriginalData();
  }, []);

  function buildOriginalData() {
    const yVals = covidData.map((data) => data.daily_cases);
    const xVals = covidData.map((data) =>
      moment.unix(data.timestamp).format("YYYY-MM-DD")
    );
    const _50thDate = moment
      .unix(covidData[covidData.length - 1].timestamp)
      .add(50, "day")
      .format("YYYY-MM-DD");

    const predictionsData = predictions.map((data) => {
      const meanVals = [...yVals, ...data.mean];
      const q09Vals = [...yVals, ...data.quantiles["0.9"]];
      const q01Vals = [...yVals, ...data.quantiles["0.1"]];

      let next50Dates = [];
      for (let i = 1; i < 50; i++) {
        const curr = moment(xVals[xVals.length - 1])
          .add(i, "day")
          .format("YYYY-MM-DD");
        next50Dates.push(curr);
      }
      const xAxes = [...xVals, ...next50Dates];
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
    const layout = {
      title: {
        text: "Covid cases for " + covidData[0].region,
        font: { color: "#cccc" },
      },
      width: 900,
      height: 500,
      font_color: "blue",
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
              count: 6,
              label: "Last 6 Months",
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
