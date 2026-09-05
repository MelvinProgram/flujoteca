import type { Config } from "@netlify/functions";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const SENDER = { name: "Melvin — Flujoteca", email: "hola@flujoteca.es" };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmail(name: string) {
  const text = `Hola ${name},

Hemos recibido tu solicitud de diagnóstico gratuito. Te responderemos en menos de 24 horas para proponerte horario y hablar sobre cómo automatizar los procesos de tu despacho.

Mientras tanto, si tienes alguna pregunta puedes responder directamente a este correo.

Un saludo,
Melvin — Flujoteca`;

  const html = text
    .split("\n\n")
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

  return { text, html };
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
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

  if (!name || !email) {
    return new Response(JSON.stringify({ error: "Falta nombre o email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { text, html } = buildEmail(name);

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email, name }],
        subject: "Hemos recibido tu solicitud — Flujoteca",
        htmlContent: html,
        textContent: text,
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
