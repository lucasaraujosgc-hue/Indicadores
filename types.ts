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

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: ChartDataPoint[];
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
