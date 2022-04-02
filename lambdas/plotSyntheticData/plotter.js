const PLOTLY_UN = "SohailMG";
const PLOTLY_KEY = "3GGD83RZEgeALjRcw1lj";
const P = require("plotly")(PLOTLY_UN, PLOTLY_KEY);
const titles = ["mean", "0.9 Quantiles", "0.1 Quantiles"];
const colors = ["#8b4513", "#0fff5b", "#ff0f2f"];

module.exports.plotlyHandler = async (dataset, predictions) => {
  const { mean, quantiles, samples } = { ...predictions[0] };
  const predictionsArr = [mean, quantiles["0.9"], quantiles["0.1"]];

  const predictionsData = predictionsArr.map((data, i) => {
    const xVals = [...dataset, ...data].map((x, i) => i);
    const yVals = [...dataset, ...data];
    return {
      x: xVals,
      y: yVals,
      type: "scatter",
      mode: "line",
      name: titles[i],
      marker: {
        color: colors[i],
        side: 12,
      },
    };
  });
  const originalData = {
    x: dataset.map((x, i) => i),
    y: dataset,
    type: "scatter",
    mode: "line",
    name: "Original",
    marker: {
      color: "#159FFF",
      side: 12,
    },
  };

  const data = [...predictionsData, originalData];

  const results = await plotData(data, graphOptions);
  console.log(results);
};

const layout = {
  title: "Synthetic Data for Student ID: M00716650",
  width: 900,
  height: 500,
  font: {
    size: 10,
  },
  xaxis: {
    title: "Time (hours) ",
  },
  yaxis: {
    title: "Value",
  },
};
const graphOptions = {
  layout: layout,
  filename: "date-axes",
  fileopt: "overwrite",
};

async function plotData(data, graphOptions) {
  return new Promise((resolve, reject) => {
    P.plot(data, graphOptions, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
