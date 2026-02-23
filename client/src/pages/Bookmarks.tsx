import { useBookmarks } from "@/hooks/use-content";
import { useAuth } from "@/hooks/use-auth";
import { useI18n, translations, getLocalizedField } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Loader2, BookmarkIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Bookmarks() {
  const { data: bookmarks, isLoading } = useBookmarks();
  const { isAuthenticated } = useAuth();
  const { language } = useI18n();
  const t = translations[language];

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="text-center py-32 max-w-md mx-auto">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <BookmarkIcon className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">{t.bookmarks}</h2>
          <p className="text-muted-foreground text-lg mb-8">{t.loginToBookmark}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-4xl font-display font-extrabold mb-2">{t.bookmarks}</h1>
        <p className="text-muted-foreground text-lg">Your personal reading list.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : bookmarks?.length === 0 ? (
        <div className="text-center py-24 bg-white/50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-border max-w-2xl mx-auto">
          <BookmarkIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground mb-6">Start exploring subjects and save articles to read later.</p>
          <Link href="/sections" className="text-primary font-bold hover:underline inline-flex items-center">
            Explore Subjects <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks?.map((bookmark) => (
            <Link key={bookmark.id} href={`/articles/${bookmark.article.id}`}>
              <Card className="flex flex-col h-full bg-white dark:bg-zinc-900 border-border/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer p-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <BookmarkIcon className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {getLocalizedField(bookmark.article, 'title', language)}
                </h3>
                <p className="text-muted-foreground line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                  {getLocalizedField(bookmark.article, 'body', language).substring(0, 100)}...
                </p>
                <div className="flex items-center text-sm font-bold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Read Article <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
