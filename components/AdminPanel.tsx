
import React, { useState } from 'react';
import { X, Trash2, Plus, Lock, Palette, Check, Database, Type, Wifi, WifiOff, Pencil, RefreshCw } from 'lucide-react';
import { ChartConfig, Post, TopicId, ExternalChartData } from '../types';
import { TOPICS } from '../constants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onAddPost: (topicId: TopicId, description: string, chartConfig: ChartConfig) => Promise<boolean | void>;
  onEditPost: (postId: string, topicId: TopicId, description: string, chartConfig: ChartConfig) => Promise<boolean | void>;
  onDeletePost: (postId: string) => void;
  usingServer: boolean;
}

const DEFAULT_JSON_TEMPLATE = `{
  "chart": {
    "type": "bar",
    "title": "Novo Gráfico",
    "data": [
      { "label": "Janeiro", "value": 10 },
      { "label": "Fevereiro", "value": 20 }
    ]
  }
}`;

const PRESET_COLORS = [
  '#0ea5e9', // Sky 500 (Azul)
  '#10b981', // Emerald 500 (Verde)
  '#f59e0b', // Amber 500 (Amarelo)
  '#3b82f6', // Blue 500
  '#ef4444', // Red 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
  '#94a3b8', // Slate 400
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  posts, 
  onAddPost, 
  onEditPost, 
  onDeletePost,
  usingServer
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Form States
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [editingPostId, setEditingPostId] = useState<string | null>(null); // Se null, modo criar. Se string, modo editar.
  
  const [selectedTopic, setSelectedTopic] = useState<TopicId>(TopicId.SAUDE);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON_TEMPLATE);
  const [selectedColor, setSelectedColor] = useState('#0ea5e9');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Azul') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const resetForm = () => {
    setEditingPostId(null);
    setTitle('');
    setDescription('');
    setJsonInput(DEFAULT_JSON_TEMPLATE);
    setSelectedColor('#0ea5e9');
    setSelectedTopic(TopicId.SAUDE);
    setJsonError(null);
  };

  const handleEditClick = (post: Post) => {
    setEditingPostId(post.id);
    setSelectedTopic(post.topicId);
    setTitle(post.chartConfig.title);
    setDescription(post.description);
    setSelectedColor(post.chartConfig.color || '#0ea5e9');
    
    // Reconstrói o JSON para o usuário editar, mantendo a estrutura original
    const jsonToDisplay = {
      chart: {
        type: post.chartConfig.type,
        title: post.chartConfig.title,
        color: post.chartConfig.color,
        data: post.chartConfig.data,
        series: post.chartConfig.series,
        options: post.chartConfig.options
      }
    };
    setJsonInput(JSON.stringify(jsonToDisplay, null, 2));
    
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);
    setIsSubmitting(true);

    try {
      let parsed = JSON.parse(jsonInput);
      let config: ChartConfig;

      // Smart parsing logic: se tiver wrapper "chart", usa o conteúdo.
      if (parsed.chart) {
        config = parsed.chart;
      } else {
        config = parsed;
      }

      // Se o usuário não preencheu o título no input, tenta pegar do JSON novo (formato complexo)
      let finalTitle = title.trim();
      
      // Verifica se data é um objeto (complexo) e se tem título lá dentro
      if (!finalTitle && config.data && !Array.isArray(config.data) && typeof config.data === 'object') {
         const dataObj = config.data as any;
         if (dataObj.title) {
            finalTitle = dataObj.title;
            setTitle(finalTitle); // Atualiza o state
         }
      }

      if (!finalTitle) {
        // Se ainda assim não tiver título, tenta pegar do config.title padrão ou lança erro
        finalTitle = config.title || "";
        if(!finalTitle) throw new Error("Por favor, adicione um título ao gráfico (no campo acima ou no JSON).");
      }

      // Validação Flexível
      const hasDataArray = config.data && Array.isArray(config.data);
      const hasDataObject = config.data && !Array.isArray(config.data) && typeof config.data === 'object';
      const hasSeries = config.series && Array.isArray(config.series);

      // Relaxa a validação: Exige 'type' e alguma fonte de dados
      if (!config.type) {
         throw new Error("O JSON deve conter a propriedade 'type'.");
      }
      // Se não tiver dataArray, nem dataObject, nem series, falha.
      if (!hasDataArray && !hasDataObject && !hasSeries) {
        throw new Error("O JSON deve conter dados (propriedade 'data' ou 'series').");
      }
      
      // Validação extra para formato aninhado (data array with values)
      if (Array.isArray(config.data) && config.data.length > 0 && 'values' in config.data[0] && !Array.isArray(config.data[0].values)) {
         throw new Error("Formato inválido: 'values' deve ser um array.");
      }

      // Apply overrides
      config.color = selectedColor;
      config.title = finalTitle; 

      let success;
      if (editingPostId) {
        success = await onEditPost(editingPostId, selectedTopic, description, config);
      } else {
        success = await onAddPost(selectedTopic, description, config);
      }
      
      if (success !== false) {
          alert(editingPostId ? 'Gráfico atualizado com sucesso!' : 'Gráfico adicionado com sucesso!');
          resetForm();
          setActiveTab('list');
      }
    } catch (err: any) {
      console.error(err);
      setJsonError(err.message || "Erro ao processar JSON. Verifique a sintaxe.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este gráfico permanentemente?')) {
      onDeletePost(id);
      if (editingPostId === id) {
        resetForm();
      }
    }
  };

  // --- Auth View ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-8 text-center border-b border-slate-800">
            <div className="mx-auto w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Lock className="text-emerald-400" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white">Acesso Restrito</h2>
            <p className="text-slate-400 text-sm mt-2">Área de gestão de indicadores municipais.</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 bg-slate-800/50">
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Senha de Acesso</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                autoFocus
              />
              {authError && <p className="text-red-400 text-sm mt-2 flex items-center gap-1"><X size={14}/> Senha incorreta.</p>}
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 font-bold shadow-lg shadow-emerald-900/20 transition-all hover:shadow-emerald-900/40"
              >
                Acessar Painel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Authenticated View ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center bg-slate-900 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-xl font-bold text-white whitespace-nowrap">Painel de Gestão</h2>
            <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
            <div className="flex bg-slate-800 rounded-lg p-1 w-full md:w-auto">
              <button
                onClick={() => { setActiveTab('add'); if(!editingPostId) resetForm(); }}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'add' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {editingPostId ? 'Editar Indicador' : 'Adicionar'}
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'list' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Gerenciar
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${usingServer ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-amber-900/30 text-amber-400 border-amber-800'}`}>
               {usingServer ? <Wifi size={14} /> : <WifiOff size={14} />}
               {usingServer ? 'CONECTADO AO SERVIDOR' : 'MODO OFFLINE (LOCAL)'}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#0B1120] custom-scrollbar">
          
          {/* TAB: ADD / EDIT POST */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSubmit} className="p-6 max-w-3xl mx-auto space-y-8">
              
              {/* Header de Edição */}
              {editingPostId && (
                <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pencil className="text-indigo-400" />
                    <div>
                      <h3 className="text-white font-bold">Editando Indicador</h3>
                      <p className="text-xs text-indigo-300">Você está alterando um registro existente.</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700"
                  >
                    Cancelar Edição
                  </button>
                </div>
              )}

              {/* Topic Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">1. Área / Tópico</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`p-3 text-sm rounded-xl border text-left transition-all flex items-center gap-2 ${
                        selectedTopic === topic.id 
                          ? `border-emerald-500 bg-emerald-900/20 text-emerald-400 ring-1 ring-emerald-500` 
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${topic.color}`}></div>
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

               {/* Title */}
               <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1 flex items-center gap-2">
                  <Type size={14} /> 2. Título do Indicador
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-500 transition-all"
                  placeholder="Se deixar vazio, tentaremos usar o título do JSON"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">3. Descrição e Análise</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-500 transition-all min-h-[100px]"
                  rows={3}
                  placeholder="Descreva o contexto, a fonte dos dados e a análise dos resultados..."
                />
              </div>

              {/* Color Picker */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1 flex items-center gap-2">
                  <Palette size={14} /> 4. Cor do Gráfico (Opcional)
                </label>
                <div className="flex flex-wrap items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check size={14} className="text-white drop-shadow-md" />}
                    </button>
                  ))}
                  <div className="h-6 w-px bg-slate-700 mx-2"></div>
                  <input 
                    type="color" 
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="h-9 w-9 p-0 border-0 rounded-lg overflow-hidden cursor-pointer bg-transparent"
                    title="Cor Personalizada"
                  />
                </div>
              </div>

              {/* JSON Editor */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">5. Dados (JSON)</label>
                <div className="relative">
                  <textarea
                    required
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full p-4 font-mono text-sm bg-slate-950 text-emerald-400 border border-slate-700 rounded-xl h-48 focus:ring-2 focus:ring-emerald-500 outline-none"
                    spellCheck={false}
                  />
                  <div className="absolute top-2 right-2 text-[10px] text-slate-600 font-mono pointer-events-none">JSON</div>
                </div>
                {jsonError && (
                  <div className="mt-2 text-red-400 text-sm bg-red-900/20 border border-red-900/50 p-3 rounded-lg">
                    {jsonError}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 pb-12">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-4 ${editingPostId ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-1'}`}
                >
                  {editingPostId ? <RefreshCw size={20} /> : <Plus size={20} />}
                  {isSubmitting ? 'Salvando...' : (editingPostId ? 'Salvar Alterações' : 'Publicar Indicador')}
                </button>
              </div>
            </form>
          )}

          {/* TAB: LIST / DELETE */}
          {activeTab === 'list' && (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
              
              <div className={`rounded-xl p-4 flex items-center gap-4 shadow-sm border ${usingServer ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-amber-900/20 border-amber-800 text-amber-300'}`}>
                {usingServer ? <Database className="shrink-0" /> : <WifiOff className="shrink-0" />}
                <div>
                  <h4 className="font-bold text-sm mb-1">{usingServer ? 'Conectado ao Banco de Dados' : 'Modo Offline (LocalStorage)'}</h4>
                  <p className="text-xs opacity-80">
                    {usingServer 
                      ? 'As alterações são salvas permanentemente no servidor e visíveis para todos os usuários.' 
                      : 'Você está editando dados apenas no seu navegador. Conecte ao servidor para publicar oficialmente.'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                      <th className="p-4 font-bold">Tópico</th>
                      <th className="p-4 font-bold">Título do Gráfico</th>
                      <th className="p-4 font-bold hidden sm:table-cell">Data</th>
                      <th className="p-4 font-bold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-500">
                          Nenhum gráfico encontrado.
                        </td>
                      </tr>
                    ) : (
                      posts.map(post => {
                        const topic = TOPICS.find(t => t.id === post.topicId);
                        return (
                          <tr key={post.id} className="hover:bg-slate-700/30 transition-colors group">
                            <td className="p-4">
                              <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white ${topic?.color || 'bg-slate-600'}`}>
                                {topic?.label}
                              </span>
                            </td>
                            <td className="p-4 text-slate-200 font-medium">
                              {post.chartConfig.title}
                            </td>
                            <td className="p-4 text-slate-500 text-sm hidden sm:table-cell">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(post)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-900/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg text-sm font-medium transition-all border border-indigo-900/30 hover:border-indigo-500"
                                >
                                  <Pencil size={14} /> <span className="hidden sm:inline">Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(e, post.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-sm font-medium transition-all border border-red-900/30 hover:border-red-500"
                                >
                                  <Trash2 size={14} /> <span className="hidden sm:inline">Excluir</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
