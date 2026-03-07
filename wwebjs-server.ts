import { makeWASocket, DisconnectReason, useMultiFileAuthState, delay, makeInMemoryStore } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';

const QRCode = require('qrcode-terminal');

// Configuration - use localhost for internal API
const API_BASE_URL = 'http://localhost:3000';
const BOT_API_KEY = process.env.BOT_API_KEY || 'qm-bot-secret-key';
const CACHE_TTL = 5 * 60 * 1000;

// Cache
let cachedProducts: any[] = [];
let cachedServices: any[] = [];
let cacheTime: number = 0;

// Conversation states
enum State {
  MAIN_MENU = 'MAIN_MENU',
  BOOKING_SERVICE = 'BOOKING_SERVICE',
  BOOKING_DATE = 'BOOKING_DATE',
  BOOKING_TIME = 'BOOKING_TIME',
  BOOKING_NAME = 'BOOKING_NAME',
  BOOKING_PHONE = 'BOOKING_PHONE',
  BOOKING_CONFIRM = 'BOOKING_CONFIRM',
  PRODUCTS_LIST = 'PRODUCTS_LIST',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  SERVICES_LIST = 'SERVICES_LIST',
}

// User conversation state
interface UserState {
  state: State;
  data: any;
}

const userStates: Map<string, UserState> = new Map();

// Booking services
const BOOKING_SERVICES = [
  { id: '1', name: 'Luxury Facial Treatment', price: '70,000 TZS', duration: '75 min' },
  { id: '2', name: 'Hair Treatments & Relaxer', price: '45,000 TZS', duration: '90 min' },
  { id: '3', name: 'Nails (Manicure & Pedicure)', price: '30,000 TZS', duration: '75 min' },
  { id: '4', name: 'QM Waxing', price: '25,000 TZS', duration: '45 min' },
  { id: '5', name: 'Full Body Massage', price: '85,000 TZS', duration: '120 min' }
];

const DATE_OPTIONS = ['Today', 'Tomorrow', 'In 2 days', 'In 3 days', 'In 4 days', 'In 5 days', 'In 6 days'];
const TIME_OPTIONS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

let sock: any = null;

// In-memory store keeps sent messages so Baileys can resend on phash ACK
const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) as any });

// Manual sent-message cache — store captures via events but has a race condition
// with phash ACKs. This cache is populated synchronously after every sendMessage call.
const sentMessages = new Map<string, any>();

function cacheSentMessage(key: any, message: any) {
  if (key?.id) {
    sentMessages.set(key.id, message);
    // Keep last 200 messages to avoid unbounded growth
    if (sentMessages.size > 200) {
      sentMessages.delete(sentMessages.keys().next().value);
    }
  }
}

// ============ API FUNCTIONS ============

async function fetchFromAPI(endpoint: string): Promise<any> {
  const url = API_BASE_URL + '/api/bot/' + endpoint;
  console.log('[API] URL: ' + url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'x-bot-api-key': BOT_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const contentType = response.headers.get('content-type') || 'unknown';
    const status = response.status;
    console.log('[API] Status: ' + status + ', Type: ' + contentType);

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[API] Not JSON: ' + text.substring(0, 80));
      throw new Error('Not JSON');
    }

    const data = await response.json();
    console.log('[API] OK: ' + (data.count || 0) + ' items [SOURCE] api');
    return data;
    
  } catch (error: any) {
    console.error('[API] Error: ' + error.message + ' [SOURCE] fallback');
    throw error;
  }
}

function isCacheValid(): boolean {
  return cacheTime > 0 && (Date.now() - cacheTime) < CACHE_TTL;
}

async function getProducts(): Promise<{ items: any[]; source: string }> {
  console.log('[CACHE] Checking products...');
  
  if (isCacheValid() && cachedProducts.length > 0) {
    console.log('[CACHE] Using cached (' + cachedProducts.length + ') [SOURCE] cache');
    return { items: cachedProducts, source: 'cache' };
  }
  
  try {
    const data = await fetchFromAPI('products');
    if (data.items && data.items.length > 0) {
      cachedProducts = data.items;
      cacheTime = Date.now();
      return { items: cachedProducts, source: 'api' };
    }
    throw new Error('Empty');
  } catch (error: any) {
    if (cachedProducts.length > 0) {
      return { items: cachedProducts, source: 'stale-cache' };
    }
    return { items: [], source: 'fallback' };
  }
}

