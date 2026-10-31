import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  version: string;
  port: number;
  dbPath: string;
  adminPass: string;
  editorPass: string;
  viewerPass: string;
  adminToken: string;
  editorToken: string;
  viewerToken: string;
  corsAllowedOrigin: string;
  telegramBotToken: string;
  telegramChatId: string;
  telegramNotifyHour: number;
}

export function loadConfig(): AppConfig {
  return {
    version: process.env.VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
    dbPath: process.env.DB_PATH || 'app.db',
    adminPass: process.env.ADMIN_PASS || 'emmamyers',
    editorPass: process.env.EDITOR_PASS || 'jisoo',
    viewerPass: process.env.VIEWER_PASS || 'view',
    adminToken: process.env.ADMIN_TOKEN || 'token-admin-secret-777',
    editorToken: process.env.EDITOR_TOKEN || 'token-editor-secret-555',
    viewerToken: process.env.VIEWER_TOKEN || 'token-viewer-secret-111',
    corsAllowedOrigin: process.env.CORS_ALLOWED_ORIGIN || '*',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    telegramNotifyHour: parseInt(process.env.TELEGRAM_NOTIFY_HOUR || '6', 10)
  };
}

export const config = loadConfig();
