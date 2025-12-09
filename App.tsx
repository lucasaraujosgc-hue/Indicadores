
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Lock, MessageCircle, AlertCircle, Maximize2, X } from 'lucide-react';
import { TOPICS } from './constants';
import { Post, TopicId, ChartConfig } from './types';
import { TopicCard } from './components/TopicCard';
import { ChartRenderer } from './components/ChartRenderer';
import { AdminPanel } from './components/AdminPanel';

// --- Main App Component ---

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingServer, setUsingServer] = useState(true); // Indica se estamos conectados ao backend

  // Busca os dados (Tenta Servidor -> Fallback LocalStorage)
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // Tenta conectar ao servidor
      const response = await fetch('/api/posts');
      
      if (!response.ok) {
        throw new Error('Servidor não acessível ou retornou erro.');
      }
      
      const json = await response.json();
      setPosts(json.data || []);
      setUsingServer(true);
      setError(null);
    } catch (err) {
      console.warn("Backend indisponível, ativando modo offline (LocalStorage).", err);
      setUsingServer(false);
      
      // Fallback: Carrega do LocalStorage
      const localData = localStorage.getItem('posts');
      if (localData) {
        try {
          setPosts(JSON.parse(localData));
        } catch (e) {
          console.error("Erro ao ler LocalStorage", e);
        }
      }
      // Não exibimos erro crítico na UI para não bloquear o uso em preview
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddPost = async (topicId: TopicId, description: string, chartConfig: ChartConfig) => {
    const newPost: Post = {
      id: Date.now().toString(),
      topicId,
      description,
      chartConfig,
      createdAt: Date.now(),
    };

    if (usingServer) {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPost),
        });

        if (!response.ok) throw new Error('Erro ao salvar no servidor.');

        setPosts(prevPosts => [newPost, ...prevPosts]);
        return true;
      } catch (err) {
        console.error("Falha ao salvar no servidor, tentando LocalStorage de backup...", err);
        // Se falhar no meio do caminho, avisamos o usuário
        alert("Erro de conexão com o servidor. O gráfico não pôde ser salvo no banco de dados.");
        return false;
      }
    } else {
      // Modo Offline / LocalStorage
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      localStorage.setItem('posts', JSON.stringify(updatedPosts));
      return true;
    }
  };

  const handleEditPost = async (postId: string, topicId: TopicId, description: string, chartConfig: ChartConfig) => {
    if (usingServer) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topicId,
            description,
            chartConfig,
          }),
        });

        if (!response.ok) throw new Error('Erro ao atualizar no servidor.');

        setPosts(prevPosts => prevPosts.map(p => 
          p.id === postId ? { ...p, topicId, description, chartConfig } : p
        ));
        return true;
      } catch (err) {
        console.error("Erro ao editar:", err);
        alert("Erro ao salvar alterações no servidor.");
        return false;
      }
    } else {
      // Modo Offline / LocalStorage
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, topicId, description, chartConfig } : p
      );
      setPosts(updatedPosts);
      localStorage.setItem('posts', JSON.stringify(updatedPosts));
      return true;
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (usingServer) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Erro ao excluir do servidor.');

        const idToDelete = String(postId);
        setPosts(currentPosts => currentPosts.filter(p => String(p.id) !== idToDelete));
      } catch (err) {
        alert("Erro ao excluir do servidor: " + err);
      }
    } else {
      // Modo Offline / LocalStorage
      const idToDelete = String(postId);
      const updatedPosts = posts.filter(p => String(p.id) !== idToDelete);
      setPosts(updatedPosts);
      localStorage.setItem('posts', JSON.stringify(updatedPosts));
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
        <header className="bg-slate-900/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <img 
                src="https://pmsgc-goncalinho.wvai75.easypanel.host/brasao.png" 
                alt="Brasão São Gonçalo" 
                className="h-12 w-auto object-contain drop-shadow-md"
              />
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">Indicadores de São Gonçalo dos Campos</h1>
                <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Painel de Gestão Pública</span>
              </div>
            </Link>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-all border border-slate-700 hover:border-emerald-500/50"
              title="Área Administrativa"
            >
              <Lock size={16} />
              <span className="hidden sm:inline">Gestão</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          
          {/* Botão IA Lateral Fixo */}
          <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end pointer-events-none">
             <a
              href="https://pmsgc-goncalinho.wvai75.easypanel.host"
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-l-xl shadow-2xl flex items-center gap-2 transform translate-x-2 hover:translate-x-0 transition-all duration-300 group border-l-2 border-t-2 border-b-2 border-emerald-400/30"
              title="Falar com IA Gonçalinho"
            >
              <MessageCircle size={24} className="animate-pulse" />
              <span className="font-bold hidden group-hover:inline max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-500 whitespace-nowrap">
                IA Gonçalinho
              </span>
            </a>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {!usingServer && !isLoading && (
            <div className="bg-amber-900/20 border border-amber-500/20 text-amber-200 px-4 py-2 rounded-lg mb-6 text-sm flex justify-center">
              Modo de Visualização Local (Offline). Conecte ao servidor para persistência definitiva.
            </div>
          )}

          <Routes>
            <Route path="/" element={<DashboardView isLoading={isLoading} />} />
            <Route 
              path="/topic/:topicId" 
              element={<TopicDetailView posts={posts} isLoading={isLoading} />} 
            />
          </Routes>
        </main>

        {isAdminOpen && (
          <AdminPanel 
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            posts={posts}
            onAddPost={handleAddPost}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            usingServer={usingServer}
          />
        )}
      </div>
    </Router>
  );
}

