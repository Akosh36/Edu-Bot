import { Link } from "wouter";
import { useSections } from "@/hooks/use-content";
import { useI18n, translations, getLocalizedField } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { BookOpen, Compass, Globe, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: sections, isLoading } = useSections();
  const { language } = useI18n();
  const t = translations[language];

  // Helper to render dynamic lucide icons if needed, falling back to a default
  const IconMap: Record<string, any> = {
    science: Compass,
    languages: Globe,
    history: BookOpen,
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-border/50 shadow-sm mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-primary text-sm font-semibold mb-6 ring-1 ring-primary/20 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Learning</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground mb-6 leading-[1.1]">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 text-base h-12 hover:-translate-y-0.5 transition-transform">
              <Link href="/sections">{t.startLearning}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 border-2 hover:bg-slate-50 text-base transition-transform">
              <Link href="/bookmarks">{t.bookmarks}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">{t.subjects}</h2>
        <Button variant="ghost" asChild className="hidden md:flex items-center text-primary font-medium hover:bg-primary/5">
          <Link href="/sections">
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections?.map((section) => {
            const Icon = IconMap[section.icon] || BookOpen;
            return (
              <Link key={section.id} href={`/sections/${section.slug}`}>
                <Card className="group relative overflow-hidden h-full border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer rounded-2xl bg-white/50 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-colors duration-500" />
                  <div className="p-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {getLocalizedField(section, 'title', language)}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      {t.readMore} <ArrowRight className="w-4 h-4 ml-1" />
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
