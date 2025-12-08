
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Lock, MessageCircle, AlertCircle } from 'lucide-react';
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

  // Busca os dados do servidor (Banco de Dados SQLite)
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('Falha ao buscar dados do servidor.');
      }
      const json = await response.json();
      setPosts(json.data || []);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
      // Fallback silencioso ou mensagem de erro amigável se o backend não estiver rodando (dev mode frontend only)
      setError("Não foi possível conectar ao banco de dados. Verifique se o servidor está rodando.");
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

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar no banco de dados.');
      }

      // Atualiza a lista localmente após sucesso
      setPosts(prevPosts => [newPost, ...prevPosts]);
      return true;
    } catch (err) {
      alert("Erro ao salvar gráfico: " + err);
      return false;
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir do banco de dados.');
      }

      // Atualiza a lista localmente
      const idToDelete = String(postId);
      setPosts(currentPosts => currentPosts.filter(p => String(p.id) !== idToDelete));
    } catch (err) {
      alert("Erro ao excluir: " + err);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <header className="bg-slate-900 shadow-md sticky top-0 z-40 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <img 
                src="https://pmsgc-goncalinho.wvai75.easypanel.host/brasao.png" 
                alt="Brasão São Gonçalo" 
                className="h-12 w-auto object-contain"
              />
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">Indicadores de São Gonçalo dos Campos</h1>
                <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Painel de Gestão Pública</span>
              </div>
            </Link>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all border border-slate-700 hover:border-slate-600"
              title="Área Administrativa"
            >
              <Lock size={16} />
              <span className="hidden sm:inline">Gestão</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
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

        <AdminPanel 
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          posts={posts}
          onAddPost={handleAddPost}
          onDeletePost={handleDeletePost}
        />
      </div>
    </Router>
  );
}

// --- Views ---

const DashboardView = ({ isLoading }: { isLoading: boolean }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      {/* IA Gonçalinho Button / Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
              <MessageCircle className="text-emerald-400" />
              IA Gonçalinho
            </h2>
            <p className="text-slate-300 text-sm md:text-base max-w-xl">
              Este é um chat de IA. Utilize nossa inteligência artificial para consultar dados e tirar dúvidas sobre os indicadores municipais.
            </p>
          </div>
          <a
            href="https://pmsgc-goncalinho.wvai75.easypanel.host"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group"
          >
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all group-hover:scale-105 flex items-center gap-2">
              Acessar Chat IA
            </button>
          </a>
        </div>
        {/* Decorative element */}
        <div className="absolute -right-12 -bottom-24 w-64 h-64 bg-emerald-500 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Painel de Indicadores</h2>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
          Selecione uma área abaixo para visualizar relatórios detalhados, gráficos estatísticos e informações de planejamento.
        </p>
      </div>
      
      {isLoading ? (
         <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
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

interface TopicDetailViewProps {
  posts: Post[];
  isLoading: boolean;
}

const TopicDetailView: React.FC<TopicDetailViewProps> = ({ posts, isLoading }) => {
  const { topicId } = useParams<{ topicId: string }>();
  
  const topic = TOPICS.find(t => t.id === topicId);
  const topicPosts = posts.filter(p => p.topicId === topicId).sort((a, b) => b.createdAt - a.createdAt);

  if (!topic) {
    return <div className="text-center py-20 text-gray-500">Tópico não encontrado.</div>;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            Voltar para o Painel
          </Link>
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-bold text-slate-800">{topic.label}</h2>
             <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${topic.color}`}>
               {topicPosts.length} Indicadores
             </span>
          </div>
          <p className="text-slate-500 mt-1">{topic.description}</p>
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {topicPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Nenhum dado publicado</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-1">
                Novos indicadores serão publicados em breve.
              </p>
            </div>
          ) : (
            topicPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm text-gray-400">
                      Publicado em {formatDate(post.createdAt)}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                    {post.description}
                  </p>
                  
                  <div className="bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-100">
                    <ChartRenderer config={post.chartConfig} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default App;
