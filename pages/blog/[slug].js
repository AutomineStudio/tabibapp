import Link from "next/link";
import Head from "next/head";
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
      articleIntro: isFr ? "Introduction" : "مقدمة",
      practicalTips: isFr ? "Conseils pratiques" : "نصائح عملية",
      faq: isFr ? "Questions frequentes" : "اسئلة شائعة",
      cta: {
        title: isFr ? "Besoin d'une orientation rapide ?" : "تحتاج توجيها سريعا؟",
        subtitle: isFr
          ? "Discutez avec notre assistant medical intelligent pour obtenir une premiere orientation."
          : "تحدث مع مساعدنا الطبي الذكي للحصول على توجيه اولي سريع.",
        button: isFr ? "Commencer le chat medical" : "ابدأ المحادثة الطبية"
      },
      notFound: {
        title: isFr ? "Article introuvable" : "المقال غير موجود",
        subtitle: isFr ? "Cet article n'est pas disponible." : "هذا المقال غير متاح حاليا."
      },
      subtitleBrand: isFr ? "Assistant Médical Intelligent" : "المساعد الطبي الذكي",
      tips: isFr
        ? [
            "Maintenez une routine simple et realiste sur plusieurs semaines.",
            "Surveillez les signes d'alerte et consultez en cas de doute.",
            "Associez alimentation equilibree, sommeil et activite physique.",
            "Evitez l'automedication prolongee sans avis professionnel."
          ]
        : [
            "حافظ على روتين بسيط وواقعي لعدة اسابيع.",
            "راقب العلامات المنذرة واستشر الطبيب عند الشك.",
            "اجمع بين التغذية المتوازنة والنوم الجيد والنشاط البدني.",
            "تجنب الاستعمال الطويل للادوية بدون استشارة مختص."
          ],
      faqs: isFr
        ? [
            {
              q: "Quand faut-il consulter un professionnel de sante ?",
              a: "En cas de symptomes persistants, d'aggravation rapide ou de signes inhabituels, une evaluation medicale est recommandee."
            },
            {
              q: "Ces conseils remplacent-ils un diagnostic medical ?",
              a: "Non. Cet article est informatif et ne remplace pas un diagnostic ou un traitement personnalise par un professionnel."
            }
          ]
        : [
            {
              q: "متى يجب استشارة مختص صحي؟",
              a: "عند استمرار الاعراض او تدهورها بسرعة او ظهور علامات غير معتادة، يوصى بالتقييم الطبي."
            },
            {
              q: "هل هذه النصائح تغني عن التشخيص الطبي؟",
              a: "لا. هذا المقال للتوعية فقط ولا يعوض التشخيص او العلاج الفردي من طرف مختص."
            }
          ]
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

  const seoTitle = `${article.title[language]} | Tabib.info`;
  const seoDescription = article.excerpt[language];
  const canonicalUrl = `https://tabib.info/blog/${article.slug}`;
  const seoKeywords = isFr
    ? `sante, blog sante, prevention, bien-etre, ${article.title.fr}`
    : `الصحة, مدونة صحية, الوقاية, التوعية الصحية, ${article.title.ar}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title[language],
    image: [article.image],
    datePublished: article.date,
    dateModified: article.date,
    description: article.excerpt[language],
    author: {
      "@type": "Organization",
      name: "Tabib.info"
    },
    publisher: {
      "@type": "Organization",
      name: "Tabib.info",
      logo: {
        "@type": "ImageObject",
        url: "https://tabib.info/logo.png"
      }
    },
    mainEntityOfPage: canonicalUrl
  };

  return (
    <div dir={isFr ? "ltr" : "rtl"} className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={article.image} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={article.image} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      </Head>
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{labels.articleIntro}</h2>
            <p className="text-gray-700 leading-8 mb-4">{article.excerpt[language]}</p>
            <div className="space-y-4 text-gray-700 leading-8">
              {article.content[language].map((paragraph, index) => (
                <p key={`${article.slug}-${language}-${index}`}>{paragraph}</p>
              ))}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">{labels.practicalTips}</h2>
            <ul className="list-disc ps-6 space-y-2 text-gray-700 leading-8">
              {labels.tips.map((tip) => (
                <li key={`${article.slug}-${tip}`}>{tip}</li>
              ))}
            </ul>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">{labels.faq}</h2>
            <div className="space-y-4">
              {labels.faqs.map((item) => (
                <div key={`${article.slug}-${item.q}`} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.q}</h3>
                  <p className="text-gray-700 leading-7">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">{labels.cta.title}</h3>
              <p className="text-emerald-700 mb-4">{labels.cta.subtitle}</p>
              <Link
                href="/chat"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                {labels.cta.button}
              </Link>
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

