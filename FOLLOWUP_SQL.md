# SQL para criar tabela followups

Execute no Supabase Dashboard → SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encaminhamento_id TEXT UNIQUE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  profissional_nome TEXT,
  responsavel_nome TEXT,
  contato TEXT,
  contato_tipo TEXT,
  email_enviado_em TIMESTAMPTZ,
  lembrete_enviado_em TIMESTAMPTZ,
  contatou BOOLEAN,
  motivo_nao_contato TEXT,
  agendou BOOLEAN,
  motivo_nao_agendamento TEXT,
  quer_novo_encaminhamento BOOLEAN,
  nps_profissional INTEGER,
  nps_plataforma INTEGER,
  comentario TEXT,
  concluido_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
```