async function getServices(): Promise<{ items: any[]; source: string }> {
  console.log('[CACHE] Checking services...');
  
  if (isCacheValid() && cachedServices.length > 0) {
    console.log('[CACHE] Using cached (' + cachedServices.length + ') [SOURCE] cache');
    return { items: cachedServices, source: 'cache' };
  }
  
  try {
    const data = await fetchFromAPI('services');
    if (data.items && data.items.length > 0) {
      cachedServices = data.items;
      cacheTime = Date.now();
      return { items: cachedServices, source: 'api' };
    }
    throw new Error('Empty');
  } catch (error: any) {
    if (cachedServices.length > 0) {
      return { items: cachedServices, source: 'stale-cache' };
    }
    return { items: [], source: 'fallback' };
  }
}

// ============ STATE MANAGEMENT ============

function clearUserState(jid: string) {
  userStates.delete(jid);
}

function setUserState(jid: string, state: State, data: any = {}) {
  userStates.set(jid, { state, data });
  console.log('[STATE] ' + jid.substring(0, 15) + ' -> ' + state);
}

function getUserState(jid: string): UserState | undefined {
  return userStates.get(jid);
}

// ============ MESSAGE SENDING ============

async function sendReply(jid: string, text: string) {
  if (!sock) {
    console.error('[SEND] Socket not ready');
    return;
  }
  try {
    await sock.sendPresenceUpdate('composing', jid).catch(() => {});
    await delay(300);
    const sent = await sock.sendMessage(jid, { text });
    if (sent?.key) cacheSentMessage(sent.key, sent.message);
    await sock.sendPresenceUpdate('paused', jid).catch(() => {});
  } catch (err: any) {
    console.error('[SEND] Error: ' + err.message);
  }
}

// ============ MAIN MENU ============

async function sendMainMenu(jid: string) {
  const prod = await getProducts();
  const svc = await getServices();
  
  const menu = '👋 Welcome to QM Beauty!\n\n' +
    '🛍️ Products: ' + prod.items.length + ' (' + prod.source + ')\n' +
    '💇 Services: ' + svc.items.length + ' (' + svc.source + ')\n\n' +
    'Commands:\n' +
    '• PRODUCTS - View products\n' +
    '• SERVICES - View services\n' +
    '• BOOK - Book appointment\n' +
    '• ORDER - Track order\n' +
    '• PAYMENT - Payment info\n' +
    '• HELP - Contact info\n\n' +
    '📞 +255 657 120 151';
  
  setUserState(jid, State.MAIN_MENU, {});
  await sendReply(jid, menu);
}

// ============ MAIN MESSAGE HANDLER ============

async function handleMessage(jid: string, text: string) {
  const userState = getUserState(jid);
  const upperText = text.toUpperCase().trim();
  const currentState = userState?.state || State.MAIN_MENU;
  
  console.log('[MSG] ' + jid.substring(0, 15) + ' | "' + text + '" | State: ' + currentState);
  
  // Global commands - work in ANY state
  if (upperText === 'M' || upperText === 'MENU' || upperText === 'MAIN') {
    clearUserState(jid);
    await sendMainMenu(jid);
    return;
  }
  
  if (upperText === 'CANCEL' || upperText === 'C') {
    clearUserState(jid);
    await sendReply(jid, '❌ Cancelled.\n\nReply M for Main Menu');
    return;
  }
  
  // Route by STATE - numeric input only works in specific states
  switch (currentState) {
    case State.MAIN_MENU:
      await handleMainMenuInput(jid, text);
      break;
    case State.BOOKING_SERVICE:
      await handleBookingService(jid, text);
      break;
    case State.BOOKING_DATE:
      await handleBookingDate(jid, text);
      break;
    case State.BOOKING_TIME:
      await handleBookingTime(jid, text);
      break;
    case State.BOOKING_NAME:
      await handleBookingName(jid, text);
      break;
    case State.BOOKING_PHONE:
      await handleBookingPhone(jid, text);
      break;
    case State.BOOKING_CONFIRM:
      await handleBookingConfirm(jid, text);
      break;
    case State.PRODUCTS_LIST:
      await handleProductsList(jid, text);
      break;
    case State.SERVICES_LIST:
      await handleServicesList(jid, text);
      break;
    default:
      await sendMainMenu(jid);
  }
}

