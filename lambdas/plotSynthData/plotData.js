const synthData = require("./synthetic_data.js")
const PLOTLY_UN = "SohailMG";
const PLOTLY_KEY = "3GGD83RZEgeALjRcw1lj";
const MY_SID = "M00716650";
const P = require("plotly")(PLOTLY_UN, PLOTLY_KEY);

const titles = ["mean","Predictions - 0.9","Predictions - 0.1"]
const colors = ["#BEF4D7","#ff0f2f","#0fff5b"]

module.exports = async function buildPredictionData(predictions){
    const graphData = predictions.map((data,i)=>{
        
        const xVals = [...synthData.target, ...data].map((x,i)=>i)
        const yVals = [...synthData.target, ...data];
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
            
    })
    const actualData = buildSynthData()
    return plotData([...graphData,actualData],graphOptions)
    
}


function buildSynthData(){
    const xVals = synthData.target.map((num,i)=>i);
    const yVals = synthData.target;
    const data = {
        x: xVals,
        y: yVals,
        type: "scatter",
        mode: "line",
        name: "Synthetic",
        marker: {
          color: "#159FFF",
          side: 12,
        },
    };
    return data
}

    

async function plotData(data,graphOptions) {
//   const xs = [...yVals, ...predict].map((x,i)=>i)

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




const layout = {
    title: "Synthetic Data for Student " + MY_SID,
    font: {
      size: 25,
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


