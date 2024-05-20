import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface SalaryData {
  work_year: string;
  job_title: string;
}

interface JobTitleData {
  title: string;
  count: number;
}

const JobTitlesTable: React.FC<{ year: string }> = ({ year }) => {
  const [jobTitles, setJobTitles] = useState<JobTitleData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/salaries.csv');
      const reader = response.body?.getReader();
      const result = await reader?.read();
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result?.value);
      const parsedData = Papa.parse<SalaryData>(csvData, { header: true, skipEmptyLines: true }).data;

      const filteredData = parsedData.filter((row) => row.work_year === year);

      const aggregatedTitles = filteredData.reduce((acc: { [key: string]: number }, curr) => {
        if (!acc[curr.job_title]) {
          acc[curr.job_title] = 0;
        }
        acc[curr.job_title] += 1;
        return acc;
      }, {});

      const formattedTitles = Object.keys(aggregatedTitles).map((title) => ({
        title,
        count: aggregatedTitles[title],
      }));

      setJobTitles(formattedTitles);
    };

    fetchData();
  }, [year]);

  return (
    <table>
      <thead>
        <tr>
          <th>Job Title</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        {jobTitles.map((job, index) => (
          <tr key={index}>
            <td>{job.title}</td>
            <td>{job.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default JobTitlesTable;
