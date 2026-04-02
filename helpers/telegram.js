const axios = require('axios');
const { formatPrice } = require('./format');

async function sendTelegramOrderNotification(order, settings) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { skipped: true };

  const baseUrl = (process.env.BASE_URL || '').replace(/\/$/, '');
  const adminOrderUrl = baseUrl ? `${baseUrl}/admin/orders` : '/admin/orders';
  const lines = [
    '🛒 <b>New Order</b>',
    `Order ID: <b>${order.id}</b>`,
    `Nama: ${order.customer_name}`,
    `WhatsApp: ${order.whatsapp}`,
    `Alamat: ${order.address}`,
    '',
    '<b>Produk:</b>',
    ...order.items.map((item, index) => `${index + 1}. ${item.name} x${item.qty} (${formatPrice(item.line_total_thb, item.line_total_idr)})`),
    '',
    `<b>Total:</b> ${formatPrice(order.total_thb, order.total_idr)}`,
    `Admin: ${adminOrderUrl}`
  ];

  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'HTML'
  });

  return { sent: true };
}

module.exports = { sendTelegramOrderNotification };
