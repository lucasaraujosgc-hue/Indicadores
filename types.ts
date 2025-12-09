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

// Permitir qualquer chave (ex: "bahia", "sgc", "value")
export interface ChartDataPoint {
  label: string;
  [key: string]: string | number;
}

export interface ChartSeries {
  name: string;
  data: { label: string; value: number }[];
  color?: string;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  // Suporta formato direto (Flat) ou formato aninhado (Series)
  data?: ChartDataPoint[]; 
  series?: ChartSeries[];
  color?: string;
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