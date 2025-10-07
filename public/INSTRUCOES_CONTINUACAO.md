# 🚀 INSTRUÇÕES PARA CONTINUAR O PROJETO

## 📍 ONDE PARÁMOS

Acabámos de completar o **sistema de fotos de perfil** com sucesso! 

### ✅ Última Funcionalidade Implementada
- **Upload de fotos de perfil** com compressão automática no cliente
- **Integração completa** das fotos em:
  - Página de perfil
  - Sidebar footer (canto inferior esquerdo)
  - Lista de amigos
  - Lista de equipa

### 🎯 Estado Atual
- **Servidor**: A correr em http://localhost:3004
- **Base de Dados**: PostgreSQL com todos os dados de teste
- **Utilizador de Teste**: eduardo@test.com / password123
- **Foto Carregada**: Sim, foto do Eduardo Test está carregada e a aparecer

---

## 🔄 COMO RETOMAR O TRABALHO

### Passo 1: Restaurar o Projeto
```bash
# 1. Extrair o backup
tar -xzf music-rights-manager-backup.tar.gz
cd music-rights-manager

# 2. Instalar dependências
npm install

# 3. Verificar variáveis de ambiente
cat .env.local
# Deve conter:
# PGHOST=localhost
# PGPORT=5432
# PGUSER=postgres
# PGPASSWORD=postgres
# PGDATABASE=music_rights_db
# JWT_SECRET=your-secret-key-change-in-production
```

### Passo 2: Verificar Base de Dados
```bash
# Conectar à base de dados
PGPASSWORD=postgres psql -h localhost -U postgres -d music_rights_db

# Verificar tabelas
\dt

# Verificar utilizadores
SELECT id, name, email, role FROM users;

# Verificar perfis com fotos
SELECT id, user_id, artist_name, photo_url FROM artist_profiles;

# Sair
\q
```

### Passo 3: Iniciar o Servidor
```bash
# Iniciar servidor de desenvolvimento na porta 3004
npm run dev

# O servidor deve iniciar em:
# http://localhost:3004
```

### Passo 4: Testar a Aplicação
1. Abrir browser em: http://localhost:3004
2. Fazer login com: eduardo@test.com / password123
3. Verificar que a foto aparece na sidebar (canto inferior esquerdo)
4. Ir para /profile e verificar que a foto aparece no topo
5. Ir para /friends e verificar lista de amigos
6. Ir para /team e verificar lista de equipa

---

## 📂 ESTRUTURA DE FICHEIROS IMPORTANTES

### Ficheiros de Configuração
```
music-rights-manager/
├── .env.local                    # Variáveis de ambiente
├── package.json                  # Dependências e scripts
├── next.config.ts               # Configuração Next.js
├── tailwind.config.ts           # Configuração Tailwind
└── tsconfig.json                # Configuração TypeScript
```

### Código Principal
```
app/
├── (auth)/
│   ├── login/page.tsx           # Página de login
│   └── register/page.tsx        # Página de registo
├── (main)/
│   ├── songs/page.tsx           # Catálogo de músicas
│   ├── friends/page.tsx         # Lista de amigos (COM FOTOS)
│   ├── team/page.tsx            # Gestão de equipa (COM FOTOS)
│   ├── concerts/page.tsx        # Gestão de concertos
│   ├── profile/page.tsx         # Perfil (COM UPLOAD DE FOTO)
│   └── artists/page.tsx         # Lista de artistas (managers)
└── api/
    ├── auth/
    │   ├── login/route.ts       # API de login
    │   ├── register/route.ts    # API de registo
    │   └── session/route.ts     # API de sessão (COM FOTO)
    ├── songs/route.ts           # API de músicas
    ├── friends/route.ts         # API de amigos (COM FOTOS)
    ├── team/route.ts            # API de equipa (COM FOTOS)
    ├── profile/route.ts         # API de perfil
    └── upload/route.ts          # API de upload de fotos
```

### Componentes
```
components/
├── ui/                          # Componentes shadcn/ui
└── sidebar.tsx                  # Sidebar (COM FOTO DO UTILIZADOR)
```

### Bibliotecas
```
lib/
├── db.ts                        # Conexão PostgreSQL
└── auth.ts                      # Autenticação JWT (COM FOTO)
```

