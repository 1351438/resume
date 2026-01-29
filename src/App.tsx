"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ScrollToPlugin } from "gsap/dist/ScrollToPlugin";
import { SplitText } from "gsap/dist/SplitText";
import { ScrambleTextPlugin } from "gsap/dist/ScrambleTextPlugin";
import { ScrollSmoother } from "gsap/dist/ScrollSmoother";
import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { MailIcon, PhoneIcon } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    SplitText,
    ScrollSmoother,
    ScrambleTextPlugin,
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSectionOneRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useGSAP(
    () => {
      const blurbs = [
        "Frontend Architect | React Specialist with Intermediate PHP & TypeScript Growth",
        "UI/UX Powerhouse: Expert React & CSS with Solid PHP Backend Integration",
        "React Developer & PHP Logic Builder | Bridging Modern Frontend with Scalable Backend",
        "Full-Spectrum Developer: Dominant in React/CSS with Mid-Level PHP Proficiency",
        "Interface Specialist | Powering Modern Web Apps with React, PHP, and TypeScript",
      ];
      let curIndex = 0;

      const updateText = () => {
        curIndex = (curIndex + 1) % blurbs.length;

        gsap.to("#blurbsText", {
          duration: 3,
          scrambleText: {
            text: blurbs[curIndex],
            chars: "upperAndLowerCase",
            revealDelay: 0.2,
            tweenLength: true,
          },
          ease: "power2.inOut",
        });

        gsap.delayedCall(10, updateText);
      };

      gsap.delayedCall(0, updateText);
    },
    { scope: containerRef },
  );

  useGSAP(
    () => {
      // 1. Use the scoped selector instead of document.querySelector
      const overlay = containerRef.current?.querySelector(".shape-overlays");
      const paths = containerRef.current?.querySelectorAll(
        ".shape-overlays__path",
      );

      if (!overlay || !paths || paths.length === 0) return;

      const numPoints = 10;
      const numPaths = paths.length;
      const delayPointsMax = 0.3;
      const delayPerPath = 0.25;
      const isOpened = false;
      const pointsDelay: number[] = [];
      const allPoints: number[][] = [];

      // Initialize points
      for (let i = 0; i < numPaths; i++) {
        allPoints.push(new Array(numPoints).fill(100));
      }

      // 2. Create the timeline
      const tl = gsap.timeline({
        onUpdate: render,
        defaults: {
          ease: "power2.inOut",
          duration: 0.9,
        },
        onComplete: () => {
          // Use autoAlpha for a cleaner hide (handles opacity and visibility)
          gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
        },
      });

      // 3. Define the animation logic inside the hook
      for (let i = 0; i < numPoints; i++) {
        pointsDelay[i] = Math.random() * delayPointsMax;
      }

      for (let i = 0; i < numPaths; i++) {
        const points = allPoints[i];
        const pathDelay = delayPerPath * (isOpened ? i : numPaths - i - 1);

        for (let j = 0; j < numPoints; j++) {
          const delay = pointsDelay[j];
          tl.to(
            points,
            {
              [j]: 0,
            },
            delay + pathDelay,
          );
        }
      }

      function render() {
        for (let i = 0; i < numPaths; i++) {
          const path = paths[i];
          const points = allPoints[i];

          let d = isOpened ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`;

          for (let j = 0; j < numPoints - 1; j++) {
            const p = ((j + 1) / (numPoints - 1)) * 100;
            const cp = p - 100 / (numPoints - 1) / 2;
            d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
          }

          d += isOpened ? ` V 100 H 0` : ` V 0 H 0`;
          path.setAttribute("d", d);
        }
      }

      // 4. Force an initial render so the SVG isn't empty on the first frame
      render();
    },
    { scope: containerRef },
  );

  useGSAP(
    () => {
      function playAnimation(shape: HTMLElement) {
        let tl = gsap.timeline();
        tl.from(shape, {
          opacity: 0,
          scale: 0,
          ease: "elastic.out(1,0.3)",
        })
          .to(
            shape,
            {
              rotation: "random([-360, 360])",
            },
            "<",
          )
          .to(
            shape,
            {
              y: "120vh",
              ease: "back.in(.4)",
              duration: 1,
            },
            0,
          )
          // This line hides the image immediately after the drop finishes
          .set(shape, { opacity: 0 });
      }

      let programmingLangs = gsap.utils.toArray<HTMLElement>(".pr-langs");

      let gap = 100;
      let index = 0;
      let wrapper = gsap.utils.wrap(0, programmingLangs.length);

      gsap.defaults({ duration: 1 });
      let mousePos = { x: 0, y: 0 };
      let lastMousePos = mousePos;
      let cachedMousePos = mousePos;

      window.addEventListener("mousemove", (e) => {
        mousePos = { x: e.x, y: e.y };
      });

      gsap.ticker.add(ImageTrail);

      function ImageTrail() {
        const bounds = containerSectionOneRef.current?.getBoundingClientRect();
        if (!bounds) return;

        // 2. Check if mouse is within Section 1 boundaries
        const isInside =
          mousePos.x >= bounds.left &&
          mousePos.x <= bounds.right &&
          mousePos.y >= bounds.top &&
          mousePos.y <= bounds.bottom;

        let travelDistance = Math.hypot(
          lastMousePos.x - mousePos.x,
          lastMousePos.y - mousePos.y,
        );

        cachedMousePos.x = gsap.utils.interpolate(
          cachedMousePos.x || mousePos.x,
          mousePos.x,
          0.1,
        );
        cachedMousePos.y = gsap.utils.interpolate(
          cachedMousePos.y || mousePos.y,
          mousePos.y,
          0.1,
        );

        if (travelDistance > gap && isInside) {
          animateImage();
          lastMousePos = mousePos;
        }
      }

      function animateImage() {
        let wrappedIndex = wrapper(index);

        console.log(index, programmingLangs.length);

        let img = programmingLangs[wrappedIndex];
        gsap.killTweensOf(img);

        gsap.set(img, {
          clearProps: "all",
        });

        // Inside animateImage
        gsap.set(img, {
          opacity: 1,
          left: mousePos.x,
          top: mousePos.y,
          xPercent: -50,
          yPercent: -50,
          pointerEvents: "none", // Prevents the image from blocking mouse clicks
          zIndex: 0, // Keeps them behind your "Section 1" text
        });

        playAnimation(img);

        index++;
      }
    },
    { scope: containerSectionOneRef },
  );

  const scrollToPanel = (index: number) => {
    const st = ScrollTrigger.getById(`panel-${index}`);
    if (st) {
      gsap.to(window, {
        scrollTo: { y: st.start, autoKill: false },
        duration: 0.8,
        ease: "power3.inOut",
      });
    }
  };

  // 1. SplitText Animation
  useGSAP(
    () => {
      textRefs.current.forEach((ref: any) => {
        if (!ref) return;
        const split = new SplitText(ref, { type: "chars" });
        gsap.from(split.chars, {
          x: 100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.03,
          ease: "power4.out",
        });
      });
    },
    { scope: containerRef },
  );

  // 2. Optimized Infinite Pinning Logic
  useGSAP(
    () => {
const panels = gsap.utils.toArray<HTMLElement>(".panel");
    if (panels.length === 0) return;

    panels.forEach((panel: any, i: number) => {
      gsap.set(panel, { zIndex: i });

      const strip = panel.querySelector(".gallery-strip") as HTMLElement;
      const isGallery = !!strip;

      ScrollTrigger.create({
        trigger: panel,
        start: "top top",
        pin: true,
        pinSpacing: isGallery, 
        end: isGallery ? "+=4000" : "+=100%",
        id: `panel-${i}`,
        invalidateOnRefresh: true,
      });

      // Gallery horizontal scroll logic remains the same
      if (isGallery) {
        const scrollAmount = strip.scrollWidth - window.innerWidth;
        gsap.to(strip, {
          x: -scrollAmount - 200,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "top top",
            end: "+=4000",
            scrub: 1,
          },
        });
      }
    });

    ScrollTrigger.create({
  snap: {
    snapTo: (value: number) => {
      // 1. Get the current scroll position in pixels
      const scrollPos = value * ScrollTrigger.maxScroll(window);
      
      // 2. Identify your Gallery (Portfolio) section
      const stGallery = ScrollTrigger.getById("panel-2"); 

      // 3. DISABLE snapping if inside the horizontal gallery
      // This keeps the section "still" and lets the user scroll freely
      if (stGallery && scrollPos > stGallery.start && scrollPos < stGallery.end) {
        return value; 
      }

      // 4. Snap to the nearest panel start for all other sections
      const panels = gsap.utils.toArray<HTMLElement>(".panel");
      const panelStarts = panels.map((_, i) => {
        const st = ScrollTrigger.getById(`panel-${i}`);
        return st ? st.start / ScrollTrigger.maxScroll(window) : 0;
      });

      return gsap.utils.snap(panelStarts, value);
    },
    duration: { min: 0.2, max: 0.6 }, // Slightly longer duration for a smoother transition
    delay: 0.2,                      // Increased delay so it doesn't snap while the user is still moving
    ease: "power3.inOut",            // A more "premium," weighted feel
  },
});

    // We removed handleScroll and the 'scroll' EventListener here.
    
    window.addEventListener("resize", () => {
      ScrollTrigger.refresh();
    });
    },
    { scope: containerRef },
  );

  const IntroPanel = ({ index }: { index: number }) => (
    <div
      className="panel 
    bg-gradient-to-b from-[#012622] via-[#023a34] to-[#012622]
     h-screen w-full  text-white relative"
    >
      <div className="flex flex-col justify-center items-center absolute inset-0">
        <p
          className="text-2xl md:text-5xl font-bold mb-2"
          ref={(el) => {
            textRefs.current[index] = el;
          }}
        >
          Morteza Bagheri
        </p>
        <small className="mb-8 opacity-70">Front-end/Back-end Developer</small>
        <div className="flex gap-4">
          <Button onClick={() => scrollToPanel(1)}>
            Technical Proficiencies
          </Button>
          <Button onClick={() => scrollToPanel(4)}>Get in touch</Button>
          <Button onClick={() => window.open("/resume.pdf")}>Resume</Button>
        </div>
      </div>
      <svg
        className="shape-overlays w-full h-screen relative overflow-hidden absloute"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#09ff5b8e" />
            <stop offset="100%" stopColor="#bdf8d6" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b0ffde" />
            <stop offset="100%" stopColor="#0a5e3d" />
          </linearGradient>
        </defs>
        <path className="shape-overlays__path" fill="url(#gradient2)"></path>
        <path className="shape-overlays__path" fill="url(#gradient1)"></path>
      </svg>
    </div>
  );

  const ProgrammingLanguageCard = ({
    src,
    level,
    language,
  }: {
    src: string;
    level: string;
    language: string;
  }) => (
    <Card className="cursor-pointer h-[85px] lg:h-[200px] w-full md:w-[300px] animate-fade-in transition-all duration-500 hover:scale-105 hover:shadow-lg relative overflow-hidden pt-[32px]">
      <CardHeader className="absolute z-10 bottom-4 flex-col items-start">
        <h4 className="text-white font-bold text-2xl w-full ">{language}</h4>
        <p className="text-sm text-white/60 font-normal">{level}</p>
      </CardHeader>
      <img
        alt="Card background"
        className="z-0 w-full h-full object-cover absolute inset-0"
        src={src}
      />
      <div className="absolute inset-0 bg-black/65 w-full h-full "> </div>
    </Card>
  );

  return (
    <div ref={containerRef} className="relative overflow-x-hidden">
      <IntroPanel index={0} />
      <motion.section
        ref={containerSectionOneRef}
        className="p-8 panel h-screen
        bg-gradient-to-br from-[#003B36] via-[#004d46] to-[#002b28]
        flex items-center justify-center text-white text-3xl font-bold"
      >
        <div className="icons-content">
          <img
            className="z-[20] pr-langs fixed opacity-0 width-[50px]"
            width={50}
            src="/logo/php.png"
          />
          <img
            className="z-[20] pr-langs fixed opacity-0 width-[50px]"
            width={50}
            src="/logo/html5.png"
          />
          <img
            className="z-[20] pr-langs fixed opacity-0 width-[50px]"
            width={50}
            src="/logo/css.png"
          />
          <img
            className="z-[20] pr-langs fixed opacity-0 width-[50px]"
            width={50}
            src="/logo/dart.png"
          />
          <img
            className="z-[20] pr-langs fixed opacity-0 width-[50px]"
            width={50}
            src="/logo/js.png"
          />
          <img
            className="z-[20] pr-langs fixed opacity-0 width-[50px]"
            width={50}
            src="/logo/ts.png"
          />
          <img
            className="z-[20] pr-langs fixed opacity-0 width-[50px]"
            width={50}
            src="/logo/next-js.svg"
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-5 md:gap-3 justify-center items-center">
          <div className="flex flex-col gap-4 items-center justify-center max-w-[450px] font-normal text-center">
            <p className="font-bold text-2xl">Technical Proficiencies</p>
            <small className="opacity-70 text-sm">
              A comprehensive overview of the programming languages and
              frameworks I’ve utilized to build scalable solutions.
            </small>
          </div>

          <div className="grid grid-cols-1 gap-2 w-full">
            <div className=" grid grid-cols-1 md:grid-cols-3 justify-center items-center gap-4">
              <ProgrammingLanguageCard
                src="/bg/mysql.webp"
                level="Intermediate"
                language="MYSQL"
              />
              <ProgrammingLanguageCard
                src="/bg/php.avif"
                level="Intermediate"
                language="PHP"
              />
              <ProgrammingLanguageCard
                src="/bg/next.png"
                level="Beginner"
                language="Next.js"
              />
            </div>

            <div className="hidden md:grid grid-cols-3 justify-center items-center gap-4">
              <ProgrammingLanguageCard
                src="/bg/illusrator.avif"
                level="Intermediate"
                language="Adobe products"
              />
              <ProgrammingLanguageCard
                src="/bg/ts.webp"
                level="Intermediate"
                language="Typescript"
              />
              <ProgrammingLanguageCard
                src="/bg/flutter.webp"
                level="Beginner"
                language="Flutter"
              />
            </div>
          </div>
        </div>
      </motion.section>
      <section className="flex flex-col gap-8 md:gap-32 panel h-screen bg-gradient-to-tr from-[#ECE5F0] via-[#F5F3F7] to-white flex items-center justify-center text-black text-3xl font-bold">
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl">Portfolio</p>
          <p className="text-sm opacity-70">
            The Creative & Visionary
          </p>
        </div>
        <div className="overflow-hidden relative">
          <div className="w-full p-0 ml-auto mr-auto gallery-wrapper">
            <div className="flex gap-4 flex-nowrap will-change-transform relative mx-8 gallery-strip">
              <img
                onClick={() => window.open("https://pizzaton.me")}
                className="max-h-[400px] object-cover cursor-pointer flex-shrink-0 rounded-xl shadow-xl"
                src="/projects/1.png"
              />
              <img
                onClick={() => window.open("https://t.me/dropgiftbot")}
                className="max-h-[400px] object-cover cursor-pointer flex-shrink-0 rounded-xl shadow-xl"
                src="/projects/2.png"
              />
              <img
                onClick={() => window.open("https://fractionft.xyz")}
                className="max-h-[400px] object-cover cursor-pointer flex-shrink-0 rounded-xl shadow-xl"
                src="/projects/3.png"
              />
              <img
                onClick={() =>
                  window.open("https://github.com/1351438/ston-fi")
                }
                className="max-h-[400px] object-cover cursor-pointer flex-shrink-0 rounded-xl shadow-xl"
                src="/projects/5.png"
              />
              <img
                onClick={() => window.open("https://tongo.run")}
                className="max-h-[400px] object-cover cursor-pointer flex-shrink-0 rounded-xl shadow-xl"
                src="/projects/4.png"
              />
              <img
                onClick={() => window.open("https://pana-platform.ir")}
                className="max-h-[400px] object-cover cursor-pointer flex-shrink-0 rounded-xl shadow-xl"
                src="/projects/6.png"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="panel h-screen bg-gradient-to-tl from-[#7A1B6A] via-[#59114D] to-[#3B0B33] flex items-center justify-center text-white text-3xl font-bold">
        <p
          className="px-8 md:px-0 text  max-w-[600px] mx-auto text-center break-words whitespace-normal text-2xl"
          id="blurbsText"
        >
          ........
        </p>
      </section>
      <section className="flex flex-col gap-8 panel h-screen bg-gradient-to-t from-[#000000] to-[#003B36] flex items-center justify-center text-white  font-bold">
        <div className="flex flex-col gap-4 max-w-[600px] items-center justify-center">
          <p className="text-3xl text-center font-bold">Contact with me</p>
          <p className="text-sm text-center font-normal opacity-70">
            Let’s build something great together.
          </p>
          <div className="w-full flex flex-col gap-4">
            <InputGroup className="max-w-[300px]">
              <InputGroupInput
                placeholder="Email"
                value={"bagheri1382morteza@gmail.com"}
                readOnly
              />
              <InputGroupAddon>
                <MailIcon />
              </InputGroupAddon>
            </InputGroup>
            <InputGroup className="max-w-[300px]">
              <InputGroupInput
                placeholder="Tel"
                value={"0919-647-7087"}
                readOnly
              />
              <InputGroupAddon>
                <PhoneIcon />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
        <div className="flex flex-row gap-4 flex-wrap items-center justify-center">
          <Button
            className="cursor-pointer"
            onClick={() => window.open("mailto:bagheri1382morteza@gmail.com")}
          >
            Email Me
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => window.open("https://t.me/mba4587")}
          >
            Telegram
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/in/morteza-bagheri-6190ba193?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
              )
            }
          >
            LinkedIn
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => window.open("https://github.com/1351438")}
          >
            GitHub
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => window.open("tel:+989196477087")}
          >
            Call
          </Button>
        </div>
      </section>
      {/* <IntroPanel index={1} /> */}
    </div>
  );
}
