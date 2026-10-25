import { useEffect, useRef, useState } from "react";

function GlowCursor() {
  const haloRef = useRef(null);
  const dotRef = useRef(null);
  const sparklesContainerRef = useRef(null);

  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return finePointer && !reducedMotion;
  });

  useEffect(() => {
    if (!enabled) return;

    let mouseX = -100;
    let mouseY = -100;
    let dotX = -100;
    let dotY = -100;
    let haloX = -100;
    let haloY = -100;
    let targetX = -100;
    let targetY = -100;
    let isHovering = false;
    let isMagnetic = false;
    let magneticCenterX = 0;
    let magneticCenterY = 0;
    let isVisible = false;
    let animId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (haloRef.current) haloRef.current.style.opacity = "1";
        if (dotRef.current) dotRef.current.style.opacity = "1";
      }

      const target = e.target;
      const interactive = target && (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest('[role="button"]') ||
        target.closest('[role="checkbox"]') ||
        target.closest(".magnetic-target")
      );

      if (interactive) {
        isHovering = true;
        const rect = interactive.getBoundingClientRect();
        magneticCenterX = rect.left + rect.width / 2;
        magneticCenterY = rect.top + rect.height / 2;

        // Apply gentle magnetic attraction if close to center
        const dist = Math.hypot(mouseX - magneticCenterX, mouseY - magneticCenterY);
        isMagnetic = dist < Math.max(rect.width, rect.height) * 0.75;
      } else {
        isHovering = false;
        isMagnetic = false;
      }

      if (haloRef.current) {
        if (isHovering) {
          haloRef.current.classList.add("is-hovering");
        } else {
          haloRef.current.classList.remove("is-hovering");
        }
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (haloRef.current) haloRef.current.style.opacity = "0";
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    const onMouseEnter = () => {
      isVisible = true;
      if (haloRef.current) haloRef.current.style.opacity = "1";
      if (dotRef.current) dotRef.current.style.opacity = "1";
    };

    // Spawn subtle, elegant golden & terracotta sparkles on interaction
    const onPointerDown = (e) => {
      if (!sparklesContainerRef.current) return;
      const x = e.clientX;
      const y = e.clientY;
      const colors = ["#b94e32", "#d7c5a4", "#e8a87c", "#ffffff"];

      for (let i = 0; i < 4; i++) {
        const sparkle = document.createElement("span");
        sparkle.className = "cursor-sparkle";
        const angle = (i * Math.PI) / 2 + (Math.random() - 0.5) * 0.6;
        const dist = 14 + Math.random() * 20;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const size = 3 + Math.random() * 3;
        const color = colors[i % colors.length];

        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.backgroundColor = color;
        sparkle.style.boxShadow = `0 0 6px ${color}`;
        sparkle.style.setProperty("--dx", `${dx}px`);
        sparkle.style.setProperty("--dy", `${dy}px`);

        sparklesContainerRef.current.appendChild(sparkle);

        setTimeout(() => {
          sparkle.remove();
        }, 500);
      }
    };

    // Smooth dual-speed fluid lerp loop: dot is responsive, halo has a soft trailing aura
    const loop = () => {
      // Faster response for pointer dot
      dotX += (mouseX - dotX) * 0.38;
      dotY += (mouseY - dotY) * 0.38;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      }

      // Smooth trailing halo with gentle magnetic attraction
      if (isMagnetic) {
        targetX = magneticCenterX + (mouseX - magneticCenterX) * 0.28;
        targetY = magneticCenterY + (mouseY - magneticCenterY) * 0.28;
      } else {
        targetX = mouseX;
        targetY = mouseY;
      }

      haloX += (targetX - haloX) * 0.14;
      haloY += (targetY - haloY) * 0.14;

      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${haloX}px, ${haloY}px, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="glow-cursor-root" aria-hidden="true">
      <div ref={haloRef} className="cursor-halo" />
      <div ref={dotRef} className="cursor-dot" />
      <div ref={sparklesContainerRef} className="cursor-sparkles-container" />
    </div>
  );
}

export default GlowCursor;