// ============ MAIN MENU INPUTS ============

async function handleMainMenuInput(jid: string, text: string) {
  const upperText = text.toUpperCase().trim();
  
  if (upperText === 'PRODUCTS' || upperText === 'PRODUCT') {
    setUserState(jid, State.PRODUCTS_LIST, { page: 0 });
    await showProductsList(jid);
  } else if (upperText === 'SERVICES' || upperText === 'SERVICE') {
    setUserState(jid, State.SERVICES_LIST, { page: 0 });
    await showServicesList(jid);
  } else if (upperText === 'BOOK' || upperText === 'BOOKING') {
    setUserState(jid, State.BOOKING_SERVICE, {});
    await showBookingServices(jid);
  } else if (upperText === 'ORDER') {
    await sendReply(jid, '📦 Order Tracking\n\nProvide order number (e.g., QB-123456)\n\nqmbeauty.africa/orders\n\nReply M for Main Menu');
  } else if (upperText === 'PAYMENT') {
    await sendReply(jid, '💳 Payment Options\n\n• M-Pesa\n• Tigo Pesa\n• Airtel Money\n• Cash on Delivery\n\nqmbeauty.africa/checkout\n\nReply M for Main Menu');
  } else if (upperText === 'HELP' || upperText === 'CONTACT') {
    await sendReply(jid, '📞 Contact\n\nWhatsApp: +255 657 120 151\nEmail: info@qmbeauty.africa\nWebsite: qmbeauty.africa\n\nReply M for Main Menu');
  } else {
    await sendReply(jid, '❓ Unknown. Try: PRODUCTS, SERVICES, BOOK, HELP\n\nReply M for Main Menu');
  }
}

// ============ BOOKING FLOW ============

async function showBookingServices(jid: string) {
  let msg = '💇 Book Appointment\n\nSelect service (1-5):\n\n';
  BOOKING_SERVICES.forEach(s => {
    msg += s.id + '. ' + s.name + '\n   💰 ' + s.price + ' | ⏱ ' + s.duration + '\n';
  });
  msg += '\n📝 Reply 1-5\n⬅️ Reply M';
  await sendReply(jid, msg);
}

async function handleBookingService(jid: string, text: string) {
  const num = parseInt(text.trim());
  if (isNaN(num) || num < 1 || num > 5) {
    await sendReply(jid, '❌ Invalid. Reply 1-5');
    return;
  }
  
  const service = BOOKING_SERVICES[num - 1];
  setUserState(jid, State.BOOKING_DATE, { service: service });
  
  let msg = '✅ ' + service.name + '\n💰 ' + service.price + '\n\nSelect date (1-7):\n\n';
  DATE_OPTIONS.forEach((d, i) => msg += (i + 1) + '. ' + d + '\n');
  msg += '\n📝 Reply 1-7';
  await sendReply(jid, msg);
}

async function handleBookingDate(jid: string, text: string) {
  const num = parseInt(text.trim());
  const state = getUserState(jid);
  
  if (isNaN(num) || num < 1 || num > 7) {
    await sendReply(jid, '❌ Invalid date. Reply 1-7');
    return;
  }
  
  const date = DATE_OPTIONS[num - 1];
  setUserState(jid, State.BOOKING_TIME, { 
    service: state?.data.service,
    date: date 
  });
  
  let msg = '📅 ' + date + '\n\nSelect time:\n\n';
  TIME_OPTIONS.forEach((t, i) => msg += (i + 1) + '. ' + t + '\n');
  msg += '\n📝 Reply 1-8';
  await sendReply(jid, msg);
}

async function handleBookingTime(jid: string, text: string) {
  const num = parseInt(text.trim());
  const state = getUserState(jid);
  
  if (isNaN(num) || num < 1 || num > 8) {
    await sendReply(jid, '❌ Invalid time. Reply 1-8');
    return;
  }
  
  const time = TIME_OPTIONS[num - 1];
  setUserState(jid, State.BOOKING_NAME, { 
    service: state?.data.service,
    date: state?.data.date,
    time: time
  });
  
  await sendReply(jid, '⏰ ' + time + '\n\n📝 Enter your NAME:\n\nReply M to cancel');
}

