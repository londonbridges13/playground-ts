"use client";

import * as React from "react";
import {
  MotionStyle,
  MotionValue,
  ValueAnimationTransition,
  animate,
  m,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useScroll, useWheel } from "@use-gesture/react";
import styles from "./radial-timeline.module.css";
import type { Line, Lines, Item } from "./data";
import { DATA, loremIpsum } from "./data";
import { getRandomItem } from "./get-random-item";
import img2 from "./5.png";
import { clamp } from "./clamp";
import { areIntersecting } from "./are-intersecting";
import { useShortcuts } from "./use-shortcuts";
import { useIsHydrated } from "./use-is-hydrated";
import { useEvent } from "./use-event";

export const SCALE_ZOOM = 6;
export const SCALE_DEFAULT = 1;
export const LINE_COUNT = 180;
export const SCALE_ZOOM_FACTOR = 0.02;
export const SCROLL_SNAP = 250;

////////////////////////////////////////////////////////////////////////////////

interface Constants {
  LINE_WIDTH_SMALL: number;
  LINE_WIDTH_MEDIUM: number;
  LINE_WIDTH_LARGE: number;
  LABEL_FONT_SIZE: number;
  LABEL_MARGIN: number;
  RADIUS: number;
  SIZE: number;
}

export interface TimelineContext extends Constants {
  zoom: boolean;
  rotate: MotionValue<number>;
  rotateToIndex: (index: number) => void;
  setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>;
  hoveredIndex: number | null;
  activeIndex: number | null;
  scrollTargetRef?: React.RefObject<HTMLElement>;
}

const TimelineContext = React.createContext({} as TimelineContext);
export const useTimeline = () => React.useContext(TimelineContext);

////////////////////////////////////////////////////////////////////////////////

interface RadialTimelineProps {
  onClose?: () => void;
  nodeLabel?: string;
  scrollTargetRef?: React.RefObject<HTMLElement>;
}

