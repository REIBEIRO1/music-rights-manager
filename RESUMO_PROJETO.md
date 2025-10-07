# 🎵 Music Rights Manager - Resumo Completo do Projeto

## 📋 Visão Geral do Projeto

**Music Rights Manager** é uma aplicação web completa para gestão de direitos musicais, desenvolvida em **Next.js 15** com **TypeScript**, **PostgreSQL** e **shadcn/ui**.

### 🎯 Objetivo
Permitir que artistas e managers gerem catálogos musicais, colaboradores, equipas, concertos e perfis profissionais de forma integrada.

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológica
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI + Lucide Icons
- **Backend**: Next.js API Routes
- **Base de Dados**: PostgreSQL
- **Autenticação**: JWT (cookies httpOnly)
- **Upload de Ficheiros**: Sistema local com compressão de imagens

### Estrutura do Projeto
```
music-rights-manager/
├── app/
│   ├── (auth)/              # Páginas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (main)/              # Páginas principais (requer autenticação)
│   │   ├── songs/           # Catálogo de músicas
│   │   ├── friends/         # Gestão de amigos
│   │   ├── team/            # Gestão de equipa
│   │   ├── concerts/        # Gestão de concertos
│   │   ├── notifications/   # Notificações
│   │   ├── support/         # Apoios
│   │   ├── profile/         # Perfil do utilizador
│   │   └── artists/         # Lista de artistas (para managers)
│   └── api/                 # API Routes
│       ├── auth/            # Autenticação
│       ├── songs/           # CRUD de músicas
│       ├── friends/         # Gestão de amizades
│       ├── team/            # Gestão de equipa
│       ├── concerts/        # CRUD de concertos
│       ├── profile/         # Perfil do utilizador
│       ├── upload/          # Upload de fotos
│       └── context/         # Contexto de visualização (managers)
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   └── sidebar.tsx          # Sidebar principal
├── lib/
│   ├── db.ts               # Conexão PostgreSQL
│   └── auth.ts             # Funções de autenticação
└── public/
    └── uploads/
        └── profiles/        # Fotos de perfil carregadas
```

---

## 🗄️ Estrutura da Base de Dados

### Tabelas Principais

