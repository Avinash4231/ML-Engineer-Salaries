import React, { useState, useEffect } from 'react';
import MainTable from './components/MainTable';
import AnalyticsChart from './components/AnalyticsChart';
import JobTitlesTable from './components/JobTitlesTable';
import Papa from 'papaparse';

interface SalaryData {
  work_year: string;
  experience_level: string;
  employment_type: string;
  job_title: string;
  salary: string;
  salary_currency: string;
  salary_in_usd: string;
  employee_residence: string;
  remote_ratio: string;
  company_location: string;
  company_size: string;
}

interface AggregatedData {
  year: string;
  totalJobs: number;
  avgSalary: number;
}

const App: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/salaries.csv');
      const reader = response.body?.getReader();
      const result = await reader?.read();
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result?.value);
      const parsedData = Papa.parse<SalaryData>(csvData, { header: true, skipEmptyLines: true }).data;

      // Aggregating data
      const aggregated = parsedData.reduce(
        (acc: { [key: string]: { totalJobs: number; totalSalary: number } }, curr) => {
          if (!acc[curr.work_year]) {
            acc[curr.work_year] = { totalJobs: 0, totalSalary: 0 };
          }
          acc[curr.work_year].totalJobs += 1;
          acc[curr.work_year].totalSalary += parseFloat(curr.salary_in_usd);
          return acc;
        },
        {}
      );

      const formattedAggregatedData: AggregatedData[] = Object.keys(aggregated).map((year) => ({
        year,
        totalJobs: aggregated[year].totalJobs,
        avgSalary: aggregated[year].totalSalary / aggregated[year].totalJobs,
      }));

      setAggregatedData(formattedAggregatedData);
    };

    fetchData();
  }, []);

  const handleRowClick = (year: string) => {
    setSelectedYear(year);
  };

  return (
    <div className="App">
      <MainTable onRowClick={handleRowClick} />
      {aggregatedData.length > 0 && <AnalyticsChart data={aggregatedData} />}
      {selectedYear && <JobTitlesTable year={selectedYear} />}
    </div>
  );
};

export default App;
