import { useEffect, useState } from "react";
import type { FC } from "react";
import LightRays from "@/components/ui/light-rays";
import ShinyText from "@/components/ui/shiny-text";
import MetallicPaint from "@/components/ui/metallic-paint";
import logo from "@/assets/logo_png.png";

const ComingSoonPage: FC = () => {
  // Removed heavy parsing; no loading state needed
  const [logoVisible, setLogoVisible] = useState(false);

  // Fade the logo in as soon as the logo image is loaded (bitmap path)
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setLogoVisible(true);
    };
    img.src = logo;
  }, []);
  
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#000000' }}>
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.5}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        brightness={4.0}
        className="custom-rays"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="flex-1 flex items-end justify-center">
          <div className="w-30 h-30 flex items-center justify-center pointer-events-none">
            <div
              className={`w-full h-full transform transition-all duration-300 ease-out will-change-transform will-change-opacity ${
                logoVisible ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-[1px]"
              }`}
            >
              {
                <MetallicPaint
                  imageUrl={logo}
                  params={{
                    edge: 1,
                    patternBlur: 0.01,
                    patternScale: 2,
                    refraction: 0.05,
                    speed: 0.3,
                    liquid: 0.2,
                  }}
                />
              }
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center">
          <ShinyText
            text="Coming Soon"
            disabled={false}
            speed={3}
            className="text-base sm:text-lg md:text-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage; 