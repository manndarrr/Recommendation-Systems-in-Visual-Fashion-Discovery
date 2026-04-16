export interface RecommendationResult {
  itemId: string;
  score: number;
  reasons: string[];
}

interface ItemFeatures {
  id: string;
  category: string;
  color_tags: string[];
  pattern_tags: string[];
  style_tags: string[];
  complementary_categories: string[] | null;
}

interface UserPreferences {
  preferred_colors: string[] | null;
  preferred_styles: string[] | null;
  preferred_patterns: string[] | null;
}

interface InteractionData {
  item_id: string;
  interaction_type: string;
  user_id?: string;
}

// ─── Utility ────────────────────────────────────────────

function tagOverlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b.map(t => t.toLowerCase()));
  const matches = a.filter(t => setB.has(t.toLowerCase())).length;
  return matches / Math.max(a.length, b.length);
}

function getSharedTags(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(t => t.toLowerCase()));
  return a.filter(t => setB.has(t.toLowerCase()));
}

// ─── Content-Based Similarity ───────────────────────────

export function computeSimilarity(
  source: ItemFeatures,
  target: ItemFeatures
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let totalScore = 0;

  const colorScore = tagOverlap(source.color_tags, target.color_tags);
  if (colorScore > 0) {
    totalScore += colorScore * 0.35;
    const shared = getSharedTags(source.color_tags, target.color_tags);
    reasons.push(`Similar color palette: ${shared.join(", ")}`);
  }

  const styleScore = tagOverlap(source.style_tags, target.style_tags);
  if (styleScore > 0) {
    totalScore += styleScore * 0.35;
    const shared = getSharedTags(source.style_tags, target.style_tags);
    reasons.push(`Matching style: ${shared.join(", ")}`);
  }

  const patternScore = tagOverlap(source.pattern_tags, target.pattern_tags);
  if (patternScore > 0) {
    totalScore += patternScore * 0.2;
    const shared = getSharedTags(source.pattern_tags, target.pattern_tags);
    reasons.push(`Similar pattern: ${shared.join(", ")}`);
  }

  if (source.complementary_categories?.includes(target.category)) {
    totalScore += 0.1;
    reasons.push(`Completes this look: pairs well with ${source.category}`);
  }

  return { score: totalScore, reasons };
}

// ─── User Preference Scoring ────────────────────────────

export function getPersonalizedScore(
  item: ItemFeatures,
  userPrefs: UserPreferences
): { bonus: number; reasons: string[] } {
  const reasons: string[] = [];
  let bonus = 0;

  const prefColors = userPrefs.preferred_colors || [];
  const colorMatch = tagOverlap(item.color_tags, prefColors);
  if (colorMatch > 0) {
    bonus += colorMatch * 0.15;
    const shared = getSharedTags(item.color_tags, prefColors);
    reasons.push(`Matches your preferred colors: ${shared.join(", ")}`);
  }

  const prefStyles = userPrefs.preferred_styles || [];
  const styleMatch = tagOverlap(item.style_tags, prefStyles);
  if (styleMatch > 0) {
    bonus += styleMatch * 0.15;
    const shared = getSharedTags(item.style_tags, prefStyles);
    reasons.push(`Matches your preferred style: ${shared.join(", ")}`);
  }

  const prefPatterns = userPrefs.preferred_patterns || [];
  const patternMatch = tagOverlap(item.pattern_tags, prefPatterns);
  if (patternMatch > 0) {
    bonus += patternMatch * 0.1;
    const shared = getSharedTags(item.pattern_tags, prefPatterns);
    reasons.push(`Features patterns you love: ${shared.join(", ")}`);
  }

  return { bonus, reasons };
}

// ─── Collaborative Filtering ────────────────────────────

/**
 * Build a user-item interaction matrix and find users with similar tastes.
 * Returns item scores boosted by what similar users liked.
 */
function getCollaborativeScores(
  targetUserId: string,
  targetUserLikedItems: Set<string>,
  allInteractions: InteractionData[],
  allItems: ItemFeatures[]
): Map<string, { score: number; reason: string }> {
  const result = new Map<string, { score: number; reason: string }>();

  // Build per-user liked-items map
  const userLikes = new Map<string, Set<string>>();
  for (const int of allInteractions) {
    if (int.interaction_type === "like" && int.user_id && int.user_id !== targetUserId) {
      if (!userLikes.has(int.user_id)) userLikes.set(int.user_id, new Set());
      userLikes.get(int.user_id)!.add(int.item_id);
    }
  }

  if (targetUserLikedItems.size === 0 || userLikes.size === 0) return result;

  // Compute Jaccard similarity with each other user
  const similarUsers: { userId: string; similarity: number; likes: Set<string> }[] = [];

  for (const [userId, likes] of userLikes) {
    const intersection = [...targetUserLikedItems].filter(id => likes.has(id)).length;
    if (intersection === 0) continue;
    const union = new Set([...targetUserLikedItems, ...likes]).size;
    const similarity = intersection / union;
    if (similarity > 0.05) {
      similarUsers.push({ userId, similarity, likes });
    }
  }

  similarUsers.sort((a, b) => b.similarity - a.similarity);
  const topSimilar = similarUsers.slice(0, 10);

  if (topSimilar.length === 0) return result;

  // Score items that similar users liked but target user hasn't
  for (const { similarity, likes } of topSimilar) {
    for (const itemId of likes) {
      if (targetUserLikedItems.has(itemId)) continue;
      const existing = result.get(itemId);
      const addedScore = similarity * 0.3;
      if (existing) {
        result.set(itemId, {
          score: existing.score + addedScore,
          reason: existing.reason,
        });
      } else {
        result.set(itemId, {
          score: addedScore,
          reason: "Popular with users who share your taste",
        });
      }
    }
  }

  return result;
}