---

## 🗄️ QUERIES ÚTEIS DA BASE DE DADOS

### Ver Todos os Utilizadores
```sql
SELECT id, name, email, role FROM users;
```

### Ver Perfis com Fotos
```sql
SELECT 
  u.id, 
  u.name, 
  u.email, 
  ap.artist_name, 
  ap.photo_url 
FROM users u
LEFT JOIN artist_profiles ap ON u.id = ap.user_id;
```

### Ver Amizades
```sql
SELECT 
  f.id,
  u1.name as requester,
  u2.name as receiver,
  f.status
FROM friendships f
JOIN users u1 ON f.requester_id = u1.id
JOIN users u2 ON f.receiver_id = u2.id;
```

### Ver Equipa do Eduardo
```sql
SELECT 
  tm.id,
  u1.name as artist,
  u2.name as manager,
  tm.permissions
FROM team_members tm
JOIN users u1 ON tm.artist_id = u1.id
JOIN users u2 ON tm.member_id = u2.id
WHERE tm.artist_id = 1;
```

### Ver Músicas com Colaboradores
```sql
SELECT 
  s.id,
  s.title,
  u.name as artist,
  COUNT(sc.id) as num_collaborators
FROM songs s
JOIN users u ON s.artist_id = u.id
LEFT JOIN song_collaborators sc ON s.id = sc.song_id
GROUP BY s.id, s.title, u.name;
```

---

## 🎯 PRÓXIMAS FUNCIONALIDADES SUGERIDAS

### 1. Dashboard (Prioridade Alta)
**Objetivo**: Criar página inicial com estatísticas e resumo

**Tarefas**:
- [ ] Criar componente de estatísticas (total de músicas, concertos, amigos)
- [ ] Adicionar gráfico de músicas por mês
- [ ] Mostrar próximos concertos
- [ ] Mostrar notificações recentes
- [ ] Adicionar quick actions (adicionar música, criar concerto)

**Ficheiros a criar/modificar**:
- `app/(main)/dashboard/page.tsx`
- `app/api/stats/route.ts`

### 2. Sistema de Apoios (Prioridade Alta)
**Objetivo**: Implementar sistema de apoios/financiamento

**Tarefas**:
- [ ] Criar tabela `supports` na base de dados
- [ ] Criar formulário para adicionar apoios
- [ ] Listar apoios recebidos
- [ ] Adicionar filtros por tipo (subsídio, patrocínio, crowdfunding)
- [ ] Calcular total de apoios

**Ficheiros a criar/modificar**:
- `app/(main)/support/page.tsx` (já existe, precisa de funcionalidade)
- `app/api/supports/route.ts`
- Migração SQL para criar tabela

### 3. Relatórios de Direitos (Prioridade Alta)
**Objetivo**: Gerar relatórios de distribuição de direitos

**Tarefas**:
- [ ] Criar página de relatórios
- [ ] Calcular distribuição de direitos por música
- [ ] Gerar relatório em PDF
- [ ] Exportar dados em CSV
- [ ] Filtrar por período

**Ficheiros a criar**:
- `app/(main)/reports/page.tsx`
- `app/api/reports/route.ts`
- Biblioteca de geração de PDF (ex: jsPDF)

### 4. Integração com Spotify (Prioridade Média)
**Objetivo**: Buscar dados do Spotify usando o Artist ID

**Tarefas**:
- [ ] Configurar Spotify API credentials
- [ ] Criar endpoint para buscar dados do artista
- [ ] Mostrar estatísticas do Spotify no perfil
- [ ] Sincronizar músicas do Spotify

**Ficheiros a criar**:
- `app/api/spotify/route.ts`
- `lib/spotify.ts`

### 5. Notificações em Tempo Real (Prioridade Média)
**Objetivo**: Notificações instantâneas sem refresh

**Tarefas**:
- [ ] Implementar Server-Sent Events ou WebSockets
- [ ] Criar componente de notificações em tempo real
- [ ] Adicionar som de notificação
- [ ] Badge com contador de não lidas

**Ficheiros a modificar**:
- `app/(main)/notifications/page.tsx`
- `components/sidebar.tsx`

---

## 🔧 COMANDOS DE DESENVOLVIMENTO

