import type { FC } from "react";
import BlurText from "@/blocks/blurText";
import TextType from "@/blocks/textType";

const LandingPage: FC = () => {
  const handleAnimationComplete = () => {
    console.log("Animation complete");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center flex-col">
      <BlurText
        text="OneTee"
        delay={150}
        animateBy="letters"
        direction="top"
        onAnimationComplete={handleAnimationComplete}
        className="text-5xl mb-8"
      />
      <TextType 
        text={["OneTee at a time!"]}
        typingSpeed={75}
        pauseDuration={1500}
        showCursor={true}
        cursorCharacter="|" 
        textColors={["#000000"]}
        className="text-2xl mb-8"
    />
    </div>
  );
};

export default LandingPage; 