import { useRoute, Link } from "wouter";
import { useArticle, useBookmarks, useToggleBookmark } from "@/hooks/use-content";
import { useAuth } from "@/hooks/use-auth";
import { useI18n, translations, getLocalizedField } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookmarkIcon, Calendar, ArrowLeft, Loader2, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export default function Article() {
  const [, params] = useRoute("/articles/:id");
  const articleId = parseInt(params?.id || "0");
  const { data: article, isLoading } = useArticle(articleId);
  const { data: bookmarks } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const { isAuthenticated } = useAuth();
  const { language } = useI18n();
  const t = translations[language];
  const { toast } = useToast();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!article) return <Layout><div className="py-20 text-center text-xl font-bold">Article not found</div></Layout>;

  const userBookmark = bookmarks?.find(b => b.article.id === articleId);
  const isBookmarked = !!userBookmark;

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: t.loginToBookmark,
        variant: "destructive"
      });
      return;
    }
    toggleBookmark.mutate({ 
      articleId, 
      isBookmarked, 
      bookmarkId: userBookmark?.id 
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-in fade-in duration-700 pb-12">
        <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
          <Link href="/sections">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
        </Button>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-900 border border-border/50 rounded-full shadow-sm">
              <Calendar className="w-4 h-4" />
              {article.createdAt ? format(new Date(article.createdAt), 'MMMM d, yyyy') : 'Recent'}
            </div>
            <div className="flex gap-2">
              {article.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider text-[10px] font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground leading-[1.15] mb-8">
            {getLocalizedField(article, 'title', language)}
          </h1>

          <div className="flex items-center gap-3 pb-8 border-b border-border/50">
            <Button 
              onClick={handleBookmark} 
              variant={isBookmarked ? "default" : "outline"}
              disabled={toggleBookmark.isPending}
              className={`rounded-full px-6 transition-all ${isBookmarked ? 'bg-primary shadow-md shadow-primary/20' : 'bg-white dark:bg-zinc-900 border-border'}`}
            >
              <BookmarkIcon className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? t.saved : t.save}
            </Button>
            <Button variant="outline" size="icon" className="rounded-full bg-white dark:bg-zinc-900 border-border">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl prose-img:shadow-lg prose-pre:bg-slate-900 dark:prose-pre:bg-black/50 prose-pre:border prose-pre:border-slate-800">
          <ReactMarkdown>
            {getLocalizedField(article, 'body', language)}
          </ReactMarkdown>
        </div>
      </div>
    </Layout>
  );
}
