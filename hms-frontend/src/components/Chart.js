import React from "react";
import { Bar } from "react-chartjs-2";

const Chart = ({ data }) => {
  // prevent chart rendering when data is empty or incomplete
  if (!data || !data.datasets || !Array.isArray(data.datasets)) {
    return <p>Loading chart...</p>;
  }

  return <Bar data={data} />;
};

export default Chart;
