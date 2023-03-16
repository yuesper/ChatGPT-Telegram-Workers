const ENV_VALUE_TYPE = {
  API_KEY: 'string',
};

export const ENV = {
 // OpenAI API Key
API_KEY: null,
// OpenAI model name
CHAT_MODEL: 'gpt-3.5-turbo',

// Allowed Telegram Tokens, separated by commas when setting
TELEGRAM_AVAILABLE_TOKENS: [],
// Allowed Telegram Token corresponding Bot Name, separated by commas when setting
TELEGRAM_BOT_NAME: [],

// Allow everyone to use
I_AM_A_GENEROUS_PERSON: false,
// Whitelist
CHAT_WHITE_LIST: [],
// Group whitelist
CHAT_GROUP_WHITE_LIST: [],

// Group chat bot switch
GROUP_CHAT_BOT_ENABLE: true,
// Group chat bot sharing mode, when closed, a group only has one conversation and configuration. When opened, each person in the group has their own conversation context
GROUP_CHAT_BOT_SHARE_MODE: false,

// To avoid the 4096 character limit, trim the message
AUTO_TRIM_HISTORY: true,
// Maximum history length
MAX_HISTORY_LENGTH: 20,
// Maximum message length
MAX_TOKEN_LENGTH: 2048,
// Use GPT3 TOKEN count
GPT3_TOKENS_COUNT: true,

// Global default initialization message
SYSTEM_INIT_MESSAGE: 'You are a capable assistant',
// Global default initialization message role
SYSTEM_INIT_MESSAGE_ROLE: 'system',
// Enable usage statistics
ENABLE_USAGE_STATISTICS: false,
// Hide some command buttons
HIDE_COMMAND_BUTTONS: [],

// Branch to check for updates
UPDATE_BRANCH: 'master',
// Current version
BUILD_TIMESTAMP: process.env.BUILD_TIMESTAMP || 0,
// Current version commit id
BUILD_VERSION: process.env.BUILD_VERSION || '',

// DEBUG dedicated
// Debug mode
DEBUG_MODE: false,
  // 开发模式
  DEV_MODE: false,
  // 本地调试专用
  TELEGRAM_API_DOMAIN: 'https://api.telegram.org',
  OPENAI_API_DOMAIN: 'https://api.openai.com',
};

export const CONST = {
  PASSWORD_KEY: 'chat_history_password',
  GROUP_TYPES: ['group', 'supergroup'],
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
};

export let DATABASE = null;

export function initEnv(env) {
  DATABASE = env.DATABASE;
  for (const key in ENV) {
    if (env[key]) {
      switch (ENV_VALUE_TYPE[key] || (typeof ENV[key])) {
        case 'number':
          ENV[key] = parseInt(env[key]) || ENV[key];
          break;
        case 'boolean':
          ENV[key] = (env[key] || 'false') === 'true';
          break;
        case 'string':
          ENV[key] = env[key];
          break;
        case 'object':
          if (Array.isArray(ENV[key])) {
            ENV[key] = env[key].split(',');
          } else {
            try {
              ENV[key] = JSON.parse(env[key]);
            } catch (e) {
              console.error(e);
            }
          }
          break;
        default:
          ENV[key] = env[key];
          break;
      }
    }
  }
  {
    // 兼容性代码 兼容旧版本
    if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
      if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
        ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
      }
      ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
    }
  }
}
