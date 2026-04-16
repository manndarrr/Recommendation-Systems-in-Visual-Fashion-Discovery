import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { FashionCard } from "@/components/FashionCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { analyzeUploadedImage, findSimilarItems, getCompleteTheLook } from "@/lib/recommendation-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Image, X, Sparkles, Palette, Wand2, PuzzleIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "StyleUps" },
      { name: "description", content: "Upload a fashion image and find visually similar items." },
    ],
  }),
  component: UploadPage,
});

const CATEGORY_OPTIONS = ["blazers", "suits", "shoes", "accessories", "watches", "casual", "outerwear", "tops"];
const COLOR_OPTIONS = ["black", "white", "navy", "beige", "brown", "grey", "charcoal", "blue", "tan", "burgundy", "olive", "cream", "camel", "gold", "silver", "red", "green"];
const STYLE_OPTIONS = ["classic", "formal", "tailored", "sophisticated", "elegant", "casual", "streetwear", "vintage", "luxury", "minimalist", "modern", "sporty", "urban", "professional"];
const PATTERN_OPTIONS = ["solid", "striped", "plaid", "textured", "woven", "quilted", "graphic", "check"];

function UploadPage() {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("blazers");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [results, setResults] = useState<{ similar: any[]; complete: any[] } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const { data: items } = await supabase.from("fashion_items").select("*");
    setAllItems(items || []);

    let prefs = undefined;
    if (user) {
      const { data } = await supabase.from("profiles").select("preferred_colors, preferred_styles, preferred_patterns").eq("user_id", user.id).single();
      prefs = data || undefined;
    }

    const uploadedFeatures = analyzeUploadedImage({
      colors: selectedColors,
      patterns: selectedPatterns.length ? selectedPatterns : ["solid"],
      styles: selectedStyles,
      category: selectedCategory,
    });

    const similar = findSimilarItems(uploadedFeatures, items || [], prefs, 8);
    const complete = getCompleteTheLook(uploadedFeatures, items || [], prefs, 4);

    setResults({ similar, complete });
    setAnalyzing(false);
  };

  const reset = () => {
    setImagePreview(null);
    setResults(null);
    setSelectedColors([]);
    setSelectedStyles([]);
    setSelectedPatterns([]);
  };

  // Helper to get the primary reason badge type
  const getReasonBadge = (reasons: string[]) => {
    const badges: { label: string; icon: typeof Palette; variant: "default" | "secondary" | "outline" }[] = [];
    for (const r of reasons) {
      if (r.toLowerCase().includes("color palette")) {
        badges.push({ label: "Similar color palette", icon: Palette, variant: "secondary" });
      } else if (r.toLowerCase().includes("preferred style") || r.toLowerCase().includes("matching style")) {
        badges.push({ label: "Matches your style", icon: Wand2, variant: "secondary" });
      } else if (r.toLowerCase().includes("completes") || r.toLowerCase().includes("outfit")) {
        badges.push({ label: "Completes this look", icon: PuzzleIcon, variant: "secondary" });
      }
    }
    // Deduplicate by label
    const seen = new Set<string>();
    return badges.filter(b => {
      if (seen.has(b.label)) return false;
      seen.add(b.label);
      return true;
    }).slice(0, 2);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-foreground sm:text-4xl">Visual Search</h1>
        <p className="mt-2 text-muted-foreground">Upload a fashion image and describe it to find similar items</p>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Upload area */}
        <div className="space-y-6">
          {!imagePreview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
            >
              <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 cursor-pointer opacity-0" />
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium text-foreground">Drop your fashion image here</p>
              <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={imagePreview} alt="Uploaded" className="w-full rounded-2xl object-cover" />
              <button onClick={reset} className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Tag selection */}
          <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="font-[var(--font-display)] text-lg font-semibold">Describe the item</h3>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map(cat => (
                  <Badge key={cat} variant={selectedCategory === cat ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setSelectedCategory(cat)}>{cat}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(c => (
                  <Badge key={c} variant={selectedColors.includes(c) ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => toggleTag(c, selectedColors, setSelectedColors)}>{c}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style</p>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map(s => (
                  <Badge key={s} variant={selectedStyles.includes(s) ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => toggleTag(s, selectedStyles, setSelectedStyles)}>{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pattern</p>
              <div className="flex flex-wrap gap-2">
                {PATTERN_OPTIONS.map(p => (
                  <Badge key={p} variant={selectedPatterns.includes(p) ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => toggleTag(p, selectedPatterns, setSelectedPatterns)}>{p}</Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={analyzing || selectedColors.length === 0} className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              {analyzing ? "Analyzing..." : "Find Similar Items"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div>
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                {results.similar.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-[var(--font-display)] text-xl font-bold text-foreground">Visually Similar</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Items matching your uploaded piece based on color, style, and pattern analysis</p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {results.similar.map(rec => {
                        const recItem = allItems.find(i => i.id === rec.itemId);
                        if (!recItem) return null;
                        const badges = getReasonBadge(rec.reasons);
                        return (
                          <div key={rec.itemId} className="space-y-2">
                            <FashionCard
                              id={recItem.id}
                              name={recItem.name}
                              image_url={recItem.image_url}
                              price={Number(recItem.price)}
                              brand={recItem.brand || ""}
                              category={recItem.category}
                              style_tags={recItem.style_tags || []}
                              color_tags={recItem.color_tags || []}
                            />
                            {badges.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {badges.map(b => (
                                  <span key={b.label} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                    <b.icon className="h-3 w-3" />
                                    {b.label}
                                  </span>
                                ))}
                              </div>
                            )}
                            <RecommendationCard reasons={rec.reasons} score={rec.score} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {results.complete.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <PuzzleIcon className="h-5 w-5 text-primary" />
                      <h3 className="font-[var(--font-display)] text-xl font-bold text-foreground">Complete the Look</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Complementary pieces from different categories to build a full outfit</p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {results.complete.map(rec => {
                        const recItem = allItems.find(i => i.id === rec.itemId);
                        if (!recItem) return null;
                        const badges = getReasonBadge(rec.reasons);
                        return (
                          <div key={rec.itemId} className="space-y-2">
                            <FashionCard
                              id={recItem.id}
                              name={recItem.name}
                              image_url={recItem.image_url}
                              price={Number(recItem.price)}
                              brand={recItem.brand || ""}
                              category={recItem.category}
                              style_tags={recItem.style_tags || []}
                              color_tags={recItem.color_tags || []}
                            />
                            {badges.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {badges.map(b => (
                                  <span key={b.label} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                    <b.icon className="h-3 w-3" />
                                    {b.label}
                                  </span>
                                ))}
                              </div>
                            )}
                            <RecommendationCard reasons={rec.reasons} score={rec.score} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
                <Image className="h-16 w-16 text-muted-foreground/30" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">Upload an image and describe it</p>
                <p className="mt-1 text-xs text-muted-foreground">Recommendations will appear here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
