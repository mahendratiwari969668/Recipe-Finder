import { useState } from "react";
import { Link } from "react-router";

function RecipeCard({ recipe }) {
  const {
    id,
    prepTimeMinutes,
    cookTimeMinutes,
    image,
    name,
    cuisine,
    difficulty,
    rating,
  } = recipe;

  const totalTime = (prepTimeMinutes || 0) + (cookTimeMinutes || 0);

  const [tilt, setTilt] = useState({
    x: 0,
    y: 0,
    spotX: 50,
    spotY: 50,
    active: false,
  });

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotX = (0.5 - y) * 7;
    const rotY = (x - 0.5) * 7;

    setTilt({
      x: rotX,
      y: rotY,
      spotX: Math.round(x * 100),
      spotY: Math.round(y * 100),
      active: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt((prev) => ({ ...prev, x: 0, y: 0, active: false }));
  };

  return (
    <Link
      to={`/recipe/${id}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="recipe-card-premium group relative bg-card border border-champagne/40 rounded-xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        transform: tilt.active
          ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
          : "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)",
        transition: tilt.active ? "transform 90ms ease-out" : "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      {/* Light-follow highlight sheen */}
      <div
        className="card-specular-light pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: tilt.active
            ? `radial-gradient(circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(255, 255, 255, 0.42) 0%, rgba(245, 235, 218, 0.01) 16%, transparent 100%)`
            : "none",
          opacity: tilt.active ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Image Container with Consistent Aspect Ratio and Smooth Zoom */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-cream">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
          loading="lazy"
        />
        {/* Subtle dark gradient overlay at base of image */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-espresso/40 to-transparent pointer-events-none" />

        {/* Top Provenance Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-card/90 text-espresso backdrop-blur-md border border-champagne/40 shadow-sm">
            {cuisine}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-olive/15 text-olive font-sans backdrop-blur-md border border-olive/30">
            {difficulty}
          </span>
        </div>
      </div>

      {/* Card Content with Editorial Typography */}
      <div className="p-5 flex flex-col flex-1 bg-card/95">
        <h3 className="font-serif font-bold text-lg text-espresso mb-1.5 leading-snug tracking-tight group-hover:text-accent transition-colors duration-200 line-clamp-1">
          {name}
        </h3>

        <p className="text-xs text-muted mb-4 tracking-wide font-sans">
          {cuisine} Culinary Tradition · {difficulty}
        </p>

        {/* Bottom Metrics Pill */}
        <div className="mt-auto pt-3 border-t border-champagne/30 flex justify-between items-center text-xs">
          <span className="flex items-center gap-1 font-semibold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
            <svg className="w-3.5 h-3.5 fill-amber-500" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {rating}
          </span>

          <span className="flex items-center gap-1.5 text-muted font-medium">
            <svg
              className="w-3.5 h-3.5 stroke-muted fill-none"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {totalTime} mins
          </span>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
