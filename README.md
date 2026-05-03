# Xandeflix 2.0

Streaming multi-plataforma (Android e Smart TVs) recriado do zero.

## Stack Tecnológica
- **Framework**: React 19
- **Linguagem**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Mobile/TV**: Capacitor.js
- **Backend/Auth**: Supabase

## Estrutura do Projeto
O projeto utiliza **Feature-Based Architecture** para a lógica de negócio e **Atomic/Shared Design** para componentes reutilizáveis.

### Pastas Principais
- `src/app`: Configurações globais, rotas e provedores.
- `src/components`: Componentes compartilhados organizados por domínio.
- `src/features`: Módulos da aplicação (Auth, Catalog, Player, etc).
- `src/hooks`: Hooks customizados globais.
- `src/lib`: Integrações com bibliotecas externas (Supabase, Spatial Navigation).
- `src/styles`: Estilos globais e tokens do Tailwind 4.

## Como Rodar
1. `npm install`
2. `npm run dev`
