// pages/_app.js
import Script from "next/script";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* Google Analytics (GA4) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-M8N1VDTDDQ"
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-M8N1VDTDDQ');
        `}
      </Script>

      <Component {...pageProps} />
    </>
  );
}
