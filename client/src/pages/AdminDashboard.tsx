import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, LogOut, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Section {
  id: number;
  slug: string;
  titleEn: string;
  titleUz: string;
  titleRu: string;
  icon: string;
}

interface Article {
  id: number;
  sectionId: number;
  titleEn: string;
  titleUz: string;
  titleRu: string;
  bodyEn: string;
  bodyUz: string;
  bodyRu: string;
  tags?: string[];
}

export default function AdminDashboard() {
  const [sections, setSections] = useState<Section[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showNewSection, setShowNewSection] = useState(false);
  const [showNewArticle, setShowNewArticle] = useState(false);
  const [, navigate] = useLocation();

  const getAdminToken = () => localStorage.getItem("adminToken") || "";

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/status", {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!response.ok) {
        navigate("/admin/login");
      }
    } catch {
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    checkAuth();
    fetchSections();
    fetchArticles();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch(`/api/admin/sections?adminToken=${getAdminToken()}`);
      if (response.ok) {
        setSections(await response.json());
      }
    } catch (err) {
      setError("Failed to fetch sections");
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await fetch(`/api/admin/articles?adminToken=${getAdminToken()}`);
      if (response.ok) {
        setArticles(await response.json());
      }
    } catch (err) {
      setError("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (data: Partial<Section>) => {
    try {
      setError("");
      const url = editingSection
        ? `/api/admin/sections/${editingSection.id}`
        : "/api/admin/sections";
      const method = editingSection ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || "Failed to save section");
        return;
      }

      setEditingSection(null);
      setShowNewSection(false);
      await fetchSections();
    } catch (err) {
      setError("Connection error");
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getAdminToken()}` },
      });
      if (response.ok) {
        await fetchSections();
      } else {
        setError("Failed to delete section");
      }
    } catch (err) {
      setError("Connection error");
    }
  };

  const handleSaveArticle = async (data: Partial<Article>) => {
    try {
      setError("");
      const url = editingArticle
        ? `/api/admin/articles/${editingArticle.id}`
        : "/api/admin/articles";
      const method = editingArticle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || "Failed to save article");
        return;
      }

      setEditingArticle(null);
      setShowNewArticle(false);
      await fetchArticles();
    } catch (err) {
      setError("Connection error");
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getAdminToken()}` },
      });
      if (response.ok) {
        await fetchArticles();
      } else {
        setError("Failed to delete article");
      }
    } catch (err) {
      setError("Connection error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="sections" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
          </TabsList>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-4">
            <Button onClick={() => setShowNewSection(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Section
            </Button>

            {showNewSection && (
              <SectionForm
                section={null}
                onSave={handleSaveSection}
                onCancel={() => setShowNewSection(false)}
              />
            )}

            <div className="grid gap-4">
              {sections.map((section: Section) => (
                <Card key={section.id} className="p-4">
                  {editingSection?.id === section.id ? (
                    <SectionForm
                      section={editingSection}
                      onSave={async (data) => {
                        await handleSaveSection(data);
                        setEditingSection(null);
                      }}
                      onCancel={() => setEditingSection(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{section.titleEn}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div>
                            <p className="font-medium">Slug:</p>
                            <p>{section.slug}</p>
                          </div>
                          <div>
                            <p className="font-medium">Icon:</p>
                            <p>{section.icon}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSection(section)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-4">
            <Button onClick={() => setShowNewArticle(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Article
            </Button>

            {showNewArticle && (
              <ArticleForm
                article={null}
                sections={sections}
                onSave={handleSaveArticle}
                onCancel={() => setShowNewArticle(false)}
              />
            )}

            <div className="grid gap-4">
              {articles.map((article: Article) => (
                <Card key={article.id} className="p-4">
                  {editingArticle?.id === article.id ? (
                    <ArticleForm
                      article={editingArticle}
                      sections={sections}
                      onSave={async (data) => {
                        await handleSaveArticle(data);
                        setEditingArticle(null);
                      }}
                      onCancel={() => setEditingArticle(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{article.titleEn}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                          {article.bodyEn}
                        </p>
                        <div className="text-xs text-slate-500">
                          Section ID: {article.sectionId}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingArticle(article)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SectionForm({
  section,
  onSave,
  onCancel,
}: {
  section: Section | null;
  onSave: (data: Partial<Section>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(
    section || {
      slug: "",
      titleEn: "",
      titleUz: "",
      titleRu: "",
      icon: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="p-4 bg-slate-100 dark:bg-zinc-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Slug"
            value={formData.slug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
          <Input
            placeholder="Icon (e.g., Calculator)"
            value={formData.icon}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, icon: e.target.value })}
            required
          />
        </div>
        <Input
          placeholder="Title (English)"
          value={formData.titleEn}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, titleEn: e.target.value })}
          required
        />
        <Input
          placeholder="Title (Uzbek)"
          value={formData.titleUz}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, titleUz: e.target.value })}
          required
        />
        <Input
          placeholder="Title (Russian)"
          value={formData.titleRu}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, titleRu: e.target.value })}
          required
        />
        <div className="flex gap-2">
          <Button type="submit" className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ArticleForm({
  article,
  sections,
  onSave,
  onCancel,
}: {
  article: Article | null;
  sections: Section[];
  onSave: (data: Partial<Article>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(
    article || {
      sectionId: sections[0]?.id || 0,
      titleEn: "",
      titleUz: "",
      titleRu: "",
      bodyEn: "",
      bodyUz: "",
      bodyRu: "",
      tags: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="p-4 bg-slate-100 dark:bg-zinc-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <select
            value={formData.sectionId}
            onChange={(e) =>
              setFormData({ ...formData, sectionId: Number(e.target.value) })
            }
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-zinc-700 dark:text-white"
            required
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titleEn}
              </option>
            ))}
          </select>

          <Textarea
            placeholder="Title (English)"
            value={formData.titleEn}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, titleEn: e.target.value })}
            required
            rows={1}
          />
          <Textarea
            placeholder="Title (Uzbek)"
            value={formData.titleUz}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, titleUz: e.target.value })}
            required
            rows={1}
          />
          <Textarea
            placeholder="Title (Russian)"
            value={formData.titleRu}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, titleRu: e.target.value })}
            required
            rows={1}
          />

          <Textarea
            placeholder="Body (English)"
            value={formData.bodyEn}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bodyEn: e.target.value })}
            required
            rows={4}
          />
          <Textarea
            placeholder="Body (Uzbek)"
            value={formData.bodyUz}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bodyUz: e.target.value })}
            required
            rows={4}
          />
          <Textarea
            placeholder="Body (Russian)"
            value={formData.bodyRu}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bodyRu: e.target.value })}
            required
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