export default function RadialTimeline({ onClose, nodeLabel, scrollTargetRef }: RadialTimelineProps = {}) {
  useShortcuts({
    Escape: () => {
      if (!zoom) rotate.set(0);
      setZoom(false);
      activeNode.current?.blur();
      animate(scrollY, 0, transition);
      scale.set(SCALE_DEFAULT);
      setActiveIndex(null);
    },
    ArrowLeft: arrow(-1),
    ArrowRight: arrow(1),
  });

  const ref = React.useRef<HTMLDivElement>(null);
  const isHydrated = useIsHydrated();
  const scrollY = useMotionValue(0);
  const sheetRef = React.useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const activeNode = React.useRef<HTMLElement>(null);

  const intersectingAtY = useMotionValue(0);
  const rotate = useSpring(0, { stiffness: 150, damping: 42, mass: 1.1 });
  const scale = useSpring(1, { stiffness: 300, damping: 50 });

  const [lines, constants] = useLines();

  const context = {
    ...constants,
    rotateToIndex,
    setHoveredIndex,
    hoveredIndex,
    activeIndex,
    zoom,
    rotate,
    scrollTargetRef,
  };

  function arrow(dir: 1 | -1) {
    return () => {
      if (activeIndex !== null) {
        const newIndex = activeIndex + dir;
        if (newIndex >= 0 && newIndex < DATA.length) {
          rotateToIndex(newIndex);
        }
      }
    };
  }

  React.useEffect(() => {
    function wheel(e: WheelEvent) {
      // Prevent back swipe on horizontal wheel
      if (Math.abs(e.deltaX) > 0) {
        e.preventDefault();
      }
    }

    window.addEventListener("wheel", wheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", wheel);
    };
  }, []);

  useWheel(
    ({ delta: [dx, dy], last }) => {
      if (Math.abs(dy) > 0) return;
      if (!zoom) return;
      const newRotate = rotate.get() + dx * -1 * 0.5;
      rotate.set(newRotate);
      const newIndex = getIndexForRotate(newRotate);
      if (last && newIndex !== activeIndex) {
        rotateToIndex(newIndex);
      }
    },
    {
      target: scrollTargetRef?.current ?? (typeof window !== "undefined" ? window : undefined),
    }
  );

  useScroll(
    ({ delta: [_, dy], offset: [__, oy] }) => {
      // Log scroll progress
      const scrollPercentage = ((oy / SCROLL_SNAP) * 100).toFixed(1);
      console.log(`📊 Scroll Progress: ${oy}px / ${SCROLL_SNAP}px (${scrollPercentage}%) | Scale: ${scale.get().toFixed(2)} | Zoom: ${zoom}`);

      scrollY.stop();
      scrollY.set(-oy);

      if (sheetRef.current && activeNode.current) {
        const intersecting = areIntersecting(
          sheetRef.current,
          activeNode.current
        );
        if (intersecting && intersectingAtY.get() === 0) {
          intersectingAtY.set(oy);
        }
      }

      if (oy <= 0) {
        // Zoom out
        console.log('🔄 Zooming OUT - scroll at top');
        scale.set(SCALE_DEFAULT);
        setZoom(false);
        intersectingAtY.set(0);
        setActiveIndex(null);
        setHoveredIndex(null);
        return;
      }

      if (oy >= SCROLL_SNAP) {
        // Zoom in
        console.log('🎯 SNAP TRIGGERED - Zooming IN to full scale');
        scale.set(SCALE_ZOOM);
        if (activeIndex === null) {
          const index = getIndexForRotate(rotate.get());
          rotateToIndex(index);
        }
        setZoom(true);
        return;
      }

      let newScale = scale.get() + dy * SCALE_ZOOM_FACTOR;
      newScale = clamp(newScale, [1, SCALE_ZOOM]);
      scale.set(newScale);
      console.log(`⚡ Progressive zoom: scale=${newScale.toFixed(2)}`);
    },
    {
      target: scrollTargetRef?.current ?? (typeof window !== "undefined" ? window : undefined),
    }
  );

  React.useEffect(() => {
    window.history.scrollRestoration = "manual";
    const el = scrollTargetRef?.current ?? document.documentElement;
    el.scrollTo(0, 0);
    console.log('🚀 RadialTimeline mounted - scroll reset to top');
  }, [scrollTargetRef]);

  React.useEffect(() => {
    const activeElement = document.querySelector("[data-active=true]");
    if (activeElement) {
      activeNode.current = activeElement as HTMLElement;
    }
  }, [activeIndex]);

  useEvent("resize", () => {
    intersectingAtY.set(0);
  });

  function rotateToIndex(targetIndex: number | null) {
    if (targetIndex === null) return;
    setZoom(true);
    setActiveIndex(targetIndex);

    const el = scrollTargetRef?.current ?? document.documentElement;
    if (zoom) {
      console.log(`🎯 Rotating to index ${targetIndex} - scrolling to ${SCROLL_SNAP}px (smooth)`);
      el.scrollTo({
        top: SCROLL_SNAP,
        left: 0,
        behavior: "smooth",
      });
    } else {
      console.log(`🎯 Rotating to index ${targetIndex} - scrolling to ${SCROLL_SNAP}px (instant)`);
      (el as any).scrollTop = SCROLL_SNAP;
    }

    const newRotate = getRotateForIndex(targetIndex, rotate.get());

    if (newRotate === rotate.get()) {
      return;
    }

    rotate.set(newRotate);
  }

  return (
    <main className="w-full min-h-screen overflow-x-hidden">
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 9999,
            padding: '10px 15px',
            background: 'rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          ✕ Close
        </button>
      )}
      <div style={{ minHeight: '300vh', position: 'relative' }}>
        <Provider value={context}>
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ pointerEvents: zoom ? 'auto' : 'none' }}
          >
            <m.div
              className="absolute origin-[50%_7vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [--highlight-color:var(--color-orange)]"
              style={{
                width: constants.SIZE,
                height: constants.SIZE,
                scale,
                filter: useTransform(scrollY, (y) => {
                  if (intersectingAtY.get() === 0) return "blur(0px)";
                  let offsetY = Math.abs(y) - intersectingAtY.get();
                  const blur = clamp(offsetY * 0.005, [0, 4]);
                  return `blur(${blur}px)`;
                }),
              }}
            >
              {/* Rotate */}
              {isHydrated && (
                <m.div
                  ref={ref}
                  className="w-full h-full"
                  style={{ rotate }}
                  transition={transition}
                >
                  {lines.map((line, index) => {
                    return <Line key={index} {...line} />;
                  })}
                </m.div>
              )}
            </m.div>
          </div>
          <Sheet ref={sheetRef} />
        </Provider>
      </div>
    </main>
  );
}

////////////////////////////////////////////////////////////////////////////////

export function Provider({
  value,
  children,
}: {
  value: TimelineContext;
  children: React.ReactNode;
}) {
  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
}

////////////////////////////////////////////////////////////////////////////////

