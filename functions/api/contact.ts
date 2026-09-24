interface Env {
  SENDGRID_API_KEY: string;
  CONTACT_TO_EMAILS: string;
  CONTACT_FROM_EMAIL?: string;
}

interface ContactPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  stage?: string;
  message?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { firstName, lastName, email, company, stage, message } = body;

  if (!firstName || !lastName || !email || !company) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 422 });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  if (!emailOk) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 422 });
  }

  const toAddresses = (env.CONTACT_TO_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
    .map(e => ({ email: e }));

  if (toAddresses.length === 0) {
    return new Response(JSON.stringify({ error: 'No recipient configured' }), { status: 500 });
  }

  const fromEmail = env.CONTACT_FROM_EMAIL || 'noreply@humeedge.ai';

  const htmlBody = `
    <h2>New Contact Form Submission — Hume Edge</h2>
    <table cellpadding="8" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
      <tr><td><strong>Name</strong></td><td>${firstName} ${lastName}</td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td><strong>Company</strong></td><td>${company}</td></tr>
      <tr><td><strong>AI Journey Stage</strong></td><td>${stage || '—'}</td></tr>
      <tr><td><strong>Message</strong></td><td style="white-space:pre-wrap;max-width:560px">${message || '—'}</td></tr>
    </table>
  `;

  const sgPayload = {
    personalizations: [{ to: toAddresses }],
    from: { email: fromEmail, name: 'Hume Edge Website' },
    reply_to: { email: email.trim(), name: `${firstName} ${lastName}` },
    subject: `New Inquiry from ${firstName} ${lastName} — ${company}`,
    content: [{ type: 'text/html', value: htmlBody }],
  };

  const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
    },
    body: JSON.stringify(sgPayload),
  });

  if (!sgRes.ok) {
    const detail = await sgRes.text();
    console.error('SendGrid error:', sgRes.status, detail);
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
