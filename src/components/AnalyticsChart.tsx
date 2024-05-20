import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AggregatedData {
  year: string;
  totalJobs: number;
  avgSalary: number;
}

const AnalyticsChart: React.FC<{ data: AggregatedData[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="totalJobs" stroke="#8884d8" />
      <Line type="monotone" dataKey="avgSalary" stroke="#82ca9d" />
    </LineChart>
  </ResponsiveContainer>
);

export default AnalyticsChart;
