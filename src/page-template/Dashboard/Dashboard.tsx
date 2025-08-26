import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase"; 

interface Candidate {
  id: string;
  name: string;
  email: string;
  fitScore: number;
  classification: string;
  createdAt: string;
}

const Dashboard = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassification, setFilterClassification] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar dados do Supabase
  const loadCandidatesFromSupabase = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro do Supabase:", error);
        setError("Erro ao carregar candidatos do banco de dados");
        return;
      }

      // Mapear os dados do Supabase para o formato esperado
      const mappedCandidates: Candidate[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        fitScore: item.fit_score,
        classification: item.classification,
        createdAt: item.created_at
      }));

      setCandidates(mappedCandidates);
      setFilteredCandidates(mappedCandidates);
      
    } catch (error) {
      console.error("Erro ao carregar candidatos:", error);
      setError("Erro inesperado ao carregar candidatos");
    } finally {
      setIsLoading(false);
    }
  };

  // Função principal de carregamento
  const loadCandidates = () => {
    loadCandidatesFromSupabase();
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    let filtered = candidates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by classification
    if (filterClassification !== "all") {
      filtered = filtered.filter(candidate =>
        candidate.classification === filterClassification
      );
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, filterClassification]);

  const getStats = () => {
    const total = candidates.length;
    const altissimo = candidates.filter(c => c.fitScore >= 80).length;
    const aprovado = candidates.filter(c => c.fitScore >= 60 && c.fitScore < 80).length;
    const questionavel = candidates.filter(c => c.fitScore >= 40 && c.fitScore < 60).length;
    const fora = candidates.filter(c => c.fitScore < 40).length;
    
    const averageScore = total > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.fitScore, 0) / total)
      : 0;

    return { total, altissimo, aprovado, questionavel, fora, averageScore };
  };

  const getBadgeColor = (classification: string) => {
    switch (classification) {
      case "Fit Altíssimo":
        return "bg-emerald-500";
      case "Fit Aprovado":
        return "bg-blue-500";
      case "Fit Questionável":
        return "bg-yellow-500";
      case "Fora do Perfil":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const stats = getStats();

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="text-center flex flex-col items-center gap-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do banco...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadCandidates}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="dashboard">
      <div className="container">
        <div className="flex items-center justify-end mb-6 dashboard__recharge">
          <button onClick={loadCandidates}>
            <i className='bx bx-reset'></i>  Recarregar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 dashboard__fitScore">
          <div className="rounded-lg border bg-card text-card-foreground shadow-amber-50 shadow-card-custom dashboard__fitScore__box">
            <div className="flex items-center justify-between">
              <div>
                <p className="tracking-tight text-sm font-medium dashboard__fitScore__box__title">Total de Candidatos</p>
                <p className="text-2xl font-bold dashboard__fitScore__box__number--total">{stats.total}</p>
                <p className="text-xs text-gray-500">candidatos avaliados</p>
              </div>
              <div className="dashboard__fitScore__box__icon"><i className='bx bxs-user-account'></i></div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-amber-50 shadow-card-custom dashboard__fitScore__box FitAltossimo">
            <div className="flex items-center justify-between">
              <div>
                <p className="tracking-tight text-sm font-medium dashboard__fitScore__box__title">Fit Altíssimo</p>
                <p className="text-2xl font-bold dashboard__fitScore__box__number--FitAltossimo">{stats.altissimo}</p>
                <p className="text-xs text-gray-500">candidatos avaliados - ≥ 80 pontos</p>
              </div>
              <div className="dashboard__fitScore__box__icon"><i className='bx bxs-hot'></i></div>
            </div>
          </div>
      
          <div className="rounded-lg border bg-card text-card-foreground shadow-amber-50 shadow-card-custom dashboard__fitScore__box FitApproved">
            <div className="flex items-center justify-between">
              <div>
                <p className="tracking-tight text-sm font-medium dashboard__fitScore__box__title">Fit Aprovado</p>
                <p className="text-2xl font-bold dashboard__fitScore__box__number--FitApproved">{stats.aprovado}</p>
                <p className="text-xs text-gray-500">candidatos avaliados - 60-79 pontos</p>
              </div>
              <div className="dashboard__fitScore__box__icon"><i className='bx bx-check-circle'></i></div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-amber-50 shadow-card-custom dashboard__fitScore__box questionavel">
            <div className="flex items-center justify-between">
              <div>
                <p className="tracking-tight text-sm font-medium dashboard__fitScore__box__title">Fit Questionável</p>
                <p className="text-2xl font-bold dashboard__fitScore__box__number--questionavel">{stats.questionavel}</p>
                <p className="text-xs text-gray-500">pontuação média -  40-59</p>
              </div>
              <div className="dashboard__fitScore__box__icon"><i className='bx bx-error'></i></div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-amber-50 shadow-card-custom dashboard__fitScore__box Fora">
            <div className="flex items-center justify-between">
                <div>
                  <p className="tracking-tight text-sm font-medium dashboard__fitScore__box__title">Fora do Perfil</p>
                  <p className="text-2xl font-bold dashboard__fitScore__box__number--Fora">{stats.fora}</p>
                  <p className="text-xs text-gray-500">pontuação média -  &lt; 40 pontos</p>
                </div>
                <div className="dashboard__fitScore__box__icon"><i className='bx bxs-user-x'></i></div>
              </div>
          </div>
        </div>

        <div className="rounded-lg  p-6 mb-6 dashboard__filters">
          <h2 className="text-lg font-semibold mb-4 flex items-center dashboard__filters__title">
            <i className='bx  bx-filter'></i>  Filtros
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
              />
            </div>
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2  focus:border-transparent min-w-[200px]"
            >
              <option value="all">Todas as classificações</option>
              <option value="Fit Altíssimo">Fit Altíssimo</option>
              <option value="Fit Aprovado">Fit Aprovado</option>
              <option value="Fit Questionável">Fit Questionável</option>
              <option value="Fora do Perfil">Fora do Perfil</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg  overflow-hidden dashboard__table">
          <div className="p-6 border-b border-gray-200 dashboard__table__content">
            <h2 className="text-2xl font-semibold leading-none tracking-tight dashboard__table__content__title">Candidatos Avaliados</h2>
            <p className="text-gray-600 text-sm text-muted-foreground dashboard__table__content__text">
             Lista completa de candidatos com suas respectivas pontuações
            </p>
          </div>
          
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4"><i className='bx bx-user'></i></div>
              <h3 className="text-lg font-semibold mb-2">Nenhum candidato encontrado</h3>
              <p className="text-gray-600">
                {candidates.length === 0 
                  ? "Ainda não há candidatos avaliados no banco de dados."
                  : "Tente ajustar os filtros para encontrar candidatos."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto dashboard__table__box">
              <table className="w-full caption-bottom text-sm ">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      FitScore
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Classificação
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{candidate.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{candidate.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-bold text-lg ${getScoreColor(candidate.fitScore)}`}>
                          {candidate.fitScore}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className={`rounded-full text-xs font-medium text-white ${getBadgeColor(candidate.classification)}`}>
                          {candidate.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(candidate.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;