async function handleBookingName(jid: string, text: string) {
  const name = text.trim();
  if (name.length < 2) {
    await sendReply(jid, '❌ Invalid name. Enter your full name.');
    return;
  }
  
  const state = getUserState(jid);
  setUserState(jid, State.BOOKING_PHONE, { 
    service: state?.data.service,
    date: state?.data.date,
    time: state?.data.time,
    name: name
  });
  
  await sendReply(jid, '✅ ' + name + '\n\n📱 Your number: +255717939999\n\nReply:\n1 - Confirm\n2 - Enter different');
}

async function handleBookingPhone(jid: string, text: string) {
  const choice = text.trim();
  const state = getUserState(jid);
  
  if (choice === '1') {
    const phone = '+255717939999';
    setUserState(jid, State.BOOKING_CONFIRM, { 
      service: state?.data.service,
      date: state?.data.date,
      time: state?.data.time,
      name: state?.data.name,
      phone: phone
    });
    await showBookingConfirmation(jid);
  } else if (choice === '2') {
    await sendReply(jid, '📝 Enter your phone number:');
  } else {
    await sendReply(jid, '❌ Reply 1 or 2');
  }
}

async function showBookingConfirmation(jid: string) {
  const s = getUserState(jid)?.data;
  const msg = '📋 Booking Summary:\n\n' +
    '💇 ' + s?.service?.name + '\n' +
    '📅 ' + s?.date + '\n' +
    '⏰ ' + s?.time + '\n' +
    '👤 ' + s?.name + '\n' +
    '📱 ' + s?.phone + '\n\n' +
    'Reply 1 - ✅ Confirm\nReply 2 - ❌ Cancel';
  
  await sendReply(jid, msg);
}

async function handleBookingConfirm(jid: string, text: string) {
  const choice = text.trim();
  
  if (choice === '1') {
    const s = getUserState(jid)?.data;
    const bookingId = 'QB-' + Date.now().toString().slice(-6);
    
    const msg = '🎉 Booking Confirmed!\n\n' +
      '📋 ID: ' + bookingId + '\n\n' +
      '💇 ' + s?.service?.name + '\n' +
      '📅 ' + s?.date + ' at ' + s?.time + '\n\n' +
      'We will contact you at ' + s?.phone + '\n\n' +
      'Reply M for Main Menu';
    
    console.log('[BOOKING] ' + bookingId + ' | ' + s?.service?.name + ' | ' + s?.name);
    clearUserState(jid);
    await sendReply(jid, msg);
    
  } else if (choice === '2') {
    clearUserState(jid);
    await sendReply(jid, '❌ Cancelled.\n\nReply M for Main Menu');
  } else {
    await sendReply(jid, '❌ Reply 1 or 2');
  }
}

// ============ PRODUCTS FLOW ============

async function showProductsList(jid: string) {
  const { items, source } = await getProducts();
  const state = getUserState(jid);
  const page = state?.data?.page || 0;
  const perPage = 7;
  const start = page * perPage;
  const end = start + perPage;
  const pageItems = items.slice(start, end);
  const totalPages = Math.ceil(items.length / perPage);
  
  let msg = '🛍️ Products (' + items.length + ' - ' + source + ')\n\n';
  
  pageItems.forEach((p: any, i: number) => {
    msg += (start + i + 1) + '. ' + p.name + '\n   💰 ' + p.price.toLocaleString() + ' TZS\n';
  });
  
  msg += '\n';
  if (end < items.length) msg += 'Reply N - Next\n';
  if (page > 0) msg += 'Reply P - Previous\n';
  msg += 'Reply M - Main Menu';
  
  await sendReply(jid, msg);
}

