import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './MainTable.css';

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

const MainTable: React.FC<{ onRowClick: (year: string) => void }> = ({ onRowClick }) => {
  const [data, setData] = useState<SalaryData[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof AggregatedData; direction: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/salaries.csv');
      const reader = response.body?.getReader();
      const result = await reader?.read();
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result?.value);
      const parsedData = Papa.parse<SalaryData>(csvData, { header: true, skipEmptyLines: true }).data;
      setData(parsedData);

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

      const formattedAggregatedData = Object.keys(aggregated).map((year) => ({
        year,
        totalJobs: aggregated[year].totalJobs,
        avgSalary: aggregated[year].totalSalary / aggregated[year].totalJobs,
      }));

      setAggregatedData(formattedAggregatedData);
    };

    fetchData();
  }, []);

  const sortData = (key: keyof AggregatedData) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...aggregatedData].sort((a, b) => {
    if (sortConfig) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });

  return (
    <div>
      <table className="main-table">
        <thead>
          <tr>
            <th onClick={() => sortData('year')}>Year</th>
            <th onClick={() => sortData('totalJobs')}>Number of Total Jobs</th>
            <th onClick={() => sortData('avgSalary')}>Average Salary (USD)</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={row.year} onClick={() => onRowClick(row.year)}>
              <td>{row.year}</td>
              <td>{row.totalJobs}</td>
              <td>{row.avgSalary.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MainTable;
