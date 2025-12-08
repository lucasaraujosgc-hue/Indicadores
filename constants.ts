import { TopicId, TopicDef, Post } from './types';

export const TOPICS: TopicDef[] = [
  {
    id: TopicId.SAUDE,
    label: 'Saúde',
    iconName: 'HeartPulse',
    color: 'bg-emerald-500', // Verde
    description: 'Indicadores de saúde pública, campanhas e atendimentos.',
  },
  {
    id: TopicId.EDUCACAO,
    label: 'Educação',
    iconName: 'GraduationCap',
    color: 'bg-sky-500', // Azul
    description: 'Dados sobre escolas, alunos, desempenho e infraestrutura escolar.',
  },
  {
    id: TopicId.DESENVOLVIMENTO_SOCIAL,
    label: 'Desenvolvimento Social',
    iconName: 'Users',
    color: 'bg-amber-400', // Amarelo
    description: 'Programas sociais, assistência e inclusão comunitária.',
  },
  {
    id: TopicId.FINANCAS,
    label: 'Finanças',
    iconName: 'BadgeDollarSign',
    color: 'bg-emerald-600', // Verde Escuro
    description: 'Orçamento, arrecadação e despesas municipais.',
  },
  {
    id: TopicId.ESPORTE_CULTURA_LAZER,
    label: 'Esporte, Cultura e Lazer',
    iconName: 'Trophy',
    color: 'bg-amber-500', // Amarelo/Laranja
    description: 'Eventos esportivos, culturais e áreas de lazer.',
  },
  {
    id: TopicId.AGRICULTURA,
    label: 'Agricultura',
    iconName: 'Sprout',
    color: 'bg-green-600', // Verde
    description: 'Produção rural, apoio ao agricultor e safras.',
  },
  {
    id: TopicId.INFRAESTRUTURA,
    label: 'Infraestrutura',
    iconName: 'HardHat',
    color: 'bg-cyan-600', // Azul Petróleo
    description: 'Obras, pavimentação e manutenção urbana.',
  },
  {
    id: TopicId.PLANEJAMENTO,
    label: 'Planejamento',
    iconName: 'ClipboardList',
    color: 'bg-sky-600', // Azul
    description: 'Metas, diretrizes e projetos futuros.',
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    topicId: TopicId.SAUDE,
    createdAt: Date.now(),
    description: 'Acompanhamento mensal dos casos notificados de Dengue no município.',
    chartConfig: {
      type: 'bar',
      title: 'Casos de Dengue em São Gonçalo dos Campos (Jan-Nov 2025)',
      data: [
        { label: "Jan", value: 6 },
        { label: "Fev", value: 1 },
        { label: "Mar", value: 2 },
        { label: "Abr", value: 1 },
        { label: "Mai", value: 2 },
        { label: "Jun", value: 4 },
        { label: "Jul", value: 1 },
        { label: "Ago", value: 1 },
        { label: "Set", value: 2 },
        { label: "Out", value: 1 },
        { label: "Nov", value: 2 }
      ],
      color: '#10b981' // emerald-500
    }
  },
  {
    id: '2',
    topicId: TopicId.FINANCAS,
    createdAt: Date.now() - 100000,
    description: 'Comparativo de arrecadação de impostos no primeiro trimestre.',
    chartConfig: {
      type: 'bar',
      title: 'Arrecadação de IPTU (em Milhares de R$)',
      data: [
        { label: "Jan", value: 450 },
        { label: "Fev", value: 320 },
        { label: "Mar", value: 280 }
      ],
      color: '#059669' // emerald-600
    }
  }
];