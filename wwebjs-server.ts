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
            
            console.log(📨 Message from \: \);
            
            const lowerMsg = messageText.toLowerCase().trim();
            let reply = '';
            
            // GREETING
            if (lowerMsg === 'hi' || lowerMsg === 'hello' || lowerMsg === 'hey' || lowerMsg === 'start') {
                reply = \👋 *Welcome to QM Beauty!*

Your Natural & Organic Beauty Destination in Dar es Salaam 🌿

I'm your virtual assistant. Here's how I can help:

🛍️ *Type "products"* - Browse our catalog
📅 *Type "services"* - View spa services
💇 *Type "book"* - Book an appointment
🛒 *Type "cart"* - Shopping cart info
📦 *Type "order"* - Check order status
💳 *Type "payment"* - Payment options
📞 *Type "contact"* - Get in touch
❓ *Type "help"* - Full command list

What would you like to explore?\;
            }
            
            // PRODUCTS
            else if (lowerMsg.includes('product') || lowerMsg.includes('catalog') || lowerMsg.includes('shop') || lowerMsg.includes('buy') || lowerMsg.includes('price')) {
                let productList = products.map(p => \• *\* - \ TZS\).join('\n');
                reply = \🛍️ *QM Beauty Product Catalog*

Our Natural & Organic Collection:

\

✨ *All products are:*
• 100% Natural & Organic
• Handmade with care
• Cruelty-free
• Made in Tanzania

🛒 *Shop Online:* https://qmbeauty.africa/shop
📞 *Order via WhatsApp:* +255 657 120 151

Type a product name for more details!\;
            }
            
            // SPECIFIC PRODUCT INFO
            else if (products.some(p => lowerMsg.includes(p.name.toLowerCase()))) {
                const product = products.find(p => lowerMsg.includes(p.name.toLowerCase()));
                if (product) {
                    reply = \🛍️ *\*

💰 Price: \ TZS
📁 Category: \
✨ Benefits: \

🛒 Shop: https://qmbeauty.africa/shop

Need help with your order? Just ask!\;
                }
            }
            
            // SERVICES
            else if (lowerMsg.includes('service') || lowerMsg.includes('spa') || lowerMsg.includes('treatment')) {
                let serviceList = services.map(s => \• *\* - \\).join('\n');
                reply = \💇‍♀️ *QM Beauty Spa Services*

Professional Beauty Services:

\

📍 *Location:* Dar es Salaam, Tanzania
🕐 *Hours:* 8 AM - 8 PM Daily
📅 *Book Online:* https://qmbeauty.africa/appointments
📞 *Call/WhatsApp:* +255 657 120 151

Type "book" to schedule your appointment!\;
            }
            
            // BOOK APPOINTMENT
            else if (lowerMsg.includes('book') || lowerMsg.includes('appointment') || lowerMsg.includes('schedule') || lowerMsg.includes('reserve')) {
                reply = \💇‍♀️ *Book Your Beauty Appointment*

*How to Book:*
1️⃣ Visit: https://qmbeauty.africa/appointments
2️⃣ Select your preferred service
3️⃣ Choose date & time
4️⃣ Confirm your booking

*Our Services:*
• Facial Treatments (60-90 min)
• Hair Styling & Treatment (60-120 min)
• Nail Care (30-60 min)
• Waxing Services (30-90 min)
• Massage Therapy (60-90 min)

📞 *Quick Booking:* +255 657 120 151
📍 *Visit Us:* Dar es Salaam, Tanzania
🕐 *Hours:* 8 AM - 8 PM Daily

What service would you like to book?\;
            }
            
            // CART
            else if (lowerMsg.includes('cart') || lowerMsg.includes('basket') || lowerMsg.includes('bag')) {
                reply = \🛒 *Your Shopping Cart*

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

Happy Shopping! 🛍️\;
            }
            
            // ORDER STATUS
            else if (lowerMsg.includes('order') || lowerMsg.includes('status') || lowerMsg.includes('track') || lowerMsg.includes('delivery')) {
                reply = \📦 *Order Status & Tracking*

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

Provide your order code for assistance!\;
            }
            
            // PAYMENT
            else if (lowerMsg.includes('pay') || lowerMsg.includes('payment') || lowerMsg.includes('mpesa') || lowerMsg.includes('tigo') || lowerMsg.includes('airtel')) {
                reply = \💳 *Payment Options*

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

Questions? Contact us: +255 657 120 151\;
            }
            
            // CONTACT
            else if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('address') || lowerMsg.includes('location') || lowerMsg.includes('email')) {
                reply = \📞 *Contact QM Beauty*

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

We'd love to hear from you! 💚\;
            }
            
            // HELP
            else if (lowerMsg.includes('help') || lowerMsg.includes('support') || lowerMsg.includes('command') || lowerMsg.includes('menu')) {
                reply = \❓ *QM Beauty Bot - Help Menu*

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

Just type any keyword and I'll help you! 🌟\;
            }
            
            // HOURS
            else if (lowerMsg.includes('hour') || lowerMsg.includes('time') || lowerMsg.includes('open') || lowerMsg.includes('close')) {
                reply = \🕐 *Business Hours*

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

Walk-ins also welcome! 💚\;
            }
            
            // DELIVERY/SHIPPING
            else if (lowerMsg.includes('delivery') || lowerMsg.includes('shipping') || lowerMsg.includes('dispatch')) {
                reply = \🚚 *Delivery & Shipping*

*Delivery Areas:*
• Dar es Salaam: Same day / Next day
• Other regions: 2-4 business days

*Delivery Fees:*
• Dar es Salaam: 5,000 TZS
• Free delivery on orders over 100,000 TZS

*Track Your Order:*
https://qmbeauty.africa/orders

Questions? Contact us: +255 657 120 151\;
            }
            
            // DEFAULT FALLBACK
            else {
                reply = \🤔 I didn't understand that.

Try these commands:
• "products" - Browse products
• "services" - View spa services
• "book" - Book appointment
• "help" - Full command list

Or type "hi" to see the main menu! 👋\;
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
