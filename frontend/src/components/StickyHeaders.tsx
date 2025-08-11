import { useRef } from 'react';
import logo from '../assets/logo_png.png';
import LiquidGlass from 'liquid-glass-react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

const StickyHeaders = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rightSideRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

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
          left: "225px",
          zIndex: 50,
          borderRadius: "25px"
        }}
      >
        <span className="text-sm font-medium text-gray-500">Marketplace</span>
      </LiquidGlass>

      {/* About Us Button */}
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
          console.log("About Us clicked");
        }}
        style={{
          position: "fixed",
          top: "60px",
          left: "345px",
          zIndex: 50,
          borderRadius: "25px"
        }}
      >
        <span className="text-sm font-medium text-gray-500">About Us</span>
      </LiquidGlass>
      

      {/* Search bar */}
       <div ref={searchBarRef}>
       <LiquidGlass
         displacementScale={64}
         blurAmount={0.1}
         saturation={130}
         aberrationIntensity={2}
         elasticity={0.35}
         cornerRadius={100}
         mouseContainer={searchBarRef}
         overLight={false}
         mode="standard"
         padding="4px 16px"
         style={{
           position: "fixed",
           top: "60px",
           right: "220px",
           zIndex: 50,
           borderRadius: "25px"
         }}
       >
         <div className="text-sm font-medium text-gray-500 border-gray-500 p-1 pr-20">
           Search
         </div>
       </LiquidGlass>
       </div>

       <LiquidGlass
        displacementScale={64}
        blurAmount={0.1}
        saturation={130}
        aberrationIntensity={2}
        elasticity={0.35}
        cornerRadius={100}
        mouseContainer={searchBarRef}
        overLight={false}
        mode="standard"
        padding="12px 16px"
        style={{
          position: "fixed",
          top: "60px",
          right: "220px",
          zIndex: 50,
          borderRadius: "30px",
        }}
       >
        <MagnifyingGlassIcon
         className='w-4 h-4 text-gray-500'
        />
       </LiquidGlass>


      {/* Right Side */}
      <div ref={rightSideRef}>
      <LiquidGlass
        displacementScale={64}
        blurAmount={0.1}
        saturation={130}
        aberrationIntensity={2}
        elasticity={0.35}
        cornerRadius={100}
        mouseContainer={rightSideRef}
        overLight={false}
        mode="standard"
        padding="8px 16px"
        onClick={() => {
          console.log("Home clicked");
        }}
        style={{
          position: "fixed",
          top: "58px",
          right: "120px",
          zIndex: 50,
          borderRadius: "25px"
        }}
      >
        <span className="text-sm font-medium text-gray-500">Log In</span>
      </LiquidGlass>
      </div>
      
    </div>
  );
};

export default StickyHeaders;