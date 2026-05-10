import { useState, useEffect, useRef, Fragment } from "react";
import { blogArticles } from "../data/blogArticles";

// Parse text and return segments: **...** becomes bold (asterisks removed)
function parseBoldSegments(text) {
  if (typeof text !== "string") return [{ bold: false, text: String(text) }];
  const parts = text.split("**");
  return parts.map((t, i) => ({ bold: i % 2 === 1, text: t }));
}

// Format Moroccan phone: +212XXXXXXXXX or 0212... → 0X XX XX XX XX
function formatMoroccanPhone(raw) {
  if (!raw) return raw;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("212")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("00212")) digits = "0" + digits.slice(5);
  else if (!digits.startsWith("0")) digits = "0" + digits;
  if (digits.length === 10) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  }
  return digits;
}

// Language translations
const translations = {
  ar: {
    title: "Tabib.info",
    subtitle: "المساعد الطبي الذكي",
    nav: {
      chat: "المحادثة",
      pharmacie: "صيدلية الحراسة",
      medicament: "الدواء",
      blog: "المدونة",
      about: "عن التطبيق"
    },
    hero: {
      title: "طبيبك الذكي",
      subtitle: "استشارات طبية فورية بالذكاء الاصطناعي",
      promotionalVideoAria: "فيديو تعريفي عن Tabib.info",
      features: {
        instant: "استشارات فورية 24/7",
        images: "تحليل الصور الطبية",
        privacy: "خصوصية تامة"
      }
    },
    chat: {
      greeting: "سلام! أنا الطبيب ديالك. شنو هي الأعراض لي كتحس بيهم؟",
      title: "ابدأ محادثتك الطبية",
      subtitle: "اكتب أعراضك أو ارفع صورة للحصول على استشارة فورية",
      newChat: "بدء محادثة جديدة",
      placeholder: "اكتب أعراضك هنا...",
      addImage: "إضافة صورة",
      imageSelected: "تم اختيار الصورة",
      send: "إرسال",
      editInfo: "تعديل معلوماتي"
    },
    patientForm: {
      title: "معلوماتك العامة",
      subtitle: "أدخل معلوماتك قبل بدء المحادثة. الطبيب سيأخذها بعين الاعتبار ولن يطلبها مرة أخرى.",
      name: "الاسم",
      namePlaceholder: "مثال: ياسين العلوي",
      email: "البريد الإلكتروني",
      emailPlaceholder: "example@email.com",
      phone: "رقم الهاتف",
      phonePlaceholder: "06XXXXXXXX",
      age: "العمر (بالسنوات)",
      agePlaceholder: "مثال: 25",
      sex: "الجنس",
      sexMale: "ذكر",
      sexFemale: "أنثى",
      allergies: "الحساسية (إن وجدت)",
      allergiesPlaceholder: "مثال: بنيسيلين، غبار... أو اترك فارغاً",
      medicalCondition: "أمراض أو حالات طبية معروفة",
      medicalConditionPlaceholder: "مثال: سكري، ضغط... أو اترك فارغاً",
      rememberProfile: "احفظ معلوماتي على هذا الجهاز للاستعمال لاحقاً",
      clearSavedProfile: "حذف المعلومات المحفوظة",
      consentLabel: "أفهم أنه عند تفعيل خيار الحفظ سيتم تخزين بياناتي على هذا الجهاز، وأُقِرّ بأن هذا الشات بوت للاستشارة والمعلومات فقط ولا يُعتبر بديلاً عن الطبيب المختص.",
      startConversation: "بدء المحادثة",
      requiredField: "العمر والجنس مطلوبان",
      consentRequired: "يجب الموافقة على التنبيه قبل بدء المحادثة",
      invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
      invalidPhone: "يرجى إدخال رقم هاتف صحيح (9 أرقام على الأقل)",
      optional: "اختياري"
    },
    pharmacie: {
      title: "صيدلية الحراسة",
      subtitle: "صيدليات مفتوحة ليلاً وعطل نهاية الأسبوع",
      chooseCity: "اختر مدينتك",
      loading: "جاري التحميل...",
      seekingPharmacies: "جاري البحث عن أقرب الصيدليات",
      loadingLocation: "جاري الحصول على موقعك...",
      allowLocation: "السماح بالموقع لعرض أقرب 10 صيدليات",
      locationDenied: "تم رفض الموقع. فعّله من إعدادات المتصفح لعرض أقرب الصيدليات.",
      locationTimeout: "استغرقت عملية تحديد الموقع وقتاً طويلاً. حاول مرة أخرى.",
      useMyLocation: "استخدام موقعي - أقرب 10 صيدليات",
      orChooseCity: "أو اختر مدينة",
      nearestTitle: "أقرب 10 صيدليات من موقعك",
      error: "تعذر تحميل القائمة. حاول لاحقاً أو زر الموقع المصدر.",
      noResults: "لا توجد صيدليات حراسة قريبة.",
      call: "اتصال",
      directions: "مسار",
      distance: "{{km}} كم",
      distanceLabel: "المسافة",
      useLocationToSort: "استخدم موقعك لترتيب الصيدليات حسب المسافة",
      sortedByDistance: "مرتبة حسب المسافة"
    },
    medicament: {
      title: "الدواء",
      subtitle: "ابحث عن الدواء بالاسم. المصدر: قاعدة الأدوية المغربية.",
      namePlaceholder: "اسم الدواء...",
      search: "بحث",
      loading: "جاري التحميل...",
      error: "تعذر التحميل. حاول لاحقاً.",
      noResults: "لا توجد نتائج.",
      ppv: "السعر",
      lab: "المختبر"
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
    blogPreview: {
      title: "من المدونة الصحية",
      subtitle: "نصائح ومقالات مختارة من أحدث المحتوى",
      previous: "السابق",
      next: "التالي",
      readMore: "قراءة المقال"
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
      pharmacie: "On-duty Pharmacy",
      medicament: "Medicament",
      blog: "Blog",
      about: "About"
    },
    hero: {
      title: "Your Smart Doctor",
      subtitle: "Instant medical consultations with artificial intelligence",
      promotionalVideoAria: "Tabib.info promotional video",
      features: {
        instant: "24/7 instant consultations",
        images: "Medical image analysis",
        privacy: "Complete privacy"
      }
    },
    chat: {
      greeting: "Hello! I'm your doctor. What symptoms are you experiencing?",
      title: "Start Your Medical Chat",
      subtitle: "Write your symptoms or upload an image for instant consultation",
      newChat: "Start New Chat",
      placeholder: "Write your symptoms here...",
      addImage: "Add Image",
      imageSelected: "Image Selected",
      send: "Send",
      editInfo: "Edit my information"
    },
    patientForm: {
      title: "Your General Information",
      subtitle: "Enter your details before starting. The doctor will use them and will not ask again.",
      name: "Full name",
      namePlaceholder: "e.g. Yassine Alaoui",
      email: "Email",
      emailPlaceholder: "example@email.com",
      phone: "Phone number",
      phonePlaceholder: "e.g. 0612345678",
      age: "Age (years)",
      agePlaceholder: "e.g. 25",
      sex: "Sex",
      sexMale: "Male",
      sexFemale: "Female",
      allergies: "Allergies (if any)",
      allergiesPlaceholder: "e.g. penicillin, dust... or leave blank",
      medicalCondition: "Known medical conditions",
      medicalConditionPlaceholder: "e.g. diabetes, hypertension... or leave blank",
      rememberProfile: "Save my information on this device for next time",
      clearSavedProfile: "Delete saved profile",
      consentLabel: "I understand that if save is enabled my data will be stored on this device, and this chatbot is for consultation and informational purposes only, and is not a substitute for a medical professional.",
      startConversation: "Start the conversation",
      requiredField: "Age and sex are required",
      consentRequired: "You must accept the notice before starting the conversation",
      invalidEmail: "Please enter a valid email address",
      invalidPhone: "Please enter a valid phone number (at least 9 digits)",
      optional: "Optional"
    },
    pharmacie: {
      title: "On-duty Pharmacy",
      subtitle: "Pharmacies open at night and on weekends",
      chooseCity: "Choose your city",
      loading: "Loading...",
      seekingPharmacies: "Searching for nearby pharmacies",
      loadingLocation: "Getting your location...",
      allowLocation: "Allow location to see the 10 nearest pharmacies",
      locationDenied: "Location was denied. Enable it in your browser to see the nearest pharmacies.",
      locationTimeout: "Getting location took too long. Please try again.",
      useMyLocation: "Use my location – 10 nearest pharmacies",
      orChooseCity: "Or choose a city",
      nearestTitle: "10 nearest pharmacies from your location",
      error: "Could not load the list. Try again or visit the source.",
      noResults: "No on-duty pharmacies nearby.",
      call: "Call",
      directions: "Directions",
      distance: "{{km}} km",
      distanceLabel: "Distance",
      useLocationToSort: "Use your location to sort by distance",
      sortedByDistance: "Sorted by distance"
    },
    medicament: {
      title: "Medicament",
      subtitle: "Search by medicine name. Source: Morocco medicines database.",
      namePlaceholder: "Medicine name...",
      search: "Search",
      loading: "Loading...",
      error: "Failed to load. Try again later.",
      noResults: "No results.",
      ppv: "Price",
      lab: "Laboratory"
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
    blogPreview: {
      title: "From the Health Blog",
      subtitle: "Selected tips and articles from the latest content",
      previous: "Previous",
      next: "Next",
      readMore: "Read article"
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
      pharmacie: "Pharmacie de garde",
      medicament: "Médicament",
      blog: "Blog",
      about: "À propos"
    },
    hero: {
      title: "Votre Médecin Intelligent",
      subtitle: "Consultations médicales instantanées avec l'intelligence artificielle",
      promotionalVideoAria: "Vidéo promotionnelle Tabib.info",
      features: {
        instant: "Consultations instantanées 24/7",
        images: "Analyse d'images médicales",
        privacy: "Confidentialité totale"
      }
    },
    chat: {
      greeting: "Bonjour ! Je suis votre médecin. Quels symptômes ressentez-vous ?",
      title: "Commencez Votre Chat Médical",
      subtitle: "Écrivez vos symptômes ou téléchargez une image pour une consultation instantanée",
      newChat: "Nouveau Chat",
      placeholder: "Écrivez vos symptômes ici...",
      addImage: "Ajouter Image",
      imageSelected: "Image Sélectionnée",
      send: "Envoyer",
      editInfo: "Modifier mes informations"
    },
    patientForm: {
      title: "Vos informations générales",
      subtitle: "Renseignez ces informations avant de commencer. Le médecin en tiendra compte et ne les redemandera pas.",
      name: "Nom complet",
      namePlaceholder: "ex. Yassine Alaoui",
      email: "E-mail",
      emailPlaceholder: "example@email.com",
      phone: "Numéro de téléphone",
      phonePlaceholder: "ex. 0612345678",
      age: "Âge (années)",
      agePlaceholder: "ex. 25",
      sex: "Sexe",
      sexMale: "Homme",
      sexFemale: "Femme",
      allergies: "Allergies (le cas échéant)",
      allergiesPlaceholder: "ex. pénicilline, poussière... ou laisser vide",
      medicalCondition: "Affections ou pathologies connues",
      medicalConditionPlaceholder: "ex. diabète, hypertension... ou laisser vide",
      rememberProfile: "Enregistrer mes informations sur cet appareil pour la prochaine fois",
      clearSavedProfile: "Supprimer le profil enregistré",
      consentLabel: "Je comprends que si l'enregistrement est activé, mes données seront stockées sur cet appareil, et que ce chatbot est uniquement destiné à la consultation et à l'information, sans remplacer un professionnel de santé.",
      startConversation: "Commencer la conversation",
      requiredField: "L'âge et le sexe sont requis",
      consentRequired: "Vous devez accepter l'avertissement avant de démarrer la conversation",
      invalidEmail: "Veuillez saisir une adresse e-mail valide",
      invalidPhone: "Veuillez saisir un numéro de téléphone valide (au moins 9 chiffres)",
      optional: "Optionnel"
    },
    pharmacie: {
      title: "Pharmacie de garde",
      subtitle: "Pharmacies ouvertes la nuit et le week-end",
      chooseCity: "Choisissez votre ville",
      loading: "Chargement...",
      seekingPharmacies: "Recherche des pharmacies à proximité",
      loadingLocation: "Obtention de votre position...",
      allowLocation: "Autorisez l'accès à votre position pour afficher les 10 pharmacies les plus proches",
      locationDenied: "L'accès à la position a été refusé. Activez-la dans les paramètres du navigateur pour voir les pharmacies à proximité.",
      locationTimeout: "La localisation a pris trop de temps. Veuillez réessayer.",
      useMyLocation: "Utiliser ma position – 10 pharmacies les plus proches",
      orChooseCity: "Ou choisir une ville",
      nearestTitle: "10 pharmacies les plus proches de chez vous",
      error: "Impossible de charger la liste. Réessayez ou consultez le site source.",
      noResults: "Aucune pharmacie de garde à proximité.",
      call: "Appeler",
      directions: "Itinéraire",
      distance: "{{km}} km",
      distanceLabel: "Distance",
      useLocationToSort: "Utilisez votre position pour trier par distance",
      sortedByDistance: "Tri par distance"
    },
    medicament: {
      title: "Médicament",
      subtitle: "Recherchez un médicament par nom.",
      namePlaceholder: "Nom du médicament...",
      search: "Rechercher",
      loading: "Chargement...",
      error: "Impossible de charger. Réessayez plus tard.",
      noResults: "Aucun résultat.",
      ppv: "Prix",
      lab: "Laboratoire"
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
    blogPreview: {
      title: "Du Blog Santé",
      subtitle: "Conseils et articles sélectionnés parmi les plus récents",
      previous: "Précédent",
      next: "Suivant",
      readMore: "Lire l'article"
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

const CITIES_FOR_NEARBY = [
  "casablanca", "rabat", "marrakech", "fes", "agadir", "tanger", "meknes", "sale", "kenitra", "oujda"
];
const PHARMACIE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const PHARMACIE_CITIES = [
  { slug: "agadir", label: "Agadir" },
  { slug: "al-hoceima", label: "Al Hoceima" },
  { slug: "al-kelaa-des-sraghna", label: "Al kelaa des Sraghna" },
  { slug: "azilal", label: "Azilal" },
  { slug: "beni-mellal", label: "Béni Mellal" },
  { slug: "benslimane", label: "Benslimane" },
  { slug: "boujdour", label: "Boujdour" },
  { slug: "boulemane", label: "Boulemane" },
  { slug: "casablanca", label: "Casablanca" },
  { slug: "chefchaouen", label: "Chefchaouen" },
  { slug: "chichaoua", label: "Chichaoua" },
  { slug: "dakhla", label: "Dakhla" },
  { slug: "el-jadida", label: "El Jadida" },
  { slug: "errachidia", label: "Errachidia" },
  { slug: "es-semara", label: "Es Semara" },
  { slug: "essaouira", label: "Essaouira" },
  { slug: "fes", label: "Fès" },
  { slug: "figuig", label: "Figuig" },
  { slug: "guelmim", label: "Guelmim" },
  { slug: "ifrane", label: "Ifrane" },
  { slug: "kenitra", label: "Kénitra" },
  { slug: "khemisset", label: "Khémisset" },
  { slug: "khenifra", label: "Khénifra" },
  { slug: "khouribga", label: "Khouribga" },
  { slug: "laayoune", label: "Laâyoune" },
  { slug: "larache", label: "Larache" },
  { slug: "marrakech", label: "Marrakech" },
  { slug: "meknes", label: "Meknès" },
  { slug: "mohammedia", label: "Mohammedia" },
  { slug: "nador", label: "Nador" },
  { slug: "ouarzazate", label: "Ouarzazate" },
  { slug: "oujda", label: "Oujda" },
  { slug: "rabat", label: "Rabat" },
  { slug: "safi", label: "Safi" },
  { slug: "sale", label: "Salé" },
  { slug: "sefrou", label: "Sefrou" },
  { slug: "settat", label: "Settat" },
  { slug: "sidi-kacem", label: "Sidi Kacem" },
  { slug: "sidi-slimane", label: "Sidi Slimane" },
  { slug: "tan-tan", label: "Tan Tan" },
  { slug: "tanger", label: "Tanger" },
  { slug: "taounate", label: "Taounate" },
  { slug: "taroudannt", label: "Taroudannt" },
  { slug: "tata", label: "Tata" },
  { slug: "taza", label: "Taza" },
  { slug: "temara", label: "Témara" },
  { slug: "tetouan", label: "Tétouan" },
  { slug: "tiznit", label: "Tiznit" }
];

export default function Home() {
  const SAVED_PATIENT_INFO_KEY = "tabib_saved_patient_info_v1";
  const [messages, setMessages] = useState([
    { role: "assistant", content: "سلام! أنا الطبيب ديالك. شنو هي الأعراض لي كتحس بيهم؟" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [activeSection, setActiveSection] = useState("chat");
  const [language, setLanguage] = useState("ar");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [patientInfoSubmitted, setPatientInfoSubmitted] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    sex: "",
    allergies: "",
    medicalCondition: ""
  });
  const [patientFormError, setPatientFormError] = useState(null);
  const [patientConsentChecked, setPatientConsentChecked] = useState(false);
  const [rememberPatientProfile, setRememberPatientProfile] = useState(false);
  const [pharmacieData, setPharmacieData] = useState(null);
  const [pharmacieLoading, setPharmacieLoading] = useState(false);
  const [pharmacieError, setPharmacieError] = useState(null);
  const [pharmacieCity, setPharmacieCity] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [pharmacieSectionMounted, setPharmacieSectionMounted] = useState(false);
  const [medicamentName, setMedicamentName] = useState("");
  const [medicamentData, setMedicamentData] = useState(null);
  const [medicamentLoading, setMedicamentLoading] = useState(false);
  const [medicamentError, setMedicamentError] = useState(null);
  const [blogPreviewIndex, setBlogPreviewIndex] = useState(0);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pharmacieCacheRef = useRef(Object.create(null)); // { [citySlug]: { pharmacies, ts } }
  const locationErrorTimeoutRef = useRef(null);

  // Prefetch pharmacie data for nearby cities in the background on page load
  useEffect(() => {
    const cache = pharmacieCacheRef.current;
    const isFresh = (entry) => entry && (Date.now() - entry.ts) < PHARMACIE_CACHE_TTL_MS;
    CITIES_FOR_NEARBY.forEach((city) => {
      if (isFresh(cache[city])) return;
      fetch(`/api/pharmacie-garde?city=${encodeURIComponent(city)}`)
        .then((res) => (res.ok ? res.json() : { pharmacies: [] }))
        .then((data) => {
          const list = data.pharmacies && Array.isArray(data.pharmacies) ? data.pharmacies : [];
          cache[city] = { pharmacies: list, ts: Date.now() };
        })
        .catch(() => {});
    });
  }, []);

  // Smooth scroll with header offset
  const scrollElementWithOffset = (el) => {
    if (!el || typeof window === 'undefined') return;
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const elTop = el.getBoundingClientRect().top + window.pageYOffset;
    const target = Math.max(elTop - headerHeight - 12, 0);
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  // Scroll on initial load and when browser history (path) changes
  useEffect(() => {
    const pathToSection = {
      '/chat': 'chat',
      '/pharmacie': 'pharmacie',
      '/medicament': 'medicament',
      '/about': 'about',
    };

    const applyPathOrQuery = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      let id = pathToSection[path] || '';

      if (!id) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('section');
        if (q) {
          id = q;
          // Normalize query to clean path
          const newPath = `/${q}`;
          if (pathToSection[newPath] === q) {
            history.replaceState(null, '', newPath);
          }
        }
      }

      if (!id) return;
      setActiveSection(id);
      const el = document.getElementById(id);
      if (el) scrollElementWithOffset(el);
    };

    applyPathOrQuery();
    window.addEventListener('popstate', applyPathOrQuery);
    return () => window.removeEventListener('popstate', applyPathOrQuery);
  }, []);

  const t = translations[language] ?? translations.ar;
  const blogLang = language === "fr" ? "fr" : "ar";
  const featuredBlogArticles = blogArticles.slice(0, 5);
  const blogPreviewGroupSize = 3;
  const visibleBlogPreviewArticles =
    featuredBlogArticles.length === 0
      ? []
      : Array.from(
          { length: Math.min(blogPreviewGroupSize, featuredBlogArticles.length) },
          (_, i) => featuredBlogArticles[(blogPreviewIndex + i) % featuredBlogArticles.length]
        );

  useEffect(() => {
    if (featuredBlogArticles.length <= 1) return;
    const intervalId = setInterval(() => {
      setBlogPreviewIndex((prev) => (prev + blogPreviewGroupSize) % featuredBlogArticles.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [featuredBlogArticles.length, blogPreviewGroupSize]);
  // When language changes, translate the initial assistant greeting so it always matches selected language
  useEffect(() => {
    if (
      messages.length === 1 &&
      messages[0]?.role === 'assistant' &&
      [
        translations.ar.chat.greeting,
        translations.en.chat.greeting,
        translations.fr.chat.greeting,
      ].includes(messages[0].content)
    ) {
      setMessages([{ role: 'assistant', content: t.chat.greeting }]);
    }
  }, [language]);

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

    const savedProfileRaw = localStorage.getItem(SAVED_PATIENT_INFO_KEY);
    if (savedProfileRaw) {
      try {
        const parsed = JSON.parse(savedProfileRaw);
        const expiresAt = Number(parsed?.expiresAt || 0);
        if (expiresAt && Date.now() > expiresAt) {
          localStorage.removeItem(SAVED_PATIENT_INFO_KEY);
        } else if (parsed?.data) {
          setPatientInfo((prev) => ({
            ...prev,
            name: String(parsed.data.name || ""),
            email: String(parsed.data.email || ""),
            phone: String(parsed.data.phone || ""),
            age: String(parsed.data.age || ""),
            sex: String(parsed.data.sex || ""),
            allergies: String(parsed.data.allergies || ""),
            medicalCondition: String(parsed.data.medicalCondition || "")
          }));
          setRememberPatientProfile(true);
        }
      } catch (_err) {
        localStorage.removeItem(SAVED_PATIENT_INFO_KEY);
      }
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

  // Generate and cleanup preview URL for selected image
  useEffect(() => {
    if (!selectedImage) {
      setSelectedImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedImage);
    setSelectedImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  useEffect(() => {
    if (activeSection === "pharmacie") setPharmacieSectionMounted(true);
  }, [activeSection]);

  const searchMedicaments = () => {
    setMedicamentLoading(true);
    setMedicamentError(null);
    const params = new URLSearchParams();
    if (medicamentName.trim()) params.set("name", medicamentName.trim());
    params.set("limit", "80");
    fetch(`/api/medicament?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setMedicamentData(Array.isArray(data.medicaments) ? data.medicaments : []);
        setMedicamentError(data.error || null);
      })
      .catch((err) => {
        setMedicamentError(err.message || "Error");
        setMedicamentData(null);
      })
      .finally(() => setMedicamentLoading(false));
  };

  // Request location only on button click (user gesture) so the browser shows the permission prompt
  const requestLocationForPharmacie = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("denied");
      return;
    }
    if (locationErrorTimeoutRef.current) {
      clearTimeout(locationErrorTimeoutRef.current);
      locationErrorTimeoutRef.current = null;
    }
    setLocationError(null);
    setPharmacieError(null);
    setPharmacieData(null);
    setLocationRequested(true);
    setPharmacieCity(""); // switch to "nearby" mode

    let resolved = false;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolved = true;
        if (locationErrorTimeoutRef.current) {
          clearTimeout(locationErrorTimeoutRef.current);
          locationErrorTimeoutRef.current = null;
        }
        setLocationError(null);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // NEVER set error here — some browsers (Chrome) fire error then success.
        // Instead, schedule a delayed check. If success hasn't arrived after 8s, show error.
        if (!resolved) {
          locationErrorTimeoutRef.current = setTimeout(() => {
            locationErrorTimeoutRef.current = null;
            if (!resolved) {
              setLocationError("denied");
              setLocationRequested(false);
            }
          }, 8000);
        }
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 300000 }
    );
  };

  // Fetch pharmacies from multiple cities when we have user location; merge, sort by distance, top 10
  useEffect(() => {
    if (!userLocation) {
      if (locationError) setPharmacieData(null);
      return;
    }
    const cache = pharmacieCacheRef.current;
    const isFresh = (entry) => entry && (Date.now() - entry.ts) < PHARMACIE_CACHE_TTL_MS;
    const getDistanceKm = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    const mergeAndSort = (results) => {
      const seen = new Set();
      const merged = [];
      for (const data of results) {
        if (!data.pharmacies || !Array.isArray(data.pharmacies)) continue;
        for (const p of data.pharmacies) {
          const key = (p.phone || "").replace(/\D/g, "") || `${(p.name || "").slice(0, 30)}-${(p.address || "").slice(0, 30)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(p);
        }
      }
      const withDistance = merged.map((p) => {
        const km = p.lat != null && p.lng != null
          ? getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng)
          : null;
        return { ...p, distanceKm: km };
      });
      const sorted = withDistance.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
      return sorted.slice(0, 10);
    };

    setLocationRequested(false); // location obtained, clear the "waiting" flag

    // If all cities are cached and fresh, use instant (no loading)
    const allCached = CITIES_FOR_NEARBY.every((city) => isFresh(cache[city]));
    if (allCached) {
      const results = CITIES_FOR_NEARBY.map((city) => ({ pharmacies: cache[city].pharmacies }));
      setPharmacieData({ pharmacies: mergeAndSort(results), userCoords: userLocation });
      setPharmacieError(null);
      return;
    }

    let cancelled = false;
    setPharmacieLoading(true);
    setPharmacieError(null);
    Promise.allSettled(
      CITIES_FOR_NEARBY.map((city) => {
        if (isFresh(cache[city])) return Promise.resolve({ pharmacies: cache[city].pharmacies });
        return fetch(`/api/pharmacie-garde?city=${encodeURIComponent(city)}`)
          .then((res) => (res.ok ? res.json() : { pharmacies: [] }))
          .then((data) => {
            const list = data.pharmacies && Array.isArray(data.pharmacies) ? data.pharmacies : [];
            cache[city] = { pharmacies: list, ts: Date.now() };
            return { pharmacies: list };
          });
      })
    )
      .then((outcomes) => {
        if (cancelled) return;
        const results = outcomes.map((o) => (o.status === "fulfilled" ? o.value : { pharmacies: [] }));
        const merged = mergeAndSort(results);
        setPharmacieData({ pharmacies: merged, userCoords: userLocation });
        setPharmacieError(merged.length === 0 ? "Could not load the list." : null);
      })
      .finally(() => {
        if (!cancelled) setPharmacieLoading(false);
      });
    return () => { cancelled = true; };
  }, [userLocation]);

  // Fallback: fetch by city when user selects a city (and no location or they want city list)
  useEffect(() => {
    if (!pharmacieCity) {
      if (!userLocation) setPharmacieData(null);
      return;
    }
    const cache = pharmacieCacheRef.current;
    const isFresh = (entry) => entry && (Date.now() - entry.ts) < PHARMACIE_CACHE_TTL_MS;
    const getDistanceKm = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    const applyList = (list) => {
      const withDistance = userLocation
        ? list.map((p) => {
            const km = p.lat != null && p.lng != null
              ? getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng)
              : null;
            return { ...p, distanceKm: km };
          }).sort((a, b) => {
            if (a.distanceKm == null && b.distanceKm == null) return 0;
            if (a.distanceKm == null) return 1;
            if (b.distanceKm == null) return -1;
            return a.distanceKm - b.distanceKm;
          })
        : list.map((p) => ({ ...p, distanceKm: null }));
      setPharmacieData({ pharmacies: withDistance, userCoords: userLocation || undefined });
      setPharmacieError(null);
    };

    // Use cache if available and fresh
    const entry = cache[pharmacieCity];
    if (isFresh(entry)) {
      applyList(entry.pharmacies);
      return;
    }

    let cancelled = false;
    setPharmacieLoading(true);
    setPharmacieError(null);
    fetch(`/api/pharmacie-garde?city=${encodeURIComponent(pharmacieCity)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 502 ? "Source unavailable" : "Request failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list = data.pharmacies || [];
        cache[pharmacieCity] = { pharmacies: list, ts: Date.now() };
        applyList(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setPharmacieData(null);
          setPharmacieError(err.message || "Error");
        }
      })
      .finally(() => {
        if (!cancelled) setPharmacieLoading(false);
      });
    return () => { cancelled = true; };
  }, [pharmacieCity, userLocation]);

  // Pharmacies are already sorted by distance and limited to top 10 (with distanceKm) from the fetch effect
  const sortedPharmacies = pharmacieData?.pharmacies ?? [];
  const userCoords = pharmacieData?.userCoords || userLocation;

  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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

      // IMPORTANT: Send FULL conversation history for context
      // Remove the greeting message and any image URLs (they can't be sent as JSON)
      const messagesForAPI = newMessages
        .filter(msg => msg.content !== t.chat.greeting) // Remove greeting
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      formData.append("messages", JSON.stringify(messagesForAPI));
      formData.append("patientInfo", JSON.stringify(patientInfo));

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // Send responseId (threadId) for conversation continuity
      if (threadId) {
        formData.append("previousResponseId", threadId);
      }

      const res = await fetch("/api/assistant", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.result || 'Error sending message');
      }

      // Save responseId for conversation continuity
      if (data.responseId || data.threadId) {
        const newThreadId = data.responseId || data.threadId;
        setThreadId(newThreadId);
        localStorage.setItem('tabib_thread_id', newThreadId);
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
    if (typeof window !== 'undefined') {
      const path = `/${sectionId}`;
      if (window.location.pathname !== path) {
        history.pushState(null, '', path);
      }
    }
    const element = document.getElementById(sectionId);
    if (element) scrollElementWithOffset(element);
  };

  // Add this function to clear the thread and reset the chat
  const handlePatientFormSubmit = async (e) => {
    e.preventDefault();
    setPatientFormError(null);
    const age = String(patientInfo.age || "").trim();
    const sex = String(patientInfo.sex || "").trim();
    if (!age || !sex) {
      setPatientFormError(t.patientForm.requiredField);
      return;
    }
    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 1 || numAge > 120) {
      setPatientFormError(t.patientForm.requiredField);
      return;
    }
    const email = String(patientInfo.email || "").trim();
    const phone = String(patientInfo.phone || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setPatientFormError(t.patientForm.invalidEmail);
      return;
    }
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 9) {
        setPatientFormError(t.patientForm.invalidPhone);
        return;
      }
    }
    if (!patientConsentChecked) {
      setPatientFormError(t.patientForm.consentRequired);
      return;
    }
    try {
      await fetch("/api/patient-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(patientInfo.name || "").trim(),
          email,
          phone,
          age,
          sex,
          allergies: String(patientInfo.allergies || "").trim(),
          medicalCondition: String(patientInfo.medicalCondition || "").trim(),
          language,
          consentMarketing: false,
          consentDisclaimer: true
        })
      });
    } catch (_err) {
      // Do not block chat start if server-side profile save fails.
    }
    if (rememberPatientProfile) {
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);
      localStorage.setItem(
        SAVED_PATIENT_INFO_KEY,
        JSON.stringify({
          data: {
            name: String(patientInfo.name || "").trim(),
            email,
            phone,
            age,
            sex,
            allergies: String(patientInfo.allergies || "").trim(),
            medicalCondition: String(patientInfo.medicalCondition || "").trim()
          },
          expiresAt
        })
      );
    } else {
      localStorage.removeItem(SAVED_PATIENT_INFO_KEY);
    }
    setPatientInfoSubmitted(true);
  };

  const clearSavedPatientProfile = () => {
    localStorage.removeItem(SAVED_PATIENT_INFO_KEY);
    setRememberPatientProfile(false);
    setPatientConsentChecked(false);
    setPatientInfo({
      name: "",
      email: "",
      phone: "",
      age: "",
      sex: "",
      allergies: "",
      medicalCondition: ""
    });
    setPatientInfoSubmitted(false);
  };

  const handleNewChat = () => {
    localStorage.removeItem('tabib_thread_id');
    setThreadId(null);
    setMessages([
      { role: "assistant", content: t.chat.greeting }
    ]);
    setInput("");
  };

  // Toggle text direction by language (LTR for French, RTL otherwise)
  return (
    <div dir={language === 'fr' ? 'ltr' : 'rtl'} className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
                onClick={() => scrollToSection('pharmacie')}
                className={`text-sm font-medium transition-colors ${activeSection === 'pharmacie' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                {t.nav.pharmacie}
              </button>
              <button 
                onClick={() => scrollToSection('medicament')}
                className={`text-sm font-medium transition-colors ${activeSection === 'medicament' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                {t.nav.medicament}
              </button>
              <a href="/blog" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                {t.nav.blog}
              </a>
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
                    <img src="https://flagcdn.com/w40/ma.png" alt="Morocco Flag" className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://flagcdn.com/w40/fr.png" alt="France Flag" className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="hidden sm:inline">{language === 'ar' ? 'العربية' : 'Français'}</span>
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
                      <img src="https://flagcdn.com/w40/ma.png" alt="Morocco Flag" className="w-full h-full object-cover" />
                    ) : (
                      <img src="https://flagcdn.com/w40/fr.png" alt="France Flag" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="hidden xs:inline">{language === 'ar' ? 'ع' : 'FR'}</span>
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

      {/* Promotional video (between hero and chat) */}
      <section className="py-10 md:py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200/80 bg-black/5 ring-1 ring-black/5">
            <video
              className="w-full h-auto max-h-[min(70vh,520px)] object-contain bg-black"
              autoPlay
              muted
              playsInline
              controls
              preload="auto"
              aria-label={t.hero.promotionalVideoAria}
            >
              <source src="/tabib-promotional-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section id="chat" className="py-12" style={{ background: '#fff' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">{t.chat.title}</h3>
            <p className="text-gray-600">{t.chat.subtitle}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {patientInfoSubmitted && (
                <button
                  type="button"
                  onClick={() => setPatientInfoSubmitted(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  {t.chat.editInfo}
                </button>
              )}
              <button
                type="button"
                onClick={clearSavedPatientProfile}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors border border-red-200"
              >
                {t.patientForm.clearSavedProfile}
              </button>
              <button
                onClick={handleNewChat}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                {t.chat.newChat}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {!patientInfoSubmitted ? (
              /* Patient info form before starting conversation */
              <div className="p-6 md:p-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-1">{t.patientForm.title}</h4>
                <p className="text-gray-600 text-sm mb-6">{t.patientForm.subtitle}</p>
                <form onSubmit={handlePatientFormSubmit} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.patientForm.name} ({t.patientForm.optional})</label>
                    <input
                      type="text"
                      value={patientInfo.name}
                      onChange={(e) => setPatientInfo((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder={t.patientForm.namePlaceholder}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.patientForm.email} ({t.patientForm.optional})</label>
                    <input
                      type="email"
                      value={patientInfo.email}
                      onChange={(e) => setPatientInfo((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder={t.patientForm.emailPlaceholder}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.patientForm.phone} ({t.patientForm.optional})</label>
                    <input
                      type="tel"
                      value={patientInfo.phone}
                      onChange={(e) => setPatientInfo((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder={t.patientForm.phonePlaceholder}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.patientForm.age} *</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={patientInfo.age}
                      onChange={(e) => setPatientInfo((prev) => ({ ...prev, age: e.target.value }))}
                      placeholder={t.patientForm.agePlaceholder}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.patientForm.sex} *</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sex"
                          checked={patientInfo.sex === "male"}
                          onChange={() => setPatientInfo((prev) => ({ ...prev, sex: "male" }))}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{t.patientForm.sexMale}</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sex"
                          checked={patientInfo.sex === "female"}
                          onChange={() => setPatientInfo((prev) => ({ ...prev, sex: "female" }))}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{t.patientForm.sexFemale}</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.patientForm.allergies} ({t.patientForm.optional})</label>
                    <input
                      type="text"
                      value={patientInfo.allergies}
                      onChange={(e) => setPatientInfo((prev) => ({ ...prev, allergies: e.target.value }))}
                      placeholder={t.patientForm.allergiesPlaceholder}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.patientForm.medicalCondition} ({t.patientForm.optional})</label>
                    <input
                      type="text"
                      value={patientInfo.medicalCondition}
                      onChange={(e) => setPatientInfo((prev) => ({ ...prev, medicalCondition: e.target.value }))}
                      placeholder={t.patientForm.medicalConditionPlaceholder}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={rememberPatientProfile}
                      onChange={(e) => setRememberPatientProfile(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{t.patientForm.rememberProfile}</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={patientConsentChecked}
                      onChange={(e) => setPatientConsentChecked(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{t.patientForm.consentLabel}</span>
                  </label>
                  {patientFormError && (
                    <p className="text-red-600 text-sm">{patientFormError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={!patientConsentChecked}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                  >
                    {t.patientForm.startConversation}
                  </button>
                </form>
              </div>
            ) : (
              <>
            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-6" ref={messagesContainerRef}>
              <div className="flex flex-col space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className="flex flex-col">
                    <div className={m.role === "user" 
                      ? "self-end p-4 rounded-2xl shadow-sm max-w-xs md:max-w-md lg:max-w-lg text-black"
                      : "self-start p-4 rounded-2xl shadow-sm max-w-xs md:max-w-md lg:max-w-lg"}
                      style={m.role === "user" ? { backgroundColor: '#f5f5f5' } : m.role === "assistant" ? { backgroundColor: '#eaffea' } : {}}
                      dir={language === 'fr' ? 'ltr' : 'rtl'}
                    >
                      <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">
                        {parseBoldSegments(m.content).map((seg, j) =>
                          seg.bold ? (
                            <strong key={j}>{seg.text}</strong>
                          ) : (
                            <Fragment key={j}>{seg.text}</Fragment>
                          )
                        )}
                      </pre>
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
              {selectedImage && selectedImagePreviewUrl && (
                <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3 text-left" dir="ltr">
                  <img
                    src={selectedImagePreviewUrl}
                    alt="Selected image preview"
                    className="w-14 h-14 rounded object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 truncate">{selectedImage.name}</div>
                    <div className="text-xs text-gray-500">
                      {(selectedImage.size / 1024 < 1024
                        ? `${Math.round(selectedImage.size / 1024)} KB`
                        : `${(selectedImage.size / (1024 * 1024)).toFixed(1)} MB`)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    aria-label="Remove selected image"
                    title="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
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
                  title={selectedImage ? t.chat.imageSelected : t.chat.addImage}
                  aria-label={selectedImage ? t.chat.imageSelected : t.chat.addImage}
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
              </>
            )}
          </div>
        </div>
      </section>

      {/* Pharmacie de garde Section */}
      <section id="pharmacie" className="py-12" style={{ background: 'linear-gradient(180deg, #fff 0%, #f0fdf4 100%)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">{t.pharmacie.title}</h3>
            <p className="text-gray-600">{t.pharmacie.subtitle}</p>
            <p className="text-sm text-gray-500 mt-1" dir={language === "fr" ? "ltr" : "rtl"}>{t.pharmacie.nearestTitle}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            {/* Primary: button to use location (user gesture so browser shows permission) */}
            <div className="flex flex-col items-center mb-4" dir={language === "fr" ? "ltr" : "rtl"}>
              <button
                type="button"
                onClick={requestLocationForPharmacie}
                disabled={pharmacieLoading || (locationRequested && !userLocation)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t.pharmacie.useMyLocation}
              </button>
            </div>
            <div className="flex flex-col items-center mb-6">
              <p className="text-sm text-gray-500 mb-2" dir={language === "fr" ? "ltr" : "rtl"}>{t.pharmacie.orChooseCity}</p>
              <select
                value={pharmacieCity}
                onChange={(e) => {
                  setPharmacieCity(e.target.value);
                  if (!e.target.value) setPharmacieData(null);
                }}
                className="w-full max-w-xs p-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                dir={language === "fr" ? "ltr" : "rtl"}
              >
              <option value="">—</option>
              {PHARMACIE_CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
              </select>
            </div>
            {locationRequested && !userLocation && !locationError && (
              <div className="flex items-center gap-3 py-3 text-gray-600" dir={language === "fr" ? "ltr" : "rtl"}>
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <span className="absolute inline-flex h-10 w-10 animate-pharmacie-ping rounded-full bg-emerald-200 opacity-70" />
                  <svg className="relative h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p>{t.pharmacie.loadingLocation}</p>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pharmacie-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pharmacie-bounce" style={{ animationDelay: "200ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pharmacie-bounce" style={{ animationDelay: "400ms" }} />
                </span>
              </div>
            )}
            {locationError && !userLocation && !locationRequested && !pharmacieLoading && (
              <p className="text-amber-700 py-2" dir={language === "fr" ? "ltr" : "rtl"}>
                {locationError === "timeout" ? t.pharmacie.locationTimeout : t.pharmacie.locationDenied}
              </p>
            )}
            {pharmacieLoading && (
              <div className="py-8 px-4" dir={language === "fr" ? "ltr" : "rtl"}>
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative inline-flex">
                    <span className="absolute inline-flex h-14 w-14 animate-pharmacie-ping rounded-full bg-emerald-300 opacity-70" />
                    <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                      <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-medium text-gray-700">{t.pharmacie.seekingPharmacies}</p>
                  <div className="mt-2 flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pharmacie-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pharmacie-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pharmacie-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
                <div className="space-y-4 max-w-xl mx-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50/80 animate-pharmacie-pulse">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 opacity-80" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-2 opacity-80" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 opacity-80" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pharmacieError && !pharmacieLoading && !(locationRequested && !userLocation) && (
              <p className="text-red-600 py-4" dir={language === "fr" ? "ltr" : "rtl"}>{t.pharmacie.error}</p>
            )}
            {pharmacieData && !pharmacieLoading && !pharmacieError && !(locationRequested && !userLocation) && (
              <>
                {sortedPharmacies.length === 0 ? (
                  <p className="text-gray-600 py-4" dir={language === "fr" ? "ltr" : "rtl"}>{t.pharmacie.noResults}</p>
                ) : (
                  <ul className="space-y-4 mb-6">
                    {sortedPharmacies.map((ph, i) => {
                      const distKm = userCoords && ph.lat != null && ph.lng != null
                        ? getDistanceKm(userCoords.lat, userCoords.lng, ph.lat, ph.lng)
                        : (ph.distanceKm ?? null);
                      return (
                      <li key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                          {ph.name && <p className="font-semibold text-gray-900" dir="ltr">{ph.name}</p>}
                          {userCoords && (
                            <span className="text-sm text-emerald-700 font-medium shrink-0" dir="ltr" title={t.pharmacie.distanceLabel}>
                              {t.pharmacie.distanceLabel}: {distKm != null
                                ? t.pharmacie.distance.replace("{{km}}", distKm < 1 ? distKm.toFixed(2) : distKm.toFixed(1))
                                : "—"}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2" dir="ltr">{ph.address}</p>
                        <div className="flex flex-wrap gap-3 mt-3">
                          {ph.phone && (
                            <a
                              href={`tel:${ph.phone.replace(/\D/g, "")}`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              <>{t.pharmacie.call}{' '}<span dir="ltr">{formatMoroccanPhone(ph.phone)}</span></>
                            </a>
                          )}
                          {ph.mapsUrl && (
                            <a
                              href={ph.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {t.pharmacie.directions}
                            </a>
                          )}
                        </div>
                      </li>
                    ); })}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Médicament Section - source: morocco_medicines_pretty.json, search by name */}
      <section id="medicament" className="py-12" style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #fff 100%)" }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">{t.medicament.title}</h3>
            <p className="text-gray-600" dir={language === "fr" ? "ltr" : "rtl"}>{t.medicament.subtitle}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <div className="flex flex-wrap gap-3 mb-6" dir="ltr">
              <input
                type="text"
                value={medicamentName}
                onChange={(e) => setMedicamentName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchMedicaments()}
                placeholder={t.medicament.namePlaceholder}
                className="flex-1 min-w-[200px] p-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={searchMedicaments}
                disabled={medicamentLoading}
                className="px-5 py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
              >
                {medicamentLoading ? t.medicament.loading : t.medicament.search}
              </button>
            </div>
            {medicamentError && !medicamentLoading && (
              <p className="text-red-600 py-4" dir={language === "fr" ? "ltr" : "rtl"}>{t.medicament.error}</p>
            )}
            {medicamentData !== null && !medicamentLoading && (
              <>
                {medicamentData.length === 0 ? (
                  <p className="text-gray-600 py-4" dir={language === "fr" ? "ltr" : "rtl"}>{t.medicament.noResults}</p>
                ) : (
                  <ul className="space-y-3 max-h-[28rem] overflow-y-auto">
                    {medicamentData.map((med, i) => (
                      <li key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50">
                        <p className="font-semibold text-gray-900" dir="ltr">{med.nom_commercial}</p>
                        {(med.presentation || med.dosage) && (
                          <p className="text-sm text-gray-600 mt-1" dir="ltr">{[med.dosage, med.presentation].filter(Boolean).join(" · ")}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          {med.ppv && <span className="text-emerald-700 font-medium" dir="ltr">{t.medicament.ppv}: {med.ppv}</span>}
                          {med.distributeur && <span className="text-gray-600" dir="ltr">{t.medicament.lab}: {med.distributeur}</span>}
                        </div>
                        {med.composition && <p className="text-xs text-gray-500 mt-1" dir="ltr">{med.composition}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
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
                {t.about.vision.desc2}
              </p>
              
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

      {/* Blog Preview Section */}
      <section className="py-16" style={{ background: "linear-gradient(180deg, #eef2ff 0%, #e0f2fe 100%)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold mb-3" style={{ color: "#e11d48" }}>{t.blogPreview.title}</h3>
            <p className="text-gray-600">{t.blogPreview.subtitle}</p>
          </div>

          <div className="max-w-6xl mx-auto">
            {visibleBlogPreviewArticles.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {visibleBlogPreviewArticles.map((article) => (
                  <article key={article.slug} className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title[blogLang]}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-5">
                      <p className="text-xs text-gray-500 mb-2" dir="ltr">{article.date}</p>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">{article.title[blogLang]}</h4>
                      <p className="text-gray-600 mb-5">{article.excerpt[blogLang]}</p>
                      <a
                        href={`/blog/${article.slug}`}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      >
                        {t.blogPreview.readMore}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}

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
                <li><button onClick={() => scrollToSection('pharmacie')} className="hover:text-white transition-colors">{t.nav.pharmacie}</button></li>
                <li><button onClick={() => scrollToSection('medicament')} className="hover:text-white transition-colors">{t.nav.medicament}</button></li>
                <li><a href="/blog" className="hover:text-white transition-colors">{t.nav.blog}</a></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">{t.nav.about}</button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">{t.footer.contact}</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>automyracontact@gmail.com</li>
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
