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
git commit -m "Integrate Supabase SSR clients"
git push
```

## 2. Supabase Tabelle erstellen

1. In Supabase ein Projekt öffnen oder erstellen.
2. Im Supabase Dashboard zu **SQL Editor** gehen.
3. Den Inhalt von `supabase/schema.sql` einfügen.
4. Query ausführen.
5. Prüfen, ob die Tabelle `audit_requests` erstellt wurde.

Die SQL-Datei erlaubt öffentliche Inserts für Audit-Anfragen. Reads sind nur für Supabase-authentifizierte Nutzer
gedacht. Die bestehende interne Admin-Seite bleibt zusätzlich durch das lokale Admin-Passwort geschützt.

## 3. Environment Variables

Lokal eine `.env.local` Datei erstellen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

Hinweise:

- Supabase verwendet hier die URL, den anon public Key und serverseitig den service role Key.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` darf im Browser verwendet werden.
- `SUPABASE_SERVICE_ROLE_KEY` darf nur serverseitig verwendet werden.
- `ADMIN_PASSWORD` gehört zur bestehenden internen Admin-Seite und ist nicht Teil der Supabase-Client-Konfiguration.

## 4. Lokal testen

```powershell
npm install
npm run lint
npm run build
npm run start
```

Tests:

- `/supabase-health` öffnen und prüfen, ob `Supabase connected` erscheint.
- `/audit` öffnen und Formular absenden.
- In Supabase prüfen, ob ein Datensatz in `audit_requests` erstellt wurde.
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
```

6. Deploy starten.

## 6. Nach dem Vercel Deployment testen

- `https://deine-domain.vercel.app/supabase-health` öffnen.
- `https://deine-domain.vercel.app/audit` öffnen und Test-Anfrage absenden.
- In Supabase prüfen, ob der Datensatz gespeichert wurde.
- `https://deine-domain.vercel.app/admin/audits` ausgeloggt öffnen und Redirect bestätigen.
- `https://deine-domain.vercel.app/admin/login` öffnen und einloggen.

## 7. Wichtiger Hinweis

Die Supabase-Helfer nutzen das aktuelle `@supabase/ssr` Muster mit `proxy.ts`, weil Next.js 16 die frühere
Middleware-Konvention in Proxy umbenannt hat. Für späteren Mehrpersonen-Adminzugriff sollte Supabase Auth oder eine
andere echte Authentifizierung ergänzt werden.
