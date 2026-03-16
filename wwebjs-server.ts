import { makeWASocket, DisconnectReason, useMultiFileAuthState, delay, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

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
  { id: '1', name: 'Japanese Head Spa Treatment', duration: '90 min' },
  { id: '2', name: 'Luxury Facial Treatment', duration: '75 min' },
  { id: '3', name: 'Full Body Massage', duration: '120 min' },
  { id: '4', name: 'QM Waxing', duration: '45 min' },
  { id: '5', name: 'QM Full Body Coffee Scrub', duration: '60 min' },
  { id: '6', name: 'Hair Treatments & Relaxer', duration: '90 min' },
  { id: '7', name: 'Hair Braiding', duration: '180 min' },
  { id: '8', name: 'Hair Plaiting', duration: '150 min' },
  { id: '9', name: 'Nails (Manicure & Pedicure)', duration: '75 min' },
  { id: '10', name: 'Make Up', duration: '60 min' },
  { id: '11', name: 'Heena', duration: '90 min' },
  { id: '12', name: 'Foot Massage', duration: '45 min' },
  { id: '13', name: 'Eyebrows / Upper Lip / Chin Threading', duration: '30 min' },
  { id: '14', name: 'Special Packages', duration: 'Varies' }
];

const DATE_OPTIONS = ['Today', 'Tomorrow', 'In 2 days', 'In 3 days', 'In 4 days', 'In 5 days', 'In 6 days'];
const TIME_OPTIONS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

let sock: any = null;

// Manual sent-message cache — populated synchronously after every sendMessage call.
// Baileys uses the getMessage callback to resend messages on phash ACK.
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

// LID (Linked ID) → phone JID resolution map.
// WhatsApp assigns privacy-preserving 14-digit LIDs to accounts. Messages arrive
// with a @s.whatsapp.net JID that looks like a phone but is actually a LID.
// For delivery to work we must send to either: the real phone JID (from contacts
// events) OR use the @lid domain suffix which Baileys/WhatsApp routes correctly.
const lidToPhoneJid = new Map<string, string>();

function mapContact(c: any) {
  const phoneJid: string | undefined = c.id;
  const lid: string | undefined = c.lid;
  if (phoneJid && lid) {
    const lidNum = lid.includes('@') ? lid.split('@')[0] : lid;
    lidToPhoneJid.set(lidNum, phoneJid);
    lidToPhoneJid.set(lidNum + '@s.whatsapp.net', phoneJid);
    lidToPhoneJid.set(lidNum + '@lid', phoneJid);
    console.log('[CONTACT] LID ' + lidNum.substring(0, 12) + ' -> ' + phoneJid.substring(0, 20));
  }
}

function isLidJid(jid: string): boolean {
  // Standard phone JIDs: country_code + number = 10-13 digits max
  // Tanzania = 255XXXXXXXXX = 12 digits. LIDs are 14+ digits.
  const num = jid.split('@')[0];
  return /^\d{14,}$/.test(num);
}

function resolveJidForSend(jid: string): string {
  // 1. Direct hit from contacts events (phone JID confirmed)
  if (lidToPhoneJid.has(jid)) return lidToPhoneJid.get(jid)!;
  const num = jid.split('@')[0];
  if (lidToPhoneJid.has(num)) return lidToPhoneJid.get(num)!;

  // 2. Log unresolved LIDs so we can diagnose
  if (isLidJid(jid)) {
    console.log('[RESOLVE] LID unresolved, using as-is: ' + jid.substring(0, 25));
  }

  return jid;
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
    const targetJid = resolveJidForSend(jid);
    if (targetJid !== jid) console.log('[SEND] LID resolved: ' + jid.substring(0, 15) + ' -> ' + targetJid.substring(0, 15));
    await sock.sendPresenceUpdate('composing', targetJid).catch(() => {});
    await delay(300);
    const sent = await sock.sendMessage(targetJid, { text });
    const sentId = sent?.key?.id;
    const hasMsgProto = !!sent?.message;
    console.log('[SEND] id=' + sentId + ' to=' + targetJid.substring(0, 20) + ' proto=' + hasMsgProto);
    if (sent?.key) cacheSentMessage(sent.key, sent.message);
    await sock.sendPresenceUpdate('paused', jid).catch(() => {});
  } catch (err: any) {
    console.error('[SEND] Error: ' + err.message);
  }
}

// ============ MAIN MENU ============

