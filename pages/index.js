import { useState, useEffect, useRef } from "react";

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
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const savedThreadId = localStorage.getItem('tabib_thread_id');
    if (savedThreadId) {
      setThreadId(savedThreadId);
    }
  }, []);

  useEffect(() => {
    if (threadId) {
      localStorage.setItem('tabib_thread_id', threadId);
    }
  }, [threadId]);

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
                <h1 className="text-2xl font-bold" style={{ color: '#111' }}>Tabib.info</h1>
                <span className="text-gray-500 text-base mt-1">المساعد الطبي الذكي</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              <button 
                onClick={() => scrollToSection('chat')}
                className={`text-sm font-medium transition-colors ${activeSection === 'chat' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                المحادثة
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className={`text-sm font-medium transition-colors ${activeSection === 'features' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                المميزات
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className={`text-sm font-medium transition-colors ${activeSection === 'reviews' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                التقييمات
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className={`text-sm font-medium transition-colors ${activeSection === 'about' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                عن التطبيق
              </button>
            </nav>

            <div className="md:hidden">
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
          <h2 className="text-4xl md:text-6xl font-bold mb-6">طبيبك الذكي</h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">استشارات طبية فورية بالذكاء الاصطناعي</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>استشارات فورية 24/7</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>تحليل الصور الطبية</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>خصوصية تامة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section id="chat" className="py-12" style={{ background: '#fff' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">ابدأ محادثتك الطبية</h3>
            <p className="text-gray-600">اكتب أعراضك أو ارفع صورة للحصول على استشارة فورية</p>
            <button
              onClick={handleNewChat}
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              بدء محادثة جديدة
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
                  placeholder="اكتب أعراضك هنا..." 
                  className="flex-1 p-3 rounded-xl border border-gray-200 shadow-inner focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
                <button 
                  type="submit" 
                  className="bg-[#95f16d] hover:bg-[#b6f7a0] text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#95f16d]"
                  aria-label="إرسال"
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
                  title={selectedImage ? 'تم اختيار الصورة' : 'إضافة صورة'}
                  aria-label="إضافة صورة"
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
            <h3 className="text-3xl font-bold mb-4" style={{ color: '#e11d48' }}>مميزات طبيبك</h3>
            <p className="text-gray-600">اكتشف كيف يمكن لطبيبك الذكي مساعدتك</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">استشارات فورية</h4>
              <p className="text-gray-600">احصل على استشارة طبية فورية في أي وقت من اليوم، 24 ساعة في اليوم، 7 أيام في الأسبوع</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4 4L20 6" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">تحليل الصور</h4>
              <p className="text-gray-600">ارفع صور الأعراض أو الجروح للحصول على تحليل دقيق وتشخيص أولي</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">خصوصية تامة</h4>
              <p className="text-gray-600">معلوماتك الطبية محمية بخصوصية تامة ولا يتم حفظها أو مشاركتها</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-16" style={{ background: 'linear-gradient(180deg, #f3fcf4 0%, #fff 100%)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">آراء المستخدمين</h3>
            <p className="text-gray-600">ماذا يقول الناس عن طبيبك</p>
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
            <h3 className="text-3xl font-bold mb-4" style={{ color: '#111' }}>عن Tabib.info</h3>
            <p className="text-gray-600">تعرف على المزيد عن تطبيقنا</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-semibold text-gray-800 mb-6">رؤيتنا</h4>
              <p className="text-gray-600 mb-4">
                نسعى لتوفير رعاية صحية ذكية ومتاحة للجميع من خلال تقنيات الذكاء الاصطناعي المتقدمة.
              </p>
              <p className="text-gray-600 mb-6">
                <span style={{ color: '#111', fontWeight: 'bold' }}>Tabib.info</span> هو مساعد طبي ذكي مصمم لتقديم استشارات أولية دقيقة وسريعة، مع الحفاظ على أعلى معايير الخصوصية والأمان.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">+10K</div>
                  <div className="text-sm text-gray-600">مستخدم نشط</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">+50K</div>
                  <div className="text-sm text-gray-600">استشارة مكتملة</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h5 className="text-xl font-semibold text-gray-800 mb-4">معلومات مهمة</h5>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h6 className="font-semibold text-gray-800">استشارة أولية فقط</h6>
                    <p className="text-sm text-gray-600">هذا التطبيق لا يحل محل الطبيب المختص</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <svg className="w-6 h-6 text-red-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h6 className="font-semibold text-gray-800">خصوصية مضمونة</h6>
                    <p className="text-sm text-gray-600">معلوماتك محمية ولا يتم مشاركتها</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <svg className="w-6 h-6 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h6 className="font-semibold text-gray-800">للحالات الطارئة</h6>
                    <p className="text-sm text-gray-600">اتصل بـ 150 أو 141 للحالات الخطيرة</p>
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
                  <span className="text-xl font-bold" style={{ color: '#fff' }}>Tabib.info</span>
                  <span className="text-gray-500 text-base mt-1">المساعد الطبي الذكي</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">روابط سريعة</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><button onClick={() => scrollToSection('chat')} className="hover:text-white transition-colors">المحادثة</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">المميزات</button></li>
                <li><button onClick={() => scrollToSection('reviews')} className="hover:text-white transition-colors">التقييمات</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">عن التطبيق</button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">معلومات الاتصال</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>البريد الإلكتروني: contact@tabib.info</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">أرقام الطوارئ</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>🚑 الإسعاف: 141</li>
                <li>👮 الدرك: 150</li>
                <li>🚔 الشرطة: 19</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              <span style={{ color: '#fff', fontWeight: 'bold' }}>Tabib.info © 2025 جميع الحقوق محفوظة</span>. للاستشارات الطبية فقط.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}