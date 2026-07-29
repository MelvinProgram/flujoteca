/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * URL del webhook al que se envía el formulario de contacto
   * (Zapier, Make, n8n, etc.). Configurable por entorno — ver .env.example.
   */
  readonly PUBLIC_CONTACT_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
