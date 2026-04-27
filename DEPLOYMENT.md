# LeadLeak AI Deployment

## 1. Auf GitHub pushen

```powershell
git add .
git commit -m "Add Twilio pilot webhooks"
git push
```

## 2. Supabase Schema ausführen

1. Supabase Dashboard öffnen.
2. SQL Editor öffnen.
3. Inhalt von `supabase/schema.sql` einfügen.
4. Query ausführen.
5. Prüfen, ob `audit_requests`, `clients`, `client_leads` und `client_messages` vorhanden sind.

## 3. Environment Variables

Lokal in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
RESEND_API_KEY=your-resend-api-key
ADMIN_NOTIFICATION_EMAIL=admin@example.ch
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

Hinweise:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` darf im Browser verwendet werden.
- `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TWILIO_ACCOUNT_SID` und `TWILIO_AUTH_TOKEN` dürfen nur serverseitig verwendet werden.
- `ADMIN_PASSWORD` schützt die interne Admin-Seite.
- `ADMIN_NOTIFICATION_EMAIL` erhält Audit-Kopien und optional Pilot-Lead-Kopien.

## 4. Lokal testen

```powershell
npm install
npm run lint
npm run build
npm run start
```

Tests:

- `/api/debug/env` öffnen und prüfen, ob Supabase, Admin und Resend als `true` angezeigt werden.
- `/api/debug/twilio` öffnen und prüfen, ob beide Twilio-Werte `true` sind.
- `/audit` absenden und Supabase plus E-Mail prüfen.
- `/admin/login` öffnen und mit `ADMIN_PASSWORD` einloggen.
- In `/admin/clients` einen Kunden mit Twilio-Nummer im E.164 Format anlegen, z.B. `+41310000000`.

## 5. Auf Vercel deployen

1. Vercel Projekt öffnen.
2. Environment Variables setzen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
RESEND_API_KEY=your-resend-api-key
ADMIN_NOTIFICATION_EMAIL=admin@example.ch
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

3. Redeploy starten.

## 6. Nach dem Vercel Deployment testen

- `https://deine-domain.vercel.app/api/debug/env` öffnen.
- `https://deine-domain.vercel.app/api/debug/twilio` öffnen.
- `https://deine-domain.vercel.app/audit` mit einer Test-Anfrage absenden.
- `https://deine-domain.vercel.app/admin/audits` ausgeloggt öffnen und Redirect bestätigen.
- `https://deine-domain.vercel.app/admin/login` öffnen und einloggen.
- `https://deine-domain.vercel.app/admin/clients` öffnen und prüfen, ob Kunden/Leads sichtbar sind.

## 7. Twilio Webhooks konfigurieren

In der Twilio Console bei der verwendeten Nummer:

```text
Voice webhook:
https://YOUR_DOMAIN/api/twilio/incoming-call

Messaging webhook:
https://YOUR_DOMAIN/api/twilio/incoming-sms
```

Wichtig: `clients.twilio_phone_number` muss exakt mit Twilios `To`-Nummer übereinstimmen, inklusive `+` und Ländercode.

Zum Testen:

- Testanruf auf die Twilio-Nummer auslösen.
- Test-SMS an die Twilio-Nummer senden.
- Danach `/admin/clients/[id]` prüfen: Lead, Source und Nachrichten sollten sichtbar sein.

## 8. Wichtiger Hinweis

Der Resend-Absender ist aktuell `LeadLeak AI <onboarding@resend.dev>`. Für echte Produktion sollte später eine eigene verifizierte Domain in Resend eingerichtet werden. Twilio-Webhooks sind aktuell nicht signaturvalidiert und sollten nach dem ersten Pilot gehärtet werden.
