import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { blogArticles } from "../../data/blogArticles";

function resolveLanguage(raw) {
  return raw === "fr" ? "fr" : "ar";
}

export default function BlogArticlePage({ article }) {
  const [language, setLanguage] = useState("ar");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("tabib_language") : null;
    setLanguage(resolveLanguage(saved));
  }, []);

  const isFr = language === "fr";
  const labels = useMemo(
    () => ({
      nav: {
        chat: isFr ? "Chat" : "المحادثة",
        pharmacie: isFr ? "Pharmacie de garde" : "صيدلية الحراسة",
        medicament: isFr ? "Médicament" : "الدواء",
        blog: isFr ? "Blog" : "المدونة",
        about: isFr ? "À propos" : "عن التطبيق"
      },
      back: isFr ? "Retour au blog" : "الرجوع إلى المدونة",
      notFound: {
        title: isFr ? "Article introuvable" : "المقال غير موجود",
        subtitle: isFr ? "Cet article n'est pas disponible." : "هذا المقال غير متاح حاليا."
      },
      subtitleBrand: isFr ? "Assistant Médical Intelligent" : "المساعد الطبي الذكي"
    }),
    [isFr]
  );

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center max-w-xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{labels.notFound.title}</h1>
          <p className="text-gray-600 mb-5">{labels.notFound.subtitle}</p>
          <Link href="/blog" className="inline-flex px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            {labels.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir={isFr ? "ltr" : "rtl"} className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <img src="/logo.png" className="w-16 h-16 object-contain" alt="Tabib.info" />
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold" style={{ color: "#111" }}>Tabib.info</h1>
                <span className="text-gray-500 text-base mt-1">{labels.subtitleBrand}</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              <Link href="/chat" className="text-sm font-medium text-gray-600 hover:text-black">{labels.nav.chat}</Link>
              <Link href="/pharmacie" className="text-sm font-medium text-gray-600 hover:text-black">{labels.nav.pharmacie}</Link>
              <Link href="/medicament" className="text-sm font-medium text-gray-600 hover:text-black">{labels.nav.medicament}</Link>
              <Link href="/blog" className="text-sm font-medium text-black">{labels.nav.blog}</Link>
              <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-black">{labels.nav.about}</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-36 pb-14">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/blog" className="inline-flex mb-4 text-emerald-700 hover:text-emerald-800">
            ← {labels.back}
          </Link>

          <article className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs text-gray-500 mb-2" dir="ltr">{article.date}</p>
            <h1 className="text-3xl font-bold text-gray-800 mb-5">{article.title[language]}</h1>
            <img src={article.image} alt={article.title[language]} className="w-full h-80 object-cover rounded-lg mb-6" />
            <div className="space-y-4 text-gray-700 leading-8">
              {article.content[language].map((paragraph, index) => (
                <p key={`${article.slug}-${language}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: blogArticles.map((article) => ({ params: { slug: article.slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const article = blogArticles.find((entry) => entry.slug === params.slug) || null;
  return {
    props: {
      article
    }
  };
}

