import axios from 'axios';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    filename?: string;
  };
}

export interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

class WhatsAppClient {
  private apiUrl: string;
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.apiUrl = WHATSAPP_API_URL;
    this.phoneNumberId = WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = WHATSAPP_ACCESS_TOKEN;
  }

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse | null> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const response = await axios.post<WhatsAppResponse>(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          ...message,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('WhatsApp send message error:', error);
      return null;
    }
  }

  async sendTextMessage(to: string, text: string): Promise<WhatsAppResponse | null> {
    return this.sendMessage({
      to,
      type: 'text',
      text: {
        body: text,
      },
    });
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'en',
    components?: any[]
  ): Promise<WhatsAppResponse | null> {
    return this.sendMessage({
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components,
      },
    });
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return true;
    } catch (error) {
      console.error('WhatsApp mark as read error:', error);
      return false;
    }
  }
}

export default new WhatsAppClient();
