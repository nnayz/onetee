import { useRef } from 'react';
import logo from '../assets/logo_png.png';
import LiquidGlass from 'liquid-glass-react';

const StickyHeaders = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      {/* Logo */}
      <LiquidGlass
        displacementScale={64}
        blurAmount={0.1}
        saturation={130}
        aberrationIntensity={2}
        elasticity={0.35}
        cornerRadius={100}
        mouseContainer={containerRef}
        overLight={false}
        mode="standard"
        padding="8px"
        style={{
          position: "fixed",
          top: "60px",
          left: "60px",
          zIndex: 50,
          borderRadius: "50%"
        }}
      >
        <img src={logo} alt="OneTee Logo" className="w-6 h-6 rounded-full object-cover object-center scale-220" />
      </LiquidGlass>

      {/* Home Button */}
      <LiquidGlass
        displacementScale={64}
        blurAmount={0.1}
        saturation={130}
        aberrationIntensity={2}
        elasticity={0.35}
        cornerRadius={100}
        mouseContainer={containerRef}
        overLight={false}
        mode="standard"
        padding="8px 16px"
        onClick={() => {
          console.log("Home clicked");
        }}
        style={{
          position: "fixed",
          top: "60px",
          left: "120px",
          zIndex: 50,
          borderRadius: "25px"
        }}
      >
        <span className="text-sm font-medium text-gray-500">Home</span>
      </LiquidGlass>

      {/* Marketplace Button */}
      <LiquidGlass
        displacementScale={64}
        blurAmount={0.1}
        saturation={130}
        aberrationIntensity={2}
        elasticity={0.35}
        cornerRadius={100}
        mouseContainer={containerRef}
        overLight={false}
        mode="standard"
        padding="8px 16px"
        onClick={() => {
          console.log("Marketplace clicked");
        }}
        style={{
          position: "fixed",
          top: "60px",
          left: "220px",
          zIndex: 50,
          borderRadius: "25px"
        }}
      >
        <span className="text-sm font-medium text-gray-500">Marketplace</span>
      </LiquidGlass>
    </div>
  );
};

export default StickyHeaders;