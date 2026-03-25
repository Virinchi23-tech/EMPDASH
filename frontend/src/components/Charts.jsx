import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.jsx';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Charts = ({ attendanceData = [] }) => {
  // Ensure the chart data is in Chronological order (Past -> Present)
  const sortedData = [...attendanceData];

  const lineData = {
    labels: sortedData.map(d => d.date),
    datasets: [
      {
        label: 'Productivity Units (Logged Hours/Presence)',
        data: sortedData.map(d => d.count),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        borderRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(241, 245, 249, 1)', drawBorder: false },
        ticks: { 
          stepSize: 1,
          font: { size: 11, weight: '500' },
          color: '#64748b'
        }
      },
      x: { 
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#64748b'
        }
      }
    }
  };

  return (
    <div className="w-100" style={{ height: '280px' }}>
      <Line data={lineData} options={lineOptions} />
    </div>
  );
};

export default Charts;
