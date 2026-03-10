import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { initializeAdminAuth } from "./replit_integrations/admin";
import { registerAdminRoutes } from "./replit_integrations/admin/routes";
import Groq from "groq-sdk";
import { db } from "./db";
import { articles, sections } from "@shared/schema";
import { sql } from "drizzle-orm";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Initialize admin authentication
  initializeAdminAuth(app);
  await registerAdminRoutes(app);

  app.get(api.sections.list.path, async (req, res) => {
    const data = await storage.getSections();
    res.json(data);
  });

  app.get(api.articles.list.path, async (req, res) => {
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const data = await storage.getArticles(sectionId, search);
    res.json(data);
  });

  app.get(api.articles.get.path, async (req, res) => {
    const data = await storage.getArticle(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  });

  app.get(api.bookmarks.list.path, isAuthenticated, async (req: any, res) => {
    const data = await storage.getBookmarks(req.user.claims.sub);
    res.json(data);
  });

  app.post(api.bookmarks.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const { articleId } = api.bookmarks.create.input.parse(req.body);
      const data = await storage.createBookmark(req.user.claims.sub, articleId);
      res.status(201).json(data);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.bookmarks.delete.path, isAuthenticated, async (req: any, res) => {
    await storage.deleteBookmark(Number(req.params.id), req.user.claims.sub);
    res.status(204).end();
  });

  app.post(api.chat.send.path, async (req: any, res) => {
    try {
      const { message, language, section } = api.chat.send.input.parse(req.body);
      
      // Basic text search for RAG since Groq doesn't support embeddings
      let contextStr = "No specific context found.";
      const searchTerm = message.split(' ').find(w => w.length > 3) || message;
      const articlesFound = await storage.getArticles(undefined, searchTerm);
      
      if (articlesFound.length > 0) {
        const bodies = articlesFound.slice(0, 2).map(a => {
           if(language === 'uz') return a.bodyUz;
           if(language === 'ru') return a.bodyRu;
           return a.bodyEn;
        });
        contextStr = `Found relevant context:\n\n${bodies.join('\n\n')}`;
      }
      
      const stream = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768", // Groq's free tier model
        messages: [
          { role: "system", content: `You are an educational assistant for a platform. Respond in language: ${language}. Context section: ${section || 'General'}. Use the following context to answer if relevant:\n\n${contextStr}` },
          { role: "user", content: message }
        ],
        stream: true,
        max_tokens: 1024,
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error" });
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getSections();
  if (existing.length === 0) {
    const insertedSections = await db.insert(sections).values([
      { slug: "math", titleEn: "Mathematics", titleUz: "Matematika", titleRu: "Математика", icon: "Calculator" },
      { slug: "programming", titleEn: "Programming", titleUz: "Dasturlash", titleRu: "Программирование", icon: "Code" },
      { slug: "science", titleEn: "Science", titleUz: "Ilm-fan", titleRu: "Наука", icon: "Atom" },
      { slug: "history", titleEn: "History", titleUz: "Tarix", titleRu: "История", icon: "Globe" },
      { slug: "languages", titleEn: "Languages", titleUz: "Tillar", titleRu: "Языки", icon: "Languages" },
      { slug: "general", titleEn: "General Knowledge", titleUz: "Umumiy", titleRu: "Общие знания", icon: "Lightbulb" }
    ]).returning();

    await db.insert(articles).values([
      {
        sectionId: insertedSections[0].id,
        titleEn: "The Pythagorean Theorem", titleUz: "Pifagor teoremasi", titleRu: "Теорема Пифагора",
        bodyEn: "In a right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: a² + b² = c².", 
        bodyUz: "To'g'ri burchakli uchburchakda gipotenuza kvadrati katetlar kvadratlari yig'indisiga teng: a² + b² = c².", 
        bodyRu: "В прямоугольном треугольнике квадрат гипотенузы равен сумме квадратов катетов: a² + b² = c²."
      },
      {
        sectionId: insertedSections[0].id,
        titleEn: "Basic Algebra", titleUz: "Algebra asoslari", titleRu: "Основы алгебры",
        bodyEn: "Algebra uses symbols and letters to represent numbers in equations and formulas. For example, in 2x + 3 = 7, x is the variable we solve for.",
        bodyUz: "Algebra tenglamalar va formulalardagi sonlarni ifodalash uchun belgilar va harflardan foydalanadi. Masalan, 2x + 3 = 7 da x biz yechadigan o'zgaruvchidir.",
        bodyRu: "Алгебра использует символы и буквы для представления чисел в уравнениях и формулах. Например, в 2x + 3 = 7, x — это переменная, которую мы находим."
      },
      {
        sectionId: insertedSections[1].id,
        titleEn: "Python Variables", titleUz: "Python o'zgaruvchilari", titleRu: "Переменные Python",
        bodyEn: "Python has int, float, str, and bool data types. Variables are declared dynamically.", 
        bodyUz: "Pythonda int, float, str, va bool ma'lumot turlari mavjud. O'zgaruvchilar dinamik e'lon qilinadi.", 
        bodyRu: "В Python есть типы данных int, float, str и bool. Переменные объявляются динамически."
      },
      {
        sectionId: insertedSections[1].id,
        titleEn: "Control Flow", titleUz: "Boshqaruv oqimi", titleRu: "Управляющие конструкции",
        bodyEn: "If statements, for loops, and while loops allow you to control the execution of your code based on conditions.",
        bodyUz: "If operatorlari, for va while tsikllari sharoitga qarab kodning bajarilishini boshqarish imkonini beradi.",
        bodyRu: "Операторы if, циклы for и while позволяют управлять выполнением кода в зависимости от условий."
      },
      {
        sectionId: insertedSections[2].id,
        titleEn: "Newton's Laws of Motion", titleUz: "Nyuton qonunlari", titleRu: "Законы Ньютона",
        bodyEn: "First law: An object remains at rest or in uniform motion unless acted upon by a force.", 
        bodyUz: "Birinchi qonun: Jismga tashqi kuch ta'sir etmaguncha u tinch holatini yoki to'g'ri chiziqli tekis harakatini saqlaydi.", 
        bodyRu: "Первый закон: Тело находится в покое или движется равномерно, пока на него не подействует сила."
      },
      {
        sectionId: insertedSections[2].id,
        titleEn: "The Solar System", titleUz: "Quyosh tizimi", titleRu: "Солнечная система",
        bodyEn: "The Solar System consists of the Sun and everything that orbits around it, including eight planets and their moons.",
        bodyUz: "Quyosh tizimi Quyoshdan va uning atrofida aylanadigan hamma narsadan, jumladan sakkizta sayyora va ularning yo'ldoshlaridan iborat.",
        bodyRu: "Солнечная система состоит из Солнца и всего, что вращается вокруг него, включая восемь планет и их спутники."
      },
      {
        sectionId: insertedSections[3].id,
        titleEn: "The Silk Road", titleUz: "Buyuk Ipak yo'li", titleRu: "Великий шелковый путь",
        bodyEn: "The Silk Road was an ancient network of trade routes that connected the East and West for centuries.",
        bodyUz: "Buyuk Ipak yo'li asrlar davomida Sharq va G'arbni bog'lab turgan qadimiy savdo yo'llari tarmog'i edi.",
        bodyRu: "Великий шелковый путь был древней сетью торговых путей, соединявших Восток и Запад на протяжении веков."
      },
      {
        sectionId: insertedSections[4].id,
        titleEn: "Parts of Speech", titleUz: "So'z turkumlari", titleRu: "Части речи",
        bodyEn: "Nouns, verbs, adjectives, and adverbs are the building blocks of language, each serving a specific function in a sentence.",
        bodyUz: "Ot, fe'l, sifat va ravish tilning asosiy qurilish bloklari bo'lib, ularning har biri gapda o'ziga xos vazifani bajaradi.",
        bodyRu: "Существительные, глаголы, прилагательные и наречия — это строительные блоки языка, каждый из которых выполняет определенную функцию в предложении."
      },
      {
        sectionId: insertedSections[5].id,
        titleEn: "Critical Thinking", titleUz: "Tanqidiy fikrlash", titleRu: "Критическое мышление",
        bodyEn: "Critical thinking is the analysis of facts to form a judgment. It is self-directed, self-disciplined, and self-monitored.",
        bodyUz: "Tanqidiy fikrlash - xulosa chiqarish uchun faktlarni tahlil qilishdir. Bu mustaqil, intizomli va nazorat qilinadigan jarayondir.",
        bodyRu: "Критическое мышление — это анализ фактов для формирования суждения. Оно является направленным, дисциплинированным и самоконтролируемым."
      }
    ]);
  }
}
