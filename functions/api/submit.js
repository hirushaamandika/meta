// Cloudflare Pages Function: POST /api/submit
// Required environment variables (Pages > Settings > Variables and Secrets):
//   RESEND_API_KEY  (secret)  - from resend.com
//   TO_EMAIL                  - the address that receives submissions
//   FROM_EMAIL (optional)     - defaults to Resend's test sender

const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return new Response('Bad request', { status: 400 }); }

  const name = String(data.name || '').trim().slice(0, 100);
  const message = String(data.message || '').trim().slice(0, 2000);
  if (!name || !message) return new Response('Missing fields', { status: 400 });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.FROM_EMAIL || 'Website Form <onboarding@resend.dev>',
      to: [env.TO_EMAIL],
      subject: `New form submission from ${name}`,
      html: `<p><b>Name:</b> ${esc(name)}</p><p><b>Message:</b><br>${esc(message).replace(/\n/g, '<br>')}</p>`
    })
  });

  return new Response(res.ok ? 'OK' : await res.text(), { status: res.ok ? 200 : 502 });
}
