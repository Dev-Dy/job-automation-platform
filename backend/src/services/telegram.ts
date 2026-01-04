import axios from 'axios';

export class TelegramService {
  private botToken: string | undefined;
  private chatId: string | undefined;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;

    if (!this.botToken || !this.chatId) {
      console.warn('Telegram bot not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
    }
  }

  async sendNotification(message: string): Promise<void> {
    if (!this.botToken || !this.chatId) {
      return;
    }

    try {
      await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        },
        { timeout: 5000 }
      );
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }
}

export const telegramService = new TelegramService();
