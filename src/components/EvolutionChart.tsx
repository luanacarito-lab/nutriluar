import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EvolutionChartProps {
  data: any[];
  dataKey: string;
  name: string;
  color?: string;
  height?: number;
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ 
  data, 
  dataKey, 
  name, 
  color = '#6B8F71',
  height = 300 
}) => {
  // Filtrar dados que possuem a métrica informada
  const filteredData = data
    .filter(item => item[dataKey] !== null && item[dataKey] !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (filteredData.length < 2) {
    return (
      <div className="empty-chart" style={{ height }}>
        <p>Dados insuficientes para gerar este gráfico.</p>
      </div>
    );
  }

  // Formatar datas para exibição
  const chartData = filteredData.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }));

  return (
    <div style={{ width: '100%', height, marginTop: '20px' }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="formattedDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748B', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748B', fontSize: 12 }} 
            dx={-10}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '10px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              backgroundColor: '#fff' 
            }}
            labelStyle={{ fontWeight: 'bold', color }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            name={name}
            stroke={color} 
            strokeWidth={3} 
            dot={{ fill: color, strokeWidth: 2, r: 4, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvolutionChart;
