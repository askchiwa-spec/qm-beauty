import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import express from 'express';
import cors from 'cors';
import { Boom } from '@hapi/boom';

const QRCode = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(express.json());

// Product catalog with full details
const products = [
    { name: 'Carrot Oil', price: 25000, category: 'Hair Care', benefits: 'Promotes hair growth, prevents breakage, adds shine' },
    { name: 'Coconut Oil (Pure)', price: 35000, category: 'Hair Care', benefits: 'Deep conditioning, scalp health, natural moisturizer' },
    { name: 'Coconut Oil (Regular)', price: 25000, category: 'Hair Care', benefits: 'Daily hair care, affordable nourishment' },
    { name: 'Herbal Hair Oil', price: 30000, category: 'Hair Care', benefits: 'Strengthens roots, reduces dandruff, herbal formula' },
    { name: 'Body Butter', price: 100000, category: 'Body Care', benefits: 'Deep hydration, soft skin, natural ingredients' },
    { name: 'Hair Relaxer & Treatment', price: 55000, category: 'Hair Care', benefits: 'Smooth hair, professional treatment, long-lasting' },
    { name: 'Nail Care Set', price: 30000, category: 'Nail Care', benefits: 'Complete nail care, strengthening, grooming' }
];

// Services with full details
const services = [
    { name: 'Facial Treatments', duration: '60-90 min', price: 'From 50,000 TZS', description: 'Deep cleansing, exfoliation, mask treatment' },
    { name: 'Hair Styling & Treatment', duration: '60-120 min', price: 'From 40,000 TZS', description: 'Professional styling, deep conditioning, scalp treatment' },
    { name: 'Nail Care', duration: '30-60 min', price: 'From 25,000 TZS', description: 'Manicure, pedicure, nail art, gel polish' },
    { name: 'Waxing Services', duration: '30-90 min', price: 'From 30,000 TZS', description: 'Full body waxing, gentle formula, long-lasting' },
    { name: 'Massage Therapy', duration: '60-90 min', price: 'From 60,000 TZS', description: 'Relaxation, deep tissue, aromatherapy' }
];

// Conversation state management for onboarding
const userSessions: Map<string, { step: string; data: any }> = new Map();

// Available time slots
const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
];

