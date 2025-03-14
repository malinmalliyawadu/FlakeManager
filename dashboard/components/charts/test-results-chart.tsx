"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// This would be fetched from an API in a real application
const testData = [
  {
    name: "Week 1",
    passing: 120,
    failing: 20,
    flaky: 5,
  },
  {
    name: "Week 2",
    passing: 130,
    failing: 15,
    flaky: 8,
  },
  {
    name: "Week 3",
    passing: 125,
    failing: 18,
    flaky: 10,
  },
  {
    name: "Week 4",
    passing: 140,
    failing: 12,
    flaky: 7,
  },
  {
    name: "Week 5",
    passing: 145,
    failing: 10,
    flaky: 5,
  },
  {
    name: "Week 6",
    passing: 150,
    failing: 8,
    flaky: 3,
  },
];

export default function TestResultsChart() {
  const [timeRange, setTimeRange] = useState("6w");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1w">Last Week</SelectItem>
            <SelectItem value="2w">Last 2 Weeks</SelectItem>
            <SelectItem value="4w">Last Month</SelectItem>
            <SelectItem value="6w">Last 6 Weeks</SelectItem>
            <SelectItem value="12w">Last Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={testData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="passing" name="Passing Tests" fill="#4ade80" />
          <Bar dataKey="failing" name="Failing Tests" fill="#f87171" />
          <Bar dataKey="flaky" name="Flaky Tests" fill="#fbbf24" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
