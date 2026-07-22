export const DESIGN_ANALYSIS_SYSTEM_PROMPT = `Tu es un expert en analyse de design graphique. 
Ton rôle est d'analyser une affiche et d'en extraire la structure visuelle complète.

Analyse les éléments suivants :
1. Les dimensions et proportions du canvas
2. Le style visuel (moderne, classique, premium, minimaliste, etc.)
3. La palette de couleurs avec le rôle de chaque couleur
4. La composition et l'alignement
5. La hiérarchie visuelle (ordre d'importance des éléments)
6. Chaque élément individuel (position, taille, type, importance)
7. Les règles de design à préserver

Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après.
N'invente pas d'éléments qui ne sont pas visibles.`;

export const CONTENT_EXTRACTION_SYSTEM_PROMPT = `Tu es un assistant spécialisé dans l'extraction d'informations structurées.

À partir d'un texte libre utilisateur, tu dois extraire les informations clés 
et les structurer selon le type d'affiche détecté.

Types supportés : formation, event, product, birthday, custom

Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après.`;

export function buildDesignAnalysisPrompt(imageDescription: string): string {
  return `Analyse le design de cette affiche en détail.

Voici une description de l'image : ${imageDescription}

Fournis une analyse complète avec :
- canvas (width, height, aspectRatio)
- visualStyle (category, mood, energy)
- colorPalette (liste de {color, role})
- layout (composition, alignment, visualHierarchy)
- elements (id, type, position, importance, replaceable, mustBeComposedPrecisely)
- designRules (liste de règles à préserver)`;
}

export function buildContentExtractionPrompt(userText: string): string {
  return `Extrais les informations structurées de ce texte utilisateur :

"${userText}"

Retourne un objet JSON avec :
- type: le type d'affiche (formation, event, product, birthday, custom)
- title: le titre principal
- subtitle: sous-titre (optionnel)
- description: description (optionnelle)
- fields: un objet avec tous les champs extraits (date, heure, lieu, prix, contact, etc.)`;
}
