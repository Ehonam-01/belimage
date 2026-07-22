-- ============================================
-- BelImage — Schéma de base de données Supabase
-- ============================================

-- 1. PROFIL UTILISATEUR
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  credits     INTEGER NOT NULL DEFAULT 10,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJETS
CREATE TABLE projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','analyzing','content','generating','composing','completed','failed')),
  poster_type       TEXT,
  reference_model_url   TEXT,
  reference_analysis    JSONB,
  user_content          JSONB,
  content_blueprint     JSONB,
  creative_blueprint    JSONB,
  generated_images      JSONB[],
  composition_data      JSONB,
  final_url             TEXT,
  credits_consumed      INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);

-- 3. ASSETS (fichiers importés)
CREATE TABLE assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_type   TEXT NOT NULL CHECK (file_type IN ('image', 'logo', 'photo')),
  role        TEXT,
  label       TEXT,
  width       INTEGER,
  height      INTEGER,
  file_size   INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_project_id ON assets(project_id);

-- 4. GÉNÉRATIONS
CREATE TABLE generations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  variant_index   INTEGER DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','completed','failed')),
  provider_used   TEXT,
  prompt_sent     TEXT,
  negative_prompt TEXT,
  result_url      TEXT,
  error_message   TEXT,
  credits_cost    INTEGER NOT NULL DEFAULT 1,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generations_project_id ON generations(project_id);

-- 5. TRANSACTIONS DE CRÉDITS
CREATE TABLE credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('purchase','generation','bonus','refund','admin_adjustment')),
  reference_id  UUID,
  description   TEXT,
  balance_after INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);

-- 6. LOGS D'ERREUR
CREATE TABLE error_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id),
  service       TEXT NOT NULL,
  error_type    TEXT NOT NULL,
  error_message TEXT,
  context       JSONB,
  severity      TEXT CHECK (severity IN ('low','medium','high','critical')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PROJECTS
CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ASSETS
CREATE POLICY "Users can read own assets"
  ON assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  USING (auth.uid() = user_id);

-- GENERATIONS
CREATE POLICY "Users can read own generations"
  ON generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- CREDIT TRANSACTIONS
CREATE POLICY "Users can read own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ADMINS: accès complet
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can read all projects"
  ON projects FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can read all transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('reference-models', 'reference-models', true),
  ('user-assets', 'user-assets', true),
  ('generated-images', 'generated-images', true),
  ('final-posters', 'final-posters', true)
ON CONFLICT (id) DO NOTHING;
