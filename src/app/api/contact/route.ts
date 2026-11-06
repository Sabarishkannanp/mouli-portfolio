export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 5000);
  const type = String(body.type ?? "Other").slice(0, 40);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "Please fill in name, a valid email and a message." }, { status: 400 });
  }

  // TODO: send with Resend
  //   npm i resend, add RESEND_API_KEY in Vercel → Settings → Environment Variables, then:
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: "Portfolio <onboarding@resend.dev>",
  //     to: "mouliprasanth796@gmail.com",
  //     replyTo: email,
  //     subject: `New ${type} enquiry from ${name}`,
  //     text: message,
  //   });
  console.log("[contact]", { name, email, type, message });

  return Response.json({ ok: true });
}
