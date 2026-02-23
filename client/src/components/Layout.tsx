import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useI18n, translations, Language } from "@/lib/i18n";
import { BookMarked, Home, Library, LogIn, LogOut, Menu, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage } = useI18n();
  const t = translations[language];
  const [location] = useLocation();

  const handleAuth = () => {
    if (isAuthenticated) {
      window.location.href = '/api/logout';
    } else {
      window.location.href = '/api/login';
    }
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-2 p-4">
      <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800'}`}>
        <Home className="w-5 h-5" />
        {t.home}
      </Link>
      <Link href="/sections" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location.startsWith('/sections') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800'}`}>
        <Library className="w-5 h-5" />
        {t.subjects}
      </Link>
      {isAuthenticated && (
        <Link href="/bookmarks" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location === '/bookmarks' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800'}`}>
          <BookMarked className="w-5 h-5" />
          {t.bookmarks}
        </Link>
      )}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl fixed inset-y-0 z-40">
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-primary p-2 rounded-xl group-hover:scale-105 transition-transform shadow-sm shadow-primary/20">
              <Library className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">EduPlatform</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 glass-panel flex items-center justify-between px-4 md:px-8 border-b-0 md:border-b mb-6 md:mb-0">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary p-2 rounded-xl">
                      <Library className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-display font-bold">EduPlatform</span>
                  </div>
                </div>
                <NavLinks />
              </SheetContent>
            </Sheet>
          </div>

          <div className="ml-auto flex items-center gap-3 md:gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="font-medium rounded-full px-4 h-9 bg-white/50 border-border/50 shadow-sm">
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-border/50">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('uz')} className="cursor-pointer">Oʻzbekcha</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ru')} className="cursor-pointer">Русский</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 rounded-full pl-2 pr-4 bg-white/50 border border-border/50 shadow-sm flex items-center gap-2 hover:bg-slate-100">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.profileImageUrl || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs"><UserCircle className="w-4 h-4"/></AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:block truncate max-w-[100px]">
                      {user?.firstName || user?.email?.split('@')[0] || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl shadow-xl p-2 w-48">
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b mb-1">
                    {t.welcome}
                  </div>
                  <DropdownMenuItem onClick={handleAuth} className="cursor-pointer text-destructive focus:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleAuth} className="rounded-full h-9 px-6 shadow-sm shadow-primary/20 hover:shadow-md transition-all">
                <LogIn className="w-4 h-4 mr-2" />
                {t.signIn}
              </Button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 md:px-8 max-w-7xl mx-auto w-full pb-24">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
