// AI Service for business automation and analysis

interface AIAnalysisRequest {
  type: 'quote_analysis' | 'negotiation_strategy' | 'email_classification' | 'supplier_rating';
  data: any;
}

interface QuoteAnalysisResponse {
  competitiveScore: number;
  priceComparison: 'below_market' | 'market_rate' | 'above_market';
  qualityIndicators: string[];
  riskFactors: string[];
  recommendations: string[];
  negotiationPoints: Array<{
    category: string;
    currentValue: string;
    suggestedValue: string;
    potentialSavings: number;
    confidence: number;
    justification: string;
  }>;
}

interface NegotiationStrategyResponse {
  strategy: 'collaborative' | 'competitive' | 'accommodating' | 'avoiding' | 'compromising';
  keyPoints: string[];
  emailTemplate: string;
  expectedOutcome: string;
  confidence: number;
}

interface EmailClassificationResponse {
  category: 'quote' | 'inquiry' | 'complaint' | 'follow_up' | 'general';
  confidence: number;
  extractedData: {
    supplierName?: string;
    amount?: number;
    currency?: string;
    dueDate?: string;
    items?: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
  };
  urgency: 'low' | 'medium' | 'high';
}

class AIService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_AI_SERVICE_URL || 'https://api.openai.com/v1';
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  async analyzeQuote(quoteData: any): Promise<QuoteAnalysisResponse> {
    try {
      // Mock implementation for demonstration
      // In production, this would call OpenAI API or another AI service
      const mockAnalysis: QuoteAnalysisResponse = {
        competitiveScore: this.randomBetween(6, 9),
        priceComparison: this.getRandomPriceComparison(),
        qualityIndicators: [
          'Certified supplier with ISO 9001',
          'Strong delivery track record (98% on-time)',
          'Competitive pricing for industry standard',
          'Responsive customer service team'
        ],
        riskFactors: [
          'New supplier relationship',
          'Payment terms more restrictive than usual',
          'Longer delivery window than competitors'
        ],
        recommendations: [
          'Request references from recent customers',
          'Negotiate for extended payment terms',
          'Consider bulk pricing for larger orders',
          'Ask for expedited delivery options'
        ],
        negotiationPoints: [
          {
            category: 'price',
            currentValue: `${quoteData.total} ${quoteData.currency}`,
            suggestedValue: `${(quoteData.total * 0.92).toFixed(2)} ${quoteData.currency}`,
            potentialSavings: quoteData.total * 0.08,
            confidence: 8,
            justification: 'Market analysis shows 8% average discount possible for similar products'
          },
          {
            category: 'payment_terms',
            currentValue: quoteData.paymentTerms || 'Net 30',
            suggestedValue: 'Net 45',
            potentialSavings: 0,
            confidence: 7,
            justification: 'Extended payment terms improve cash flow without additional cost'
          },
          {
            category: 'delivery',
            currentValue: quoteData.deliveryTime || '4-6 weeks',
            suggestedValue: '3-4 weeks',
            potentialSavings: 0,
            confidence: 6,
            justification: 'Faster delivery provides competitive advantage and reduces inventory costs'
          }
        ]
      };

      return mockAnalysis;
    } catch (error) {
      console.error('Error analyzing quote:', error);
      throw new Error('Failed to analyze quote');
    }
  }

  async generateNegotiationStrategy(
    quoteData: any,
    supplierHistory?: any,
    businessContext?: any
  ): Promise<NegotiationStrategyResponse> {
    try {
      const strategies = ['collaborative', 'competitive', 'accommodating', 'compromising'];
      const selectedStrategy = strategies[Math.floor(Math.random() * strategies.length)] as any;

      const mockStrategy: NegotiationStrategyResponse = {
        strategy: selectedStrategy,
        keyPoints: this.generateKeyPoints(selectedStrategy, quoteData),
        emailTemplate: this.generateEmailTemplate(selectedStrategy, quoteData),
        expectedOutcome: this.generateExpectedOutcome(selectedStrategy),
        confidence: this.randomBetween(7, 9)
      };

      return mockStrategy;
    } catch (error) {
      console.error('Error generating negotiation strategy:', error);
      throw new Error('Failed to generate negotiation strategy');
    }
  }

  async classifyEmail(emailContent: string, emailSubject: string): Promise<EmailClassificationResponse> {
    try {
      const content = (emailSubject + ' ' + emailContent).toLowerCase();
      
      // Simple keyword-based classification for demo
      let category: EmailClassificationResponse['category'] = 'general';
      let confidence = 0.5;

      if (content.includes('quote') || content.includes('proposal') || content.includes('estimate')) {
        category = 'quote';
        confidence = 0.9;
      } else if (content.includes('inquiry') || content.includes('question') || content.includes('request')) {
        category = 'inquiry';
        confidence = 0.8;
      } else if (content.includes('complaint') || content.includes('issue') || content.includes('problem')) {
        category = 'complaint';
        confidence = 0.85;
      } else if (content.includes('follow up') || content.includes('following up')) {
        category = 'follow_up';
        confidence = 0.75;
      }

      const urgency = this.determineUrgency(content);
      const extractedData = this.extractDataFromEmail(content);

      return {
        category,
        confidence,
        extractedData,
        urgency
      };
    } catch (error) {
      console.error('Error classifying email:', error);
      throw new Error('Failed to classify email');
    }
  }

  async ratSupplier(supplierData: any, transactionHistory: any[]): Promise<{
    rating: number;
    factors: Array<{ factor: string; score: number; weight: number }>;
    recommendations: string[];
  }> {
    try {
      const factors = [
        { factor: 'Price Competitiveness', score: this.randomBetween(6, 9), weight: 0.3 },
        { factor: 'Delivery Reliability', score: this.randomBetween(7, 10), weight: 0.25 },
        { factor: 'Quality Consistency', score: this.randomBetween(7, 9), weight: 0.2 },
        { factor: 'Communication', score: this.randomBetween(6, 10), weight: 0.15 },
        { factor: 'Flexibility', score: this.randomBetween(5, 8), weight: 0.1 }
      ];

      const weightedScore = factors.reduce((sum, factor) => 
        sum + (factor.score * factor.weight), 0
      );

      const recommendations = this.generateSupplierRecommendations(factors);

      return {
        rating: Math.round(weightedScore * 10) / 10,
        factors,
        recommendations
      };
    } catch (error) {
      console.error('Error rating supplier:', error);
      throw new Error('Failed to rate supplier');
    }
  }

  // Helper methods
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomPriceComparison(): 'below_market' | 'market_rate' | 'above_market' {
    const options: Array<'below_market' | 'market_rate' | 'above_market'> = 
      ['below_market', 'market_rate', 'above_market'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private generateKeyPoints(strategy: string, quoteData: any): string[] {
    const basePoints = [
      'Emphasize long-term partnership potential',
      'Highlight your company\'s payment reliability',
      'Reference market rates for similar products'
    ];

    switch (strategy) {
      case 'collaborative':
        return [
          ...basePoints,
          'Focus on win-win outcomes',
          'Suggest trial period or pilot project',
          'Explore volume discount opportunities'
        ];
      case 'competitive':
        return [
          ...basePoints,
          'Mention competitive alternatives',
          'Negotiate aggressively on price',
          'Set firm deadlines for decisions'
        ];
      case 'accommodating':
        return [
          ...basePoints,
          'Show flexibility on non-critical terms',
          'Express willingness to compromise',
          'Build relationship for future opportunities'
        ];
      default:
        return basePoints;
    }
  }

  private generateEmailTemplate(strategy: string, quoteData: any): string {
    const companyName = quoteData.supplierName || '[Supplier Name]';
    const amount = `${quoteData.total} ${quoteData.currency}` || '[Quote Amount]';

    return `Dear ${companyName} Team,

Thank you for your quote #${quoteData.id} dated ${new Date().toLocaleDateString()}.

We've reviewed your proposal for ${amount} and are interested in moving forward. Based on our analysis and current market conditions, we'd like to discuss the following:

${this.generateKeyPoints(strategy, quoteData).map(point => `• ${point}`).join('\n')}

We value potential partnerships and look forward to finding mutually beneficial terms. Could we schedule a brief call to discuss these points?

Best regards,
[Your Name]
Procurement Team`;
  }

  private generateExpectedOutcome(strategy: string): string {
    switch (strategy) {
      case 'collaborative':
        return '5-12% cost reduction with improved terms and stronger supplier relationship';
      case 'competitive':
        return '8-15% cost reduction but potentially strained supplier relationship';
      case 'accommodating':
        return '2-7% cost reduction with very strong supplier relationship for future negotiations';
      case 'compromising':
        return '4-10% cost reduction with balanced supplier relationship';
      default:
        return '5-10% cost reduction with maintained supplier relationship';
    }
  }

  private determineUrgency(content: string): 'low' | 'medium' | 'high' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical'];
    const mediumKeywords = ['soon', 'quick', 'fast', 'expedite'];

    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => content.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  private extractDataFromEmail(content: string): EmailClassificationResponse['extractedData'] {
    // Simple extraction logic for demo
    const amountRegex = /\$?([\d,]+\.?\d*)/g;
    const amounts = content.match(amountRegex);
    
    return {
      amount: amounts ? parseFloat(amounts[0].replace(/[,$]/g, '')) : undefined,
      currency: content.includes('$') ? 'USD' : content.includes('€') ? 'EUR' : undefined,
    };
  }

  private generateSupplierRecommendations(factors: any[]): string[] {
    const recommendations = [];
    
    factors.forEach(factor => {
      if (factor.score < 7) {
        switch (factor.factor) {
          case 'Price Competitiveness':
            recommendations.push('Request bulk pricing or long-term contract discounts');
            break;
          case 'Delivery Reliability':
            recommendations.push('Implement delivery performance penalties and bonuses');
            break;
          case 'Quality Consistency':
            recommendations.push('Establish quality standards and regular audits');
            break;
          case 'Communication':
            recommendations.push('Set up regular check-in meetings and communication protocols');
            break;
          case 'Flexibility':
            recommendations.push('Discuss customization options and change management processes');
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Continue current partnership - supplier performing well across all metrics');
    }

    return recommendations;
  }
}

export const aiService = new AIService();
export { AIService };
