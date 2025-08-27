import { useState } from "react";
import { Calculator, User, Zap, Heart } from "lucide-react";
import { supabase } from "../../services/supabase";

// Interface para os dados do formulário
interface FormData {
  candidato: { nome: string; email: string };
  performance: { experiencia: number; entregas: number; habilidades: number; qualidade: number };
  energia: { disponibilidade: number; prazos: number; pressao: number };
  cultura: { valores1: number; valores2: number; valores3: number };
}

interface TouchedFields {
  nome: boolean;
  email: boolean;
}

const initialFormData: FormData = {
  candidato: { nome: "", email: "" },
  performance: { experiencia: 0, entregas: 0, habilidades: 0, qualidade: 0 },
  energia: { disponibilidade: 0, prazos: 0, pressao: 0 },
  cultura: { valores1: 0, valores2: 0, valores3: 0 },
};

const initialTouchedFields: TouchedFields = {
  nome: false,
  email: false,
};

export default function FitScoreForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [touched, setTouched] = useState<TouchedFields>(initialTouchedFields);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const steps = [
    { title: "Dados do Candidato", icon: User },
    { title: "Performance", icon: Calculator },
    { title: "Energia", icon: Zap },
    { title: "Cultura", icon: Heart },
  ];

  const isStepValid = () => {
    if (currentStep === 0) return formData.candidato.nome && formData.candidato.email;
    if (currentStep === 1) return Object.values(formData.performance).every((v) => v > 0);
    if (currentStep === 2) return Object.values(formData.energia).every((v) => v > 0);
    if (currentStep === 3) return Object.values(formData.cultura).every((v) => v > 0);
    return true;
  };

  const calculateFitScore = () => {
    const performanceScore =
      (formData.performance.experiencia +
        formData.performance.entregas +
        formData.performance.habilidades +
        formData.performance.qualidade) / 4;

    const energiaScore =
      (formData.energia.disponibilidade +
        formData.energia.prazos +
        formData.energia.pressao) / 3;

    const culturaScore =
      (formData.cultura.valores1 +
        formData.cultura.valores2 +
        formData.cultura.valores3) / 3;

    const weightedScore = performanceScore * 0.4 + energiaScore * 0.3 + culturaScore * 0.3;
    const finalScore = Math.round(weightedScore * 20); // Scale to 0–100

    // Debugging logs
    // console.log("Performance Score:", performanceScore);
    // console.log("Energia Score:", energiaScore);
    // console.log("Cultura Score:", culturaScore);
    // console.log("Weighted Score:", weightedScore);
    // console.log("Final Score:", finalScore);

    return finalScore;
  };

  const getClassificacao = (score: number) => {
    if (score >= 80) return { label: "Fit Altíssimo", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" };
    if (score >= 60) return { label: "Fit Aprovado", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
    if (score >= 40) return { label: "Fit Questionável", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
    return { label: "Fora do Perfil", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" };
  };

  const sendToWebhook = async (payload: any) => {
    try {
      const response = await fetch("https://gabrielalvesss.app.n8n.cloud/webhook/candidate-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Erro no webhook: ${response.status}`);
      const data = await response.json();
      // console.log("Resposta do webhook:", data);
      return { success: true };
    } catch (err) {
      // console.error("Erro ao enviar para o webhook:", err);
      return { success: false, error: err };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;

    setIsSubmitting(true);

    const score = calculateFitScore();
    const classificacao = getClassificacao(score);

    // Salva no Supabase
    const { error } = await supabase.from("candidates").insert({
      name: formData.candidato.nome,
      email: formData.candidato.email,
      fit_score: score,
      classification: classificacao.label,
    });

    if (error) {
      setNotificationMessage(`Erro ao salvar: ${error.message}`);
      setShowNotification(true);
      setIsSubmitting(false);
      return;
    }

    // Envia para o webhook apenas se aprovado
    if (classificacao.label === "Fit Aprovado" || classificacao.label === "Fit Altíssimo") {
      const webhookPayload = {
        name: formData.candidato.nome,
        email: formData.candidato.email,
        fit_score: score,
        classification: classificacao.label,
        performance_scores: formData.performance,
        energia_scores: formData.energia,
        cultura_scores: formData.cultura,
      };
      const webhookResult = await sendToWebhook(webhookPayload);
      if (!webhookResult.success) {
        setNotificationMessage(`Avaliação salva, mas falha ao enviar para o webhook: ${webhookResult.error}`);
        setShowNotification(true);
        setIsSubmitting(false);
        return;
      }
    }

    setNotificationMessage(`Avaliação Concluída! ${formData.candidato.nome} - ${classificacao.label} (${score} pontos)`);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
      setIsSubmitting(false);
      setFormData(initialFormData);
      setTouched(initialTouchedFields);
      setCurrentStep(0);
    }, 5000); // 5 seconds for better UX
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isStepValid() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const renderCandidatoStep = () => (
    <div className="space-y-6 fitScoreForm__candidato">
      <div>
        <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
        <input
          id="nome"
          type="text"
          value={formData.candidato.nome}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, candidato: { ...prev.candidato, nome: e.target.value } }))
          }
          onKeyDown={handleKeyDown}
          onBlur={() => handleBlur("nome")}
          placeholder="Digite o nome do candidato"
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors text-gray-700 placeholder-gray-400  ${
            !formData.candidato.nome && touched.nome && currentStep === 0
              ? "border-red-500 focus:border-red-600"
              : "border-gray-200 focus:border-blue-600"
          }`}
          aria-describedby={formData.candidato.nome || !touched.nome ? undefined : "nome-error"}
        />
        {!formData.candidato.nome && touched.nome && currentStep === 0 && (
          <p id="nome-error" className="text-red-500 text-sm mt-1">Nome é obrigatório</p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">E-mail *</label>
        <input
          id="email"
          type="email"
          value={formData.candidato.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, candidato: { ...prev.candidato, email: e.target.value } }))
          }
          onKeyDown={handleKeyDown}
          onBlur={() => handleBlur("email")}
          placeholder="email@exemplo.com"
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 ${
            !formData.candidato.email && touched.email && currentStep === 0
              ? "border-red-500 focus:border-red-600"
              : "border-gray-200 focus:border-blue-600"
          }`}
          aria-describedby={formData.candidato.email || !touched.email ? undefined : "email-error"}
        />
        {!formData.candidato.email && touched.email && currentStep === 0 && (
          <p id="email-error" className="text-red-500 text-sm mt-1">E-mail é obrigatório</p>
        )}
      </div>
    </div>
  );

  const renderQuestionBlock = (
    title: string,
    questions: { key: string; label: string }[],
    category: keyof Omit<FormData, "candidato">,
    weight: string
  ) => (
    <fieldset className="space-y-6" aria-labelledby={`${category}-legend`}>
      <div className="text-center mb-6">
        <legend id={`${category}-legend`} className="text-xl font-bold text-gray-700">{title}</legend>
        <p className="text-sm text-gray-500">Peso na avaliação: {weight}</p>
      </div>
      {questions.map(({ key, label }) => (
        <div key={key} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <div className="flex flex-wrap gap-4 fitScoreForm__radioGroup">
            {[1, 2, 3, 4, 5].map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={key}
                  value={value}
                  checked={formData[category][key as keyof FormData[typeof category]] === value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [category]: { ...prev[category], [key]: parseInt(e.target.value) } }))
                  }
                  onKeyDown={handleKeyDown}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label className="text-sm text-gray-600">{value}</label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderCandidatoStep();
      case 1:
        return renderQuestionBlock("Performance - Experiência e Entregas", [
          { key: "experiencia", label: "Nível de experiência na área" },
          { key: "entregas", label: "Qualidade das entregas anteriores" },
          { key: "habilidades", label: "Domínio técnico das habilidades" },
          { key: "qualidade", label: "Atenção aos detalhes e qualidade" },
        ], "performance", "40%");
      case 2:
        return renderQuestionBlock("Energia - Disponibilidade e Ritmo", [
          { key: "disponibilidade", label: "Disponibilidade para o trabalho" },
          { key: "prazos", label: "Capacidade de cumprir prazos" },
          { key: "pressao", label: "Performance sob pressão" },
        ], "energia", "30%");
      case 3:
        return renderQuestionBlock("Cultura - Valores da LEGAL", [
          { key: "valores1", label: "Alinhamento com transparência" },
          { key: "valores2", label: "Colaboração em equipe" },
          { key: "valores3", label: "Inovação e aprendizado contínuo" },
        ], "cultura", "30%");
      default: return null;
    }
  };

  const Notification = () =>
    showNotification ? (
      <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm w-full ${getClassificacao(calculateFitScore()).bgColor} border ${getClassificacao(calculateFitScore()).borderColor} animate-slide-in z-50`}>
        <p className={`text-sm font-semibold ${getClassificacao(calculateFitScore()).color}`}>{notificationMessage}</p>
        <div className="mt-2 text-xs text-gray-600">
          Redefinindo formulário em 5 segundos...
        </div>
      </div>
    ) : null;

  return (
    <div className="min-h-screen fitScoreForm">
      <Notification />
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fitScoreForm__steps">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div key={index} className="flex flex-col items-center flex-1 fitScoreForm__steps__step">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  <IconComponent size={20} />
                </div>
                <span className={`text-xs text-center ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 fitScoreForm__progressBar">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg  p-6 mb-6 dashboard__filters fitScoreForm__form">
          <div className="flex items-center justify-between mb-6 fitScoreForm__form__box">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              {steps[currentStep].title}
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 rounded-full fitScoreForm__form__box__stepIndicator">
              {currentStep + 1} de {steps.length}
            </span>
          </div>

          <div className="mb-8">{renderStep()}</div>

          <div className="flex justify-between  border-t border-gray-200 fitScoreForm__navigation">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              ← Anterior
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors fitScoreForm__btnNext"
                onClick={() => isStepValid() && setCurrentStep(currentStep + 1)}
                disabled={isSubmitting || !isStepValid()}
              >
                Próximo →
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors fitScoreForm__btnNext"
                disabled={isSubmitting || !isStepValid()}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </span>
                ) : (
                  'Finalizar Avaliação ✓'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

