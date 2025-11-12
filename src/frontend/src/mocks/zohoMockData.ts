// Mock data service for Zoho Business Hub demo

import { ZohoEmailMessage, SupplierContact, SupplierQuote } from '../services/zoho';

export class MockZohoData {
  static getEmails(): ZohoEmailMessage[] {
    return [
      {
        id: 'email_001',
        subject: 'Enterprise Software License Quote - Q4 2024',
        fromAddress: 'quotes@techcorp-solutions.com',
        toAddress: ['procurement@infoundr.com'],
        ccAddress: [],
        bccAddress: [],
        content: `
          <div>
            <p>Dear InFoundr Team,</p>
            <p>Thank you for your inquiry about our enterprise software licensing. Please find our quote below:</p>
            
            <table border="1">
              <tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>
              <tr><td>Enterprise License Pack</td><td>10</td><td>$500</td><td>$5,000</td></tr>
              <tr><td>Support & Maintenance</td><td>1 Year</td><td>$500</td><td>$500</td></tr>
            </table>
            
            <p><strong>Subtotal:</strong> $5,000</p>
            <p><strong>Tax (10%):</strong> $500</p>
            <p><strong>Total:</strong> $5,500</p>
            
            <p><strong>Payment Terms:</strong> Net 30 days</p>
            <p><strong>Delivery:</strong> 1-2 weeks after order confirmation</p>
            <p><strong>Valid Until:</strong> December 31, 2024</p>
            
            <p>We look forward to partnering with you. Please let us know if you have any questions.</p>
            
            <p>Best regards,<br>Sarah Johnson<br>Sales Manager<br>TechCorp Solutions</p>
          </div>
        `,
        receivedTime: '2024-11-10T09:30:00Z',
        isRead: false,
        hasAttachment: false,
        priority: 'high',
        messageId: 'msg_001',
        threadId: 'thread_001',
      },
      {
        id: 'email_002',
        subject: 'Office Equipment Proposal - Standing Desks',
        fromAddress: 'sales@globalsupplies.com',
        toAddress: ['procurement@infoundr.com'],
        ccAddress: ['manager@globalsupplies.com'],
        bccAddress: [],
        content: `
          <div>
            <p>Hello,</p>
            <p>Following up on our conversation, here's our proposal for standing desks:</p>
            
            <ul>
              <li><strong>Product:</strong> ErgoStand Pro Adjustable Desks</li>
              <li><strong>Quantity:</strong> 5 units</li>
              <li><strong>Unit Price:</strong> $800 each</li>
              <li><strong>Total:</strong> $4,000</li>
              <li><strong>Tax:</strong> $400</li>
              <li><strong>Grand Total:</strong> $4,400</li>
            </ul>
            
            <p><strong>Features:</strong></p>
            <ul>
              <li>Electric height adjustment</li>
              <li>Memory presets</li>
              <li>5-year warranty</li>
              <li>Free delivery and installation</li>
            </ul>
            
            <p><strong>Terms:</strong> Net 15 days</p>
            <p><strong>Delivery:</strong> 3-4 weeks</p>
            
            <p>This quote is valid for 2 weeks. We're happy to discuss volume discounts for future orders.</p>
            
            <p>Best,<br>Mike Chen<br>Global Supplies Inc.</p>
          </div>
        `,
        receivedTime: '2024-11-08T14:15:00Z',
        isRead: true,
        hasAttachment: true,
        priority: 'normal',
        messageId: 'msg_002',
        threadId: 'thread_002',
      },
      {
        id: 'email_003',
        subject: 'Follow-up: Marketing Consultation Proposal',
        fromAddress: 'proposals@innovationpartners.co',
        toAddress: ['procurement@infoundr.com'],
        ccAddress: [],
        bccAddress: [],
        content: `
          <div>
            <p>Dear InFoundr Team,</p>
            <p>I wanted to follow up on the marketing consultation proposal we discussed last week.</p>
            
            <p><strong>Service Package:</strong> Complete Marketing Strategy & Implementation</p>
            
            <table border="1">
              <tr><th>Service</th><th>Duration</th><th>Rate</th><th>Total</th></tr>
              <tr><td>Market Analysis</td><td>2 weeks</td><td>$2,000</td><td>$2,000</td></tr>
              <tr><td>Strategy Development</td><td>1 week</td><td>$1,500</td><td>$1,500</td></tr>
              <tr><td>Implementation Support</td><td>4 weeks</td><td>$1,200/week</td><td>$4,800</td></tr>
            </table>
            
            <p><strong>Total Investment:</strong> $8,300</p>
            <p><strong>Payment Schedule:</strong> 50% upfront, 50% on completion</p>
            <p><strong>Timeline:</strong> 7 weeks total</p>
            
            <p>This includes:</p>
            <ul>
              <li>Comprehensive market research</li>
              <li>Competitor analysis</li>
              <li>Brand positioning strategy</li>
              <li>Digital marketing roadmap</li>
              <li>Performance tracking setup</li>
            </ul>
            
            <p>I'm happy to schedule a call to discuss this further. We're confident this will drive significant growth for InFoundr.</p>
            
            <p>Looking forward to your response.</p>
            
            <p>Best regards,<br>Alex Thompson<br>Senior Marketing Strategist<br>Innovation Partners</p>
          </div>
        `,
        receivedTime: '2024-11-07T11:20:00Z',
        isRead: true,
        hasAttachment: false,
        priority: 'normal',
        messageId: 'msg_003',
        threadId: 'thread_003',
      },
      {
        id: 'email_004',
        subject: 'Cloud Storage Solution - Monthly Pricing',
        fromAddress: 'enterprise@cloudstore.io',
        toAddress: ['procurement@infoundr.com'],
        ccAddress: [],
        bccAddress: [],
        content: `
          <p>Hi there,</p>
          <p>Thanks for your interest in our enterprise cloud storage solution.</p>
          <p>Based on your requirements for 500GB storage with team collaboration features:</p>
          <p><strong>Monthly Subscription:</strong> $299/month</p>
          <p><strong>Annual Plan:</strong> $2,990/year (2 months free)</p>
          <p>Includes unlimited users, 99.9% uptime SLA, and 24/7 support.</p>
          <p>Let me know if you'd like to start with a 30-day free trial!</p>
          <p>Cheers,<br>Lisa Wang<br>CloudStore.io</p>
        `,
        receivedTime: '2024-11-06T16:45:00Z',
        isRead: true,
        hasAttachment: false,
        priority: 'low',
        messageId: 'msg_004',
        threadId: 'thread_004',
      },
      {
        id: 'email_005',
        subject: 'Re: Office Furniture Inquiry',
        fromAddress: 'sales@officemax.com',
        toAddress: ['procurement@infoundr.com'],
        ccAddress: [],
        bccAddress: [],
        content: `
          <p>Hello,</p>
          <p>Thank you for reaching out about office furniture. Here's what we can offer:</p>
          <p>- Executive chairs (6x): $350 each = $2,100</p>
          <p>- Conference table: $800</p>
          <p>- Filing cabinets (4x): $200 each = $800</p>
          <p>Total: $3,700 + tax</p>
          <p>We can offer a 5% discount for orders over $3,500.</p>
          <p>Best,<br>Tom Rogers</p>
        `,
        receivedTime: '2024-11-05T10:30:00Z',
        isRead: true,
        hasAttachment: false,
        priority: 'normal',
        messageId: 'msg_005',
        threadId: 'thread_005',
      }
    ];
  }

