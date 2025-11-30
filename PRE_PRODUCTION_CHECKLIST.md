# 📋 Checklist Pre-Produzione - Sicurezza

## ✅ Da fare PRIMA di andare in produzione:

### 1. Database Security
- [ ] Eseguire `supabase_security_fixes.sql` completo
- [ ] Configurare rate limiting in Supabase Dashboard
- [ ] Abilitare email confirmation in Supabase Dashboard
- [ ] Configurare password policy (min 8 char, uppercase, lowercase, numbers)

### 2. Credenziali
- [ ] Spostare SUPABASE_URL e SUPABASE_ANON_KEY in variabili d'ambiente
- [ ] Creare file `.env` (NON committare!)
- [ ] Aggiungere `.env` al `.gitignore`
- [ ] Configurare variabili d'ambiente su piattaforma di deploy

### 3. Code Cleanup
- [ ] Rimuovere tutti i `console.log` da `AuthContext.tsx`
- [ ] Rimuovere tutti i `console.log` da `profile.tsx`
- [ ] Verificare che non ci siano altre credenziali hardcoded

### 4. Testing
- [ ] Testare login con password debole (deve essere rifiutata)
- [ ] Testare che un client non possa vedere profili di altri utenti
- [ ] Testare che un client non possa modificare il proprio ruolo
- [ ] Testare logout e re-login

### 5. Supabase Dashboard Settings
- [ ] Authentication > Email Auth > Enable email confirmations
- [ ] Authentication > Email Auth > Set redirect URLs
- [ ] Authentication > Rate Limits > Configure (es: 5 tentativi / 15 min)
- [ ] Storage > avatars bucket > Verify policies

## 📝 Note
- Tutti i file necessari sono già pronti nella cartella del progetto
- La validazione password è già attiva nel codice
- Il fix SQL minimo è in `supabase_minimal_security.sql`

## 🚀 Quando sei pronto per la produzione:
1. Segui questa checklist punto per punto
2. Testa tutto in staging prima
3. Deploy! 🎉
