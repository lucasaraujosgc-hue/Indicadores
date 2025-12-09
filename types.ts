
export enum TopicId {
  SAUDE = 'saude',
  EDUCACAO = 'educacao',
  DESENVOLVIMENTO_SOCIAL = 'social',
  FINANCAS = 'financas',
  ESPORTE_CULTURA_LAZER = 'esporte',
  AGRICULTURA = 'agricultura',
  INFRAESTRUTURA = 'infraestrutura',
  PLANEJAMENTO = 'planejamento',
}

// Formato Simples (Flat)
export interface ChartDataPoint {
  label: string;
  [key: string]: string | number;
}

// Formato Antigo (Series Aninhadas)
export interface ChartSeries {
  name: string;
  data: { label: string; value: number }[];
  color?: string;
}

// Formato Novo (Series com 'values' e 'city')
export interface NestedSeriesValue {
  city?: string;
  label?: string;
  value: number;
}

export interface NestedSeriesData {
  label: string; // Nome da série
  values: NestedSeriesValue[];
  color?: string;
}

// --- NOVOS TIPOS PARA O FORMATO COMPLEXO ---
export interface ExternalSeriesData {
  label?: string; // Pode vir como label
  name?: string;  // Pode vir como name
  data: number[];
  type?: 'bar' | 'line';
  yAxis?: 'left' | 'right';
  color?: string;
}

export interface ExternalYAxesConfig {
  left?: { title?: string; format?: string };
  right?: { title?: string; format?: string };
}

export interface ExternalChartData {
  title?: string;
  labels: string[];
  series: ExternalSeriesData[];
  yAxes?: ExternalYAxesConfig;
}
// ------------------------------------------

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  
  // Data pode ser:
  // 1. Array simples (Flat)
  // 2. Objeto complexo (ExternalChartData)
  // 3. Array de NestedSeriesData (Novo formato com 'values')
  data?: any[] | ExternalChartData; 
  
  series?: ChartSeries[]; // Legado
  color?: string;
  options?: any; // Para configurações extras
}

export interface Post {
  id: string;
  topicId: TopicId;
  description: string;
  chartConfig: ChartConfig;
  createdAt: number;
}

export interface TopicDef {
  id: TopicId;
  label: string;
  iconName: string;
  color: string;
  description: string;
}
