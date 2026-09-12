# Receber os leads numa planilha

O site é estático (não tem servidor próprio), então ele manda o lead direto para
uma **planilha do Google**, que você baixa em `.xlsx` quando quiser. Funciona em
qualquer hospedagem e não custa nada.

O lead é gravado **no momento em que a pessoa aperta "Receber minha simulação"** —
antes e independente do WhatsApp. Quem preenche e some também fica registrado.

---

## Passo a passo (uma vez só, ~10 minutos)

### 1. Criar a planilha
Abra <https://sheets.new> e dê um nome, por exemplo **Leads — Parque Cândia**.

### 2. Abrir o editor de script
Na planilha: menu **Extensões → Apps Script**.

### 3. Colar o código
Apague tudo que estiver no arquivo `Code.gs` e cole o conteúdo de
[`apps-script.gs`](apps-script.gs).

Se quiser receber um e-mail a cada lead, preencha a linha:

```js
var AVISAR_EMAIL = 'seu@email.com';
```

Salve (ícone do disquete).

### 4. Publicar como app da Web
No editor: **Implantar → Nova implantação**.

- Clique na engrenagem ao lado de "Selecione o tipo" → **App da Web**
- **Executar como:** Eu (sua conta)
- **Quem pode acessar:** **Qualquer pessoa** ← precisa ser esse, senão o site não consegue gravar
- **Implantar**

O Google vai pedir autorização. Ele mostra um aviso de "app não verificado" —
é normal, o app é seu: clique em **Avançado → Acessar (nome do projeto)**.

### 5. Copiar a URL
No fim aparece a **URL do app da Web**, terminando em `/exec`. Copie.

Para conferir, cole essa URL no navegador: deve aparecer `{"ok":true,"status":"online"...}`.

### 6. Ligar no site
Abra `assets/js/main.js` e cole a URL na linha do `leadEndpoint`:

```js
leadEndpoint: 'https://script.google.com/macros/s/AKfy...SEU_ID.../exec',
```

Pronto. Preencha o formulário no site e a linha aparece na planilha na hora.

---

## O que é gravado em cada lead

| Coluna | De onde vem |
|---|---|
| Data/Hora | momento do envio |
| Nome, WhatsApp | o que a pessoa digitou |
| Objetivo, Imóvel, Prioridade | as 3 perguntas do Match Imobiliário |
| **Campanha, Fonte, Mídia, Termo, Conteúdo** | parâmetros `utm_` do anúncio |
| **gclid** | identificador do clique no Google Ads |
| Veio de | site de origem (ou "direto") |
| Página | endereço exato onde converteu |

As colunas de campanha e o `gclid` são o que te permite saber **qual anúncio trouxe
cada lead** — sem isso você paga o Ads no escuro. O site já captura esses dados
sozinho e os guarda durante a visita, mesmo que a pessoa converta só depois de
navegar pelo site.

## Baixar em Excel

Na planilha: **Arquivo → Fazer download → Microsoft Excel (.xlsx)**.

Se preferir um arquivo que atualiza sozinho no Excel, dá para usar
**Arquivo → Compartilhar → Publicar na web** e conectar pelo Excel em
*Dados → Obter dados → Da Web*.

## Se um lead falhar

O site tem rede de segurança: se o envio falhar (internet caiu, Google fora do ar),
o lead fica guardado no navegador da pessoa e é reenviado automaticamente na
próxima visita dela. E se der erro do lado do Google, o script cria uma aba
**Erros** na própria planilha com o conteúdo bruto — nada some em silêncio.

## Trocar o código depois

Se editar o Apps Script, publique de novo em **Implantar → Gerenciar implantações →
✏️ (editar) → Versão: Nova versão → Implantar**. A URL continua a mesma.
Se criar uma "Nova implantação" do zero, a URL muda e você precisa atualizar o `main.js`.
