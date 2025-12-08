import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Lock, MessageCircle } from 'lucide-react';
import { TOPICS, INITIAL_POSTS } from './constants';
import { Post, TopicId, ChartConfig } from './types';
import { TopicCard } from './components/TopicCard';
import { ChartRenderer } from './components/ChartRenderer';
import { AdminPanel } from './components/AdminPanel';

// --- Main App Component ---

function App() {
  // Inicializa o estado buscando do LocalStorage, ou usa os posts iniciais se estiver vazio
  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = localStorage.getItem('goncalinho_posts');
    if (savedPosts) {
      try {
        return JSON.parse(savedPosts);
      } catch (e) {
        console.error("Erro ao ler dados salvos", e);
        return INITIAL_POSTS;
      }
    }
    return INITIAL_POSTS;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Efeito para salvar no LocalStorage sempre que 'posts' mudar (Adicionar ou Excluir)
  useEffect(() => {
    localStorage.setItem('goncalinho_posts', JSON.stringify(posts));
  }, [posts]);

  const handleAddPost = (topicId: TopicId, description: string, chartConfig: ChartConfig) => {
    const newPost: Post = {
      id: Date.now().toString(),
      topicId,
      description,
      chartConfig: {
        ...chartConfig,
      },
      createdAt: Date.now(),
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(currentPosts => {
      const updatedPosts = currentPosts.filter(p => p.id !== postId);
      return updatedPosts;
    });
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
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route 
              path="/topic/:topicId" 
              element={<TopicDetailView posts={posts} />} 
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

const DashboardView = () => {
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {TOPICS.map((topic) => (
          <TopicCard 
            key={topic.id} 
            topic={topic} 
            onClick={(id) => navigate(`/topic/${id}`)} 
          />
        ))}
      </div>
    </div>
  );
};

interface TopicDetailViewProps {
  posts: Post[];
}

const TopicDetailView: React.FC<TopicDetailViewProps> = ({ posts }) => {
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
    </div>
  );
};

export default App;