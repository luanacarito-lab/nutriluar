# 🌙 NutriLuar — Sistema de Gestão Nutricional

O **NutriLuar** é uma plataforma moderna e elegante projetada para nutricionistas que buscam simplificar o acompanhamento de seus pacientes. O sistema oferece uma interface intuitiva para gestão de consultas, evolução antropométrica e organização de dados clínicos, tudo com um design acolhedor e profissional inspirado na natureza.

## 🚀 Funcionalidades Principais

### 📋 Gestão de Pacientes
- Cadastro completo de dados pessoais, clínicos e hábitos.
- Listagem dinâmica com busca e filtros.
*   **Perfil Individual**: Centralização de todas as informações do paciente em um só lugar.

### 📈 Acompanhamento e Evolução
- **Registro de Consultas**: Adição rápida de peso, medidas (cintura, quadril), % de gordura e observações.
- **Gráficos Dinâmicos**: Visualização clara da evolução do peso e outras métricas corporais ao longo do tempo.
- **Cálculo Inteligente de IMC**: Suporte a diversos formatos de entrada (vírgulas, pontos, cm ou metros).
- **Dashboard de Consultas**: Resumo automático com última consulta, peso atual e diferença total de peso desde o início.

### 🔐 Segurança e Dados
- **Autenticação Segura**: Acesso restrito a nutricionistas via Supabase Auth.
- **Isolamento de Dados (RLS)**: Cada nutricionista visualiza apenas os seus próprios pacientes e consultas.
- **Persistência em Nuvem**: Dados salvos em tempo real no banco de dados PostgreSQL do Supabase.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript
- **Build & Tooling**: Vite
- **Estilização**: CSS Vanilla (Design System Personalizado)
- **Banco de Dados & Auth**: Supabase (PostgreSQL)
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Roteamento**: React Router

## 💻 Como Iniciar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/luanacarito-lab/nutriluar.git
    cd nutriluar
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto com suas chaves do Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 🌐 Deploy

O projeto está configurado para deploy em plataformas como **Vercel** ou **Netlify**. 
Para evitar erros 404 ao atualizar páginas em sub-rotas, incluímos os arquivos de configuração `vercel.json` e `_redirects`.

---

Desenvolvido com ❤️ por Luana Carito Lab.
