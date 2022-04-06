import { useEffect, useState } from "react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import renderActiveShape from "./ActivePieShape";
import { SiTwitter } from "react-icons/si";
type PieData = { name: string; value: number };

function SentimentPie({ sentiment }: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pieData, setPieData] = useState<PieData[]>([]);

  const onPieEnter = (_: any, index: any) => {
    setActiveIndex(index);
  };

  // extracting sentiment labels
  const countSentimentValues = () => {
    const sentiments: string[] = [
      ...new Set<string>(
        sentiment.map(
          (data: { sentiment: { Sentiment: any } }) => data.sentiment.Sentiment
        )
      ),
    ];
    // counting occurrences of sentiment labels
    const pieData = sentiments.map(
      (item): PieData => ({
        value: sentiment.reduce(
          (acc: number, cur: { sentiment: any }) =>
            cur.sentiment.Sentiment === item ? ++acc : acc,
          0
        ),
        name: item,
      })
    );
    return pieData;
  };
  useEffect(() => {
    const data = countSentimentValues();
    setPieData(data);
  }, []);

  return (
    <div className="self-center flex flex-col border border-dotted border-gray-700 shadow-md rounded-xl">
      <span className="flex self-center flex-row items-center space-x-2">
        <h1 className="font-semibold  text-gray-200 mt-2">Twitter Sentiment</h1>
        <SiTwitter color="#79B2E7" />
      </span>
      <PieChart width={460} height={300}>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#cccccc"
          dataKey="value"
          onMouseEnter={onPieEnter}
        />
      </PieChart>
    </div>
  );
}

export default SentimentPie;