// Available dates (next 7 days)
function getAvailableDates(): string[] {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    }
    return dates;
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys-auth');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📱 Scan QR code:');
            QRCode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️ Connection closed, reconnecting:', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ WhatsApp ready!');
        }
    });
    
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && m.type === 'notify') {
            const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            const from = msg.key.remoteJid;
            
            console.log(`📨 Message from ${from}: ${messageText}`);
            
            const lowerMsg = messageText.toLowerCase().trim();
            let reply = '';
            
            // Get or create user session
            const userId = from;
            let session = userSessions.get(userId);
            
            // Handle conversation flow for booking onboarding
            if (session) {
                // User is in a booking flow
                if (session.step === 'select_service') {
                    const serviceNum = parseInt(messageText.trim());
                    if (serviceNum >= 1 && serviceNum <= services.length) {
                        session.data.service = services[serviceNum - 1];
                        session.step = 'select_date';
                        const dates = getAvailableDates();
                        reply = `✅ *${session.data.service.name}* selected!

📅 *Select a date:*
${dates.map((d, i) => `${i + 1}. ${d}`).join('\n')}

Reply with the number (1-7):`;
                    } else {
                        reply = `❌ Invalid selection. Please reply with a number 1-${services.length}`;
                    }
                }
                else if (session.step === 'select_date') {
                    const dateNum = parseInt(messageText.trim());
                    const dates = getAvailableDates();
                    if (dateNum >= 1 && dateNum <= dates.length) {
                        session.data.date = dates[dateNum - 1];
                        session.step = 'select_time';
                        reply = `✅ *${session.data.date}* selected!

🕐 *Select a time:*
${timeSlots.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Reply with the number (1-${timeSlots.length}):`;
                    } else {
                        reply = `❌ Invalid selection. Please reply with a number 1-${dates.length}`;
                    }
                }
                else if (session.step === 'select_time') {
                    const timeNum = parseInt(messageText.trim());
                    if (timeNum >= 1 && timeNum <= timeSlots.length) {
                        session.data.time = timeSlots[timeNum - 1];
                        session.step = 'confirm_name';
                        reply = `✅ *${session.data.time}* selected!

👤 *Please enter your name:*

(Reply with your full name)`;
                    } else {
                        reply = `❌ Invalid selection. Please reply with a number 1-${timeSlots.length}`;
                    }
                }
                else if (session.step === 'confirm_name') {
                    session.data.name = messageText.trim();
                    session.step = 'confirm_phone';
                    reply = `✅ Thank you, *${session.data.name}*!

📞 *Please confirm your phone number:*

(Reply with your phone number)`;
                }
                else if (session.step === 'confirm_phone') {
                    session.data.phone = messageText.trim();
                    session.step = 'final_confirm';
                    reply = `📋 *Booking Summary:*

💇‍♀️ *Service:* ${session.data.service.name}
📅 *Date:* ${session.data.date}
🕐 *Time:* ${session.data.time}
👤 *Name:* ${session.data.name}
📞 *Phone:* ${session.data.phone}
💰 *Price:* ${session.data.service.price}

✅ Reply *CONFIRM* to complete booking
❌ Reply *CANCEL* to start over`;
                }
                else if (session.step === 'final_confirm') {
                    if (lowerMsg === 'confirm') {
                        reply = `🎉 *Booking Confirmed!*

💇‍♀️ *Service:* ${session.data.service.name}
📅 *Date:* ${session.data.date}
🕐 *Time:* ${session.data.time}
👤 *Name:* ${session.data.name}
📞 *Phone:* ${session.data.phone}

📍 *Location:* Dar es Salaam
🕐 *Please arrive 10 minutes early*

*Booking Reference:* QB-APT-${Date.now().toString().slice(-6)}

We'll send you a reminder before your appointment!

Need anything else? Type "help"`;
                        userSessions.delete(userId);
                    } else if (lowerMsg === 'cancel') {
                        reply = `❌ Booking cancelled. Type "book" to start again.`;
                        userSessions.delete(userId);
                    } else {
                        reply = `Please reply *CONFIRM* to complete or *CANCEL* to start over.`;
                    }
                }
                
                if (reply) {
                    try { await sock.sendMessage(from, { text: reply }); console.log('✅ Replied'); } catch (e) {}
                    return; // Exit after handling session
                }
            }
            
            // GREETING - exact matches first
            if (lowerMsg === 'hi' || lowerMsg === 'hello' || lowerMsg === 'hey' || lowerMsg === 'start') {
                reply = `👋 *Welcome to QM Beauty!*

Your Natural & Organic Beauty Destination in Dar es Salaam 🌿

I'm your virtual assistant. Here's how I can help:

🛍️ *Type "products"* - Browse our catalog
📅 *Type "services"* - View spa services
💇 *Type "book"* - Book an appointment (NEW: Full WhatsApp booking!)
🛒 *Type "cart"* - Shopping cart info
📦 *Type "order"* - Check order status
💳 *Type "payment"* - Payment options
📞 *Type "contact"* - Get in touch
❓ *Type "help"* - Full command list

What would you like to explore?`;
            }
            
            // CART - check before product (cart contains no product names)
            else if (lowerMsg === 'cart' || lowerMsg === 'basket' || lowerMsg === 'bag' || lowerMsg === 'my cart') {
                reply = `🛒 *Your Shopping Cart*

*View Your Cart:*
👉 https://qmbeauty.africa/cart

*Quick Actions:*
• Browse products: Type "products"
• Continue shopping: https://qmbeauty.africa/shop
• Checkout: https://qmbeauty.africa/checkout

*Need Help?*
• Payment options: Type "payment"
• Order status: Type "order"
• Contact us: Type "contact"

Happy Shopping! 🛍️`;
            }
            
            // SERVICES - check before product
            else if (lowerMsg === 'services' || lowerMsg === 'service' || lowerMsg === 'spa' || lowerMsg === 'treatment' || lowerMsg === 'treatments') {
                let serviceList = services.map(s => `• *${s.name}* - ${s.price}`).join('\n');
                reply = `💇‍♀️ *QM Beauty Spa Services*

Professional Beauty Services:

${serviceList}

📍 *Location:* Dar es Salaam, Tanzania
🕐 *Hours:* 8 AM - 8 PM Daily
📅 *Book Online:* https://qmbeauty.africa/appointments
📞 *Call/WhatsApp:* +255 657 120 151

Type "book" to schedule your appointment!`;
            }
            
            // BOOK APPOINTMENT - Start WhatsApp onboarding flow
            else if (lowerMsg === 'book' || lowerMsg === 'appointment' || lowerMsg === 'schedule' || lowerMsg === 'reserve' || lowerMsg === 'booking') {
                // Start the booking session
                userSessions.set(userId, { step: 'select_service', data: {} });
                
                reply = `💇‍♀️ *Book Your Beauty Appointment*

✅ *Quick WhatsApp Booking*

*Select a service:*
${services.map((s, i) => `${i + 1}. *${s.name}*\n   💰 ${s.price} | ⏱️ ${s.duration}`).join('\n')}

Reply with the number (1-${services.length}):`;
            }
            
            // SERVICE AVAILABILITY INQUIRY
            else if ((lowerMsg.includes('available') || lowerMsg.includes('can i book') || lowerMsg.includes('do you have slot') || lowerMsg.includes('is there space')) && (lowerMsg.includes('facial') || lowerMsg.includes('hair') || lowerMsg.includes('nail') || lowerMsg.includes('waxing') || lowerMsg.includes('massage') || lowerMsg.includes('appointment') || lowerMsg.includes('service'))) {
                reply = `✅ *Yes, we have appointment slots available!*

💇‍♀️ *Available Services:*
• Facial Treatments - 50,000 TZS
• Hair Styling & Treatment - 40,000 TZS
• Nail Care - 25,000 TZS
• Waxing Services - 30,000 TZS
• Massage Therapy - 60,000 TZS

📅 *Book Now:* https://qmbeauty.africa/appointments
📞 *Quick Booking:* +255 657 120 151
🕐 *Hours:* 8 AM - 8 PM Daily

What service would you like to book?`;
            }
            
            // ORDER STATUS
            else if (lowerMsg === 'order' || lowerMsg === 'orders' || lowerMsg === 'status' || lowerMsg === 'track' || lowerMsg === 'tracking') {
                reply = `📦 *Order Status & Tracking*

*Check Your Order:*
1. Visit: https://qmbeauty.africa/orders
2. Enter your order code (e.g., QB-123456)
3. View real-time status

*Order Codes start with:* QB-

*Shipping Information:*
• Dar es Salaam: 1-2 business days
• Other regions: 2-4 business days
• Free delivery on orders over 100,000 TZS

📞 *Need Help?* +255 657 120 151
📧 *Email:* info@qmbeauty.africa

Provide your order code for assistance!`;
            }
            
            // PAYMENT
            else if (lowerMsg === 'payment' || lowerMsg === 'pay' || lowerMsg === 'mpesa' || lowerMsg === 'tigo' || lowerMsg === 'airtel' || lowerMsg === 'halopesa' || lowerMsg === 'mobile money') {
                reply = `💳 *Payment Options*

We accept all major mobile money and cash:

📱 *Mobile Money:*
• M-Pesa
• Tigo Pesa
• Airtel Money
• HaloPesa

💵 *Cash on Delivery*
• Available in Dar es Salaam
• Pay when you receive

🔒 *Secure Checkout:*
https://qmbeauty.africa/checkout

*How to Pay:*
1. Add products to cart
2. Select payment method at checkout
3. Follow instructions for your chosen method

Questions? Contact us: +255 657 120 151`;
            }
            
            // CONTACT
            else if (lowerMsg === 'contact' || lowerMsg === 'phone' || lowerMsg === 'address' || lowerMsg === 'location' || lowerMsg === 'email' || lowerMsg === 'call') {
                reply = `📞 *Contact QM Beauty*

*Get in Touch:*

📱 *WhatsApp:* +255 657 120 151
📧 *Email:* info@qmbeauty.africa
🌐 *Website:* https://qmbeauty.africa

📍 *Visit Us:*
Dar es Salaam, Tanzania

🕐 *Business Hours:*
Monday - Sunday: 8 AM - 8 PM

*Quick Links:*
🛍️ Shop: https://qmbeauty.africa/shop
📅 Book: https://qmbeauty.africa/appointments
❓ Help: Type "help"

We'd love to hear from you! 💚`;
            }
            
            // HELP
            else if (lowerMsg === 'help' || lowerMsg === 'support' || lowerMsg === 'commands' || lowerMsg === 'menu') {
                reply = `❓ *QM Beauty Bot - Help Menu*

*Available Commands:*

🛍️ *Shopping*
• "products" - Browse catalog
• "carrot oil" - Product details
• "cart" - View cart
• "order" - Check order status

💇‍♀️ *Services*
• "services" - View spa services
• "book" - Book appointment
• "facial" - Service details

💳 *Orders & Payment*
• "payment" - Payment options
• "mpesa" - Mobile money info
• "delivery" - Shipping info

📞 *Support*
• "contact" - Contact info
• "hours" - Business hours
• "location" - Find us

Just type any keyword and I'll help you! 🌟`;
            }
            
            // HOURS
            else if (lowerMsg === 'hours' || lowerMsg === 'hour' || lowerMsg === 'time' || lowerMsg === 'open' || lowerMsg === 'close' || lowerMsg === 'timing') {
                reply = `🕐 *Business Hours*

QM Beauty is open:

*Monday - Sunday:*
8:00 AM - 8:00 PM

*Best times to visit:*
• Morning: 9 AM - 12 PM (Less crowded)
• Afternoon: 2 PM - 5 PM
• Evening: 5 PM - 8 PM

*Book your appointment:*
📅 https://qmbeauty.africa/appointments
📞 +255 657 120 151

Walk-ins also welcome! 💚`;
            }
            
            // DELIVERY/SHIPPING
            else if (lowerMsg === 'delivery' || lowerMsg === 'shipping' || lowerMsg === 'dispatch' || lowerMsg === 'ship') {
                reply = `🚚 *Delivery & Shipping*

*Delivery Areas:*
• Dar es Salaam: Same day / Next day
• Other regions: 2-4 business days

*Delivery Fees:*
• Dar es Salaam: 5,000 TZS
• Free delivery on orders over 100,000 TZS

*Track Your Order:*
https://qmbeauty.africa/orders

Questions? Contact us: +255 657 120 151`;
            }
            
            // PRODUCTS - contains checks (must be after exact matches)
            else if (lowerMsg.includes('product') || lowerMsg.includes('catalog') || lowerMsg.includes('shop') || lowerMsg.includes('buy') || lowerMsg.includes('price') || lowerMsg.includes('item')) {
                let productList = products.map(p => `• *${p.name}* - ${p.price.toLocaleString()} TZS`).join('\n');
                reply = `🛍️ *QM Beauty Product Catalog*

Our Natural & Organic Collection:

${productList}

✨ *All products are:*
• 100% Natural & Organic
• Handmade with care
• Cruelty-free
• Made in Tanzania

🛒 *Shop Online:* https://qmbeauty.africa/shop
📞 *Order via WhatsApp:* +255 657 120 151

Type a product name for more details!`;
            }
            
            // SPECIFIC PRODUCT INFO - handles website inquiries
            else if (products.some(p => lowerMsg.includes(p.name.toLowerCase()))) {
                const product = products.find(p => lowerMsg.includes(p.name.toLowerCase()));
                if (product) {
                    reply = `🛍️ *${product.name}*

💰 Price: ${product.price.toLocaleString()} TZS
📁 Category: ${product.category}
✨ Benefits: ${product.benefits}

✅ *Availability:* In Stock
🚚 *Delivery:* 1-2 days in Dar es Salaam

🛒 *Order Now:* https://qmbeauty.africa/shop
📞 *Order via WhatsApp:* +255 657 120 151

Need help with your order? Just ask!`;
                }
            }
            
            // WEBSITE PRODUCT INQUIRY - when customer asks about availability
            else if (lowerMsg.includes('available') || lowerMsg.includes('in stock') || lowerMsg.includes('do you have') || lowerMsg.includes('can i get')) {
                // Check if any product name is mentioned
                const mentionedProduct = products.find(p => lowerMsg.includes(p.name.toLowerCase()));
                if (mentionedProduct) {
                    reply = `✅ *Yes, ${mentionedProduct.name} is available!*

💰 Price: ${mentionedProduct.price.toLocaleString()} TZS
📁 Category: ${mentionedProduct.category}
✨ ${mentionedProduct.benefits}

🛒 *Order Now:* https://qmbeauty.africa/shop
📞 *WhatsApp Order:* +255 657 120 151
🚚 *Delivery:* 1-2 days in Dar es Salaam

Would you like to place an order?`;
                } else {
                    reply = `✅ *Yes, we have products in stock!*

🛍️ Browse our catalog: https://qmbeauty.africa/shop

Our products:
• Carrot Oil - 25,000 TZS
• Coconut Oil - 25,000-35,000 TZS
• Body Butter - 100,000 TZS
• Herbal Hair Oil - 30,000 TZS
• Hair Relaxer - 55,000 TZS
• Nail Care Set - 30,000 TZS

📞 Order: +255 657 120 151

Which product are you interested in?`;
                }
            }
            
            // DEFAULT FALLBACK
            else {
                reply = `🤔 I didn't understand that.

Try these commands:
• "products" - Browse products
• "services" - View spa services
• "book" - Book appointment
• "help" - Full command list

Or type "hi" to see the main menu! 👋`;
            }
            
            if (reply && from) {
                try {
                    await sock.sendMessage(from, { text: reply });
                    console.log('✅ Replied to:', from.split('@')[0]);
                } catch (e) {
                    console.error('Reply error:', e);
                }
            }
        }
    });
}

startBot();

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'baileys-whatsapp' }));
app.listen(4000, () => console.log('🚀 WhatsApp Bot Server on port 4000'));
