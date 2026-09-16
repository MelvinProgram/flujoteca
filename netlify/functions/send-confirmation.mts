import type { Config } from "@netlify/functions";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const CONFIRMATION_TEMPLATE_ID = 13;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRODUCTION_ORIGIN = "https://flujoteca.es";

// This endpoint triggers a billed third-party (Brevo) email send, so it must
// not be freely callable from anywhere. We only accept requests whose
// Origin (or, failing that, Referer) is our own production site or a
// Netlify deploy preview of it — not a bulletproof anti-abuse measure
// against a scripted client that forges headers, but it blocks the common
// case of the endpoint being hit directly from outside a browser context.
function isAllowedOrigin(candidate: string): boolean {
  try {
    const url = new URL(candidate);
    if (url.origin === PRODUCTION_ORIGIN) return true;
    return url.protocol === "https:" && url.hostname.endsWith(".netlify.app");
  } catch {
    return false;
  }
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (!(origin && isAllowedOrigin(origin)) && !(referer && isAllowedOrigin(referer))) {
    return new Response("Forbidden", { status: 403 });
  }

  const apiKey = Netlify.env.get("BREVO_API_KEY");
  if (!apiKey) {
    console.error("send-confirmation: falta la variable de entorno BREVO_API_KEY");
    return new Response(JSON.stringify({ error: "Brevo no está configurado" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let name: string;
  let email: string;
  try {
    const body = await req.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch (error) {
    console.error("send-confirmation: cuerpo de la petición inválido", error);
    return new Response(JSON.stringify({ error: "Cuerpo inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!name || !email || !EMAIL_PATTERN.test(email)) {
    return new Response(JSON.stringify({ error: "Nombre o email inválidos" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        templateId: CONFIRMATION_TEMPLATE_ID,
        to: [{ email, name }],
        params: { FIRSTNAME: name },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(`send-confirmation: Brevo respondió ${response.status}: ${errorBody}`);
      return new Response(JSON.stringify({ error: "Brevo rechazó el envío" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-confirmation: error al llamar a Brevo", error);
    return new Response(JSON.stringify({ error: "Error al llamar a Brevo" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  method: "POST",
};