// --- Views ---

const DashboardView = ({ isLoading }: { isLoading: boolean }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <div className="text-center mb-12 mt-4">
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Painel de Indicadores
          </span>
        </h2>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-lg font-light leading-relaxed">
          Transparência e dados em tempo real. Selecione uma área para acessar relatórios detalhados e estatísticas do município.
        </p>
      </div>
      
      {isLoading ? (
         <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TOPICS.map((topic) => (
            <TopicCard 
              key={topic.id} 
              topic={topic} 
              onClick={(id) => navigate(`/topic/${id}`)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Topic Detail View with Modal ---

interface TopicDetailViewProps {
  posts: Post[];
  isLoading: boolean;
}

const TopicDetailView: React.FC<TopicDetailViewProps> = ({ posts, isLoading }) => {
  const { topicId } = useParams<{ topicId: string }>();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const topic = TOPICS.find(t => t.id === topicId);
  const topicPosts = posts.filter(p => p.topicId === topicId).sort((a, b) => b.createdAt - a.createdAt);

  if (!topic) {
    return <div className="text-center py-20 text-slate-500">Tópico não encontrado.</div>;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
           <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-2 transition-colors group">
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar para o Painel
          </Link>
          <div className="flex items-center gap-3 mt-1">
             <h2 className="text-3xl font-bold text-white">{topic.label}</h2>
             <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white/90 shadow-sm ${topic.color.replace('bg-', 'bg-gradient-to-r from-').replace('500', '500 to-gray-700').split(' ')[0] + ' to-slate-600'}`}>
               {topicPosts.length} Indicadores
             </span>
          </div>
          <p className="text-slate-400 mt-2 text-lg">{topic.description}</p>
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
         </div>
      ) : (
        <>
          {topicPosts.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
              <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600">
                <LayoutDashboard size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-300">Nenhum dado publicado</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-1">
                Novos indicadores para esta área serão publicados em breve.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {topicPosts.map((post) => (
                <div key={post.id} className="bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-all duration-300 flex flex-col h-full group">
                  
                  {/* Card Header with Title */}
                  <div className="p-5 border-b border-slate-700/50 bg-slate-800/80 flex justify-between items-start gap-4">
                    <div className="flex-1">
                       <h3 className="text-xl font-bold text-slate-100 leading-snug">{post.chartConfig.title}</h3>
                       <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          Publicado em {formatDate(post.createdAt)}
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedPost(post)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Expandir Visualização"
                    >
                      <Maximize2 size={20} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700/50 h-72 w-full mb-6 shadow-inner">
                      <ChartRenderer config={post.chartConfig} />
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-2">
                      {post.description}
                    </p>
                    <button 
                        onClick={() => setSelectedPost(post)}
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 self-start mt-auto uppercase tracking-wide"
                      >
                        Ler análise completa &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
          <div 
            className="bg-slate-900 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-500 tracking-wider">Detalhes do Indicador</span>
                <h2 className="text-2xl font-bold text-white leading-tight mt-1">{selectedPost.chartConfig.title}</h2>
              </div>
              <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Chart Section */}
                <div className="flex-1 min-h-[400px] lg:h-[500px] bg-[#0f172a] rounded-2xl p-6 border border-slate-800 shadow-inner">
                  <ChartRenderer config={selectedPost.chartConfig} />
                </div>
                
                {/* Info Section */}
                <div className="lg:w-1/3 flex flex-col gap-6">
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-white border-l-4 border-emerald-500 pl-3">Análise dos Dados</h3>
                    <div className="bg-slate-800/50 p-4 rounded-xl text-slate-300 text-base leading-relaxed whitespace-pre-line border border-slate-700/50">
                      {selectedPost.description}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col gap-1">
                    <span className="font-mono">ID: {selectedPost.id}</span>
                    <span>Registrado em: {formatDate(selectedPost.createdAt)}</span>
                    <span>Fonte: Gestão Municipal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
