# 🕹️ React Arcade Hub

![0805(2)](https://github.com/user-attachments/assets/f9313068-40c5-4e53-8e69-c19c9db4de89)

---

### ✨ Sobre o Projeto

O **React Arcade Hub** é um tributo moderno e totalmente funcional à era de ouro dos fliperamas, construído do zero como uma Single Page Application (SPA) com React e TypeScript. Este projeto não é apenas uma coleção de jogos, mas uma plataforma completa que recria três clássicos atemporais — **Pong**, **Breakout** e **Space Invaders** — com mecânicas novas, sistemas de poder complexos e uma arquitetura de software robusta.

O objetivo foi aprofundar os conhecimentos em manipulação do **HTML5 Canvas**, gerenciamento de estado avançado em React, física de jogos baseada em `deltaTime` e integração com serviços de backend como o Firebase.

📌 **Jogue agora:** [https://edsoncarvalhointuria.github.io/react-arcade-hub/](https://edsoncarvalhointuria.github.io/react-arcade-hub/)

---

### 🛠️ Funcionalidades Principais

#### Arquitetura Geral

-   **Hub de Jogos:** Navegue entre os três jogos em uma interface unificada.
-   **Ranking Online:** Sistema de ranking global em tempo real com **Firebase Firestore**.
-   **Áudio Imersivo:** Efeitos sonoros e trilhas sonoras dinâmicas com **Tone.js**, gerenciados por um `AudioContext` central.
-   **100% Responsivo:** Jogue no desktop ou no celular, com controles de toque e layouts adaptativos para cada jogo.
-   **Motor de Jogo Customizado:** Lógica de renderização e física (`update`, `draw`, `gameLoop`) construída com `requestAnimationFrame` e `deltaTime` para garantir performance consistente.

#### 👾 Space Invaders

-   Ciclo infinito de ondas com dificuldade progressiva.
-   **Batalhas de Chefe** épicas com 5 níveis de dificuldade e padrões de ataque únicos.
-   Sistema de **power-ups cumulativos** que não expiram, criando uma progressão estilo "roguelike".
-   Obstáculos (asteroides) destrutíveis com colisão "pixel-perfect".
-   Frota de aliens com movimento e animação de sprites clássicos.

#### 🧱 Breakout

-   **Dois Modos de Jogo:** "Clássico" e o desafiador "Modo Muralha" infinito.
-   Sistema de **"drops" de poder** que caem dos tijolos, com ícones SVG customizados.
-   Arsenal de 6+ power-ups, incluindo Multiball, Raquete Gigante e Bola de Fogo.
-   Muro de tijolos gerado proceduralmente para se adaptar a qualquer tamanho de tela.

#### 🏓 Pong

-   **Três Modos de Jogo:** "Desafio", "Infinito" e o estiloso "Modo Dark".
-   **IA Dinâmica:** Oponente com múltiplos níveis de dificuldade e um modo "fúria".
-   Sistema de poderes com cooldown, incluindo câmera lenta, encolher raquete e o "Super Shot".
-   Efeitos visuais de tela cheia para cada poder.

---

### 🚀 Tecnologias Utilizadas

-   **Frontend:** React (com Vite), TypeScript
-   **Estilização:** SASS / SCSS
-   **Backend & Banco de Dados:** Google Firebase (Firestore)
-   **Áudio:** Tone.js
-   **Gráficos:** HTML5 Canvas API
-   **Deploy:** GitHub Pages com GitHub Actions

---

### 📦 Como Rodar o Projeto Localmente

```bash
# Clone este repositório
$ git clone [https://github.com/edsoncarvalhointuria/react-arcade-hub.git](https://github.com/edsoncarvalhointuria/react-arcade-hub.git)

# Acesse a pasta do projeto
$ cd react-arcade-hub

# Instale as dependências
$ npm install

# Execute a aplicação
$ npm run dev
```

**Observação:** Para a funcionalidade de ranking online, é necessário criar um arquivo `.env.local` na raiz do projeto com as suas próprias chaves do Firebase.

---

### 💌 Contato

**Edson Carvalho Inturia**

<p align="left">  
<a href="mailto:edsoncarvalhointuria@gmail.com" title="Gmail">  
  <img src="https://img.shields.io/badge/-Gmail-FF0000?style=flat-square&labelColor=FF0000&logo=gmail&logoColor=white" alt="Gmail"/>  
</a>  
<a href="https://br.linkedin.com/in/edson-carvalho-inturia-1442a0129" title="LinkedIn">  
  <img src="https://img.shields.io/badge/-LinkedIn-0e76a8?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"/>  
</a> 
</p>

Obrigado pela visita!
