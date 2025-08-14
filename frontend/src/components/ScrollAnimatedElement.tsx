import React, { useEffect, useRef, ReactNode, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimatedElementProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  animationType?: 'fadeUp' | 'fadeIn' | 'scaleUp' | 'slideLeft' | 'slideRight' | 'rotate' | 'parallax';
  duration?: number;
  delay?: number;
  start?: string;
  end?: string;
  enableScrub?: boolean;
  enableBlur?: boolean;
  className?: string;
  parallaxSpeed?: number;
}

const ScrollAnimatedElement: React.FC<ScrollAnimatedElementProps> = ({
  children,
  scrollContainerRef,
  animationType = 'fadeUp',
  duration = 1,
  delay = 0,
  start = "top bottom-=100px",
  end = "bottom top",
  enableScrub = false,
  enableBlur = false,
  className = "",
  parallaxSpeed = 0.5,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    let fromVars: gsap.TweenVars = {};
    let toVars: gsap.TweenVars = {};

    // Define animation types
    switch (animationType) {
      case 'fadeUp':
        fromVars = { opacity: 0, y: 60, filter: enableBlur ? "blur(10px)" : "none" };
        toVars = { opacity: 1, y: 0, filter: "blur(0px)" };
        break;
      case 'fadeIn':
        fromVars = { opacity: 0, filter: enableBlur ? "blur(8px)" : "none" };
        toVars = { opacity: 1, filter: "blur(0px)" };
        break;
      case 'scaleUp':
        fromVars = { opacity: 0, scale: 0.8, filter: enableBlur ? "blur(6px)" : "none" };
        toVars = { opacity: 1, scale: 1, filter: "blur(0px)" };
        break;
      case 'slideLeft':
        fromVars = { opacity: 0, x: 100, filter: enableBlur ? "blur(8px)" : "none" };
        toVars = { opacity: 1, x: 0, filter: "blur(0px)" };
        break;
      case 'slideRight':
        fromVars = { opacity: 0, x: -100, filter: enableBlur ? "blur(8px)" : "none" };
        toVars = { opacity: 1, x: 0, filter: "blur(0px)" };
        break;
      case 'rotate':
        fromVars = { opacity: 0, rotation: 15, filter: enableBlur ? "blur(8px)" : "none" };
        toVars = { opacity: 1, rotation: 0, filter: "blur(0px)" };
        break;
      case 'parallax':
        fromVars = { y: 0 };
        toVars = { y: `${parallaxSpeed * 100}%` };
        break;
    }

    // Create the animation
    const animation = gsap.fromTo(el, fromVars, {
      ...toVars,
      duration: enableScrub ? undefined : duration,
      delay: enableScrub ? undefined : delay,
      ease: enableScrub ? "none" : "power2.out",
      scrollTrigger: {
        trigger: el,
        scroller,
        start,
        end,
        scrub: enableScrub,
        toggleActions: enableScrub ? undefined : "play none none reverse",
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === el) trigger.kill();
      });
    };
  }, [
    scrollContainerRef,
    animationType,
    duration,
    delay,
    start,
    end,
    enableScrub,
    enableBlur,
    parallaxSpeed,
  ]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default ScrollAnimatedElement;