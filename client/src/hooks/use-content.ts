import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useSections() {
  return useQuery({
    queryKey: [api.sections.list.path],
    queryFn: async () => {
      const res = await fetch(api.sections.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sections");
      return api.sections.list.responses[200].parse(await res.json());
    },
  });
}

export function useArticles(sectionId?: number, search?: string) {
  return useQuery({
    queryKey: [api.articles.list.path, sectionId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sectionId) params.append("sectionId", sectionId.toString());
      if (search) params.append("search", search);
      
      const res = await fetch(`${api.articles.list.path}?${params.toString()}`, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch articles");
      return api.articles.list.responses[200].parse(await res.json());
    },
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: [api.articles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.articles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Article not found");
      if (!res.ok) throw new Error("Failed to fetch article");
      return api.articles.get.responses[200].parse(await res.json());
    },
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: [api.bookmarks.list.path],
    queryFn: async () => {
      const res = await fetch(api.bookmarks.list.path, { credentials: "include" });
      if (res.status === 401) return []; // Not logged in
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      return api.bookmarks.list.responses[200].parse(await res.json());
    },
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, isBookmarked, bookmarkId }: { articleId: number, isBookmarked: boolean, bookmarkId?: number }) => {
      if (isBookmarked && bookmarkId) {
        const url = buildUrl(api.bookmarks.delete.path, { id: bookmarkId });
        const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) throw new Error("Failed to remove bookmark");
      } else {
        const res = await fetch(api.bookmarks.create.path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
          credentials: 'include'
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error("unauthorized");
          throw new Error("Failed to add bookmark");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookmarks.list.path] });
    }
  });
}
