import {DATABASE, ENV, CONST} from './env.js';
// User configuration
export const USER_CONFIG = {
  // System initialization message
  SYSTEM_INIT_MESSAGE: ENV.SYSTEM_INIT_MESSAGE,
  // OpenAI API additional parameters
  OPENAI_API_EXTRA_PARAMS: {},
  };
  
  export const USER_DEFINE = {
  // Custom roles
  ROLE: {},
  };
  
  // Current chat context
  export const CURRENT_CHAT_CONTEXT = {
  chat_id: null,
  reply_to_message_id: null, // If it's a group, this value is the message ID, otherwise it's null
  parse_mode: 'Markdown',
  };
  
  // Shared context
  export const SHARE_CONTEXT = {
  currentBotId: null, // Current bot ID
  currentBotToken: null, // Current bot Token
  currentBotName: null, // Current bot name: xxx_bot
  chatHistoryKey: null, // history:chat_id:bot_id:(from_id)
  configStoreKey: null, // user_config:chat_id:bot_id:(from_id)
  groupAdminKey: null, // group_admin:group_id
  usageKey: null, // usage:bot_id
  chatType: null, // Conversation scene, private/group/supergroup, etc., from message.chat.type
  chatId: null, // Conversation id, private scene for the speaker id, group/supergroup scene for the group id
  speakerId: null, // Speaker id
  };
  
  
  function initChatContext(chatId, replyToMessageId) {
  CURRENT_CHAT_CONTEXT.chat_id = chatId;
  CURRENT_CHAT_CONTEXT.reply_to_message_id = replyToMessageId;
  if (replyToMessageId) {
  CURRENT_CHAT_CONTEXT.allow_sending_without_reply = true;
  }
  }

// 初始化用户配置
async function initUserConfig(storeKey) {
  try {
    const userConfig = JSON.parse(await DATABASE.get(storeKey));
    for (const key in userConfig) {
      if (key === 'USER_DEFINE' && typeof USER_DEFINE === typeof userConfig[key]) {
        initUserDefine(userConfig[key]);
      } else {
        if (
          USER_CONFIG.hasOwnProperty(key) &&
            typeof USER_CONFIG[key] === typeof userConfig[key]
        ) {
          USER_CONFIG[key] = userConfig[key];
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function initUserDefine(userDefine) {
  for (const key in userDefine) {
    if (USER_DEFINE.hasOwnProperty(key) &&
        typeof USER_DEFINE[key] === typeof userDefine[key]
    ) {
      USER_DEFINE[key] = userDefine[key];
    }
  }
}

export function initTelegramContext(request) {
  const {pathname} = new URL(request.url);
  const token = pathname.match(
      /^\/telegram\/(\d+:[A-Za-z0-9_-]{35})\/webhook/,
  )[1];
  const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
  if (telegramIndex === -1) {
    throw new Error('Token not allowed');
  }

  SHARE_CONTEXT.currentBotToken = token;
  SHARE_CONTEXT.currentBotId = token.split(':')[0];
  if (ENV.TELEGRAM_BOT_NAME.length > telegramIndex) {
    SHARE_CONTEXT.currentBotName = ENV.TELEGRAM_BOT_NAME[telegramIndex];
  }
}

async function initShareContext(message) {
  SHARE_CONTEXT.usageKey = `usage:${SHARE_CONTEXT.currentBotId}`;
  const id = message?.chat?.id;
  if (id === undefined || id === null) {
    throw new Error('Chat id not found');
  }

  /*
  message_id每次都在变的。
  私聊消息中：
    message.chat.id 是发言人id
  群组消息中：
    message.chat.id 是群id
    message.from.id 是发言人id

   没有开启群组共享模式时，要加上发言人id
   chatHistoryKey = history:chat_id:bot_id:(from_id)
   configStoreKey =  user_config:chat_id:bot_id:(from_id)
  * */

  const botId = SHARE_CONTEXT.currentBotId;
  let historyKey = `history:${id}`;
  let configStoreKey = `user_config:${id}`;
  let groupAdminKey = null;


  if (botId) {
    historyKey += `:${botId}`;
    configStoreKey += `:${botId}`;
  }
  // 标记群组消息
  if (CONST.GROUP_TYPES.includes(message.chat?.type)) {
    if (!ENV.GROUP_CHAT_BOT_SHARE_MODE && message.from.id) {
      historyKey += `:${message.from.id}`;
      configStoreKey += `:${message.from.id}`;
    }
    groupAdminKey = `group_admin:${id}`;
  }

  SHARE_CONTEXT.chatHistoryKey = historyKey;
  SHARE_CONTEXT.configStoreKey = configStoreKey;
  SHARE_CONTEXT.groupAdminKey = groupAdminKey;

  SHARE_CONTEXT.chatType = message.chat?.type;
  SHARE_CONTEXT.chatId = message.chat.id;
  SHARE_CONTEXT.speakerId = message.from.id || message.chat.id;
}


export async function initContext(message) {
  // 按顺序初始化上下文
  console.log(ENV);
  const chatId = message?.chat?.id;
  const replyId = CONST.GROUP_TYPES.includes(message.chat?.type) ? message.message_id : null;
  initChatContext(chatId, replyId);
  console.log(CURRENT_CHAT_CONTEXT);
  await initShareContext(message);
  console.log(SHARE_CONTEXT);
  await initUserConfig(SHARE_CONTEXT.configStoreKey);
  console.log(USER_CONFIG);
}
