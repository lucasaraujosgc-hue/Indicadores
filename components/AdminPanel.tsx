import React, { useState } from 'react';
import { X, Trash2, Plus, Lock, Palette, Check } from 'lucide-react';
import { ChartConfig, Post, TopicId } from '../types';
import { TOPICS } from '../constants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onAddPost: (topicId: TopicId, description: string, chartConfig: ChartConfig) => void;
  onDeletePost: (postId: string) => void;
}

const DEFAULT_JSON_TEMPLATE = `{
  "chart": {
    "type": "bar",
    "title": "Título do Gráfico",
    "data": [
      { "label": "Item A", "value": 10 },
      { "label": "Item B", "value": 20 }
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
  '#64748b', // Slate 500
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  posts, 
  onAddPost, 
  onDeletePost 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Form States
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [selectedTopic, setSelectedTopic] = useState<TopicId>(TopicId.SAUDE);
  const [description, setDescription] = useState('');
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON_TEMPLATE);
  const [selectedColor, setSelectedColor] = useState('#0ea5e9');
  const [jsonError, setJsonError] = useState<string | null>(null);

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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);

    try {
      let parsed = JSON.parse(jsonInput);
      let config: ChartConfig;

      // Smart parsing logic
      if (parsed.chart) {
        config = parsed.chart;
      } else {
        config = parsed;
      }

      if (!config.type || !config.data || !Array.isArray(config.data)) {
        throw new Error("O JSON deve conter 'type' e uma lista 'data'.");
      }

      // Apply selected color
      config.color = selectedColor;

      onAddPost(selectedTopic, description, config);
      
      // Reset form
      setDescription('');
      setJsonInput(DEFAULT_JSON_TEMPLATE);
      alert('Gráfico adicionado com sucesso!');
      setActiveTab('list'); // Switch to list view to see the new item
    } catch (err: any) {
      setJsonError(err.message || "Erro ao processar JSON.");
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Explicitly confirm before deleting
    if (window.confirm('Tem certeza que deseja excluir este gráfico permanentemente?')) {
      onDeletePost(id);
    }
  };

  // --- Auth View ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-slate-900 p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <Lock className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Área Administrativa</h2>
            <p className="text-slate-400 text-sm">Digite a senha para gerenciar os gráficos.</p>
          </div>
          <form onSubmit={handleLogin} className="p-6">
            <div className="mb-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Senha de acesso"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              {authError && <p className="text-red-500 text-sm mt-2">Senha incorreta.</p>}
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Authenticated View ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Painel de Gerenciamento</h2>
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'add' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Adicionar
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Gerenciar / Excluir
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          
          {/* TAB: ADD POST */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSubmit} className="p-6 max-w-3xl mx-auto space-y-6">
              
              {/* Topic Selection */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">1. Selecione o Tópico</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`p-2 text-sm rounded-lg border text-left transition-all ${
                        selectedTopic === topic.id 
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">2. Descrição do Indicador</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={2}
                  placeholder="Ex: Evolução mensal dos casos de..."
                />
              </div>

              {/* Color Picker */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Palette size={16} /> 3. Cor do Gráfico
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                    </button>
                  ))}
                  <div className="h-8 w-px bg-gray-300 mx-2"></div>
                  <input 
                    type="color" 
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="h-10 w-10 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                    title="Cor Personalizada"
                  />
                </div>
              </div>

              {/* JSON Editor */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">4. Dados (JSON)</label>
                <textarea
                  required
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full p-3 font-mono text-sm bg-slate-900 text-green-400 border border-gray-700 rounded-lg h-48 focus:ring-2 focus:ring-blue-500 outline-none"
                  spellCheck={false}
                />
                {jsonError && (
                  <div className="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                    {jsonError}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 pb-8">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Publicar Gráfico
                </button>
              </div>
            </form>
          )}

          {/* TAB: LIST / DELETE */}
          {activeTab === 'list' && (
            <div className="p-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="p-4 font-medium">Tópico</th>
                      <th className="p-4 font-medium">Título do Gráfico</th>
                      <th className="p-4 font-medium">Data</th>
                      <th className="p-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          Nenhum gráfico cadastrado.
                        </td>
                      </tr>
                    ) : (
                      posts.map(post => {
                        const topic = TOPICS.find(t => t.id === post.topicId);
                        return (
                          <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${topic?.color || 'bg-gray-500'}`}>
                                {topic?.label}
                              </span>
                            </td>
                            <td className="p-4 text-gray-800 font-medium">
                              {post.chartConfig.title}
                            </td>
                            <td className="p-4 text-gray-500 text-sm">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => handleDelete(e, post.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                              >
                                <Trash2 size={16} /> Excluir
                              </button>
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