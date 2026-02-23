import { useRoute, Link } from "wouter";
import { useSections, useArticles } from "@/hooks/use-content";
import { useI18n, translations, getLocalizedField } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Calendar, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function Section() {
  const [, params] = useRoute("/sections/:slug");
  const { data: sections } = useSections();
  const { language } = useI18n();
  const t = translations[language];
  const [search, setSearch] = useState("");

  const currentSection = sections?.find(s => s.slug === params?.slug);
  const { data: articles, isLoading } = useArticles(currentSection?.id, search);

  // If viewing all sections (no slug)
  if (!params?.slug) {
    return (
      <Layout>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">{t.subjects}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections?.map((section) => (
            <Link key={section.id} href={`/sections/${section.slug}`}>
              <Card className="p-6 border-border/50 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer rounded-2xl group">
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {getLocalizedField(section, 'title', language)}
                </h3>
              </Card>
            </Link>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-extrabold text-foreground mb-2">
              {currentSection ? getLocalizedField(currentSection, 'title', language) : '...'}
            </h1>
            <p className="text-muted-foreground text-lg">Explore curated articles and resources.</p>
          </div>
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder={t.search} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full bg-white dark:bg-zinc-900 border-border/50 focus-visible:ring-primary/20 shadow-sm"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : articles?.length === 0 ? (
        <div className="text-center py-24 bg-white/50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-border">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{t.noArticles}</h3>
          <p className="text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles?.map((article) => (
            <Link key={article.id} href={`/articles/${article.id}`}>
              <Card className="flex flex-col h-full bg-white dark:bg-zinc-900 border-border/50 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.createdAt ? format(new Date(article.createdAt), 'MMM d, yyyy') : 'Recent'}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {getLocalizedField(article, 'title', language)}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                    {getLocalizedField(article, 'body', language).substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                    <div className="flex gap-2">
                      {article.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