async function sendMainMenu(jid: string) {
  const menu =
    '👋 *Welcome to QM Beauty!*\n\n' +
    'What can we help you with today?\n\n' +
    '1️⃣ PRODUCTS — Browse our products\n' +
    '2️⃣ SERVICES — View beauty services\n' +
    '3️⃣ BOOK — Book an appointment\n' +
    '4️⃣ ORDER — Track your order\n' +
    '5️⃣ PAYMENT — Payment options\n' +
    '6️⃣ CONTACT — Get in touch\n\n' +
    'Reply with a number (1-6) or keyword.\n' +
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

const GREETINGS = new Set(['HI', 'HELLO', 'HEY', 'START', 'BEGIN', 'HUJAMBO', 'MAMBO', 'HABARI', 'SALAM', 'HAI', 'NIAJE', 'SUP', 'YO', 'HELP', '0']);

async function handleMainMenuInput(jid: string, text: string) {
  const upperText = text.toUpperCase().trim();

  // Greetings and first-time users → show main menu
  if (GREETINGS.has(upperText)) {
    await sendMainMenu(jid);
  } else if (upperText === 'PRODUCTS' || upperText === 'PRODUCT' || upperText === '1') {
    setUserState(jid, State.PRODUCTS_LIST, { page: 0 });
    await showProductsList(jid);
  } else if (upperText === 'SERVICES' || upperText === 'SERVICE' || upperText === '2') {
    setUserState(jid, State.SERVICES_LIST, {});
    await showServicesList(jid);
  } else if (upperText === 'BOOK' || upperText === 'BOOKING' || upperText === '3') {
    setUserState(jid, State.BOOKING_SERVICE, {});
    await showBookingServices(jid);
  } else if (upperText === 'ORDER' || upperText === '4') {
    await sendReply(jid, '📦 *Order Tracking*\n\nSend your order number (e.g. QB-123456) and we will update you.\n\n🌐 qmbeauty.africa/orders\n\nReply M for Main Menu');
  } else if (upperText === 'PAYMENT' || upperText === '5') {
    await sendReply(jid, '💳 *Payment Options*\n\n• M-Pesa\n• Tigo Pesa\n• Airtel Money\n• Cash on Delivery\n\n🌐 qmbeauty.africa/checkout\n\nReply M for Main Menu');
  } else if (upperText === 'CONTACT' || upperText === '6') {
    await sendReply(jid, '📞 *Contact Us*\n\nWhatsApp: +255 657 120 151\nEmail: info@qmbeauty.africa\nWebsite: qmbeauty.africa\n\nReply M for Main Menu');
  } else {
    // Unknown input — show menu instead of error
    await sendMainMenu(jid);
  }
}

// ============ BOOKING FLOW ============

async function showBookingServices(jid: string) {
  let msg = '💇 *Book Appointment*\n\nSelect service:\n\n';
  BOOKING_SERVICES.forEach(s => {
    msg += s.id + '. ' + s.name + ' ⏱ ' + s.duration + '\n';
  });
  msg += '\n📝 Reply with number\n⬅️ Reply M';
  await sendReply(jid, msg);
}

async function handleBookingService(jid: string, text: string) {
  const num = parseInt(text.trim());
  if (isNaN(num) || num < 1 || num > BOOKING_SERVICES.length) {
    await sendReply(jid, '❌ Invalid. Reply 1-' + BOOKING_SERVICES.length);
    return;
  }

  const service = BOOKING_SERVICES[num - 1];
  setUserState(jid, State.BOOKING_DATE, { service: service });

  let msg = '✅ ' + service.name + '\n⏱ ' + service.duration + '\n\n📞 *Pricing is personalised — our team will confirm the cost.*\n\nSelect date (1-7):\n\n';
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
  if (name.length < 2 || /\d/.test(name)) {
    await sendReply(jid, '❌ Please enter your full name (letters only).');
    return;
  }

  const state = getUserState(jid);
  setUserState(jid, State.BOOKING_PHONE, {
    service: state?.data.service,
    date: state?.data.date,
    time: state?.data.time,
    name,
  });

  await sendReply(jid, '✅ ' + name + '\n\n📱 Enter your phone number:\n(e.g. 0712345678 or +255712345678)\n\nReply M to cancel');
}

async function handleBookingPhone(jid: string, text: string) {
  const raw = text.trim().replace(/\s+/g, '');
  const state = getUserState(jid);

  // Normalize: accept 07XXXXXXXX, 255XXXXXXXXX, +255XXXXXXXXX
  let phone = raw;
  if (/^0\d{9}$/.test(raw)) {
    phone = '+255' + raw.slice(1);
  } else if (/^255\d{9}$/.test(raw)) {
    phone = '+' + raw;
  } else if (/^\+255\d{9}$/.test(raw)) {
    phone = raw;
  } else {
    await sendReply(jid, '❌ Invalid number. Enter a Tanzania number:\ne.g. 0712345678 or +255712345678');
    return;
  }

  setUserState(jid, State.BOOKING_CONFIRM, {
    service: state?.data.service,
    date: state?.data.date,
    time: state?.data.time,
    name: state?.data.name,
    phone,
  });
  await showBookingConfirmation(jid);
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

function formatPrice(price: any): string {
  if (typeof price === 'number') return price.toLocaleString() + ' TZS';
  if (typeof price === 'string') {
    const n = parseFloat(price.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? price : n.toLocaleString() + ' TZS';
  }
  return String(price);
}

async function showProductsList(jid: string) {
  const { items } = await getProducts();
  const state = getUserState(jid);
  const page = state?.data?.page || 0;
  const perPage = 7;
  const start = page * perPage;
  const end = start + perPage;
  const pageItems = items.slice(start, end);

  if (items.length === 0) {
    await sendReply(jid, '😔 Products unavailable right now.\n\n🌐 qmbeauty.africa/products\n\nReply M for Main Menu');
    return;
  }

  let msg = '🛍️ *Products* (' + items.length + ' total)\n\n';
  pageItems.forEach((p: any, i: number) => {
    msg += (start + i + 1) + '. ' + p.name + '\n   💰 ' + formatPrice(p.price) + '\n';
  });

  msg += '\n';
  if (end < items.length) msg += 'N - Next page\n';
  if (page > 0) msg += 'P - Previous page\n';
  msg += 'Reply number for details, or M for Main Menu';

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
      const msg = '🛍️ *' + p.name + '*\n\n' +
        '💰 ' + formatPrice(p.price) + '\n' +
        '📁 ' + (p.category || '') + '\n' +
        (p.description ? '\n' + p.description + '\n' : '') +
        '\n🛒 qmbeauty.africa/product/' + (p.slug || p.id) + '\n\n' +
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
  const { items } = await getServices();

  if (items.length === 0) {
    await sendReply(jid, '😔 Services unavailable right now.\n\n🌐 qmbeauty.africa/services\n\nReply M for Main Menu');
    return;
  }

  let msg = '💇 *Our Services*\n\n';
  items.slice(0, 10).forEach((s: any, i: number) => {
    msg += (i + 1) + '. ' + s.name + (s.duration ? ' ⏱ ' + s.duration : '') + '\n';
  });

  if (items.length > 10) msg += '\n... and ' + (items.length - 10) + ' more';

  msg += '\n\nReply a number for details, BOOK to book, or M for Main Menu';
  await sendReply(jid, msg);
}

async function handleServicesList(jid: string, text: string) {
  const upperText = text.toUpperCase().trim();
  if (upperText === 'BOOK' || upperText === 'BOOKING') {
    setUserState(jid, State.BOOKING_SERVICE, {});
    await showBookingServices(jid);
    return;
  }

  const { items } = await getServices();
  const num = parseInt(text.trim());
  if (!isNaN(num) && num >= 1 && num <= items.length) {
    const s = items[num - 1];
    const msg =
      '💇 *' + s.name + '*\n\n' +
      '⏱ ' + (s.duration || 'Contact us for duration') + '\n' +
      (s.description ? '\n' + s.description + '\n' : '') +
      '\n💬 *Pricing is personalised — contact us for a quote.*' +
      '\n\n📅 Reply BOOK to book this service\nReply M for Main Menu';
    setUserState(jid, State.MAIN_MENU, {});
    await sendReply(jid, msg);
  } else {
    await showServicesList(jid);
  }
}

// ============ BOT STARTUP ============

async function startBot() {
  console.log('[' + new Date().toISOString() + '] Starting QM Beauty Bot');
  console.log('[' + new Date().toISOString() + '] API: ' + API_BASE_URL);
  
  await getProducts();
  await getServices();
  
  // Fetch latest WhatsApp Web version to avoid 405 errors
  let version: [number, number, number] | undefined;
  try {
    const versionInfo = await fetchLatestBaileysVersion();
    version = versionInfo.version;
    if (version) {
      console.log('[' + new Date().toISOString() + '] Using WhatsApp Web version: ' + version.join('.'));
    }
  } catch (err: any) {
    console.warn('[' + new Date().toISOString() + '] Could not fetch version, using default: ' + err.message);
  }
  
  const { state, saveCreds } = await useMultiFileAuthState('baileys-auth');
  
  sock = makeWASocket({
    auth: state,
    version: version,
    browser: ['Mac OS', 'Chrome', '14.4.1'],
    syncFullHistory: false,
    getMessage: async (key: any) => {
      const id = key?.id;
      if (id && sentMessages.has(id)) {
        const m = sentMessages.get(id);
        console.log('[GETMSG] CACHE HIT id=' + id + ' proto=' + !!m);
        return m;
      }
      console.log('[GETMSG] MISS id=' + id);
      return undefined;
    },
  });

  sock.ev.on('creds.update', saveCreds);

  // Build LID → phone JID map from all three contact events.
  // contacts.set fires on initial sync, upsert/update fire on changes.
  sock.ev.on('contacts.set', ({ contacts }: any) => {
    for (const c of contacts) mapContact(c);
  });
  sock.ev.on('contacts.upsert', (contacts: any[]) => {
    for (const c of contacts) mapContact(c);
  });
  sock.ev.on('contacts.update', (updates: any[]) => {
    for (const c of updates) mapContact(c);
  });

  // Track delivery status (1=pending 2=server_ack 3=delivered 4=read)
  // fromMe=true means OUR message was delivered to the user
  // fromMe=false means USER's message was ACK'd by our account
  sock.ev.on('messages.update', (updates: any[]) => {
    for (const u of updates) {
      if (u.update?.status !== undefined) {
        console.log('[DELIVERY] id=' + u.key?.id + ' fromMe=' + u.key?.fromMe + ' status=' + u.update.status + ' jid=' + (u.key?.remoteJid || ''));
      }
    }
  });
  
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

    console.log('[INCOMING] key=' + JSON.stringify(msg.key));
    console.log('[INCOMING] full=' + JSON.stringify(msg));
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