export function Line({ dataIndex, variant, rotation, offsetX, offsetY }: Line) {
  const {
    zoom,
    hoveredIndex,
    activeIndex,
    rotateToIndex,
    setHoveredIndex,
    LINE_WIDTH_LARGE,
    LINE_WIDTH_SMALL,
    LINE_WIDTH_MEDIUM,
    LABEL_FONT_SIZE,
    LABEL_MARGIN,
    RADIUS,
  } = useTimeline();

  const isInteractive = dataIndex !== null;
  const currentItem = isInteractive ? DATA[dataIndex] : null;
  const hoveredItem = hoveredIndex ? DATA[hoveredIndex] : null;

  const hovered = dataIndex === hoveredIndex && dataIndex !== null;
  const active = activeIndex === dataIndex && dataIndex !== null;

  let width = LINE_WIDTH_SMALL;
  if (variant === "medium") width = LINE_WIDTH_MEDIUM;
  if (variant === "large" || hovered || active) width = LINE_WIDTH_LARGE;

  const props = {
    ...(isInteractive && {
      onClick: () => rotateToIndex(dataIndex),
      onMouseEnter: () => setHoveredIndex(dataIndex),
      onMouseLeave: () => setHoveredIndex(null),
    }),
  };

  const Root = isInteractive ? m.button : m.div;

  return (
    <Root
      {...props}
      className={styles.line}
      data-variant={variant}
      data-active={active}
      data-hovered={hovered || active}
      style={{
        rotate: rotation,
        x: RADIUS + offsetX + LINE_WIDTH_LARGE,
        y: RADIUS + offsetY + LINE_WIDTH_LARGE,
        width,
        pointerEvents: isInteractive ? 'auto' : 'none',
      }}
      initial={false}
      animate={{
        width,
        transition: {
          ...transition,
          width: {
            type: "spring",
            stiffness: 250,
            damping: 25,
          },
        },
        scale: zoom ? 0.2 : 1,
      }}
    >
      {/* Forces Safari to render with GPU */}
      <div aria-hidden style={{ transform: "translateZ(0)" }} />
      {currentItem?.name && currentItem?.year && (
        <Meta
          currentItem={currentItem}
          hoveredItem={hoveredItem}
          hovered={hovered}
          zoom={zoom}
          rotation={rotation}
          style={{
            fontSize: LABEL_FONT_SIZE,
            x: LABEL_MARGIN,
          }}
        />
      )}
    </Root>
  );
}

////////////////////////////////////////////////////////////////////////////////

export function Meta({
  currentItem,
  hoveredItem,
  hovered,
  zoom,
  style,
  rotation,
}: {
  currentItem: Item;
  hoveredItem: Item | null;
  hovered?: boolean;
  zoom?: boolean;
  style: MotionStyle;
  rotation: number;
}) {
  const { rotate } = useTimeline();
  const reverseRotate = useTransform(rotate, (r) => -r - rotation);
  const isPartiallyVisible = hoveredItem && hoveredItem.variant === "medium";

  let opacity = 0;

  if (currentItem.variant === "large") {
    opacity = isPartiallyVisible ? 0.2 : 1;
  }

  if (hovered || zoom) {
    opacity = 1;
  }

  return (
    <m.div
      className="flex flex-col items-center whitespace-nowrap translate-y-[-50%]"
      data-slot="meta"
      style={{ ...style, rotate: reverseRotate }}
      initial={{ opacity }}
      animate={{ opacity }}
      transition={{
        opacity: { delay: zoom && !isPartiallyVisible ? 0.4 : 0 },
        ...transition,
      }}
    >
      <i data-slot="label">{currentItem.name}</i>
      <i data-slot="year">{currentItem.year}</i>
    </m.div>
  );
}

////////////////////////////////////////////////////////////////////////////////

