// src/components/ResultsChart.tsx

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

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
        position: 'top' as const,
        align: 'center' as const, // Corrigimos o alinhamento para um valor aceitável
        labels: {
          color: '#f0f0f0',
        },
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