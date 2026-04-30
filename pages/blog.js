import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { blogArticles } from "../data/blogArticles";

function resolveLanguage(raw) {
  return raw === "fr" ? "fr" : "ar";
}

export default function BlogPage() {
  const [language, setLanguage] = useState("ar");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("tabib_language") : null;
    setLanguage(resolveLanguage(saved));
  }, []);

  const isFr = language === "fr";
  const labels = useMemo(
    () => ({
      title: isFr ? "Blog Santé" : "المدونة الصحية",
      subtitle: isFr ? "Articles santé récents" : "أحدث المقالات الصحية",
      nav: {
        chat: isFr ? "Chat" : "المحادثة",
        pharmacie: isFr ? "Pharmacie de garde" : "صيدلية الحراسة",
        medicament: isFr ? "Médicament" : "الدواء",
        blog: isFr ? "Blog" : "المدونة",
        about: isFr ? "À propos" : "عن التطبيق"
      },
      readMore: isFr ? "Lire l'article" : "قراءة المقال",
      quickLinks: isFr ? "Liens Rapides" : "روابط سريعة",
      contact: isFr ? "Informations de Contact" : "معلومات الاتصال",
      emergency: isFr ? "Numéros d'Urgence" : "أرقام الطوارئ",
      subtitleBrand: isFr ? "Assistant Médical Intelligent" : "المساعد الطبي الذكي"
    }),
    [isFr]
  );

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
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">{labels.title}</h2>
            <p className="text-gray-600">{labels.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogArticles.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`} className="block">
                <article className="h-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img src={article.image} alt={article.title[language]} className="w-full h-44 object-cover" />
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-2" dir="ltr">{article.date}</p>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title[language]}</h3>
                    <p className="text-sm text-gray-600 mb-4">{article.excerpt[language]}</p>
                    <span className="inline-flex text-emerald-700 font-medium">{labels.readMore}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <img src="/logo.png" className="w-16 h-16 object-contain" alt="Tabib.info" />
                <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold" style={{ color: "#fff" }}>Tabib.info</span>
                  <span className="text-gray-500 text-base mt-1">{labels.subtitleBrand}</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-4">{labels.quickLinks}</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/chat" className="hover:text-white transition-colors">{labels.nav.chat}</Link></li>
                <li><Link href="/pharmacie" className="hover:text-white transition-colors">{labels.nav.pharmacie}</Link></li>
                <li><Link href="/medicament" className="hover:text-white transition-colors">{labels.nav.medicament}</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">{labels.nav.blog}</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">{labels.nav.about}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">{labels.contact}</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>automyracontact@gmail.com</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">{labels.emergency}</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>🚑 {isFr ? "Ambulance" : "الإسعاف"}: 141</li>
                <li>👮 {isFr ? "Gendarmerie" : "الدرك"}: 150</li>
                <li>🚔 {isFr ? "Police" : "الشرطة"}: 19</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