#### 1. **users**
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR UNIQUE)
- password (VARCHAR) -- hash bcrypt
- role (VARCHAR) -- 'artist', 'manager', 'collaborator', 'publisher'
- created_at (TIMESTAMP)
```

#### 2. **artist_profiles**
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER UNIQUE) -- FK para users
- artist_name (VARCHAR)
- real_name (VARCHAR)
- age (INTEGER)
- birthday (DATE)
- spa_member_number (VARCHAR)
- spa_coop_number (VARCHAR)
- ipi_number (VARCHAR)
- alias_ipi_number (VARCHAR)
- label (VARCHAR)
- distributor (VARCHAR)
- email (VARCHAR)
- email_alt (VARCHAR)
- phone_number (VARCHAR)
- spotify_artist_id (VARCHAR)
- id_card_number (VARCHAR)
- nif (VARCHAR)
- id_card_expiry (DATE)
- address (TEXT)
- postal_code (VARCHAR)
- photo_url (VARCHAR) -- caminho da foto de perfil
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. **songs**
```sql
- id (SERIAL PRIMARY KEY)
- title (VARCHAR)
- artist_id (INTEGER) -- FK para users
- duration (VARCHAR)
- release_date (DATE)
- isrc (VARCHAR)
- iswc (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. **song_collaborators**
```sql
- id (SERIAL PRIMARY KEY)
- song_id (INTEGER) -- FK para songs
- collaborator_id (INTEGER) -- FK para users
- role (VARCHAR) -- 'composer', 'lyricist', 'producer', 'performer'
- percentage (DECIMAL)
- created_at (TIMESTAMP)
```

#### 5. **friendships**
```sql
- id (SERIAL PRIMARY KEY)
- requester_id (INTEGER) -- FK para users
- receiver_id (INTEGER) -- FK para users
- status (VARCHAR) -- 'pending', 'accepted', 'rejected'
- created_at (TIMESTAMP)
```

#### 6. **team_members**
```sql
- id (SERIAL PRIMARY KEY)
- artist_id (INTEGER) -- FK para users (artista)
- member_id (INTEGER) -- FK para users (manager)
- role (VARCHAR) -- 'manager'
- permissions (TEXT[]) -- array de permissões
- created_at (TIMESTAMP)
```

#### 7. **concerts**
```sql
- id (SERIAL PRIMARY KEY)
- artist_id (INTEGER) -- FK para users
- title (VARCHAR)
- venue (VARCHAR)
- location (VARCHAR)
- date (DATE)
- time (TIME)
- ticket_price (DECIMAL)
- capacity (INTEGER)
- description (TEXT)
- status (VARCHAR) -- 'scheduled', 'completed', 'cancelled'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 8. **notifications**
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER) -- FK para users
- type (VARCHAR) -- 'friend_request', 'team_invite', 'concert_reminder', etc.
- title (VARCHAR)
- message (TEXT)
- read (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 9. **viewing_context**
```sql
- id (SERIAL PRIMARY KEY)
- manager_id (INTEGER) -- FK para users (manager)
- artist_id (INTEGER) -- FK para users (artista)
- created_at (TIMESTAMP)
```

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação
1. **Registo**: `/register` - Cria utilizador com password hash (bcrypt)
2. **Login**: `/login` - Valida credenciais e cria JWT token
3. **Sessão**: Token JWT armazenado em cookie httpOnly
4. **Proteção**: Middleware verifica token em todas as rotas protegidas

### Roles de Utilizador
- **Artist**: Pode gerir o seu catálogo, perfil, concertos e equipa
- **Manager**: Pode gerir múltiplos artistas (com permissões)
- **Collaborator**: Pode ser adicionado a músicas como colaborador
- **Publisher**: Pode gerir direitos de publicação

---

## 🎨 Funcionalidades Implementadas

### ✅ 1. Sistema de Autenticação
- Registo de utilizadores com validação
- Login com email/password
- Logout com limpeza de sessão
- Proteção de rotas

### ✅ 2. Perfil de Artista
- **Foto de Perfil**: Upload com compressão automática (max 800x800px)
- **Informações Básicas**: Nome artístico, nome real, idade, data de nascimento
- **Números de Membro**: SPA Member N.º, SPA Coop. N.º, IPI N.º, Alias IPI N.º
- **Informações Profissionais**: Label, distribuidora, Spotify Artist ID
- **Contactos**: Email principal, email alternativo, telefone
- **Documentos**: Cartão de cidadão, NIF, validade CC
- **Morada**: Endereço completo e código postal
- **Managers**: Lista automática dos managers da equipa

### ✅ 3. Catálogo de Músicas
- **CRUD Completo**: Criar, ler, atualizar, eliminar músicas
- **Informações**: Título, duração, data de lançamento, ISRC, ISWC
- **Colaboradores**: Adicionar colaboradores com roles e percentagens
  - Roles: Compositor, Letrista, Produtor, Intérprete
  - Percentagens: Distribuição de direitos
- **Validação**: Percentagens devem somar 100%
- **Filtros**: Pesquisa e ordenação

### ✅ 4. Sistema de Amigos
- **Enviar Pedidos**: Por email
- **Gerir Pedidos**: Aceitar/rejeitar pedidos recebidos
- **Ver Pedidos Enviados**: Status pendente
- **Lista de Amigos**: Com fotos de perfil e roles
- **Badges de Role**: Cores diferentes por tipo de utilizador

### ✅ 5. Gestão de Equipa
- **Adicionar Managers**: Apenas amigos com role "manager"
- **Permissões Granulares**:
  - Ver Catálogo
  - Editar Catálogo
  - Ver Perfil
  - Editar Perfil
  - Ver Concertos
  - Editar Concertos
  - Ver Equipa
- **Remover Managers**: Com confirmação
- **Fotos de Perfil**: Integradas na lista de equipa

### ✅ 6. Sistema de Concertos
- **CRUD Completo**: Criar, editar, eliminar concertos
- **Informações**: Título, local, localização, data, hora
- **Detalhes**: Preço, capacidade, descrição
- **Status**: Agendado, completado, cancelado
- **Validação**: Datas futuras, campos obrigatórios

### ✅ 7. Notificações
- **Sistema Base**: Estrutura de notificações implementada
- **Tipos**: Pedidos de amizade, convites de equipa, lembretes
- **Marcar como Lido**: Funcionalidade implementada

### ✅ 8. Sistema de Fotos de Perfil
- **Upload**: Com compressão automática no cliente
- **Redimensionamento**: Max 800x800px, qualidade 80%
- **Integração**: Fotos aparecem em:
  - Página de perfil
  - Sidebar footer
  - Lista de amigos
  - Lista de equipa
- **Fallback**: Ícone de utilizador quando não há foto

### ✅ 9. Contexto de Visualização (Managers)
- **Troca de Contexto**: Managers podem ver dados dos seus artistas
- **Menu Dinâmico**: Sidebar muda conforme o contexto
- **Permissões**: Respeitadas conforme configuração

---

## 🎯 Estado Atual do Projeto

### ✅ Completamente Funcional
- Sistema de autenticação
- Perfis de artista com 18 campos + foto
- Catálogo de músicas com colaboradores
- Sistema de amigos (pedidos, aceitar, rejeitar)
- Gestão de equipa com permissões
- Concertos (CRUD completo)
- Upload de fotos com compressão
- Notificações (estrutura base)

### 🔄 Parcialmente Implementado
- **Apoios**: Página criada mas sem funcionalidade
- **Dashboard**: Página inicial sem conteúdo específico

### ❌ Não Implementado
- Relatórios financeiros
- Integração com Spotify API
- Sistema de pagamentos
- Exportação de dados
- Gráficos e estatísticas

---

## 👥 Dados de Teste na Base de Dados

### Utilizadores
1. **Eduardo Test** (ID: 1)
   - Email: eduardo@test.com
   - Password: password123
   - Role: artist
   - Foto: Carregada (/uploads/profiles/profile-1-1759816955725.png)
   - Perfil completo preenchido

2. **Beiro** (ID: 2)
   - Email: beiro@test.com
   - Role: manager
   - Manager do Eduardo Test

3. **Maria Silva** (ID: 3)
   - Email: maria@test.com
   - Role: manager

4. **Simão** (ID: 4)
   - Email: simao@test.com
   - Role: manager
   - Manager do Eduardo Test

### Relações
- Eduardo Test tem 3 amigos: Beiro, Maria Silva, Simão
- Eduardo Test tem 2 managers na equipa: Beiro e Simão
- Existem músicas de teste no catálogo

---

## 🚀 Como Iniciar o Projeto

### 1. Extrair o Backup
```bash
tar -xzf music-rights-manager-backup.tar.gz
cd music-rights-manager
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Criar ficheiro `.env.local`:
```env
# Base de Dados PostgreSQL
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=music_rights_db

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production
```

### 4. Verificar Base de Dados
A base de dados já está incluída no backup. Verificar conexão:
```bash
psql -h localhost -U postgres -d music_rights_db -c "\dt"
```

### 5. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

O servidor inicia em: **http://localhost:3004**

### 6. Fazer Login
- Email: `eduardo@test.com`
- Password: `password123`

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor de desenvolvimento (porta 3004)
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Verifica erros de linting
```

### Base de Dados
```bash
# Conectar à base de dados
psql -h localhost -U postgres -d music_rights_db

# Ver todas as tabelas
\dt

# Ver estrutura de uma tabela
\d users

# Fazer backup da base de dados
pg_dump -h localhost -U postgres music_rights_db > backup.sql

# Restaurar backup
psql -h localhost -U postgres music_rights_db < backup.sql
```

---

## 📝 Próximos Passos Sugeridos

### Prioridade Alta
1. **Dashboard**: Criar página inicial com estatísticas
2. **Apoios**: Implementar sistema de apoios/financiamento
3. **Relatórios**: Gerar relatórios de direitos e pagamentos
4. **Exportação**: Permitir exportar dados em CSV/PDF

### Prioridade Média
5. **Spotify Integration**: Conectar com Spotify API
6. **Gráficos**: Adicionar gráficos de estatísticas
7. **Pesquisa Avançada**: Melhorar filtros e pesquisa
8. **Notificações em Tempo Real**: WebSockets ou Server-Sent Events

### Prioridade Baixa
9. **Temas**: Dark mode
10. **Internacionalização**: Suporte para múltiplos idiomas
11. **Mobile App**: Versão mobile nativa
12. **Integração com Outras Plataformas**: Apple Music, YouTube, etc.

---

## 🐛 Problemas Conhecidos

### ✅ Resolvidos
- ~~Upload de fotos com erro 413~~ → Resolvido com compressão no cliente
- ~~Fotos não aparecem na sidebar~~ → Resolvido com JOIN na query
- ~~Servidor na porta errada~~ → Resolvido com flag `-p 3004`

### ⚠️ Atenção
- **Fotos de Perfil**: Armazenadas localmente em `/public/uploads/`. Em produção, considerar usar serviço externo (AWS S3, Cloudinary)
- **Autenticação**: JWT em cookies httpOnly. Considerar refresh tokens para produção
- **Validação**: Validação básica implementada. Considerar usar Zod ou Yup para validação mais robusta

---

## 📚 Documentação de Referência

### Tecnologias Utilizadas
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Lucide Icons](https://lucide.dev/)

---

## 🎉 Resumo Final

O projeto **Music Rights Manager** está **100% funcional** com todas as funcionalidades principais implementadas:

✅ Autenticação completa
✅ Perfis de artista com fotos
✅ Catálogo de músicas com colaboradores
✅ Sistema de amigos
✅ Gestão de equipa com permissões
✅ Concertos
✅ Upload de fotos com compressão

O sistema está pronto para ser usado e expandido com novas funcionalidades!

---

**Última Atualização**: 7 de Outubro de 2025, 07:11 (Europe/Lisbon)
**Versão**: 1.0.0
**Status**: ✅ Produção Ready (com ressalvas para armazenamento de fotos)
