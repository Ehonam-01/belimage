# BELIMAGE — Architecture Technique SaaS

> Application SaaS de génération d'affiches personnalisées à partir de modèles, pilotée par DeepSeek API.

---

## Table des matières

1. [Concept du Produit](#1-concept-du-produit)
2. [Architecture Générale](#2-architecture-générale)
3. [Stack Technique](#3-stack-technique)
4. [Structure des Dossiers](#4-structure-des-dossiers)
5. [Schéma de Base de Données](#5-schéma-de-base-de-données)
6. [Flux de Création d'une Affiche](#6-flux-de-création-dune-affiche)
7. [Rôle de DeepSeek API](#7-rôle-de-deepseek-api)
8. [Rôle du Provider de Génération d'Images](#8-rôle-du-provider-de-génération-dimages)
9. [Rôle du Moteur de Composition](#9-rôle-du-moteur-de-composition)
10. [Risques Techniques](#10-risques-techniques)
11. [Plan de Développement](#11-plan-de-développement)

---

## 1. Concept du Produit

### Vision
Créer un système capable de **comprendre un modèle graphique existant**, **extraire sa logique visuelle**, **remplacer intelligemment son contenu** et **produire une nouvelle affiche cohérente**.

### Fonctionnalités clés
1. Import d'une affiche de référence (modèle)
2. Analyse automatique du design (structure, couleurs, composition)
3. Compréhension de la structure visuelle
4. Identification des éléments importants
5. Remplissage des informations personnalisées
6. Import d'images et assets personnels
7. Génération de nouvelles versions par l'IA
8. Création de variantes multiples
9. Modification et édition du résultat
10. Export de l'affiche finale

---

## 2. Architecture Générale

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Dashboard│  │  Editor  │  │ Projets  │  │ Admin   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Services Layer (API Routes)              │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
┌──────────────────────▼──────────────────────────────────┐
│                   BACKEND (Next.js API)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Service Orchestrator                 │   │
│  └──┬──────┬──────┬──────┬──────┬──────┬──────────┘   │
│     │      │      │      │      │      │              │
│  ┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──────────┐  │
│  │DS   ││DA   ││CA   ││CB   ││IG   ││Composition  │  │
│  │Svc  ││Svc  ││Svc  ││Svc  ││Svc  ││Svc         │  │
│  └─────┘└─────┘└─────┘└─────┘└─────┘└─────────────┘  │
└──────────┬──────────┬──────────┬───────────────────────┘
           │          │          │
┌──────────▼──────────▼──────────▼───────────────────────┐
│           SERVICES EXTERNES & STOCKAGE                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │
│  │ DeepSeek │  │   Image  │  │    Supabase      │     │
│  │   API    │  │ Providers│  │ ┌──────────────┐ │     │
│  └──────────┘  │ (Replicate│  │ │ PostgreSQL   │ │     │
│                 │  Stability│  │ │ Storage (S3) │ │     │
│                 │  OpenAI   │  │ │ Auth         │ │     │
│                 │  etc.)    │  │ └──────────────┘ │     │
│                 └──────────┘  └──────────────────┘     │
└────────────────────────────────────────────────────────┘
```

### Flux de données

```
UTILISATEUR
    │
    ▼
IMPORT DU MODÈLE
    │
    ▼
ANALYSE DU DESIGN
    │
    ▼
DEEPSEEK API
    │
    ├── Compréhension du modèle
    ├── Extraction des règles visuelles
    ├── Compréhension du contenu utilisateur
    ├── Création du brief
    └── Création des instructions
    │
    ▼
GÉNÉRATEUR D'IMAGES
    │
    ├── Création de l'arrière-plan
    ├── Création des éléments visuels
    ├── Création ou transformation des sujets
    └── Génération des variantes
    │
    ▼
MOTEUR DE COMPOSITION
    │
    ├── Textes
    ├── Logos
    ├── Prix
    ├── Dates
    ├── Contacts
    ├── Boutons
    └── Éléments graphiques
    │
    ▼
AFFICHE FINALE
    │
    ▼
ÉDITEUR
    │
    ▼
EXPORT
```

---

## 3. Stack Technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Frontend** | Next.js 14+ (App Router) | SSR, API Routes, Server Components |
| **Langage** | TypeScript strict | Sécurité de type à tous les niveaux |
| **Styling** | Tailwind CSS + shadcn/ui | Rapidité, composants accessibles |
| **État** | Zustand + React Query | État local et serveur efficaces |
| **Base de données** | Supabase (PostgreSQL) | Relationnelle, RLS, temps réel |
| **Auth** | Supabase Auth | Sessions, OAuth, RLS intégré |
| **Stockage** | Supabase Storage | S3-compatible, buckets organisés |
| **IA Génération** | DeepSeek API | Cerveau de l'application |
| **Image Generation** | Replicate / Stability AI / OpenAI DALL-E | Providers interchangeables |
| **Composition** | Sharp (serveur) + Canvas (client) | Rendu haute fidélité |
| **Paiement** | Stripe | Facturation, crédits |
| **Hébergement** | Vercel | Déploiement optimisé Next.js |

---

## 4. Structure des Dossiers

```
belimage/
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── callback/
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── projects/[id]/
│   │   │   ├── projects/[id]/editor/
│   │   │   ├── credits/
│   │   │   └── settings/
│   │   │
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   ├── projects/
│   │   │   ├── generations/
│   │   │   └── stats/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   ├── analysis/
│   │   │   ├── generation/
│   │   │   ├── composition/
│   │   │   ├── credits/
│   │   │   ├── upload/
│   │   │   └── admin/
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── navbar.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── project-card.tsx
│   │   │   ├── project-list.tsx
│   │   │   └── create-project-modal.tsx
│   │   │
│   │   ├── editor/
│   │   │   ├── canvas.tsx
│   │   │   ├── layers-panel.tsx
│   │   │   ├── toolbar.tsx
│   │   │   ├── properties-panel.tsx
│   │   │   ├── text-element.tsx
│   │   │   ├── image-element.tsx
│   │   │   └── preview.tsx
│   │   │
│   │   ├── generation/
│   │   │   ├── pipeline-status.tsx
│   │   │   ├── variant-selector.tsx
│   │   │   └── result-viewer.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── quick-mode.tsx
│   │   │   ├── advanced-mode.tsx
│   │   │   └── dynamic-fields.tsx
│   │   │
│   │   └── assets/
│   │       ├── asset-uploader.tsx
│   │       ├── asset-grid.tsx
│   │       └── asset-preview.tsx
│   │
│   ├── services/                         # Services métier
│   │   ├── deepseek.service.ts
│   │   ├── design-analysis.service.ts
│   │   ├── content-analysis.service.ts
│   │   ├── creative-blueprint.service.ts
│   │   ├── image-generation.service.ts
│   │   ├── composition.service.ts
│   │   ├── project.service.ts
│   │   └── credit.service.ts
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── deepseek/
│   │   │   │   ├── client.ts
│   │   │   │   ├── prompts.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   └── image-providers/
│   │   │       ├── types.ts
│   │   │       ├── registry.ts
│   │   │       ├── replicate.provider.ts
│   │   │       ├── stability.provider.ts
│   │   │       └── openai.provider.ts
│   │   │
│   │   ├── composition/
│   │   │   ├── engine.ts
│   │   │   ├── layer.ts
│   │   │   ├── renderer.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── storage/
│   │   │   └── supabase-storage.ts
│   │   │
│   │   └── database/
│   │       ├── client.ts
│   │       ├── migrations/
│   │       └── seed.ts
│   │
│   ├── types/
│   │   ├── design-analysis.ts
│   │   ├── blueprint.ts
│   │   ├── project.ts
│   │   ├── generation.ts
│   │   ├── composition.ts
│   │   ├── credit.ts
│   │   └── user.ts
│   │
│   ├── hooks/
│   │   ├── use-projects.ts
│   │   ├── use-generation.ts
│   │   ├── use-editor.ts
│   │   └── use-credits.ts
│   │
│   └── utils/
│       ├── cn.ts
│       ├── validators.ts
│       └── helpers.ts
│
├── public/
│   ├── images/
│   └── fonts/
│
└── supabase/
    ├── migrations/
    └── schema.sql
```

---

## 5. Schéma de Base de Données

### Table: `profiles`

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  credits     INTEGER NOT NULL DEFAULT 10,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `projects`

```sql
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
```

### Table: `assets`

```sql
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
```

### Table: `generations`

```sql
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
```

### Table: `credit_transactions`

```sql
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
```

### Table: `error_logs`

```sql
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
```

### Row Level Security

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all"
  ON projects FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );
```

---

## 6. Flux de Création d'une Affiche

```
┌─────────────────────────────────────────────────────────────────┐
│                     PIPELINE DE CRÉATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐                                                     │
│  │ IMPORT   │ Phase 1 : L'utilisateur importe son modèle         │
│  │ MODEL    │ → Upload image → Preview → Validation              │
│  └────┬─────┘                                                     │
│       │                                                           │
│       ▼                                                           │
│  ┌──────────┐                                                     │
│  │ ANALYSE  │ Phase 2 : DeepSeek analyse le design               │
│  │ DESIGN   │ → Structure, couleurs, composition, éléments       │
│  └────┬─────┘ → DesignAnalysisService → JSON structuré           │
│       │                                                           │
│       ▼                                                           │
│  ┌──────────┐                                                     │
│  │ CONTENT  │ Phase 3 : Utilisateur remplit les infos            │
│  │ INPUT    │ → Mode Rapide OU Mode Avancé                       │
│  └────┬─────┘ → Extraction IA (DeepSeek) si mode rapide          │
│       │                                                           │
│       ▼                                                           │
│  ┌──────────┐                                                     │
│  │ BLUEPRINT│ Phase 4 : DeepSeek fusionne design + contenu       │
│  │ FUSION   │ → Creative Blueprint avec instructions précises    │
│  └────┬─────┘                                                     │
│       │                                                           │
│       ▼                                                           │
│  ┌──────────┐                                                     │
│  │ VISUAL   │ Phase 5 : Provider d'images génère le visuel       │
│  │ GEN      │ → Arrière-plan, éléments, sujets                   │
│  └────┬─────┘ → Plusieurs variantes possibles                    │
│       │                                                           │
│       ▼                                                           │
│  ┌──────────┐                                                     │
│  │ COMPOSE  │ Phase 6 : Moteur de composition                    │
│  │ POSTER   │ → Superposition des textes exacts, logos, prix     │
│  └────┬─────┘ → Sharp/Canvas rendering                           │
│       │                                                           │
│       ▼                                                           │
│  ┌──────────┐                                                     │
│  │ EDIT     │ Phase 7 : Éditeur final interactif                 │
│  │ & EXPORT │ → Modification des calques → Export PNG/PDF        │
│  └──────────┘                                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Rôle de DeepSeek API

DeepSeek est le **cerveau orchestrateur** — pas un générateur d'images.

### Responsabilités

| Fonction | Description | Format de sortie |
|----------|-------------|------------------|
| **Analyse de design** | Analyser une image modèle et extraire sa structure visuelle | `DesignAnalysis` JSON |
| **Extraction de contenu** | À partir d'un texte libre, extraire les champs structurés | `ContentBlueprint` JSON |
| **Génération de prompt visuel** | Créer un prompt optimisé pour le provider d'images | `string` (prompt text) |
| **Règles de composition** | Déterminer position, taille, style des éléments texte | `CompositionInstruction[]` |
| **Harmonisation** | Vérifier la cohérence modèle → nouvelle affiche | Rapport de validation |
| **Correction** | Proposer des ajustements si résultat incohérent | Instructions de correction |

### Principe fondamental

```
DeepSeek réfléchit, analyse, planifie, orchestre
    ↓
Provider d'images exécute la génération visuelle
    ↓
Moteur de composition assemble précisément
```

### Analyse de design — Structure de sortie

```json
{
  "canvas": {
    "width": 1080,
    "height": 1350,
    "aspectRatio": "4:5"
  },
  "visualStyle": {
    "category": "modern",
    "mood": "premium",
    "energy": "high"
  },
  "colorPalette": [
    { "color": "#000000", "role": "background" },
    { "color": "#FFFFFF", "role": "primary_text" }
  ],
  "layout": {
    "composition": "subject-left-content-right",
    "alignment": "mixed",
    "visualHierarchy": [
      "main_title",
      "main_subject",
      "secondary_information",
      "call_to_action"
    ]
  },
  "elements": [
    {
      "id": "main_subject",
      "type": "person",
      "position": { "x": 0.1, "y": 0.2, "width": 0.4, "height": 0.6 },
      "importance": "high",
      "replaceable": true
    },
    {
      "id": "headline",
      "type": "text",
      "position": { "x": 0.55, "y": 0.15, "width": 0.4, "height": 0.2 },
      "importance": "critical",
      "replaceable": true,
      "mustBeComposedPrecisely": true
    }
  ],
  "designRules": [
    "Keep subject on the left",
    "Keep headline in upper-right area",
    "Maintain strong contrast",
    "Preserve visual hierarchy"
  ]
}
```

### Catégorisation des éléments

| Type d'élément | Action |
|----------------|--------|
| **Structure, proportions, style, hiérarchie, palette, composition** | À **conserver** du modèle |
| **Personne, produit, photo, arrière-plan** | À **remplacer** par génération |
| **Titre, date, prix, téléphone, adresse, bouton, logo** | À **composer précisément** (texte exact) |

---

## 8. Rôle du Provider de Génération d'Images

### Interface abstraite

```typescript
interface ImageGenerationProvider {
  name: string;
  generateImage(params: GenerationParams): Promise<GenerationResult>;
  generateVariants(params: GenerationParams, count: number): Promise<GenerationResult[]>;
  editImage(params: EditImageParams): Promise<GenerationResult>;
}

interface GenerationParams {
  prompt: string;           // Généré par DeepSeek
  negativePrompt?: string;
  width: number;
  height: number;
  style?: string;
  referenceImage?: string;  // Pour image-to-image
  strength?: number;        // Force de la référence
}

interface GenerationResult {
  url: string;
  provider: string;
  width: number;
  height: number;
  seed?: number;
  cost: number;
}
```

### Providers supportables

| Provider | Modèles | Cas d'usage |
|----------|---------|-------------|
| **Replicate** | Flux, SDXL, Playground v2 | Haute qualité, large choix |
| **Stability AI** | Stable Diffusion 3, SDXL | Excellent rendu photoréaliste |
| **OpenAI** | DALL-E 3 | Simplicité, qualité constante |
| **Ideogram** | Ideogram v2 | Très bon pour le texte intégré |
| **Fal.ai** | Flux Pro, SD3 | Haute performance, faible latence |

### Ce que le provider fait / ne fait pas

| ✅ Fait | ❌ Ne fait pas |
|---------|----------------|
| Générer l'arrière-plan | Générer les textes précis |
| Créer des sujets et personnages | Positionner les éléments |
| Produire des ambiances et styles | Respecter une mise en page exacte |
| Générer des éléments décoratifs | Reproduire un logo spécifique |
| Créer des variantes visuelles | Composer une affiche complète |

---

## 9. Rôle du Moteur de Composition

### Principe : Mode Composition Professionnelle (par défaut)

Le moteur de composition prend :
1. L'image générée par le provider (arrière-plan + éléments visuels)
2. Les textes exacts (titre, date, prix, etc.)
3. Les assets importés (logo, photo)
4. Les instructions de composition (de DeepSeek)

Et produit l'affiche finale avec tous les textes parfaitement rendus.

### Architecture des calques

```typescript
interface CompositionLayer {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  zIndex: number;
  
  // Propriétés type-dépendantes
  content?: string;        // Pour text
  imageUrl?: string;       // Pour image
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: number;
  backgroundColor?: string;
}
```

### Technologies de rendu

| Contexte | Technologie | Usage |
|----------|-------------|-------|
| **Serveur (export)** | Sharp (node.js) | Export PNG haute résolution |
| **Client (aperçu)** | HTML Canvas + CSS | Aperçu interactif temps réel |
| **Éditeur** | Composants React drag & drop | Modification des calques |

---

## 10. Risques Techniques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **DeepSeek retourne du JSON invalide** | Blocage du pipeline | Validateur strict + retry + fallback |
| **Provider d'images génère mal** | Résultat incohérent | Variantes + retries contrôlées |
| **Texte dans l'image générée** | Texte illisible | Toujours utiliser le Mode 2 (composition séparée) |
| **Files d'attente (Replicate...)** | Expérience lente | Polling + notifications temps réel |
| **Coût API DeepSeek élevé** | Marges réduites | Cache + optimisation des prompts |
| **Sécurité des clés API** | Exposition de secrets | Clés côté serveur uniquement |
| **Upload fichiers volumineux** | Stockage coûteux | Compression, limite 10MB |
| **Concurrence sur les crédits** | Double dépense | Transactions SQL atomiques |
| **Différence rendu serveur/client** | Résultat final différent | Même moteur de rendu |
| **Panne d'un service externe** | Blocage fonctionnel | Circuit breaker, fallback |

---

## 11. Plan de Développement

### Phases

| Phase | Description | Durée | Dépendances |
|-------|-------------|-------|-------------|
| **P1** | Architecture & validation | 1 jour | — |
| **P2** | Initialisation du projet (Next.js, TS, Tailwind, Supabase) | 2 jours | P1 |
| **P3** | Authentification (login, register, protection) | 2 jours | P2 |
| **P4** | Dashboard (statistiques, projets, crédits) | 3 jours | P3 |
| **P5** | Projets (CRUD, duplication) | 2 jours | P4 |
| **P6** | Upload modèle (upload, preview, storage) | 2 jours | P5 |
| **P7** | Analyse de design (DeepSeek + validation) | 3 jours | P6 |
| **P8** | Formulaire intelligent (mode rapide + avancé) | 3 jours | P7 |
| **P9** | Blueprint (Design + Content + Creative) | 2 jours | P8 |
| **P10** | Génération visuelle (provider abstraction) | 4 jours | P9 |
| **P11** | Composition (moteur de calques, rendu) | 4 jours | P10 |
| **P12** | Éditeur (Canvas, drag & drop) | 4 jours | P11 |
| **P13** | Crédits (transactions, achat, consommation) | 2 jours | P12 |
| **P14** | Administration (dashboard admin, stats, logs) | 3 jours | P13 |
| **P15** | Tests (unitaires, intégration, E2E) | 3 jours | P14 |

### Calendrier estimé

```
Semaine 1  : P1-P2   Architecture + Initialisation
Semaine 2  : P3-P4   Auth + Dashboard
Semaine 3  : P5-P6   Projets + Upload modèle
Semaine 4  : P7      Analyse de design
Semaine 5  : P8      Formulaire intelligent
Semaine 6  : P9-P10  Blueprint + Génération visuelle
Semaine 7  : P11     Composition
Semaine 8  : P12     Éditeur
Semaine 9  : P13-P14 Crédits + Admin
Semaine 10 : P15     Tests + Déploiement
```

---

## Architecture des Services

```
src/
├── services/
│   ├── deepseek.service.ts           # Service centralisé DeepSeek
│   ├── design-analysis.service.ts     # Analyse du modèle visuel
│   ├── content-analysis.service.ts    # Analyse du contenu utilisateur
│   ├── creative-blueprint.service.ts  # Fusion design + contenu
│   ├── image-generation.service.ts    # Orchestration génération visuelle
│   ├── composition.service.ts         # Moteur de composition
│   ├── project.service.ts             # Gestion des projets
│   └── credit.service.ts              # Gestion des crédits
│
├── lib/
│   ├── ai/
│   │   ├── deepseek/
│   │   │   ├── client.ts             # Client HTTP DeepSeek
│   │   │   ├── prompts.ts            # Templates de prompts
│   │   │   ├── validators.ts         # Validation des réponses
│   │   │   └── types.ts              # Types DeepSeek
│   │   │
│   │   └── image-providers/
│   │       ├── types.ts              # Interface commune
│   │       ├── registry.ts           # Registre des providers
│   │       ├── replicate.provider.ts
│   │       ├── stability.provider.ts
│   │       └── openai.provider.ts
```

---

## Règles de Développement

### Principes stricts

1. **Ne jamais exposer les clés API** — toutes côté serveur
2. **Ne jamais dupliquer la logique** — chaque service a une responsabilité unique
3. **Ne pas appeler DeepSeek depuis le frontend** — passer par l'API
4. **Ne pas coupler DeepSeek à un seul provider d'images** — abstraction obligatoire
5. **Ne pas supposer qu'une IA d'image reproduit parfaitement le texte** — utiliser le moteur de composition
6. **Valider toutes les réponses DeepSeek** — JSON invalide → retry contrôlé → erreur claire
7. **Transactions atomiques pour les crédits** — jamais de modification directe du solde
8. **Inspections préalables** — comprendre le code existant avant de modifier

### Avant chaque modification

1. Inspecter le projet existant
2. Comprendre le code et les dépendances
3. Identifier les risques
4. Implémenter uniquement la fonctionnalité demandée
5. Vérifier TypeScript, lint, build
6. Tester la fonctionnalité
