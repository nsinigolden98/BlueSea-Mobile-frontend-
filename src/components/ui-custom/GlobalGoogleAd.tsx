import { useEffect, useState } from "react";



export const GlobalGoogleAd = () => {
  const [showAd, setShowAd] = useState(false);
  const [adSize, setAdSize] = useState({
    width: 320,
    height: 50,
    slot: "1548672969", // ✅ Mobile default
  });

  // ⏳ Delay before showing ad (2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAd(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 📱 Detect screen size and assign correct ad size
  useEffect(() => {
    const updateAdSize = () => {
      const width = window.innerWidth;

      if (width >= 1024) {
        // ✅ Desktop
        setAdSize({
          width: 728,
          height: 90,
          slot: "2262899546",
        });
      } else if (width >= 768) {
        // ✅ Tablet
        setAdSize({
          width: 468,
          height: 60,
          slot: "3990688848",
        });
      } else {
        // ✅ Mobile
        setAdSize({
          width: 320,
          height: 50,
          slot: "1548672969",
        });
      }
    };

    updateAdSize();
    window.addEventListener("resize", updateAdSize);

    return () => window.removeEventListener("resize", updateAdSize);
  }, []);

  // 🚀 Load ad when visible OR when size changes
  // useEffect(() => {
  //   if (showAd) {
  //     try {
  //       (window.adsbygoogle = window.adsbygoogle || []).push({});
  //     } catch (err) {
  //       console.error("Adsense error:", err);
  //     }
  //   }
  // }, [showAd, adSize]);

  // ❌ Don't render before delay
  if (!showAd) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "80px", // adjust if needed
        left: "50%",
        transform: "translateX(-50%)",
        width: adSize.width,
        height: adSize.height,
        zIndex: 999,
        background: "#fff",
borderRadius: "8px",
boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: adSize.width,
          height: adSize.height,
        }}
        data-ad-client="ca-pub-3718354450217516"
        data-ad-slot={adSize.slot}
      />
    </div>
  );
};
