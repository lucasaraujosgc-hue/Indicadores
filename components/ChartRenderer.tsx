import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartConfig } from '../types';

interface ChartRendererProps {
  config: ChartConfig;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ChartRenderer: React.FC<ChartRendererProps> = ({ config }) => {
  const { type, color: mainColor } = config;

  // Lógica para Normalizar os Dados (Suportar tanto 'data' flat quanto 'series' aninhado)
  const { processedData, dataKeys } = useMemo(() => {
    // CASO 1: Formato "Series" (Exemplo 1 do usuário)
    if (config.series && Array.isArray(config.series)) {
      const allLabels = new Set<string>();
      // Coleta todas as labels possíveis
      config.series.forEach(s => s.data.forEach(d => allLabels.add(d.label)));
      
      const normalized = Array.from(allLabels).map(label => {
        const item: any = { label };
        config.series?.forEach(s => {
          const point = s.data.find(d => d.label === label);
          if (point) {
            item[s.name] = point.value;
          }
        });
        return item;
      });

      // Ordenar por mês se possível (lógica simples, pode ser melhorada)
      const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      normalized.sort((a, b) => months.indexOf(a.label) - months.indexOf(b.label));

      return {
        processedData: normalized,
        dataKeys: config.series.map(s => s.name)
      };
    }

    // CASO 2: Formato "Flat" (Exemplo 2 do usuário ou o padrão antigo)
    if (config.data && Array.isArray(config.data) && config.data.length > 0) {
      // Descobre as chaves dinamicamente (ex: "sgc", "bahia", ou apenas "value")
      const keys = Object.keys(config.data[0]).filter(k => k !== 'label');
      return {
        processedData: config.data,
        dataKeys: keys
      };
    }

    return { processedData: [], dataKeys: [] };
  }, [config]);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={processedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '8px', 
                border: '1px solid #334155', 
                color: '#f8fafc',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' 
              }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {dataKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                name={key === 'value' ? 'Valor' : key} // Se for só value, mostra Valor, senão o nome da chave
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={3}
                activeDot={{ r: 6 }} 
              />
            ))}
          </LineChart>
        );
      case 'pie':
        // Pie chart geralmente espera apenas um valor. Pegamos o primeiro dataKey.
        const pieDataKey = dataKeys[0] || 'value';
        return (
          <PieChart>
             <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                return percent > 0.05 ? (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                ) : null;
              }}
              outerRadius={80}
              dataKey={pieDataKey}
              nameKey="label"
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '8px', 
                border: '1px solid #334155', 
                color: '#f8fafc' 
              }}
            />
            <Legend />
          </PieChart>
        );
      case 'bar':
      default:
        return (
          <BarChart data={processedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip 
              cursor={{ fill: '#334155', opacity: 0.4 }}
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '8px', 
                border: '1px solid #334155', 
                color: '#f8fafc',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' 
              }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {dataKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                name={key === 'value' ? 'Quantidade' : key} 
                fill={dataKeys.length === 1 && mainColor ? mainColor : COLORS[index % COLORS.length]} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};