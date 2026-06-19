# Portfólio — Victor Henrique Ramos

Landing page de portfólio (estática, sem build): HTML + CSS + JavaScript puro.
Tema dark techy, bilíngue PT/EN, responsiva, com "Baixar CV (PDF)" via impressão.

## Estrutura

```
portfolio/
├── index.html              # página única (inclui seção CV print-only)
├── assets/
│   ├── css/styles.css      # tema, layout, responsivo, @print (gera o PDF)
│   └── js/main.js          # i18n PT/EN, nav, reveals, count-up, rotator, print
├── .nojekyll               # evita processamento Jekyll no GitHub Pages
└── README.md
```

## Testar localmente

Basta abrir `index.html` no navegador. Ou servir:

```bash
cd portfolio
python3 -m http.server 8080
# abre http://localhost:8080
```

## Publicar no GitHub Pages (site de usuário)

Seu usuário é `victorhramos-dev` → o site fica em **https://victorhramos-dev.github.io**.

1. Crie um repositório **público** com o nome exato: `victorhramos-dev.github.io`
2. Suba o conteúdo desta pasta (o `index.html` tem que ficar na raiz do repo):

```bash
cd portfolio
git init
git add .
git commit -m "feat: landing page de portfólio"
git branch -M main
git remote add origin https://github.com/victorhramos-dev/victorhramos-dev.github.io.git
git push -u origin main
```

3. No GitHub: **Settings → Pages → Source = Deploy from a branch → `main` / root**.
4. Aguarde ~1 min. Acesse https://victorhramos-dev.github.io

> Para um repositório de projeto (ex.: `portfolio`), o site sai em
> `https://victorhramos-dev.github.io/portfolio/`. Como os caminhos dos assets são
> relativos (`assets/...`), funciona nos dois casos sem alteração.

## Baixar CV em PDF

O botão **"Baixar CV (PDF)"** chama a impressão do navegador. Há uma folha de estilo
`@media print` que troca a página pela versão CV (fundo branco, 1–2 páginas).
Em "Imprimir", escolha **Salvar como PDF**. O PDF respeita o idioma selecionado (PT/EN).

## Personalizar

- **Textos PT/EN:** cada elemento traduzível tem `data-pt` e `data-en` no `index.html`.
- **Cores:** variáveis no topo de `styles.css` (`:root`).
- **Números (stats):** atributos `data-count` / `data-suffix` no `index.html`.
- **Frases do rotator (hero):** array `rotatorWords` em `main.js`.
