const orderConfirmationTemplate = (order) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb">
  <div style="background:#4f46e5;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">Order Confirmed!</h1>
  </div>
  <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
    <p style="color:#374151">Hi <strong>${order.user?.name || 'Customer'}</strong>,</p>
    <p style="color:#374151">Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>

    <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
      <h3 style="margin:0 0 12px;color:#111827">Order Summary</h3>
      ${order.items.map(item => `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#374151">${item.name} × ${item.quantity}</span>
          <span style="color:#111827;font-weight:600">₹${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
      <hr style="border:none;border-top:1px solid #d1d5db;margin:12px 0"/>
      <div style="display:flex;justify-content:space-between">
        <strong>Total</strong>
        <strong style="color:#4f46e5">₹${order.total.toFixed(2)}</strong>
      </div>
    </div>

    <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
      <h3 style="margin:0 0 8px;color:#111827">Shipping to</h3>
      <p style="margin:0;color:#374151">
        ${order.shippingAddress.fullName}<br/>
        ${order.shippingAddress.street}, ${order.shippingAddress.city}<br/>
        ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
      </p>
    </div>

    <p style="color:#6b7280;font-size:14px">
      Estimated delivery: <strong>${new Date(order.estimatedDelivery).toDateString()}</strong>
    </p>

    <a href="${process.env.FRONTEND_URL}/order-confirmation/${order._id}"
       style="display:block;text-align:center;background:#4f46e5;color:#fff;padding:12px;border-radius:8px;text-decoration:none;margin-top:16px">
      Track Your Order
    </a>
  </div>
</div>`

const shippingUpdateTemplate = (order, status) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb">
  <div style="background:#4f46e5;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <h1 style="color:#fff;margin:0">Order ${status.charAt(0).toUpperCase() + status.slice(1)}!</h1>
  </div>
  <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
    <p>Hi <strong>${order.user?.name || 'Customer'}</strong>,</p>
    <p>Your order <strong>#${order.orderNumber}</strong> is now <strong>${status}</strong>.</p>
    ${status === 'shipped' ? `<p style="color:#374151">Your package is on its way! Expected delivery: <strong>${new Date(order.estimatedDelivery).toDateString()}</strong></p>` : ''}
    ${status === 'delivered' ? `<p style="color:#059669;font-weight:600">Your order has been delivered. Enjoy your purchase!</p>` : ''}
    <a href="${process.env.FRONTEND_URL}/order-confirmation/${order._id}"
       style="display:block;text-align:center;background:#4f46e5;color:#fff;padding:12px;border-radius:8px;text-decoration:none;margin-top:16px">
      View Order
    </a>
  </div>
</div>`

const newsletterTemplate = (subject, content) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb">
  <div style="background:#4f46e5;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <h1 style="color:#fff;margin:0">${subject}</h1>
  </div>
  <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
    ${content}
    <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
    <p style="color:#9ca3af;font-size:12px;text-align:center">
      You're receiving this because you subscribed to ShopKart newsletters.
    </p>
  </div>
</div>`

const lowStockAlertTemplate = (products) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <h2 style="color:#dc2626">Low Stock Alert</h2>
  <p>The following products are running low on stock:</p>
  <table style="width:100%;border-collapse:collapse">
    <tr style="background:#f3f4f6">
      <th style="padding:8px;text-align:left">Product</th>
      <th style="padding:8px;text-align:right">Stock</th>
    </tr>
    ${products.map(p => `
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:8px">${p.name}</td>
        <td style="padding:8px;text-align:right;color:${p.stock === 0 ? '#dc2626' : '#d97706'};font-weight:600">
          ${p.stock === 0 ? 'OUT OF STOCK' : p.stock + ' left'}
        </td>
      </tr>
    `).join('')}
  </table>
</div>`

module.exports = {
  orderConfirmationTemplate,
  shippingUpdateTemplate,
  newsletterTemplate,
  lowStockAlertTemplate,
}