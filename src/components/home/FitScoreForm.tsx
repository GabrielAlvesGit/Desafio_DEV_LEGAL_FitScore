import { useState } from "react";
import { Calculator, User, Zap, Heart } from "lucide-react";

// Interface para os dados do formulário
interface FormData {
  candidato: {
    nome: string;
    email: string;
  };
  performance: {
    experiencia: number;
    entregas: number;
    habilidades: number;
    qualidade: number;
  };
  energia: {
    disponibilidade: number;
    prazos: number;
    pressão: number;
  };
  cultura: {
    valores1: number;
    valores2: number;
    valores3: number;
  };
}

const initialFormData: FormData = {
  candidato: { nome: "", email: "" },
  performance: { experiencia: 0, entregas: 0, habilidades: 0, qualidade: 0 },
  energia: { disponibilidade: 0, prazos: 0, pressão: 0 },
  cultura: { valores1: 0, valores2: 0, valores3: 0 },
};

export default function FitScoreForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { title: "Dados do Candidato", icon: User },
    { title: "Performance", icon: Calculator },
    { title: "Energia", icon: Zap },
    { title: "Cultura", icon: Heart },
  ];

  // Validação para cada passo
  const isStepValid = () => {
    if (currentStep === 0) return formData.candidato.nome && formData.candidato.email;
    if (currentStep === 1) return Object.values(formData.performance).every((v) => v > 0);
    if (currentStep === 2) return Object.values(formData.energia).every((v) => v > 0);
    if (currentStep === 3) return Object.values(formData.cultura).every((v) => v > 0);
    return true;
  };

  // Cálculo do FitScore
  const calculateFitScore = () => {
    const performanceScore =
      (formData.performance.experiencia +
        formData.performance.entregas +
        formData.performance.habilidades +
        formData.performance.qualidade) /
      4;

    const energiaScore =
      (formData.energia.disponibilidade +
        formData.energia.prazos +
        formData.energia.pressão) /
      3;

    const culturaScore =
      (formData.cultura.valores1 +
        formData.cultura.valores2 +
        formData.cultura.valores3) /
      3;

    // Média ponderada: Performance 40%, Energia 30%, Cultura 30%
    return Math.round(performanceScore * 0.4 + energiaScore * 0.3 + culturaScore * 0.3);
  };

  // Classificação do FitScore
  const getClassificação = (score: number) => {
    if (score >= 80) return { label: "Fit Altíssimo", color: "text-green-600" };
    if (score >= 60) return { label: "Fit Aprovado", color: "text-blue-600" };
    if (score >= 40) return { label: "Fit Questionável", color: "text-yellow-600" };
    return { label: "Fora do Perfil", color: "text-red-600" };
  };

  // Manipulador de submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;

    setIsSubmitting(true);

    const score = calculateFitScore();
    const classificação = getClassificação(score);

    // Integração com Supabase (descomentar quando configurado)
    /*
    import { supabase } from "../services/supabase";
    const { error } = await supabase.from("candidates").insert({
      name: formData.candidato.nome,
      email: formData.candidato.email,
      answers: JSON.stringify({
        performance: formData.performance,
        energia: formData.energia,
        cultura: formData.cultura,
      }),
      fit_score: score,
      classification: classificação.label,
    });
    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
      setIsSubmitting(false);
      return;
    }
    // Trigger webhook para n8n
    await fetch("URL_DO_WEBHOOK_N8N", {
      method: "POST",
      body: JSON.stringify({ email: formData.candidato.email, result: classificação.label }),
    });
    */

    // Feedback temporário
    alert(`Avaliação Concluída! ${formData.candidato.nome} - ${classificação.label} (${score} pontos)`);

    setIsSubmitting(false);
    setFormData(initialFormData);
    setCurrentStep(0);
  };

  // Suporte a "Enter" para avançar passos
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isStepValid() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Renderização do passo de dados do candidato
  const renderCandidatoStep = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome Completo
        </label>
        <input
          id="nome"
          type="text"
          value={formData.candidato.nome}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({
              ...prev,
              candidato: { ...prev.candidato, nome: e.target.value },
            }))
          }
          onKeyDown={handleKeyDown}
          placeholder="Digite o nome do candidato"
          className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
            !formData.candidato.nome && currentStep === 0 ? "border-red-500" : "border-gray-300"
          }`}
          aria-describedby={formData.candidato.nome ? undefined : "nome-error"}
        />
        {!formData.candidato.nome && currentStep === 0 && (
          <p id="nome-error" className="text-red-500 text-sm mt-1">
            Nome é obrigatório
          </p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={formData.candidato.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({
              ...prev,
              candidato: { ...prev.candidato, email: e.target.value },
            }))
          }
          onKeyDown={handleKeyDown}
          placeholder="email@exemplo.com"
          className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
            !formData.candidato.email && currentStep === 0 ? "border-red-500" : "border-gray-300"
          }`}
          aria-describedby={formData.candidato.email ? undefined : "email-error"}
        />
        {!formData.candidato.email && currentStep === 0 && (
          <p id="email-error" className="text-red-500 text-sm mt-1">
            E-mail é obrigatório
          </p>
        )}
      </div>
    </div>
  );

  // Renderização de blocos de perguntas
  const renderQuestionBlock = (
    title: string,
    questions: { key: string; label: string }[],
    category: keyof Omit<FormData, "candidato">
  ) => (
    <fieldset className="space-y-6" aria-labelledby={`${category}-legend`}>
      <legend id={`${category}-legend`} className="text-lg font-semibold">
        {title}
      </legend>
      {questions.map(({ key, label }) => (
        <div key={key} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={key}
                  value={value}
                  checked={formData[category][key as keyof FormData[typeof category]] === value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      [category]: { ...prev[category], [key]: parseInt(e.target.value) },
                    }))
                  }
                  onKeyDown={handleKeyDown}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  aria-describedby={formData[category][key as keyof FormData[typeof category]] === 0 && currentStep > 0 ? `${key}-error` : undefined}
                />
                <label className="text-sm">{value}</label>
              </div>
            ))}
          </div>
          {formData[category][key as keyof FormData[typeof category]] === 0 && currentStep > 0 && (
            <p id={`${key}-error`} className="text-red-500 text-sm mt-1">
              Este campo é obrigatório
            </p>
          )}
        </div>
      ))}
    </fieldset>
  );

  // Renderização do passo atual
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderCandidatoStep();
      case 1:
        return renderQuestionBlock(
          "Performance - Experiência e Entregas",
          [
            { key: "experiencia", label: "Nível de experiência na área" },
            { key: "entregas", label: "Qualidade das entregas anteriores" },
            { key: "habilidades", label: "Domínio técnico das habilidades" },
            { key: "qualidade", label: "Atenção aos detalhes e qualidade" },
          ],
          "performance"
        );
      case 2:
        return renderQuestionBlock(
          "Energia - Disponibilidade e Ritmo",
          [
            { key: "disponibilidade", label: "Disponibilidade para o trabalho" },
            { key: "prazos", label: "Capacidade de cumprir prazos" },
            { key: "pressão", label: "Performance sob pressão" },
          ],
          "energia"
        );
      case 3:
        return renderQuestionBlock(
          "Cultura - Valores da LEGAL",
          [
            { key: "valores1", label: "Alinhamento com transparência" },
            { key: "valores2", label: "Colaboração em equipe" },
            { key: "valores3", label: "Inovação e aprendizado contínuo" },
          ],
          "cultura"
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Mini FitScore™</h1>
          <p className="text-gray-500">Avaliação de candidatos - Performance, Energia e Cultura</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold" aria-current="step">
              {(() => {
                const IconComponent = steps[currentStep].icon;
                return <IconComponent size={20} />;
              })()}
              {steps[currentStep].title}
            </h2>
            <span className="text-sm text-gray-500">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
          <progress
            value={currentStep / (steps.length - 1)}
            max={1}
            className="w-full h-2.5 mb-6"
          />
          <div className="space-y-6">{renderStep()}</div>
          <div className="flex justify-between pt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Anterior
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                onClick={() => isStepValid() && setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={isSubmitting || !isStepValid()}
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting || !isStepValid()}
              >
                {isSubmitting ? "Processando..." : "Finalizar Avaliação"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}