import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Eye, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StyleUps" },
      { name: "description", content: "Discover fashion recommendations powered by visual AI. Upload any outfit and get instant style-matched suggestions." },
      { property: "og:title", content: "StyleUps — Your Personal AI Stylist" },
      { property: "og:description", content: "Discover fashion recommendations powered by visual AI." },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  { icon: Eye, title: "Visual Search", desc: "Upload any fashion image and find visually similar items instantly using neural feature extraction." },
  { icon: Sparkles, title: "Smart Matching", desc: "Our engine analyzes color, texture, and pattern to find pieces that complement your style." },
  { icon: Layers, title: "Complete the Look", desc: "Get outfit completion suggestions — tops matched with bottoms, shoes, and accessories." },
];

function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fashion-cream via-background to-fashion-rose/10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-fashion-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-fashion-charcoal">
                <Sparkles className="h-3.5 w-3.5" />
                POWERED-UP FASHION
              </span>
              <h1 className="mt-6 font-[var(--font-display)] text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Your Personal
                <br />
                <span className="bg-gradient-to-r from-fashion-rose to-fashion-gold bg-clip-text text-transparent">
                  Fashion Stylist
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Upload any outfit image and discover visually similar pieces, complete-the-look
                suggestions, and personalized recommendations — all powered by neural style analysis.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/discover">
                  <Button size="lg" className="gap-2 rounded-xl px-8">
                    Explore Collection
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/upload">
                  <Button size="lg" variant="outline" className="gap-2 rounded-xl px-8">
                    Try Visual Search
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  "/hero-1.jpg",
                  "/hero-2.jpg",
                  "/51611088-1fd1-4dd1-bbb8-a9cc3385e62f.jpg",
                  "/hero-4.jpg",
                ].map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className={`overflow-hidden rounded-2xl ${i % 2 === 1 ? "mt-8" : ""}`}
                  >
                    <img src={src} alt="Fashion" className="aspect-[3/4] w-full object-cover" loading="lazy" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card/50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our system extracts visual features from fashion images — color palettes, textures, patterns — and
              maps them into a latent embedding space for intelligent similarity matching.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="rounded-2xl border border-border/50 bg-background p-8 text-center transition-shadow hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <feat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 font-[var(--font-display)] text-lg font-semibold text-foreground">{feat.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-foreground sm:text-4xl">
              Neural Recommendation Pipeline
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Inspired by multimodal deep learning architectures — combining visual embeddings with user behavior data.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 py-0 px-0">
            {["Input Image", "Feature Extraction", "Embedding Space", "Similarity Search", "Ranking", "Recommendations"].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                  {step}
                </div>
                {i < 5 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-gradient-to-r from-fashion-cream to-fashion-rose/10 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-[var(--font-display)] text-3xl font-bold text-foreground sm:text-4xl">
            Start Your Style Journey
          </h2>
          <p className="mt-4 text-muted-foreground">
            Create your style profile, explore our curated collection, and let us find your perfect look.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {!user && (
              <Link to="/signup">
                <Button size="lg" className="gap-2 rounded-xl px-8">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">
            © 2026 StyleUps. Powered by neural visual analysis.
          </p>
        </div>
      </footer>
    </div>
  );
}