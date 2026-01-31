# 🔒 Guia de Segurança - Isaac Barbearia

## ✅ Melhorias de Segurança Implementadas

### 1. **Variáveis de Ambiente (.env)**
- Criado arquivo `.env` com configurações Firebase
- Adicionado ao `.gitignore` para não expor credenciais no Git
- **Localização**: `/.env`

### 2. **Firestore Security Rules**
- Criado arquivo `firestore.rules` com regras de segurança
- **Regras Implementadas**:
  - ✅ Avaliações (feedback): Qualquer um lê, só autenticados criam/editam/deletam
  - ✅ Profissionais: Qualquer um lê, só admin edita
  - ✅ Parceiros: Qualquer um lê, só admin edita
  - ✅ Participações: Qualquer um lê, só admin edita
  - ✅ Anti-spam: Máximo 1 feedback por usuário

### 3. **Validação de Login**
- ✅ Apenas `admin@isaacbarbearia.com` pode fazer login
- ✅ Validação também será feita no backend (Firestore Rules)

---

## 🚀 PRÓXIMAS AÇÕES - IMPORTANTE!

### **Passo 1: Aplicar Firestore Security Rules**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione projeto **isaacbarbearia-admin**
3. Vá em **Firestore Database** → **Rules**
4. Copie o conteúdo de `firestore.rules` e cole no editor
5. Clique em **Publish**

**Ou use Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### **Passo 2: Configurar .env em Produção**

Para GitHub Pages (quando fizer deploy):
- O arquivo `.env` NÃO é deployado (está no .gitignore)
- As variáveis de ambiente devem ser configuradas no CI/CD ou manualmente no servidor

---

## 📋 Checklist de Segurança

- ✅ API Keys em `.env` (não expostas no Git)
- ✅ `.env` adicionado ao `.gitignore`
- ✅ Firestore Security Rules criadas
- ⏳ **PENDENTE**: Aplicar Firestore Rules no Firebase Console
- ⏳ **PENDENTE**: Cloud Functions para validações backend
- ⏳ **PENDENTE**: Rate limiting para login
- ⏳ **PENDENTE**: HTTPS forçado (already on GitHub Pages ✅)
- ⏳ **PENDENTE**: CSP headers configurados

---

## 🔐 O que está Protegido Agora

| Recurso | Antes | Depois |
|---------|-------|--------|
| API Keys | ❌ Expostas no código | ✅ Em `.env` |
| Firestore Read | ❌ Aberto | ✅ Controlado por Rules |
| Firestore Write | ❌ Aberto | ✅ Só autenticados |
| Feedback | ❌ Qualquer um cria ilimitado | ✅ 1 por usuário + email verificado |
| Admin Login | ❌ Frontend only | ✅ Frontend + Firestore Rules |
| Profissionais/Parceiros | ❌ Qualquer um edita | ✅ Só admin edita |

---

## 📞 Suporte

Se tiver dúvidas sobre as regras de segurança, consulte:
- [Firebase Security Rules Docs](https://firebase.google.com/docs/firestore/security/get-started)
- `firestore.rules` - Arquivo com as regras comentadas
