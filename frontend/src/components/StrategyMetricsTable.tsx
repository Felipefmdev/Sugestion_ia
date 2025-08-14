// src/components/StrategyMetricsTable.tsx

import React, { useState } from 'react';

interface StrategyMetric {
  strategy_name: string;
  activation_count: number;
  success_count: number;
}

type SortKey = 'strategy_name' | 'activation_count' | 'success_count' | 'success_rate';

interface StrategyMetricsTableProps {
  metrics: StrategyMetric[];
}

const StrategyMetricsTable: React.FC<StrategyMetricsTableProps> = ({ metrics }) => {
  const [sortKey, setSortKey] = useState<SortKey>('success_rate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedMetrics = React.useMemo(() => {
    if (!metrics || metrics.length === 0) return [];
    const sorted = [...metrics].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      if (sortKey === 'success_rate') {
        aValue = a.activation_count > 0 ? (a.success_count / a.activation_count) : 0;
        bValue = b.activation_count > 0 ? (b.success_count / b.activation_count) : 0;
      } else if (sortKey === 'strategy_name') {
        aValue = a.strategy_name;
        bValue = b.strategy_name;
      } else {
        aValue = a[sortKey];
        bValue = b[sortKey];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
    return sorted;
  }, [metrics, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortKey === key) {
      return sortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  if (metrics.length === 0) {
    return <div className="metrics-table-container">Nenhuma estratégia foi ativada ainda.</div>;
  }
  
  return (
    <div className="metrics-table-container">
      <h2>Estratégias Ativas</h2>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('strategy_name')} className="sortable">Estratégia {getSortIndicator('strategy_name')}</th>
            <th onClick={() => handleSort('activation_count')} className="sortable">Ativações {getSortIndicator('activation_count')}</th>
            <th onClick={() => handleSort('success_count')} className="sortable">Acertos {getSortIndicator('success_count')}</th>
            <th onClick={() => handleSort('success_rate')} className="sortable">% de Acerto {getSortIndicator('success_rate')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedMetrics.map((metric) => {
            const successRate = metric.activation_count > 0 ? (metric.success_count / metric.activation_count) * 100 : 0;
            return (
              <tr key={metric.strategy_name}>
                <td>{metric.strategy_name}</td>
                <td>{metric.activation_count}</td>
                <td>{metric.success_count}</td>
                <td>{successRate.toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StrategyMetricsTable;