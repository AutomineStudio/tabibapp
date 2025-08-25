import { useState, useEffect, useRef } from "react";

// Language translations
const translations = {
  ar: {
    title: "Tabib.info",
    subtitle: "المساعد الطبي الذكي",
    nav: {
      chat: "المحادثة",
      features: "المميزات",
      reviews: "التقييمات",
      about: "عن التطبيق"
    },
    hero: {
      title: "طبيبك الذكي",
      subtitle: "استشارات طبية فورية بالذكاء الاصطناعي",
      features: {
        instant: "استشارات فورية 24/7",
        images: "تحليل الصور الطبية",
        privacy: "خصوصية تامة"
      }
    },
    chat: {
      title: "ابدأ محادثتك الطبية",
      subtitle: "اكتب أعراضك أو ارفع صورة للحصول على استشارة فورية",
      newChat: "بدء محادثة جديدة",
      placeholder: "اكتب أعراضك هنا...",
      addImage: "إضافة صورة",
      imageSelected: "تم اختيار الصورة",
      send: "إرسال"
    },
    features: {
      title: "مميزات طبيبك",
      subtitle: "اكتشف كيف يمكن لطبيبك الذكي مساعدتك",
      instant: {
        title: "استشارات فورية",
        desc: "احصل على استشارة طبية فورية في أي وقت من اليوم، 24 ساعة في اليوم، 7 أيام في الأسبوع"
      },
      images: {
        title: "تحليل الصور",
        desc: "ارفع صور الأعراض أو الجروح للحصول على تحليل دقيق وتشخيص أولي"
      },
      privacy: {
        title: "خصوصية تامة",
        desc: "معلوماتك الطبية محمية بخصوصية تامة ولا يتم حفظها أو مشاركتها"
      }
    },
    reviews: {
      title: "آراء المستخدمين",
      subtitle: "ماذا يقول الناس عن طبيبك"
    },
    about: {
      title: "عن Tabib.info",
      subtitle: "تعرف على المزيد عن تطبيقنا",
      vision: {
        title: "رؤيتنا",
        desc1: "نسعى لتوفير رعاية صحية ذكية ومتاحة للجميع من خلال تقنيات الذكاء الاصطناعي المتقدمة.",
        desc2: "Tabib.info هو مساعد طبي ذكي مصمم لتقديم استشارات أولية دقيقة وسريعة، مع الحفاظ على أعلى معايير الخصوصية والأمان."
      },
      stats: {
        users: "مستخدم نشط",
        consultations: "استشارة مكتملة"
      },
      info: {
        title: "معلومات مهمة",
        consultation: {
          title: "استشارة أولية فقط",
          desc: "هذا التطبيق لا يحل محل الطبيب المختص"
        },
        privacy: {
          title: "خصوصية مضمونة",
          desc: "معلوماتك محمية ولا يتم مشاركتها"
        },
        emergency: {
          title: "للحالات الطارئة",
          desc: "اتصل بـ 150 أو 141 للحالات الخطيرة"
        }
      }
    },
    footer: {
      quickLinks: "روابط سريعة",
      contact: "معلومات الاتصال",
      emergency: "أرقام الطوارئ",
      ambulance: "الإسعاف",
      gendarmerie: "الدرك",
      police: "الشرطة",
      copyright: "Tabib.info © 2025 جميع الحقوق محفوظة. للاستشارات الطبية فقط."
    }
  },
  en: {
    title: "Tabib.info",
    subtitle: "Smart Medical Assistant",
    nav: {
      chat: "Chat",
      features: "Features",
      reviews: "Reviews",
      about: "About"
    },
    hero: {
      title: "Your Smart Doctor",
      subtitle: "Instant medical consultations with artificial intelligence",
      features: {
        instant: "24/7 instant consultations",
        images: "Medical image analysis",
        privacy: "Complete privacy"
      }
    },
    chat: {
      title: "Start Your Medical Chat",
      subtitle: "Write your symptoms or upload an image for instant consultation",
      newChat: "Start New Chat",
      placeholder: "Write your symptoms here...",
      addImage: "Add Image",
      imageSelected: "Image Selected",
      send: "Send"
    },
    features: {
      title: "Your Doctor's Features",
      subtitle: "Discover how your smart doctor can help you",
      instant: {
        title: "Instant Consultations",
        desc: "Get instant medical consultation anytime, 24 hours a day, 7 days a week"
      },
      images: {
        title: "Image Analysis",
        desc: "Upload photos of symptoms or wounds for accurate analysis and initial diagnosis"
      },
      privacy: {
        title: "Complete Privacy",
        desc: "Your medical information is protected with complete privacy and is not saved or shared"
      }
    },
    reviews: {
      title: "User Reviews",
      subtitle: "What people say about your doctor"
    },
    about: {
      title: "About Tabib.info",
      subtitle: "Learn more about our app",
      vision: {
        title: "Our Vision",
        desc1: "We strive to provide smart healthcare accessible to everyone through advanced artificial intelligence technologies.",
        desc2: "Tabib.info is a smart medical assistant designed to provide accurate and fast initial consultations while maintaining the highest standards of privacy and security."
      },
      stats: {
        users: "active users",
        consultations: "completed consultations"
      },
      info: {
        title: "Important Information",
        consultation: {
          title: "Initial consultation only",
          desc: "This app does not replace a specialist doctor"
        },
        privacy: {
          title: "Guaranteed privacy",
          desc: "Your information is protected and not shared"
        },
        emergency: {
          title: "For emergencies",
          desc: "Call 150 or 141 for serious cases"
        }
      }
    },
    footer: {
      quickLinks: "Quick Links",
      contact: "Contact Info",
      emergency: "Emergency Numbers",
      ambulance: "Ambulance",
      gendarmerie: "Gendarmerie",
      police: "Police",
      copyright: "Tabib.info © 2025 All rights reserved. For medical consultations only."
    }
  },
  fr: {
    title: "Tabib.info",
    subtitle: "Assistant Médical Intelligent",
    nav: {
      chat: "Chat",
      features: "Fonctionnalités",
      reviews: "Avis",
      about: "À propos"
    },
    hero: {
      title: "Votre Médecin Intelligent",
      subtitle: "Consultations médicales instantanées avec l'intelligence artificielle",
      features: {
        instant: "Consultations instantanées 24/7",
        images: "Analyse d'images médicales",
        privacy: "Confidentialité totale"
      }
    },
    chat: {
      title: "Commencez Votre Chat Médical",
      subtitle: "Écrivez vos symptômes ou téléchargez une image pour une consultation instantanée",
      newChat: "Nouveau Chat",
      placeholder: "Écrivez vos symptômes ici...",
      addImage: "Ajouter Image",
      imageSelected: "Image Sélectionnée",
      send: "Envoyer"
    },
    features: {
      title: "Fonctionnalités de Votre Médecin",
      subtitle: "Découvrez comment votre médecin intelligent peut vous aider",
      instant: {
        title: "Consultations Instantanées",
        desc: "Obtenez une consultation médicale instantanée à tout moment, 24 heures par jour, 7 jours par semaine"
      },
      images: {
        title: "Analyse d'Images",
        desc: "Téléchargez des photos de symptômes ou de blessures pour une analyse précise et un diagnostic initial"
      },
      privacy: {
        title: "Confidentialité Totale",
        desc: "Vos informations médicales sont protégées avec une confidentialité totale et ne sont pas sauvegardées ou partagées"
      }
    },
    reviews: {
      title: "Avis des Utilisateurs",
      subtitle: "Ce que disent les gens de votre médecin"
    },
    about: {
      title: "À Propos de Tabib.info",
      subtitle: "En savoir plus sur notre application",
      vision: {
        title: "Notre Vision",
        desc1: "Nous nous efforçons de fournir des soins de santé intelligents accessibles à tous grâce aux technologies avancées d'intelligence artificielle.",
        desc2: "Tabib.info est un assistant médical intelligent conçu pour fournir des consultations initiales précises et rapides tout en maintenant les plus hauts standards de confidentialité et de sécurité."
      },
      stats: {
        users: "utilisateurs actifs",
        consultations: "consultations terminées"
      },
      info: {
        title: "Informations Importantes",
        consultation: {
          title: "Consultation initiale uniquement",
          desc: "Cette application ne remplace pas un médecin spécialiste"
        },
        privacy: {
          title: "Confidentialité garantie",
          desc: "Vos informations sont protégées et non partagées"
        },
        emergency: {
          title: "Pour les urgences",
          desc: "Appelez le 150 ou 141 pour les cas graves"
        }
      }
    },
    footer: {
      quickLinks: "Liens Rapides",
      contact: "Informations de Contact",
      emergency: "Numéros d'Urgence",
      ambulance: "Ambulance",
      gendarmerie: "Gendarmerie",
      police: "Police",
      copyright: "Tabib.info © 2025 Tous droits réservés. Pour consultations médicales uniquement."
    }
  }
};

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "سلام! أنا الطبيب ديالك. شنو هي الأعراض لي كتحس بيهم؟" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [activeSection, setActiveSection] = useState("chat");
  const [language, setLanguage] = useState("ar");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const t = translations[language];

  useEffect(() => {
    const savedThreadId = localStorage.getItem('tabib_thread_id');
    if (savedThreadId) {
      setThreadId(savedThreadId);
    }
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('tabib_language');
    if (savedLanguage && ['ar', 'en', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (threadId) {
      localStorage.setItem('tabib_thread_id', threadId);
    }
  }, [threadId]);

  useEffect(() => {
    // Save language preference
    localStorage.setItem('tabib_language', language);
  }, [language]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageDropdownOpen && !event.target.closest('.language-dropdown')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageDropdownOpen]);

  useEffect(() => {
    if (copiedId !== null) {
      const timer = setTimeout(() => {
        setCopiedId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage = { 
      role: "user", 
      content: input.trim(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : null
    };

    // Add user message to UI immediately
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      // Only send the latest user message to the API
      formData.append("messages", JSON.stringify([userMessage]));
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      if (threadId) {
        formData.append("threadId", threadId);
      }

      const res = await fetch("/api/assistant", { 
        method: "POST", 
        body: formData 
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.result || 'Error sending message');
      }

      if (data.threadId && !threadId) {
        setThreadId(data.threadId);
      }

      // Add assistant response to messages
      setMessages([...newMessages, { role: "assistant", content: data.result }]);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  const getWhatsAppLink = (content) => `https://wa.me/?text=${encodeURIComponent(content)}`;

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size <= 20 * 1024 * 1024) {
          setSelectedImage(file);
        } else {
          alert('الصورة كبيرة جداً. الحد الأقصى هو 20 ميغابايت');
        }
      } else {
        alert('يرجى اختيار ملف صورة صالح');
      }
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add this function to clear the thread and reset the chat
  const handleNewChat = () => {
    localStorage.removeItem('tabib_thread_id');
    setThreadId(null);
    setMessages([
      { role: "assistant", content: "سلام! أنا الطبيب ديالك. شنو هي الأعراض لي كتحس بيهم؟" }
    ]);
    setInput("");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <img src="/logo.png" className="w-16 h-16 object-contain" alt="Tabib.info" />
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold" style={{ color: '#111' }}>{t.title}</h1>
                <span className="text-gray-500 text-base mt-1">{t.subtitle}</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              <button 
                onClick={() => scrollToSection('chat')}
                className={`text-sm font-medium transition-colors ${activeSection === 'chat' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                {t.nav.chat}
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className={`text-sm font-medium transition-colors ${activeSection === 'features' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                {t.nav.features}
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className={`text-sm font-medium transition-colors ${activeSection === 'reviews' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                {t.nav.reviews}
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className={`text-sm font-medium transition-colors ${activeSection === 'about' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                {t.nav.about}
              </button>
            </nav>

            {/* Language Switcher */}
            <div className="hidden md:flex items-center relative language-dropdown">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:bg-gray-50"
              >
                <div className="w-6 h-4 rounded border border-gray-300 overflow-hidden">
                  {language === 'ar' ? (
                    <img 
                      src="https://flagcdn.com/w40/ma.png" 
                      alt="Morocco Flag" 
                      className="w-full h-full object-cover"
                    />
                  ) : language === 'en' ? (
                    <img 
                      src="https://flagcdn.com/w40/gb.png" 
                      alt="UK Flag" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src="https://flagcdn.com/w40/fr.png" 
                      alt="France Flag" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className="hidden sm:inline">
                  {language === 'ar' ? 'العربية' : language === 'en' ? 'English' : 'Français'}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => { setLanguage('ar'); setIsLanguageDropdownOpen(false); }}
                      className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        language === 'ar' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <img 
                        src="https://flagcdn.com/w40/ma.png" 
                        alt="Morocco Flag" 
                        className="w-6 h-4 rounded border border-gray-300 object-cover"
                      />
                      <span>العربية</span>
                      {language === 'ar' && (
                        <svg className="w-4 h-4 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => { setLanguage('en'); setIsLanguageDropdownOpen(false); }}
                      className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <img 
                        src="https://flagcdn.com/w40/gb.png" 
                        alt="UK Flag" 
                        className="w-6 h-4 rounded border border-gray-300 object-cover"
                      />
                      <span>English</span>
                      {language === 'en' && (
                        <svg className="w-4 h-4 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => { setLanguage('fr'); setIsLanguageDropdownOpen(false); }}
                      className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        language === 'fr' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <img 
                        src="https://flagcdn.com/w40/fr.png" 
                        alt="France Flag" 
                        className="w-6 h-4 rounded border border-gray-300 object-cover"
                      />
                      <span>Français</span>
                      {language === 'fr' && (
                        <svg className="w-4 h-4 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
              {/* Mobile Language Switcher */}
              <div className="relative language-dropdown">
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded border border-gray-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:bg-gray-50"
                >
                  <div className="w-5 h-3 rounded border border-gray-300 overflow-hidden">
                    {language === 'ar' ? (
                      <img 
                        src="https://flagcdn.com/w40/ma.png" 
                        alt="Morocco Flag" 
                        className="w-full h-full object-cover"
                      />
                    ) : language === 'en' ? (
                      <img 
                        src="https://flagcdn.com/w40/gb.png" 
                        alt="UK Flag" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src="https://flagcdn.com/w40/fr.png" 
                        alt="France Flag" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="hidden xs:inline">
                    {language === 'ar' ? 'ع' : language === 'en' ? 'EN' : 'FR'}
                  </span>
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isLanguageDropdownOpen && (
                  <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => { setLanguage('ar'); setIsLanguageDropdownOpen(false); }}
                        className={`w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-xs hover:bg-gray-100 transition-colors ${
                          language === 'ar' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <img 
                          src="https://flagcdn.com/w40/ma.png" 
                          alt="Morocco Flag" 
                          className="w-5 h-3 rounded border border-gray-300 object-cover"
                        />
                        <span>العربية</span>
                      </button>
                      <button
                        onClick={() => { setLanguage('en'); setIsLanguageDropdownOpen(false); }}
                        className={`w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-xs hover:bg-gray-100 transition-colors ${
                          language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <img 
                          src="https://flagcdn.com/w40/gb.png" 
                          alt="UK Flag" 
                          className="w-5 h-3 rounded border border-gray-300 object-cover"
                        />
                        <span>English</span>
                      </button>
                      <button
                        onClick={() => { setLanguage('fr'); setIsLanguageDropdownOpen(false); }}
                        className={`w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-xs hover:bg-gray-100 transition-colors ${
                          language === 'fr' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <img 
                          src="https://flagcdn.com/w40/fr.png" 
                          alt="France Flag" 
                          className="w-5 h-3 rounded border border-gray-300 object-cover"
                        />
                        <span>Français</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button className="text-gray-600 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-12 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #e6fbe8 0%, #fff 100%)', color: '#222' }}>
        {/* Moroccan pattern overlay with low opacity */}
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("/moroccan-pattern.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
          pointerEvents: 'none',
          zIndex: 0,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
          opacity: 1,
        }} />
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">{t.hero.title}</h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">{t.hero.subtitle}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.hero.features.instant}</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.hero.features.images}</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.hero.features.privacy}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section id="chat" className="py-12" style={{ background: '#fff' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">{t.chat.title}</h3>
            <p className="text-gray-600">{t.chat.subtitle}</p>
            <button
              onClick={handleNewChat}
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {t.chat.newChat}
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-6" ref={messagesContainerRef}>
              <div className="flex flex-col space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className="flex flex-col">
                    <div className={m.role === "user" 
                      ? "self-end p-4 rounded-2xl shadow-sm max-w-xs md:max-w-md lg:max-w-lg text-black"
                      : "self-start p-4 rounded-2xl shadow-sm max-w-xs md:max-w-md lg:max-w-lg"}
                      style={m.role === "user" ? { backgroundColor: '#f5f5f5' } : m.role === "assistant" ? { backgroundColor: '#eaffea' } : {}}
                      dir="rtl"
                    >
                      <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{m.content}</pre>
                      {m.image && (
                        <img 
                          src={m.image} 
                          alt="Uploaded" 
                          className="mt-2 rounded-lg max-w-full h-auto max-h-60 object-contain"
                        />
                      )}
                    </div>
                    {m.role === "assistant" && (
                      <div className="self-start mt-1 mr-2 flex items-center gap-1">
                        <a 
                          href={getWhatsAppLink(m.content)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-green-600 transition-colors duration-200 p-1 rounded-full hover:bg-green-50"
                          title="مشاركة في واتساب"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleCopy(m.content, i)}
                          className="text-gray-500 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50 relative"
                          title="نسخ النص"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {copiedId === i ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                              <>
                                <rect x="8" y="8" width="12" height="12" rx="2" strokeWidth={2} />
                                <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" strokeWidth={2} />
                              </>
                            )}
                          </svg>
                          {copiedId === i && (
                            <span className="absolute -top-8 right-0 text-xs bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap">
                              تم النسخ!
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="self-start p-4 rounded-2xl shadow-sm flex items-center gap-4" style={{ backgroundColor: '#eaffea' }}>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#95f16d' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#95f16d', animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#95f16d', animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Form */}
            <div className="border-t border-gray-100 p-4">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder={t.chat.placeholder} 
                  className="flex-1 p-3 rounded-xl border border-gray-200 shadow-inner focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
                <button 
                  type="submit" 
                  className="bg-[#95f16d] hover:bg-[#b6f7a0] text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#95f16d]"
                  aria-label={t.chat.send}
                  disabled={loading || (!input.trim() && !selectedImage)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center
                    ${selectedImage 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-gray-100 hover:bg-gray-200'}`}
                  title={t.chat.imageSelected}
                  aria-label={t.chat.addImage}
                >
                  <svg 
                    className={`w-5 h-5 ${selectedImage ? 'text-white' : 'text-gray-600'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {selectedImage ? (
                      // Checkmark when image selected
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      // Camera icon
                      <>
                        <path d="M4 7a2 2 0 00-2 2v7a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-1.2-1.8A2 2 0 0014.4 4h-4.8a2 2 0 00-1.4.6L7 7H4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
                      </>
                    )}
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16" style={{ background: 'linear-gradient(180deg, #f3fcf4 0%, #fff 100%)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4" style={{ color: '#e11d48' }}>{t.features.title}</h3>
            <p className="text-gray-600">{t.features.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">{t.features.instant.title}</h4>
              <p className="text-gray-600">{t.features.instant.desc}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4 4L20 6" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">{t.features.images.title}</h4>
              <p className="text-gray-600">{t.features.images.desc}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">{t.features.privacy.title}</h4>
              <p className="text-gray-600">{t.features.privacy.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-16" style={{ background: 'linear-gradient(180deg, #f3fcf4 0%, #fff 100%)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">{t.reviews.title}</h3>
            <p className="text-gray-600">{t.reviews.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-12 h-12 rounded-full object-cover mr-3" alt="أمين المرابط" />
                <div>
                  <h5 className="font-semibold text-gray-800">أمين المرابط</h5>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"طبيبك ساعدني كثيراً عندما كنت أعاني من ألم في البطن. التشخيص كان دقيقاً والنصائح مفيدة جداً."</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-12 h-12 rounded-full object-cover mr-3" alt="فاطمة العلوي" />
                <div>
                  <h5 className="font-semibold text-gray-800">فاطمة العلوي</h5>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"ميزة تحليل الصور ممتازة! أرسلت صورة لطفح جلدي وحصلت على تشخيص سريع ودقيق."</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <img src="https://randomuser.me/api/portraits/men/65.jpg" className="w-12 h-12 rounded-full object-cover mr-3" alt="رضا فشتالي" />
                <div>
                  <h5 className="font-semibold text-gray-800">رضا فشتالي</h5>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"سهولة الاستخدام والخصوصية المطلقة جعلتني أثق في التطبيق. أنصح الجميع بتجربته."</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4" style={{ color: '#111' }}>{t.about.title}</h3>
            <p className="text-gray-600">{t.about.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-semibold text-gray-800 mb-6">{t.about.vision.title}</h4>
              <p className="text-gray-600 mb-4">
                {t.about.vision.desc1}
              </p>
              <p className="text-gray-600 mb-6">
                <span style={{ color: '#111', fontWeight: 'bold' }}>Tabib.info</span> {t.about.vision.desc2}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">+10K</div>
                  <div className="text-sm text-gray-600">{t.about.stats.users}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">+50K</div>
                  <div className="text-sm text-gray-600">{t.about.stats.consultations}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h5 className="text-xl font-semibold text-gray-800 mb-4">{t.about.info.title}</h5>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h6 className="font-semibold text-gray-800">{t.about.info.consultation.title}</h6>
                    <p className="text-sm text-gray-600">{t.about.info.consultation.desc}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <svg className="w-6 h-6 text-red-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h6 className="font-semibold text-gray-800">{t.about.info.privacy.title}</h6>
                    <p className="text-sm text-gray-600">{t.about.info.privacy.desc}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <svg className="w-6 h-6 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h6 className="font-semibold text-gray-800">{t.about.info.emergency.title}</h6>
                    <p className="text-sm text-gray-600">{t.about.info.emergency.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <img src="/logo.png" className="w-16 h-16 object-contain" alt="Tabib.info"/>
                <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold" style={{ color: '#fff' }}>{t.title}</span>
                  <span className="text-gray-500 text-base mt-1">{t.subtitle}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">{t.footer.quickLinks}</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><button onClick={() => scrollToSection('chat')} className="hover:text-white transition-colors">{t.nav.chat}</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">{t.nav.features}</button></li>
                <li><button onClick={() => scrollToSection('reviews')} className="hover:text-white transition-colors">{t.nav.reviews}</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">{t.nav.about}</button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">{t.footer.contact}</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>البريد الإلكتروني: contact@tabib.info</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">{t.footer.emergency}</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>🚑 {t.footer.ambulance}: 141</li>
                <li>👮 {t.footer.gendarmerie}: 150</li>
                <li>🚔 {t.footer.police}: 19</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{t.footer.copyright}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}