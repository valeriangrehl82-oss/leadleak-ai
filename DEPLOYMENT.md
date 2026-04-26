# LeadLeak AI Deployment

## 1. Auf GitHub pushen

```powershell
git init
git add .
git commit -m "Prepare Supabase deployment"
git branch -M main
git remote add origin https://github.com/DEIN-USER/leadleak-ai.git
git push -u origin main
```

Falls das Repository bereits besteht:

```powershell
git add .
git commit -m "Add audit email notifications"
git push
```

## 2. Supabase Tabelle erstellen

1. In Supabase ein Projekt öffnen oder erstellen.
2. Im Supabase Dashboard zu **SQL Editor** gehen.
3. Den Inhalt von `supabase/schema.sql` einfügen.
4. Query ausführen.
5. Prüfen, ob die Tabelle `audit_requests` erstellt wurde.

## 3. Environment Variables

Lokal eine `.env.local` Datei erstellen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
RESEND_API_KEY=your-resend-api-key
ADMIN_NOTIFICATION_EMAIL=admin@example.ch
```

Hinweise:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` darf im Browser verwendet werden.
- `SUPABASE_SERVICE_ROLE_KEY` darf nur serverseitig verwendet werden.
- `ADMIN_PASSWORD` schützt die interne Admin-Seite.
- `RESEND_API_KEY` und `ADMIN_NOTIFICATION_EMAIL` werden serverseitig für Audit-Benachrichtigungen verwendet.

## 4. Lokal testen

```powershell
npm install
npm run lint
npm run build
npm run start
```

Tests:

- `/api/debug/env` öffnen und prüfen, ob alle benötigten Werte als `true` angezeigt werden.
- `/audit` öffnen und Formular absenden.
- In Supabase prüfen, ob ein Datensatz in `audit_requests` erstellt wurde.
- Im Postfach von `ADMIN_NOTIFICATION_EMAIL` prüfen, ob die Resend-Benachrichtigung angekommen ist.
- Ausgeloggt `/admin/audits` öffnen und Redirect zu `/admin/login` bestätigen.
- `/admin/login` mit `ADMIN_PASSWORD` einloggen.

## 5. Auf Vercel deployen

1. Auf vercel.com einloggen.
2. **Add New Project** wählen.
3. GitHub Repository importieren.
4. Framework Preset: **Next.js**.
5. Diese Environment Variables in Vercel hinzufügen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
RESEND_API_KEY=your-resend-api-key
ADMIN_NOTIFICATION_EMAIL=admin@example.ch
```

6. Deploy starten.

## 6. Nach dem Vercel Deployment testen

- `https://deine-domain.vercel.app/api/debug/env` öffnen.
- `https://deine-domain.vercel.app/audit` öffnen und Test-Anfrage absenden.
- In Supabase prüfen, ob der Datensatz gespeichert wurde.
- Im Postfach von `ADMIN_NOTIFICATION_EMAIL` prüfen, ob die Resend-Benachrichtigung angekommen ist.
- `https://deine-domain.vercel.app/admin/audits` ausgeloggt öffnen und Redirect bestätigen.
- `https://deine-domain.vercel.app/admin/login` öffnen und einloggen.

## 7. Wichtiger Hinweis

Der Resend-Absender ist aktuell `LeadLeak AI <onboarding@resend.dev>`. Für echte Produktion sollte später eine
eigene verifizierte Domain in Resend eingerichtet werden.
