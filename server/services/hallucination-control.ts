// Многоуровневая система контроля галлюцинаций
import { ChatOpenAI } from '@langchain/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FactCheckResult {
  isFactual: boolean;
  confidence: number;
  issues: Array<{
    type: 'inaccuracy' | 'hallucination' | 'uncertainty' | 'bias';
    description: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string;
  }>;
  correctedText?: string;
  sources?: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
}

export interface RAGContext {
  documents: Array<{
    content: string;
    source: string;
    relevance_score: number;
    timestamp: Date;
  }>;
  confidence_threshold: number;
}

export class HallucinationControlSystem {
  private openai: ChatOpenAI;
  private genAI: GoogleGenerativeAI;
  private ragDatabase: Map<string, RAGContext> = new Map();
  private factCheckingHistory: Map<string, FactCheckResult[]> = new Map();

  constructor() {
    this.openai = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.1, // Низкая температура для фактической проверки
    });

    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  }

  // Уровень 1: Proven RAG - проверка на основе проверенных данных
  async checkAgainstRAG(content: string, context: string): Promise<{
    factualScore: number;
    matches: Array<{
      text: string;
      source: string;
      confidence: number;
    }>;
    gaps: string[];
  }> {
    try {
      const response = await this.openai.invoke([
        {
          role: 'system',
          content: `Ты - система проверки фактов на основе предоставленного контекста.
Проанализируй содержимое и определи, насколько оно соответствует контексту.
Верни JSON с оценкой от 0 до 1, совпадениями и пробелами в информации.`
        },
        {
          role: 'user',
          content: `Контекст: ${context}\n\nПроверяемый текст: ${content}`
        }
      ]);

      const result = JSON.parse(typeof response.content === 'string' ? response.content : String(response.content));
      
      return {
        factualScore: result.score || 0.5,
        matches: result.matches || [],
        gaps: result.gaps || []
      };
    } catch (error) {
      console.error('RAG check error:', error);
      return { factualScore: 0.5, matches: [], gaps: [] };
    }
  }

  // Уровень 2: Cross-Model Validation - проверка через несколько моделей
  async crossModelValidation(content: string): Promise<{
    consensus: number;
    discrepancies: Array<{
      model: string;
      issue: string;
      confidence: number;
    }>;
  }> {
    try {
      // Проверка через GPT-4
      const gpt4Response = await this.openai.invoke([
        {
          role: 'system',
          content: 'Проверь этот текст на фактическую точность. Выдели любые неточности или потенциальные галлюцинации.'
        },
        { role: 'user', content: content }
      ]);

      // Проверка через Gemini
      const geminiModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const geminiResponse = await geminiModel.generateContent(
        `Проверь этот текст на фактическую точность. Выdели любые неточности: ${content}`
      );

      const gpt4Analysis = typeof gpt4Response.content === 'string' ? gpt4Response.content : String(gpt4Response.content);
      const geminiAnalysis = geminiResponse.response.text();

      // Анализ консенсуса
      const consensus = this.calculateConsensus(gpt4Analysis, geminiAnalysis);
      
      return {
        consensus,
        discrepancies: this.identifyDiscrepancies(gpt4Analysis, geminiAnalysis)
      };
    } catch (error) {
      console.error('Cross-model validation error:', error);
      return { consensus: 0.5, discrepancies: [] };
    }
  }

  // Уровень 3: Self-Correction Loops - внутренние циклы коррекции
  async selfCorrection(content: string, maxIterations: number = 3): Promise<{
    correctedContent: string;
    iterations: number;
    improvements: Array<{
      type: string;
      description: string;
      confidence: number;
    }>;
  }> {
    let currentContent = content;
    let improvements: Array<{ type: string; description: string; confidence: number }> = [];
    let iterations = 0;

    for (let i = 0; i < maxIterations; i++) {
      try {
        const response = await this.openai.invoke([
          {
            role: 'system',
            content: `Ты - система самокорrекции. Проанализируй текст исп исправь любые неточности, двусмысленности или потенциальные проблемы.
Верни JSON с исправленным текстом и списком улучшений.`
          },
          { role: 'user', content: currentContent }
        ]);

        const result = JSON.parse(typeof response.content === 'string' ? response.content : String(response.content));
        
        if (result.correctedText && result.correctedText !== currentContent) {
          improvements.push(...(result.improvements || []));
          currentContent = result.correctedText;
          iterations++;
        } else {
          break; // Нет улучшений, выходим из цикла
        }
      } catch (error) {
        console.error(`Self-correction iteration ${i + 1} error:`, error);
        break;
      }
    }

    return {
      correctedContent: currentContent,
      iterations,
      improvements
    };
  }

  // Уровень 4: Factual Verification - проверка фактов
  async factualVerification(content: string): Promise<FactCheckResult> {
    try {
      const response = await this.openai.invoke([
        {
          role: 'system',
          content: `Ты - эксперт по проверке фактов. Проанализируй текст и определи:
1. Фактическую точность (0-1)
2. Любые проблемы (неточности, галлюцинации, неопределенность, предвзятость)
3. Предложения по исправлению
4. Возможные источники для проверки

Верни JSON с подробным анализом.`
        },
        { role: 'user', content: content }
      ]);

      const result = JSON.parse(typeof response.content === 'string' ? response.content : String(response.content));
      
      return {
        isFactual: result.isFactual || false,
        confidence: result.confidence || 0.5,
        issues: result.issues || [],
        correctedText: result.correctedText,
        sources: result.sources || []
      };
    } catch (error) {
      console.error('Factual verification error:', error);
      return {
        isFactual: false,
        confidence: 0.3,
        issues: [{
          type: 'uncertainty',
          description: 'Не удалось проверить факты из-за ошибки системы',
          severity: 'medium'
        }]
      };
    }
  }

  // Уровень 5: Emergency Fallback - аварийные механизмы
  async emergencyFallback(error: Error, originalContent: string): Promise<{
    fallbackContent: string;
    fallbackReason: string;
    confidence: number;
  }> {
    console.error('🚨 Emergency fallback activated:', error);

    try {
      // Используем самую надежную модель с минимальной температурой
      const response = await this.openai.invoke([
        {
          role: 'system',
          content: 'Система столкнулась с ошибкой. Предоставь безопасный, консервативный ответ на основе запроса. Избегай утвердительных заявлений без полной уверенности.'
        },
        { role: 'user', content: originalContent }
      ]);

      const fallbackContent = typeof response.content === 'string' ? response.content : String(response.content);
      
      return {
        fallbackContent,
        fallbackReason: `System error: ${error.message}`,
        confidence: 0.3 // Низкая уверенность при fallback
      };
    } catch (fallbackError) {
      return {
        fallbackContent: 'Извините, система временно недоступна. Пожалуйста, попробуйте позже.',
        fallbackReason: 'Complete system failure',
        confidence: 0.1
      };
    }
  }

  // Основная функция комплексной проверки
  async comprehensiveFactCheck(content: string, context?: string): Promise<{
    finalContent: string;
    factCheckResult: FactCheckResult;
    ragResult?: any;
    crossValidationResult?: any;
    selfCorrectionResult?: any;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    console.log('🔍 Starting comprehensive fact check...');

    try {
      // Уровень 1: RAG проверка
      let ragResult;
      if (context) {
        ragResult = await this.checkAgainstRAG(content, context);
        console.log(`📊 RAG score: ${ragResult.factualScore}`);
      }

      // Уровень 2: Cross-model validation
      const crossValidationResult = await this.crossModelValidation(content);
      console.log(`🔄 Cross-model consensus: ${crossValidationResult.consensus}`);

      // Уровень 3: Self-correction
      const selfCorrectionResult = await this.selfCorrection(content);
      console.log(`🔧 Self-correction iterations: ${selfCorrectionResult.iterations}`);

      // Уровень 4: Factual verification
      const factCheckResult = await this.factualVerification(selfCorrectionResult.correctedContent);
      console.log(`✅ Factual confidence: ${factCheckResult.confidence}`);

      // Определение уровня риска
      const riskLevel = this.calculateRiskLevel(
        ragResult?.factualScore || 0.5,
        crossValidationResult.consensus,
        factCheckResult.confidence
      );

      // Генерация рекомендаций
      const recommendations = this.generateRecommendations(
        riskLevel,
        factCheckResult,
        ragResult,
        crossValidationResult
      );

      return {
        finalContent: factCheckResult.correctedText || selfCorrectionResult.correctedContent,
        factCheckResult,
        ragResult,
        crossValidationResult,
        selfCorrectionResult,
        riskLevel,
        recommendations
      };
    } catch (error) {
      console.error('❌ Comprehensive fact check failed:', error);
      const fallback = await this.emergencyFallback(error instanceof Error ? error : new Error('Unknown error'), content);
      
      return {
        finalContent: fallback.fallbackContent,
        factCheckResult: {
          isFactual: false,
          confidence: fallback.confidence,
          issues: [{
            type: 'uncertainty',
            description: fallback.fallbackReason,
            severity: 'high'
          }]
        },
        riskLevel: 'high',
        recommendations: ['Система работает в аварийном режиме. Требуется проверка администратором.']
      };
    }
  }

  // Вспомогательные методы
  private calculateConsensus(gpt4Analysis: string, geminiAnalysis: string): number {
    // Упрощенный расчет консенсуса
    const similarity = this.calculateTextSimilarity(gpt4Analysis, geminiAnalysis);
    return similarity;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Простая метрика схожести (в реальном проекте использовать более сложные алгоритмы)
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const intersection = Array.from(new Set(words1.filter(word => words2.includes(word))));
    const union = Array.from(new Set([...words1, ...words2]));
    return intersection.length / union.length;
  }

  private identifyDiscrepancies(gpt4Analysis: string, geminiAnalysis: string): Array<{
    model: string;
    issue: string;
    confidence: number;
  }> {
    // Упрощенная идентификация расхождений
    const discrepancies = [];
    
    if (gpt4Analysis.includes('inaccurate') && !geminiAnalysis.includes('inaccurate')) {
      discrepancies.push({
        model: 'GPT-4',
        issue: 'Identified inaccuracies not found by Gemini',
        confidence: 0.7
      });
    }
    
    if (geminiAnalysis.includes('uncertain') && !gpt4Analysis.includes('uncertain')) {
      discrepancies.push({
        model: 'Gemini',
        issue: 'Identified uncertainty not found by GPT-4',
        confidence: 0.7
      });
    }
    
    return discrepancies;
  }

  private calculateRiskLevel(ragScore: number, consensus: number, factCheckConfidence: number): 'low' | 'medium' | 'high' {
    const averageScore = (ragScore + consensus + factCheckConfidence) / 3;
    
    if (averageScore >= 0.8) return 'low';
    if (averageScore >= 0.6) return 'medium';
    return 'high';
  }

  private generateRecommendations(
    riskLevel: 'low' | 'medium' | 'high',
    factCheckResult: FactCheckResult,
    ragResult?: any,
    crossValidationResult?: any
  ): string[] {
    const recommendations = [];

    if (riskLevel === 'high') {
      recommendations.push('Высокий риск неточностей. Рекомендуется дополнительная проверка.');
      recommendations.push('Рассмотреть возможность использования человеческой экспертизы.');
    }

    if (factCheckResult.issues.some(issue => issue.severity === 'high')) {
      recommendations.push('Обнаружены серьезные фактические ошибки. Требуется исправление.');
    }

    if (crossValidationResult && crossValidationResult.consensus < 0.6) {
      recommendations.push('Низкий консенсус между моделями. Рекомендуется перепроверить.');
    }

    if (ragResult && ragResult.factualScore < 0.5) {
      recommendations.push('Низкое соответствие контексту. Проверьте актуальность данных.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Контент прошел проверку успешно.');
    }

    return recommendations;
  }
}

// Singleton экземпляр
let hallucinationControlInstance: HallucinationControlSystem | null = null;

export function getHallucinationControlSystem(): HallucinationControlSystem {
  if (!hallucinationControlInstance) {
    hallucinationControlInstance = new HallucinationControlSystem();
  }
  return hallucinationControlInstance;
}