  static getSuppliers(): SupplierContact[] {
    return [
      {
        id: 'supplier_001',
        name: 'Sarah Johnson',
        company: 'TechCorp Solutions',
        email: 'quotes@techcorp-solutions.com',
        phone: '+1-555-0123',
        industry: 'Software & Technology',
        rating: 8.7,
        totalQuotes: 15,
        averageResponseTime: '2.3 days',
        preferredCurrency: 'USD',
        paymentTerms: ['Net 30', 'Net 45', 'Upfront with discount'],
        lastContact: '2024-11-10T09:30:00Z',
      },
      {
        id: 'supplier_002',
        name: 'Mike Chen',
        company: 'Global Supplies Inc',
        email: 'sales@globalsupplies.com',
        phone: '+1-555-0456',
        industry: 'Office Equipment',
        rating: 9.1,
        totalQuotes: 23,
        averageResponseTime: '1.8 days',
        preferredCurrency: 'USD',
        paymentTerms: ['Net 15', 'Net 30', 'COD'],
        lastContact: '2024-11-08T14:15:00Z',
      },
      {
        id: 'supplier_003',
        name: 'Alex Thompson',
        company: 'Innovation Partners',
        email: 'proposals@innovationpartners.co',
        phone: '+1-555-0789',
        industry: 'Consulting & Services',
        rating: 8.9,
        totalQuotes: 8,
        averageResponseTime: '3.1 days',
        preferredCurrency: 'USD',
        paymentTerms: ['50% upfront', 'Net 30', 'Milestone-based'],
        lastContact: '2024-11-07T11:20:00Z',
      },
      {
        id: 'supplier_004',
        name: 'Lisa Wang',
        company: 'CloudStore.io',
        email: 'enterprise@cloudstore.io',
        phone: '+1-555-0321',
        industry: 'Cloud Services',
        rating: 8.2,
        totalQuotes: 12,
        averageResponseTime: '1.5 days',
        preferredCurrency: 'USD',
        paymentTerms: ['Monthly subscription', 'Annual prepay', 'Usage-based'],
        lastContact: '2024-11-06T16:45:00Z',
      },
      {
        id: 'supplier_005',
        name: 'Tom Rogers',
        company: 'OfficeMax Solutions',
        email: 'sales@officemax.com',
        phone: '+1-555-0654',
        industry: 'Office Furniture',
        rating: 7.8,
        totalQuotes: 19,
        averageResponseTime: '2.7 days',
        preferredCurrency: 'USD',
        paymentTerms: ['Net 30', 'Credit terms available'],
        lastContact: '2024-11-05T10:30:00Z',
      }
    ];
  }

