import { useEffect, useState } from "react";
import type { FC } from "react";
import LightRays from "@/components/ui/light-rays";
import ShinyText from "@/components/ui/shiny-text";
import MetallicPaint, { parseLogoImage } from "@/components/ui/metallic-paint";
import logo from "@/assets/logo_png.png";

const ComingSoonPage: FC = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogo() {
      try {
        setLoading(true);
        console.log("Loading logo image...");
        
        const response = await fetch(logo);
        const blob = await response.blob();
        const file = new File([blob], "logo.png", { type: blob.type });

        console.log("Parsing logo image...");
        const parsedData = await parseLogoImage(file);
        console.log("Logo parsed successfully:", parsedData);
        
        setImageData(parsedData?.imageData ?? null);
        setLoading(false);
      } catch (err) {
        console.error("Error loading logo:", err);
        setLoading(false);
      }
    }

    loadLogo();
  }, []);
  
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#000000' }}>
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="flex-1 flex items-end justify-center">
          <div className="w-30 h-30 flex items-center justify-center pointer-events-none">
            {loading && <div className="text-white text-center">Loading...</div>}
            {!loading && imageData && (
              <div className="w-full h-full">
                <MetallicPaint 
                  imageData={imageData} 
                  params={{ 
                    edge: 1, 
                    patternBlur: 0.01, 
                    patternScale: 1, 
                    refraction: 0.05, 
                    speed: 0.3, 
                    liquid: 0.2 
                  }} 
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center">
          <ShinyText text="Coming Soon" disabled={false} speed={3} />
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage; 