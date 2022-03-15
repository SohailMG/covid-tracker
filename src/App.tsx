import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";
AWS.config.update({
  region: "us-east-1",
  credentials: {
    accessKeyId: String(process.env.REACT_APP_aws_access_key_id),
    secretAccessKey: String(process.env.REACT_APP_aws_secret_access_key),
    sessionToken: String(process.env.REACT_APP_aws_session_token),
  },
});

function App() {
  const [covidData, setCovidData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(
      "wss://0p40kzqqce.execute-api.us-east-1.amazonaws.com/prod"
    );
    ws.onopen = (event) => {
      console.log("[WS] => connection established ", event);
      ws.send(
        JSON.stringify({
          action: "dispatchData",
          data: "England",
        })
      );
      setConnected(true);
    };
    ws.onmessage = function (event) {
      console.log("[WS] => data recieved ", event.data);
      setCovidData(event.data);
    };
  }, [connected]);

  return <div className="App"></div>;
}

export default App;
