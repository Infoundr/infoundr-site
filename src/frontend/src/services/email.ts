// Email service for InFoundr frontend
// This service handles communication with the email service

const EMAIL_SERVICE_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://154.38.174.112:3002';

export interface EmailInviteData {
  email: string;
  startupName: string;
  programName: string;
  inviteCode: string;
  inviteLink?: string;
  expiryDate?: string;
}

export interface WelcomeEmailData {
  email: string;
  name: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  recipient?: string;
  error?: string;
  details?: string;
}

export interface BulkEmailData {
  emails: Array<{
    email: string;
    name?: string;
    startupName?: string;
    programName?: string;
    inviteCode?: string;
    inviteLink?: string;
    expiryDate?: string;
  }>;
}

export interface BulkEmailResponse {
  success: boolean;
  message: string;
  results: Array<{
    email: string;
    success: boolean;
    message?: string;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

class EmailService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = EMAIL_SERVICE_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get API key from environment
    const apiKey = import.meta.env.VITE_EMAIL_SERVICE_API_KEY;
    
    if (!apiKey) {
      console.warn('Email service API key not configured. Email functionality may not work.');
    }
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
        ...options.headers,
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send a startup invite email
   */
  async sendStartupInvite(data: EmailInviteData): Promise<EmailResponse> {
    try {
      return await this.makeRequest<EmailResponse>('/send-startup-invite', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error sending startup invite email:', error);
      throw error;
    }
  }

  /**
   * Send a team invite email
   */
  async sendTeamInvite(data: EmailInviteData): Promise<EmailResponse> {
    try {
      return await this.makeRequest<EmailResponse>('/send-team-invite', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error sending team invite email:', error);
      throw error;
    }
  }

  /**
   * Send a welcome email
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResponse> {
    try {
      return await this.makeRequest<EmailResponse>('/send-welcome-email', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(data: BulkEmailData): Promise<BulkEmailResponse> {
    try {
      return await this.makeRequest<BulkEmailResponse>('/bulk-send', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      throw error;
    }
  }

  /**
   * Test the email service
   */
  async testEmailService(email: string = 'test@example.com'): Promise<EmailResponse> {
    try {
      return await this.makeRequest<EmailResponse>(`/test?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Error testing email service:', error);
      throw error;
    }
  }

  /**
   * Check if the email service is healthy
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    try {
      return await this.makeRequest('/health');
    } catch (error) {
      console.error('Error checking email service health:', error);
      throw error;
    }
  }

  /**
   * Test the connection to the email service
  */
  async testConnection(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      console.log('Email service connection successful:', health);
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  /**
   * Get the email service URL
   */
  getServiceUrl(): string {
    return this.baseUrl;
  }
}

// Export a singleton instance
export const emailService = new EmailService();

// Export the class for testing purposes
export { EmailService}; 