export function Sheet({
  children,
  ref,
}: {
  ref: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}) {
  const { zoom, activeIndex, scrollTargetRef } = useTimeline();
  const [p1, setP1] = React.useState(loremIpsum[0]);
  const [p2, setP2] = React.useState(loremIpsum[1]);
  const [item, setItem] = React.useState<Item | null>(null);

  React.useEffect(() => {
    if (activeIndex === null) return;
    const item = DATA[activeIndex];
    if (item) {
      setItem(item);
      const randomP1 = getRandomItem(loremIpsum);
      const randomP2 = getRandomItem(loremIpsum);

      setP1(randomP1 + getRandomItem(loremIpsum) + getRandomItem(loremIpsum));
      setP2(randomP2 + getRandomItem(loremIpsum));
    }
  }, [activeIndex]);

  return (
    <m.div
      ref={ref}
      className="relative px-8 max-w-[700px] mx-auto mt-[50vh] top-0 flex pb-[100px] data-[active=false]:pointer-events-none"
      initial={false}
      style={{
        pointerEvents: zoom ? "auto" : "none",
      }}
      animate={{
        filter: zoom ? "blur(0px)" : "blur(20px)",
        opacity: zoom ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: zoom ? 150 : 300,
        damping: 25,
        delay: zoom ? 0.4 : 0,
      }}
      onAnimationComplete={() => {
        if (!zoom) {
          const el = scrollTargetRef?.current ?? document.documentElement;
          (el as any).scrollTop = 0;
          console.log('✅ Zoom out animation complete - scroll reset to top');
        }
      }}
    >
      {children ?? (
        <div className="text-gray12 text-15 leading-28 flex flex-col gap-6 [&>p]:leading-32 [&>p]:text-16 ">
          <div className="w-full h-[360px] bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Image placeholder</span>
          </div>
          <i className="text-24">{item?.title}</i>
          <p>{p1}</p>
          <p>{p2}</p>
          <p>{p2}</p>
          <p>{p2}</p>
          <p>{p2}</p>
          <p>{p2}</p>
          <p>{p2}</p>
        </div>
      )}
    </m.div>
  );
}

export function getLines(rootScale: number): [Lines, Constants] {
  const LINE_WIDTH_SMALL = 40 * rootScale;
  const LINE_WIDTH_MEDIUM = 45 * rootScale;
  const LINE_WIDTH_LARGE = 72 * rootScale;
  const LABEL_FONT_SIZE = 16 * rootScale;
  const LABEL_MARGIN = 80 * rootScale;
  const ANGLE_INCREMENT = 360 / LINE_COUNT;
  const RADIUS = 280 * rootScale;
  const SIZE = RADIUS * 2 + LINE_WIDTH_LARGE * 2;

  const lines = Array.from({ length: LINE_COUNT }, (_, index) => {
    const rotation = (index - LINE_COUNT / 4) * ANGLE_INCREMENT;
    const angleRad = (rotation * Math.PI) / 180;
    const offsetX = RADIUS * Math.cos(angleRad);
    const offsetY = RADIUS * Math.sin(angleRad);

    const item = DATA.find((i) => i.degree === index);
    const dataIndex = item ? DATA.indexOf(item) : null;

    return {
      rotation,
      offsetX,
      offsetY,
      dataIndex,
      variant: item?.variant,
    };
  });

  return [
    lines,
    {
      LINE_WIDTH_SMALL,
      LINE_WIDTH_MEDIUM,
      LINE_WIDTH_LARGE,
      LABEL_FONT_SIZE,
      LABEL_MARGIN,
      RADIUS,
      SIZE,
    },
  ];
}

export function useLines(): [Lines, Constants] {
  const [rootScale, setRootScale] = React.useState(1);

  useEvent("resize", () => {
    const widthScale = window.innerWidth / 960;
    const heightScale = window.innerHeight / 640;
    const baseScale = Math.min(widthScale, heightScale);

    // On small screens (< 600px), allow up to 1.0 scale
    // On larger screens, limit to 0.8 scale (20% reduction)
    const maxScale = window.innerWidth < 600 ? 1 : 0.8;
    const newScale = clamp(baseScale, [0.4, maxScale]);
    setRootScale(newScale);
  });

  const [lines, constants] = React.useMemo(
    () => getLines(rootScale),
    [rootScale]
  );

  return [lines, constants];
}

////////////////////////////////////////////////////////////////////////////////

export function getRotateForIndex(index: number, rotate: number) {
  const { degree } = DATA[index];

  if (degree === null) {
    return rotate;
  }

  const v1 = degree * 2 * -1;
  const v2 = (degree - LINE_COUNT) * 2 * -1;

  const delta1 = rotate - v1;
  const delta2 = rotate - v2;

  if (Math.abs(delta1) < Math.abs(delta2)) {
    return rotate - delta1;
  } else {
    return rotate - delta2;
  }
}

export function getIndexForRotate(rotate: number) {
  const sortedByDelta = DATA.map((i) => {
    const v1 = i.degree * 2 * -1;
    const v2 = (i.degree - LINE_COUNT) * 2 * -1;

    const delta1 = v1 - rotate;
    const delta2 = v2 - rotate;

    return {
      ...i,
      delta: Math.abs(delta1) < Math.abs(delta2) ? delta1 : delta2,
    };
  }).sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));

  const closest = sortedByDelta[0];

  if (!closest) {
    return null;
  }

  return DATA.findIndex((i) => i.degree === closest.degree);
}

export const transition: ValueAnimationTransition<number> = {
  type: "spring",
  stiffness: 100,
  damping: 22,
  mass: 1.3,
};
