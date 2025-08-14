// src/ResultsChart.tsx

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registra os elementos que o Chart.js precisa para o Doughnut Chart
ChartJS.register(ArcElement, Tooltip, Legend);

interface ResultsChartProps {
  playerWins: number;
  bankerWins: number;
  ties: number;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ playerWins, bankerWins, ties }) => {
  const data = {
    labels: ['Player (Azul)', 'Banker (Vermelho)', 'Empate (Laranja)'],
    datasets: [
      {
        data: [playerWins, bankerWins, ties],
        backgroundColor: ['#007bff', '#dc3545', '#ff8c00'],
        hoverBackgroundColor: ['#0056b3', '#c82333', '#e67300'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'end',
        labels: {
          boxWidth: 20,
          padding: 15,
          color: '#f0f0f0',
        },
      },
      layout: {
        padding: {
            right: 40 // espaço para legenda
        }
    },
      title: {
        display: true,
        text: 'Frequência de Resultados',
        color: '#61dafb',
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export default ResultsChart;