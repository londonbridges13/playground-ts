import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";

// ----------------------------------------------------------------------
// Avatar Component
// ----------------------------------------------------------------------

function Avatar({ index = 1 }) {
  if (index === 2) {
    return (
      <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
        <mask id="mask2" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
          <rect width="80" height="80" rx="160" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#mask2)">
          <rect width="80" height="80" fill="#eec276"></rect>
          <path filter="url(#filter2)" d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z" fill="#fbf6d0" transform="translate(-2 -2) rotate(-162 40 40) scale(1.5)"></path>
          <path filter="url(#filter2)" d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z" fill="#79c3aa" transform="translate(-7 -7) rotate(-63 40 40) scale(1.5)" style={{ mixBlendMode: "overlay" }}></path>
        </g>
        <defs>
          <filter id="filter2" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
            <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur"></feGaussianBlur>
          </filter>
        </defs>
      </svg>
    );
  }

  if (index === 3) {
    return (
      <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
        <mask id="mask3" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
          <rect width="80" height="80" rx="160" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#mask3)">
          <rect width="80" height="80" fill="#fbf6d0"></rect>
          <path filter="url(#filter3)" d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z" fill="#79c3aa" transform="translate(2 -2) rotate(74 40 40) scale(1.5)"></path>
          <path filter="url(#filter3)" d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z" fill="#1f0e1a" transform="translate(7 7) rotate(111 40 40) scale(1.5)" style={{ mixBlendMode: "overlay" }}></path>
        </g>
        <defs>
          <filter id="filter3" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
            <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur"></feGaussianBlur>
          </filter>
        </defs>
      </svg>
    );
  }

  if (index === 4) {
    return (
      <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
        <mask id="mask4" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
          <rect width="80" height="80" rx="160" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#mask4)">
          <rect width="80" height="80" fill="#80bca3"></rect>
          <path filter="url(#filter4)" d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z" fill="#f6f7bd" transform="translate(0 0) rotate(352 40 40) scale(1.2)"></path>
          <path filter="url(#filter4)" d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z" fill="#e6ac27" transform="translate(-4 -4) rotate(-348 40 40) scale(1.2)" style={{ mixBlendMode: "overlay" }}></path>
        </g>
        <defs>
          <filter id="filter4" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
            <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur"></feGaussianBlur>
          </filter>
        </defs>
      </svg>
    );
  }

  if (index === 5) {
    return (
      <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
        <mask id="mask5" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
          <rect width="80" height="80" rx="160" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#mask5)">
          <rect width="80" height="80" fill="#80bca3"></rect>
          <path filter="url(#filter5)" d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z" fill="#f6f7bd" transform="translate(0 0) rotate(232 40 40) scale(1.2)"></path>
          <path filter="url(#filter5)" d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z" fill="#e6ac27" transform="translate(0 0) rotate(-168 40 40) scale(1.2)" style={{ mixBlendMode: "overlay" }}></path>
        </g>
        <defs>
          <filter id="filter5" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
            <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur"></feGaussianBlur>
          </filter>
        </defs>
      </svg>
    );
  }

  if (index === 6) {
    return (
      <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
        <mask id="mask6" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
          <rect width="80" height="80" rx="160" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#mask6)">
          <rect width="80" height="80" fill="#80bca3"></rect>
          <path filter="url(#filter6)" d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z" fill="#f6f7bd" transform="translate(0 0) rotate(152 40 40) scale(1.2)"></path>
          <path filter="url(#filter6)" d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z" fill="#e6ac27" transform="translate(-4 4) rotate(-228 40 40) scale(1.2)" style={{ mixBlendMode: "overlay" }}></path>
        </g>
        <defs>
          <filter id="filter6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
            <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur"></feGaussianBlur>
          </filter>
        </defs>
      </svg>
    );
  }

  if (index === 7) {
    return (
      <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
        <mask id="mask7" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
          <rect width="80" height="80" rx="160" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#mask7)">
          <rect width="80" height="80" fill="#f6f7bd"></rect>
          <path filter="url(#filter7)" d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z" fill="#e6ac27" transform="translate(2 -2) rotate(234 40 40) scale(1.5)"></path>
          <path filter="url(#filter7)" d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z" fill="#bf4d28" transform="translate(3 -3) rotate(171 40 40) scale(1.5)" style={{ mixBlendMode: "overlay" }}></path>
        </g>
        <defs>
          <filter id="filter7" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
            <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur"></feGaussianBlur>
          </filter>
        </defs>
      </svg>
    );
  }

  // Default avatar (index 1)
  return (
    <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
      <mask id="mask0" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
        <rect width="80" height="80" rx="160" fill="#FFFFFF"></rect>
      </mask>
      <g mask="url(#mask0)">
        <rect width="80" height="80" fill="#f88f89"></rect>
        <path filter="url(#filter0)" d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z" fill="#eec276" transform="translate(6 6) rotate(310 40 40) scale(1.3)"></path>
        <path filter="url(#filter0)" d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z" fill="#fbf6d0" transform="translate(-1 -1) rotate(-105 40 40) scale(1.3)" style={{ mixBlendMode: "overlay" }}></path>
      </g>
      <defs>
        <filter id="filter0" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur"></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  );
}

// ----------------------------------------------------------------------
// AvatarCard Component
// ----------------------------------------------------------------------

function AvatarCard({ avatarIndex = 1 }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%"
    }}>
      <div style={{
        borderRadius: "50%",
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        <Avatar index={avatarIndex} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Stackable Component - Modified for absolute positioning
// ----------------------------------------------------------------------

export function Stackable({
  children,
  visibleWhenCollapsed = 3,
  itemSpacing = 6
}: {
  children: React.ReactNode;
  visibleWhenCollapsed?: number;
  itemSpacing?: number;
}) {
  const [open, setOpen] = useState(false);

  const childArray = Array.isArray(children) ? children : [children];

  if (!childArray || childArray.length === 0) {
    return null;
  }

  // Limit visible items to the specified number when collapsed
  const visibleCount = Math.min(visibleWhenCollapsed, childArray.length);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "center"
      }}
    >
      {/* First item - Fixed frontmost item */}
      <m.div
        style={{
          width: 64,
          height: 64,
          position: "relative",
          zIndex: childArray.length,
          borderRadius: 22,
          backgroundColor: "transparent",
          cursor: "pointer"
        }}
        whileTap={{ scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17
        }}
        onClick={() => setOpen(!open)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            paddingLeft: 12,
            paddingRight: 12
          }}
        >
          {childArray[0]}
        </div>
      </m.div>

      {/* Remaining items - Expand upward */}
      {childArray.slice(1).map((child, index) => {
        const itemNum = index + 2;
        const isVisible = itemNum <= visibleCount;

        return (
          <m.div
            key={index}
            initial="close"
            animate={open ? "open" : "close"}
            variants={{
              open: {
                marginBottom: itemSpacing,
                scale: 1,
                borderRadius: 22,
                backgroundColor: "transparent",
                opacity: 1
              },
              close: {
                marginBottom: -55,
                scale: isVisible ? 1 - (itemNum - 1) * 0.1 : 0,
                borderRadius: 22,
                backgroundColor: "transparent",
                opacity: isVisible ? 1 : 0
              }
            }}
            style={{
              width: 64,
              height: 64,
              position: "relative",
              zIndex: childArray.length - itemNum,
              cursor: "pointer"
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 1
            }}
            onClick={() => setOpen(!open)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                paddingLeft: 12,
                paddingRight: 12
              }}
            >
              {child}
            </div>
          </m.div>
        );
      })}
    </div>
  );
}

// Export AvatarCard for use in parent component
export { AvatarCard };

