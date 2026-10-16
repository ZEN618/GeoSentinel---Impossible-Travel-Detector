import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { SessionRecord } from '../types';
import { PieChart, BarChart2 } from 'lucide-react';

Chart.register(...registerables);

interface AnalyticsChartsProps {
  sessions: SessionRecord[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ sessions }) => {
  const doughnutRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutInstance = useRef<Chart | null>(null);
  const barInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Action counts
    let allow = 0;
    let flag = 0;
    let block = 0;

    // Risk ranges
    let low = 0;
    let medium = 0;
    let high = 0;

    sessions.forEach((s) => {
      if (s.action === 'ALLOW') allow++;
      else if (s.action === 'FLAG') flag++;
      else if (s.action === 'BLOCK') block++;

      if (s.risk_score <= 29) low++;
      else if (s.risk_score <= 59) medium++;
      else high++;
    });

    // 1. Doughnut Chart
    if (doughnutRef.current) {
      if (doughnutInstance.current) doughnutInstance.current.destroy();

      doughnutInstance.current = new Chart(doughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['ALLOW (Clean)', 'FLAG (Suspicious)', 'BLOCK (Critical)'],
          datasets: [
            {
              data: [allow, flag, block],
              backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
              borderColor: '#070c18',
              borderWidth: 2,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94a3b8',
                font: { family: 'Inter', size: 12 },
                padding: 16,
              },
            },
          },
        },
      });
    }

    // 2. Bar Chart
    if (barRef.current) {
      if (barInstance.current) barInstance.current.destroy();

      barInstance.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: ['Low (0 - 29)', 'Elevated (30 - 59)', 'High/Critical (60 - 100)'],
          datasets: [
            {
              label: 'Total Sessions Evaluated',
              data: [low, medium, high],
              backgroundColor: [
                'rgba(34, 197, 94, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(239, 68, 68, 0.7)',
              ],
              borderColor: ['#22c55e', '#f59e0b', '#ef4444'],
              borderWidth: 1.5,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#94a3b8',
                font: { family: 'JetBrains Mono', size: 11 },
                stepSize: 1,
              },
              grid: {
                color: 'rgba(51, 65, 85, 0.3)',
              },
            },
            x: {
              ticks: {
                color: '#94a3b8',
                font: { family: 'Inter', size: 11 },
              },
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }

    return () => {
      if (doughnutInstance.current) doughnutInstance.current.destroy();
      if (barInstance.current) barInstance.current.destroy();
    };
  }, [sessions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Action Breakdown Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/80">
          <PieChart className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white text-sm">
            Action Policy Breakdown
          </h3>
        </div>
        <div className="flex-grow min-h-[300px] flex items-center justify-center">
          <canvas ref={doughnutRef} />
        </div>
      </div>

      {/* Risk Distribution Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/80">
          <BarChart2 className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white text-sm">
            Risk Score Stratification (0-100)
          </h3>
        </div>
        <div className="flex-grow min-h-[300px] flex items-center justify-center">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
};
