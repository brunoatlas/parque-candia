# Parque Cândia — Butantã (site estático)

Réplica em **HTML + CSS + JavaScript puro** do site feito no Lovable
(`butanta-next-chapter.lovable.app`), pronta para subir em qualquer hospedagem
e rodar campanhas no Google Ads.

Sem build, sem framework, sem dependência: é só enviar os arquivos.

## Estrutura

```
parque-candia-site/
├── index.html          página única (todas as seções)
├── favicon.png
├── robots.txt          ← trocar SEUDOMINIO
├── sitemap.xml         ← trocar SEUDOMINIO
├── integracao/
│   ├── README-planilha.md   como ligar a planilha de leads
│   └── apps-script.gs       código para colar no Google Apps Script
└── assets/
    ├── css/style.css
    ├── js/main.js      ← configuração (WhatsApp, endpoint de lead, Ads)
    └── img/            hero, plantas, lazer, logo
```

## Ordem das seções

1. **Hero** — título, chamadas e dados principais
2. **Match Imobiliário (formulário)** — logo abaixo do topo, para o cliente não procurar
3. Conceito (morar / investir / patrimônio)
4. Plantas (6 metragens)
5. Lazer (6 categorias)
6. Localização (destaques de tempo)
7. Seu momento (morar / investir)
8. Bruno + FAQ
9. Rodapé

## Antes de publicar — checklist

1. **Domínio**: substituir `SEUDOMINIO.com.br` em `index.html` (canonical + Open Graph),
   `robots.txt` e `sitemap.xml`.
2. **WhatsApp**: já configurado como `5511963055700` em `assets/js/main.js` (`CONFIG.whatsapp`).
3. **Google Tag**: em `index.html`, trocar `G-XXXXXXXXXX` pelo ID do GA4 e,
   se for rodar Ads, descomentar a linha `gtag('config', 'AW-XXXXXXXXX')`.
4. **Conversão do Ads**: preencher `CONFIG.adsConversionLabel` em `main.js`
   com o rótulo no formato `AW-123456789/AbC-D_efGh`. Ele dispara no envio do formulário.
5. **Leads na planilha**: preencher `CONFIG.leadEndpoint` com a URL do Google Apps Script.
   Passo a passo em [integracao/README-planilha.md](integracao/README-planilha.md).
   Sem isso o lead segue **apenas** pelo WhatsApp — quem preenche e não clica se perde.

## Eventos enviados (dataLayer + gtag)

| Evento | Quando |
|---|---|
| `page_view` | carregamento |
| `hero_cta_click` | botões do topo |
| `plant_select` / `plant_cta_click` | troca de planta / CTA da planta |
| `amenity_view` | troca de categoria de lazer |
| `morar_click` / `investment_click` | alternador "seu momento" |
| `simulator_start` / `simulator_complete` | início e fim do quiz |
| **`lead_submit`** | envio do formulário — **use como conversão no Ads** |
| `whatsapp_click` | qualquer botão de WhatsApp |
| `faq_open` | abertura de pergunta |

## Como subir

### Opção A — Hospedagem tradicional (cPanel / FTP)
Envie o conteúdo da pasta para `public_html/`. Pronto.

### Opção B — Cloudflare Pages / Netlify / Vercel (grátis, com HTTPS)
Suba a pasta pelo painel ("deploy sem build"). Depois aponte o domínio comprado
no Google Domains/Squarespace para os servidores indicados pela plataforma.

### Opção C — Firebase Hosting (Google)
```bash
npm i -g firebase-tools
firebase login
firebase init hosting   # diretório público: .
firebase deploy
```

### Domínio comprado no Google
O Google Domains foi migrado para o Squarespace Domains. Em qualquer um dos casos,
o caminho é o mesmo: no painel do domínio, edite o DNS e aponte
`A` / `CNAME` para o endereço que a hospedagem escolhida informar.

## Rodar localmente

Já roda sozinho em **http://localhost:8096** (LaunchAgent `com.parquecandia.local`,
sobe junto com o Mac). No celular, pela mesma rede: `http://192.168.3.164:8096`.

Como é estático, não há build: editou o arquivo, é só recarregar a página.

Para parar ou religar:

```bash
launchctl unload ~/Library/LaunchAgents/com.parquecandia.local.plist
launchctl load ~/Library/LaunchAgents/com.parquecandia.local.plist
```

## Observações de conteúdo

Todo o texto veio do site original. As imagens são as mesmas (perspectivas
artísticas). Os avisos legais do rodapé — venda após registro do Memorial de
Incorporação, regras do MCMV e imagens ilustrativas — foram mantidos, e são
importantes para a aprovação do anúncio no Google Ads.