// ─── Hybrid Recommendation Engine ───────────────────────

/**
 * Hybrid filtering: blends content-based, user-preference, and collaborative signals.
 *
 * Content-based:   similarity between source item and candidates (tags, colors, patterns)
 * User preferences: boost for items matching user's stated style/color preferences
 * Collaborative:   boost for items liked by users with similar interaction history
 *
 * Cold-start aware: <5 interactions → light personalization, no collaborative signal
 */
export function getRecommendations(
  sourceItem: ItemFeatures,
  allItems: ItemFeatures[],
  userPrefs?: UserPreferences,
  interactions?: InteractionData[],
  limit = 8,
  allUsersInteractions?: InteractionData[],
  currentUserId?: string
): RecommendationResult[] {
  const interactionCount = interactions?.length || 0;
  const isColdStart = interactionCount < 5;

  // Build collaborative scores if we have enough data
  const userLikedItems = new Set(
    (interactions || []).filter(i => i.interaction_type === "like").map(i => i.item_id)
  );
  const collaborativeScores = (!isColdStart && allUsersInteractions && currentUserId)
    ? getCollaborativeScores(currentUserId, userLikedItems, allUsersInteractions, allItems)
    : new Map<string, { score: number; reason: string }>();

  const interactedItemIds = new Set(interactions?.map(i => i.item_id) || []);
  const results: RecommendationResult[] = [];

  for (const target of allItems) {
    if (target.id === sourceItem.id) continue;

    const { score, reasons } = computeSimilarity(sourceItem, target);
    let finalScore = score;
    const allReasons = [...reasons];

    // User preference boost
    if (userPrefs && !isColdStart) {
      const { bonus, reasons: prefReasons } = getPersonalizedScore(target, userPrefs);
      finalScore += bonus * 1.5;
      allReasons.push(...prefReasons);
    } else if (userPrefs && isColdStart) {
      const { bonus, reasons: prefReasons } = getPersonalizedScore(target, userPrefs);
      finalScore += bonus * 0.5;
      if (prefReasons.length > 0) allReasons.push(...prefReasons);
    }

    // Collaborative filtering boost
    const collabData = collaborativeScores.get(target.id);
    if (collabData) {
      finalScore += collabData.score;
      allReasons.push(collabData.reason);
    }

    // Small boost for previously interacted items
    if (!isColdStart && interactedItemIds.has(target.id)) {
      finalScore += 0.05;
    }

    if (finalScore > 0.05) {
      results.push({ itemId: target.id, score: finalScore, reasons: allReasons });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function findSimilarItems(
  sourceItem: ItemFeatures,
  allItems: ItemFeatures[],
  userPrefs?: UserPreferences,
  limit = 8,
  allUsersInteractions?: InteractionData[],
  currentUserId?: string,
  userInteractions?: InteractionData[]
): RecommendationResult[] {
  return getRecommendations(sourceItem, allItems, userPrefs, userInteractions, limit, allUsersInteractions, currentUserId);
}

export function getCompleteTheLook(
  sourceItem: ItemFeatures,
  allItems: ItemFeatures[],
  userPrefs?: UserPreferences,
  limit = 4,
  allUsersInteractions?: InteractionData[],
  currentUserId?: string
): RecommendationResult[] {
  const complementary = allItems.filter(
    item =>
      item.id !== sourceItem.id &&
      sourceItem.complementary_categories?.includes(item.category)
  );

  const results: RecommendationResult[] = [];
  const usedCategories = new Set<string>();

  // Build collaborative scores
  const userLikedItems = new Set<string>();
  const collaborativeScores = (allUsersInteractions && currentUserId)
    ? getCollaborativeScores(currentUserId, userLikedItems, allUsersInteractions, allItems)
    : new Map<string, { score: number; reason: string }>();

  const scored = complementary.map(target => {
    const { score, reasons } = computeSimilarity(sourceItem, target);
    let finalScore = score + 0.2;
    const allReasons = [`Completes this outfit: pairs with your ${sourceItem.category}`, ...reasons];

    if (userPrefs) {
      const { bonus, reasons: prefReasons } = getPersonalizedScore(target, userPrefs);
      finalScore += bonus;
      allReasons.push(...prefReasons);
    }

    const collabData = collaborativeScores.get(target.id);
    if (collabData) {
      finalScore += collabData.score;
      allReasons.push(collabData.reason);
    }

    return { itemId: target.id, score: finalScore, reasons: allReasons, category: target.category };
  });

  scored.sort((a, b) => b.score - a.score);

  for (const item of scored) {
    if (usedCategories.has(item.category)) continue;
    usedCategories.add(item.category);
    results.push({ itemId: item.itemId, score: item.score, reasons: item.reasons });
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Get "For You" recommendations based purely on user behavior and collaborative filtering.
 * Used on the discover page to show personalized picks.
 */
export function getForYouRecommendations(
  allItems: ItemFeatures[],
  userPrefs?: UserPreferences,
  userInteractions?: InteractionData[],
  allUsersInteractions?: InteractionData[],
  currentUserId?: string,
  limit = 12
): RecommendationResult[] {
  const interactionCount = userInteractions?.length || 0;
  const isColdStart = interactionCount < 5;

  const userLikedItems = new Set(
    (userInteractions || []).filter(i => i.interaction_type === "like").map(i => i.item_id)
  );

  // Get collaborative scores
  const collaborativeScores = (!isColdStart && allUsersInteractions && currentUserId)
    ? getCollaborativeScores(currentUserId, userLikedItems, allUsersInteractions, allItems)
    : new Map<string, { score: number; reason: string }>();

  // Build a profile from liked items
  const likedItemFeatures = allItems.filter(i => userLikedItems.has(i.id));

  const results: RecommendationResult[] = [];

  for (const target of allItems) {
    if (userLikedItems.has(target.id)) continue;

    let finalScore = 0;
    const reasons: string[] = [];

    // Content-based: average similarity to liked items
    if (likedItemFeatures.length > 0) {
      let totalSim = 0;
      for (const liked of likedItemFeatures) {
        const { score } = computeSimilarity(liked, target);
        totalSim += score;
      }
      const avgSim = totalSim / likedItemFeatures.length;
      if (avgSim > 0) {
        finalScore += avgSim * 0.5;
        reasons.push("Similar to items you've liked");
      }
    }

    // User preference boost
    if (userPrefs) {
      const { bonus, reasons: prefReasons } = getPersonalizedScore(target, userPrefs);
      finalScore += bonus * (isColdStart ? 1.0 : 1.5);
      reasons.push(...prefReasons);
    }

    // Collaborative boost
    const collabData = collaborativeScores.get(target.id);
    if (collabData) {
      finalScore += collabData.score;
      reasons.push(collabData.reason);
    }

    if (finalScore > 0.02) {
      results.push({ itemId: target.id, score: finalScore, reasons });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function analyzeUploadedImage(tags: {
  colors: string[];
  patterns: string[];
  styles: string[];
  category: string;
}): ItemFeatures {
  return {
    id: "uploaded",
    category: tags.category,
    color_tags: tags.colors,
    pattern_tags: tags.patterns,
    style_tags: tags.styles,
    complementary_categories: getComplementaryForCategory(tags.category),
  };
}

function getComplementaryForCategory(category: string): string[] {
  const map: Record<string, string[]> = {
    blazers: ["suits", "shoes", "accessories", "watches"],
    suits: ["shoes", "accessories", "watches"],
    shoes: ["blazers", "suits", "casual", "tops"],
    accessories: ["blazers", "suits", "casual", "tops"],
    watches: ["suits", "blazers", "casual"],
    casual: ["shoes", "accessories", "watches", "tops"],
    outerwear: ["tops", "casual", "shoes", "accessories"],
    tops: ["casual", "shoes", "accessories", "outerwear"],
  };
  return map[category] || ["shoes", "accessories", "casual"];
}

export function getColdStartStatus(interactionCount: number): {
  isColdStart: boolean;
  mode: string;
  description: string;
} {
  if (interactionCount === 0) {
    return {
      isColdStart: true,
      mode: "Discovery Mode",
      description: "Recommendations based purely on visual similarity. Interact with items to personalize!",
    };
  }
  if (interactionCount < 5) {
    return {
      isColdStart: true,
      mode: "Learning Mode",
      description: `${5 - interactionCount} more interactions needed for full personalization. Your preferences are lightly factored in.`,
    };
  }
  return {
    isColdStart: false,
    mode: "Personalized Mode",
    description: "Recommendations are fully tailored using hybrid filtering: your style profile, browsing history, and similar users' preferences.",
  };
}