### Servidor
```bash
npm run dev              # Desenvolvimento (porta 3004)
npm run build            # Build de produção
npm run start            # Produção
npm run lint             # Verificar erros
```

### Base de Dados
```bash
# Backup
pg_dump -h localhost -U postgres music_rights_db > backup.sql

# Restaurar
psql -h localhost -U postgres music_rights_db < backup.sql

# Criar nova tabela (exemplo)
psql -h localhost -U postgres -d music_rights_db -c "
CREATE TABLE supports (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  amount DECIMAL(10,2),
  type VARCHAR(50),
  date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"
```

### Git (se configurado)
```bash
git status               # Ver alterações
git add .                # Adicionar ficheiros
git commit -m "msg"      # Commit
git push                 # Push para remoto
```

---

## 🐛 TROUBLESHOOTING

### Problema: Servidor não inicia
**Solução**:
```bash
# Verificar se a porta 3004 está ocupada
lsof -i :3004

# Matar processo se necessário
kill -9 <PID>

# Reiniciar servidor
npm run dev
```

### Problema: Base de dados não conecta
**Solução**:
```bash
# Verificar se PostgreSQL está a correr
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Verificar credenciais no .env.local
cat .env.local
```

### Problema: Fotos não aparecem
**Solução**:
```bash
# Verificar se os ficheiros existem
ls -la public/uploads/profiles/

# Verificar permissões
chmod 755 public/uploads/profiles/

# Verificar na base de dados
psql -h localhost -U postgres -d music_rights_db -c "
SELECT id, user_id, photo_url FROM artist_profiles WHERE photo_url IS NOT NULL;
"

# Reiniciar servidor
pkill -f "next dev"
npm run dev
```

### Problema: Dependências em falta
**Solução**:
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 INFORMAÇÕES DE CONTACTO DO PROJETO

### Utilizadores de Teste
| Nome | Email | Password | Role |
|------|-------|----------|------|
| Eduardo Test | eduardo@test.com | password123 | artist |
| Beiro | beiro@test.com | password123 | manager |
| Maria Silva | maria@test.com | password123 | manager |
| Simão | simao@test.com | password123 | manager |

### URLs Importantes
- **Aplicação**: http://localhost:3004
- **Login**: http://localhost:3004/login
- **Perfil**: http://localhost:3004/profile
- **Músicas**: http://localhost:3004/songs
- **Amigos**: http://localhost:3004/friends
- **Equipa**: http://localhost:3004/team

### Base de Dados
- **Host**: localhost
- **Port**: 5432
- **Database**: music_rights_db
- **User**: postgres
- **Password**: postgres

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de começar a trabalhar, verificar:

- [ ] Backup extraído com sucesso
- [ ] Dependências instaladas (`node_modules` existe)
- [ ] Ficheiro `.env.local` existe e está correto
- [ ] PostgreSQL está a correr
- [ ] Base de dados `music_rights_db` existe
- [ ] Servidor inicia sem erros em http://localhost:3004
- [ ] Login funciona com eduardo@test.com / password123
- [ ] Foto aparece na sidebar
- [ ] Foto aparece na página de perfil
- [ ] Todas as páginas carregam sem erros

---

## 🎉 RESUMO RÁPIDO

**O QUE ESTÁ FEITO**:
✅ Sistema completo de autenticação
✅ Perfis de artista com 18 campos + foto
✅ Catálogo de músicas com colaboradores
✅ Sistema de amigos (pedidos, aceitar, rejeitar)
✅ Gestão de equipa com permissões
✅ Concertos (CRUD completo)
✅ Upload de fotos com compressão automática
✅ Fotos integradas em perfil, sidebar, amigos e equipa

**O QUE FALTA**:
❌ Dashboard com estatísticas
❌ Sistema de apoios funcional
❌ Relatórios de direitos
❌ Integração com Spotify
❌ Notificações em tempo real

**PRÓXIMO PASSO RECOMENDADO**:
👉 Criar o **Dashboard** com estatísticas e resumo do artista

---

**Boa sorte com o desenvolvimento! 🚀**

Se tiveres dúvidas, consulta o ficheiro `RESUMO_PROJETO.md` para informações detalhadas sobre a arquitetura e funcionalidades.