  static getQuotes(): SupplierQuote[] {
    return [
      {
        id: 'Q001',
        supplierId: 'supplier_001',
        supplierName: 'TechCorp Solutions',
        supplierEmail: 'quotes@techcorp-solutions.com',
        subject: 'Enterprise Software License Quote - Q4 2024',
        items: [
          {
            id: 'item_001',
            description: 'Enterprise License Pack',
            quantity: 10,
            unitPrice: 500,
            total: 5000,
            specifications: 'Includes all premium features, unlimited users'
          },
          {
            id: 'item_002',
            description: 'Support & Maintenance (1 Year)',
            quantity: 1,
            unitPrice: 500,
            total: 500,
            specifications: '24/7 support, regular updates, priority assistance'
          }
        ],
        subtotal: 5000,
        tax: 500,
        total: 5500,
        currency: 'USD',
        validUntil: '2024-12-31',
        paymentTerms: 'Net 30',
        deliveryTime: '1-2 weeks',
        status: 'pending',
        receivedDate: '2024-11-10',
        aiAnalysis: {
          competitiveScore: 8,
          priceComparison: 'market_rate',
          qualityIndicators: [
            'Established vendor with 5+ years experience',
            'ISO 27001 certified',
            'Excellent customer reviews (4.8/5)',
            'Comprehensive support package included'
          ],
          riskFactors: [
            'Relatively new relationship',
            'No volume discount mentioned',
            'Fixed pricing structure'
          ],
          recommendations: [
            'Request references from similar-sized companies',
            'Negotiate multi-year pricing',
            'Ask about volume discounts for future purchases',
            'Consider pilot program before full commitment'
          ],
          negotiationPoints: [
            {
              category: 'price',
              currentValue: '$5,500',
              suggestedValue: '$4,950',
              potential_savings: 550,
              confidence: 8,
              justification: 'Market research shows 10% negotiation room for enterprise software deals'
            },
            {
              category: 'payment_terms',
              currentValue: 'Net 30',
              suggestedValue: 'Net 45',
              potential_savings: 0,
              confidence: 9,
              justification: 'Extended payment terms improve cash flow without cost impact'
            }
          ]
        }
      },
      {
        id: 'Q002',
        supplierId: 'supplier_002',
        supplierName: 'Global Supplies Inc',
        supplierEmail: 'sales@globalsupplies.com',
        subject: 'Office Equipment Proposal - Standing Desks',
        items: [
          {
            id: 'item_003',
            description: 'ErgoStand Pro Adjustable Desks',
            quantity: 5,
            unitPrice: 800,
            total: 4000,
            specifications: 'Electric adjustment, memory presets, 5-year warranty'
          }
        ],
        subtotal: 4000,
        tax: 400,
        total: 4400,
        currency: 'USD',
        validUntil: '2024-11-22',
        paymentTerms: 'Net 15',
        deliveryTime: '3-4 weeks',
        status: 'negotiating',
        receivedDate: '2024-11-08',
        aiAnalysis: {
          competitiveScore: 9,
          priceComparison: 'below_market',
          qualityIndicators: [
            'Premium ergonomic design',
            'Extended 5-year warranty',
            'Free installation included',
            'High customer satisfaction ratings'
          ],
          riskFactors: [
            'Longer delivery time than competitors',
            'Aggressive payment terms (Net 15)',
            'Limited customization options'
          ],
          recommendations: [
            'Excellent value proposition - recommend acceptance',
            'Negotiate delivery timeline if urgent',
            'Consider ordering additional units for bulk discount',
            'Request payment terms extension to Net 30'
          ],
          negotiationPoints: [
            {
              category: 'delivery',
              currentValue: '3-4 weeks',
              suggestedValue: '2-3 weeks',
              potential_savings: 0,
              confidence: 6,
              justification: 'Expedited delivery may be available for established customers'
            },
            {
              category: 'payment_terms',
              currentValue: 'Net 15',
              suggestedValue: 'Net 30',
              potential_savings: 0,
              confidence: 8,
              justification: 'Standard payment terms in industry, reasonable request'
            }
          ]
        }
      },
      {
        id: 'Q003',
        supplierId: 'supplier_003',
        supplierName: 'Innovation Partners',
        supplierEmail: 'proposals@innovationpartners.co',
        subject: 'Marketing Consultation Proposal',
        items: [
          {
            id: 'item_004',
            description: 'Market Analysis',
            quantity: 1,
            unitPrice: 2000,
            total: 2000,
            specifications: '2 weeks duration, comprehensive market research'
          },
          {
            id: 'item_005',
            description: 'Strategy Development',
            quantity: 1,
            unitPrice: 1500,
            total: 1500,
            specifications: '1 week duration, custom strategy framework'
          },
          {
            id: 'item_006',
            description: 'Implementation Support',
            quantity: 4,
            unitPrice: 1200,
            total: 4800,
            specifications: '4 weeks of hands-on implementation guidance'
          }
        ],
        subtotal: 8300,
        tax: 0,
        total: 8300,
        currency: 'USD',
        validUntil: '2024-11-30',
        paymentTerms: '50% upfront, 50% on completion',
        deliveryTime: '7 weeks total',
        status: 'pending',
        receivedDate: '2024-11-07',
        aiAnalysis: {
          competitiveScore: 7,
          priceComparison: 'above_market',
          qualityIndicators: [
            'Comprehensive service package',
            'Experienced team with proven track record',
            'Detailed project timeline and milestones',
            'Strong portfolio of successful clients'
          ],
          riskFactors: [
            'Higher pricing than market average',
            'Long project timeline (7 weeks)',
            '50% upfront payment requirement',
            'No performance guarantees mentioned'
          ],
          recommendations: [
            'Request detailed breakdown of hourly rates',
            'Negotiate performance-based milestones',
            'Ask for case studies from similar projects',
            'Consider shorter pilot engagement first'
          ],
          negotiationPoints: [
            {
              category: 'price',
              currentValue: '$8,300',
              suggestedValue: '$7,500',
              potential_savings: 800,
              confidence: 7,
              justification: 'Pricing appears 10-15% above market rate for similar consulting services'
            },
            {
              category: 'payment_terms',
              currentValue: '50% upfront, 50% completion',
              suggestedValue: '25% upfront, 75% milestone-based',
              potential_savings: 0,
              confidence: 8,
              justification: 'Milestone-based payments reduce risk and ensure deliverable quality'
            }
          ]
        }
      }
    ];
  }

  static getBusinessMetrics() {
    return {
      totalSuppliers: 5,
      pendingQuotes: 2,
      inNegotiation: 1,
      acceptedQuotes: 0,
      potentialSavings: 2450,
      avgResponseTime: '2.3 days',
      successfulNegotiations: '73%',
      topPerformer: 'Global Supplies Inc'
    };
  }

  static getRecentActivity() {
    return [
      {
        id: 'activity_001',
        type: 'quote_received',
        message: 'New quote received from TechCorp Solutions',
        timestamp: '2 hours ago',
        priority: 'high'
      },
      {
        id: 'activity_002',
        type: 'negotiation_sent',
        message: 'Negotiation email sent to Global Supplies Inc',
        timestamp: '4 hours ago',
        priority: 'medium'
      },
      {
        id: 'activity_003',
        type: 'analysis_completed',
        message: 'Quote analysis completed for Office Equipment',
        timestamp: '1 day ago',
        priority: 'low'
      },
      {
        id: 'activity_004',
        type: 'supplier_added',
        message: 'New supplier contact added: Innovation Partners',
        timestamp: '2 days ago',
        priority: 'low'
      }
    ];
  }
}

export default MockZohoData;