async function handleProductsList(jid: string, text: string) {
  const upperText = text.toUpperCase().trim();
  const state = getUserState(jid);
  const page = state?.data?.page || 0;
  
  if (upperText === 'N' || upperText === 'NEXT') {
    setUserState(jid, State.PRODUCTS_LIST, { page: page + 1 });
    await showProductsList(jid);
  } else if (upperText === 'P' || upperText === 'PREV' || upperText === 'PREVIOUS') {
    if (page > 0) {
      setUserState(jid, State.PRODUCTS_LIST, { page: page - 1 });
      await showProductsList(jid);
    } else {
      await sendReply(jid, '❌ Already at first page.');
    }
  } else {
    // Numeric input - show product detail
    const { items } = await getProducts();
    const num = parseInt(text.trim());
    const perPage = 7;
    const start = page * perPage;
    
    if (!isNaN(num) && num >= 1 && num <= items.length) {
      const p = items[num - 1];
      const msg = '✅ ' + p.name + '\n\n' +
        '💰 ' + p.price.toLocaleString() + ' TZS\n' +
        '📁 ' + p.category + '\n\n' +
        (p.description || '') + '\n\n' +
        '🛒 qmbeauty.africa/product/' + p.slug + '\n\n' +
        'Reply M for more options';
      
      setUserState(jid, State.MAIN_MENU, {});
      await sendReply(jid, msg);
    } else {
      await sendReply(jid, '❌ Invalid. Reply N/P or product number.');
    }
  }
}

// ============ SERVICES FLOW ============

async function showServicesList(jid: string) {
  const { items, source } = await getServices();
  
  let msg = '💇 Services (' + items.length + ' - ' + source + ')\n\n';
  
  items.slice(0, 10).forEach((s: any, i: number) => {
    msg += (i + 1) + '. ' + s.name + '\n   💰 ' + s.price + '\n';
  });
  
  if (items.length > 10) {
    msg += '\n... and ' + (items.length - 10) + ' more';
  }
  
  msg += '\n\n🗓️ qmbeauty.africa/services\n\nReply M for Main Menu';
  
  await sendReply(jid, msg);
}

async function handleServicesList(jid: string, text: string) {
  await showServicesList(jid);
}

// ============ BOT STARTUP ============

async function startBot() {
  console.log('[' + new Date().toISOString() + '] Starting QM Beauty Bot');
  console.log('[' + new Date().toISOString() + '] API: ' + API_BASE_URL);
  
  await getProducts();
  await getServices();
  
  const { state, saveCreds } = await useMultiFileAuthState('baileys-auth');
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['Mac OS', 'Chrome', '14.4.1'],
    syncFullHistory: false,
    getMessage: async (key: any) => {
      // Check manual cache first (populated synchronously after sendMessage)
      if (key?.id && sentMessages.has(key.id)) {
        return sentMessages.get(key.id);
      }
      // Fall back to store
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message || undefined;
    },
  });

  // Bind store so sent messages are stored for phash resend lookups
  store.bind(sock.ev);

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', (update: any) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('\n[' + new Date().toISOString() + '] QR Code:');
      QRCode.generate(qr, { small: true });
    }
    
    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      console.log('[' + new Date().toISOString() + '] Closed: ' + statusCode);
      if (statusCode !== DisconnectReason.loggedOut) {
        setTimeout(startBot, 5000);
      }
    } else if (connection === 'open') {
      console.log('[' + new Date().toISOString() + '] ✅ Connected!');
    }
  });

  sock.ev.on('messages.upsert', async (m: any) => {
    const msg = m.messages[0];
    if (msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    if (!from) return;

    // Skip groups, status, newsletter
    if (from.endsWith('@g.us') || from === 'status@broadcast' || from.endsWith('@newsletter')) {
      return;
    }

    const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
    if (!text) return;

    console.log('[INCOMING] ' + from.substring(0, 20) + ': ' + text);
    await handleMessage(from, text);
  });
}

// Baileys WebSocket stream errors (TransformError) bypass try/catch and crash
// the process. Catch at the process level and restart cleanly.
process.on('uncaughtException', (error: Error) => {
  console.error('[' + new Date().toISOString() + '] Uncaught Exception: ' + error.name + ': ' + error.message);

  const isStreamError = error.name === 'TransformError'
    || error.name === 'NetworkError'
    || error.message.includes('TransformError')
    || error.message.includes('stream')
    || error.message.includes('WebSocket');

  if (isStreamError) {
    console.log('[' + new Date().toISOString() + '] Stream error — restarting bot in 5s...');
    sock = null;
    setTimeout(startBot, 5000);
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason: any) => {
  console.error('[' + new Date().toISOString() + '] Unhandled Rejection: ' + (reason?.message || reason));
});

startBot().catch(err => {
  console.error('Fatal: ' + err);
  setTimeout(startBot, 10000);
});
