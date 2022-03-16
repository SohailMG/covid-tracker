import React, { useState, useEffect, useRef } from "react";
import { GraphData } from "./utils/DataInterface";
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
  const [covidData, setCovidData] = useState<GraphData[] | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(
      "wss://0p40kzqqce.execute-api.us-east-1.amazonaws.com/prod"
    );
    ws.current.onopen = () => {
      console.log("ws opened");

      let time = 2;
      const timeValue = setInterval(() => {
        time = time - 1;
        if (time <= 0) {
          clearInterval(timeValue);
        }
        ws.current!.send(
          JSON.stringify({ action: "dispatchData", data: "england" })
        );
      }, 1000);
    };
    ws.current.onclose = () => console.log("ws closed");

    const wsCurrent = ws.current;

    return () => {
      wsCurrent.close();
    };
  }, []);

  useEffect(() => {
    if (!ws.current) return;
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log(
        "🚀 ~ file: App.tsx ~ line 48 ~ useEffect ~ message",
        message
      );
      setCovidData(message);
    };
  }, []);

  return <div className="App"></div>;
}

export default App;
