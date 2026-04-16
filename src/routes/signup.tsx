import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STYLE_CATEGORIES, COLOR_PALETTE } from "@/lib/fashion-data";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "StyleUps" },
      { name: "description", content: "Create your StyleAI account and take the style quiz." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"credentials" | "quiz">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  if (user && step === "credentials") {
    navigate({ to: "/discover" });
    return null;
  }

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setStep("quiz");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleQuizComplete = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase.from("profiles").update({
          preferred_styles: selectedStyles,
          preferred_colors: selectedColors,
          style_quiz_completed: true,
        }).eq("user_id", authUser.id);
      }
      navigate({ to: "/discover" });
    } catch {
      navigate({ to: "/discover" });
    } finally {
      setLoading(false);
    }
  };

  if (step === "quiz") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fashion-cream via-background to-fashion-rose/10 px-4 py-12">
        <Card className="w-full max-w-lg border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-[var(--font-display)] text-2xl">Style Profile</CardTitle>
            <CardDescription>Help us personalize your recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block text-sm font-semibold">What styles define you?</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_CATEGORIES.map(style => (
                  <Badge
                    key={style}
                    variant={selectedStyles.includes(style) ? "default" : "outline"}
                    className="cursor-pointer capitalize transition-all hover:scale-105"
                    onClick={() => toggleStyle(style)}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-3 block text-sm font-semibold">Colors you love</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map(color => (
                  <Badge
                    key={color.value}
                    variant={selectedColors.includes(color.value) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => toggleColor(color.value)}
                  >
                    {color.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => navigate({ to: "/discover" })} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleQuizComplete} disabled={loading} className="flex-1 gap-2">
              {loading ? "Saving..." : "Complete"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fashion-cream via-background to-fashion-rose/10 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-[var(--font-display)] text-2xl">Create Account</CardTitle>
          <CardDescription>Start your personalized fashion journey</CardDescription>
        </CardHeader>
        <form onSubmit={handleCredentials}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
