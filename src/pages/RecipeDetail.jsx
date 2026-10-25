import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function RecipeDetail() {
  const { id } = useParams();

  const [recipe, setRecipe] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Presentation-only interactive states (preserving all original recipe data)
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [tilt, setTilt] = useState({ x: 0, y: 0, spotX: 50, spotY: 50, active: false });

  const containerRef = useRef(null);

  // Fetch recipe data dynamically based on route param
  useEffect(() => {
    let ignore = false;
    async function loadRecipe() {
      try {
        const { data } = await axios.get(`https://dummyjson.com/recipes/${id}`);
        if (!ignore) {
          setRecipe(data);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setErrorMsg("Could not load recipe details. Please try again.");
          setLoading(false);
        }
      }
    }

    loadRecipe();
    return () => {
      ignore = true;
    };
  }, [id]);

  // Coordinated GSAP editorial entrance
  useEffect(() => {
    if (loading || errorMsg) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".editorial-back-nav",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .fromTo(
          ".editorial-eyebrow-line",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(
          ".recipe-title-editorial",
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.5"
        )
        .fromTo(
          ".editorial-rating-badge",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.6 },
          "-=0.6"
        )
        .fromTo(
          ".detail-metrics-grid .metric-pill",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.08 },
          "-=0.5"
        )
        .fromTo(
          ".recipe-hero-visual",
          { opacity: 0, scale: 0.97, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power2.out" },
          "-=0.7"
        )
        .fromTo(
          ".ingredients-section-card",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          ".instructions-section-card",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, errorMsg]);

  // Interactive checklist handlers (presentation-level only)
  const toggleIngredient = (index) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleAllIngredients = () => {
    if (!recipe.ingredients) return;
    if (checkedIngredients.size === recipe.ingredients.length) {
      setCheckedIngredients(new Set());
    } else {
      setCheckedIngredients(new Set(recipe.ingredients.map((_, i) => i)));
    }
  };

  const toggleStep = (index) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Image perspective tilt & specular spotlight on pointer move
  const handleImagePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotX = (0.5 - y) * 10;
    const rotY = (x - 0.5) * 10;

    setTilt({
      x: rotX,
      y: rotY,
      spotX: Math.round(x * 100),
      spotY: Math.round(y * 100),
      active: true,
    });
  };

  const handleImagePointerLeave = () => {
    setTilt((prev) => ({ ...prev, x: 0, y: 0, active: false }));
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="editorial-loading-spinner" aria-hidden="true" />
        <p className="mt-4 font-serif text-lg text-muted italic">
          Preparing seasonal recipe folio...
        </p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="editorial-back-link inline-flex items-center gap-2 mb-6 text-accent hover:text-accent-hover font-medium transition-colors"
        >
          <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Collection
        </Link>
        <div className="p-8 border border-accent/20 rounded-xl bg-card text-center">
          <p className="font-serif text-xl text-accent mb-2">Recipe folio unavailable</p>
          <p className="text-muted text-sm">{errorMsg || "Recipe could not be found."}</p>
        </div>
      </main>
    );
  }

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
  const totalIngredients = recipe.ingredients?.length || 0;
  const ingredientsCheckedCount = checkedIngredients.size;
  const allIngredientsChecked = totalIngredients > 0 && ingredientsCheckedCount === totalIngredients;

  const totalSteps = recipe.instructions?.length || 0;
  const completedStepsCount = completedSteps.size;
  const progressPercent = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  return (
    <main ref={containerRef} className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Top Editorial Breadcrumbs & Navigation */}
      <nav className="editorial-back-nav flex justify-between items-center mb-8" aria-label="Breadcrumb">
        <Link
          to="/"
          className="editorial-back-link inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors"
        >
          <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Collection</span>
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest text-muted">
          <span>Folio No. {String(recipe.id).padStart(3, "0")}</span>
          <span className="text-champagne">·</span>
          <span>{recipe.cuisine || "Culinary Study"}</span>
        </div>
      </nav>

      {/* Hero Section: Editorial Asymmetric Layout with Cinematic Food Imagery */}
      <section className="recipe-hero-editorial grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
        {/* Left Column: Metadata, Typography, and Recipe Metrics */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="editorial-eyebrow-line flex flex-wrap items-center gap-2 mb-4">
            <span className="eyebrow-cuisine">{recipe.cuisine}</span>
            <span className="text-champagne font-serif">·</span>
            <span className="eyebrow-difficulty">{recipe.difficulty}</span>
            {recipe.mealType && recipe.mealType.length > 0 && (
              <>
                <span className="text-champagne font-serif">·</span>
                <span className="eyebrow-meal">{recipe.mealType.join(" & ")}</span>
              </>
            )}
          </div>

          <h1 className="recipe-title-editorial font-serif text-text leading-[1.05] tracking-tight mb-4">
            {recipe.name}
          </h1>

          {/* Rating and Reviews */}
          <div className="editorial-rating-badge inline-flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-900 text-sm font-semibold">
              <svg className="w-4 h-4 fill-amber-500" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{recipe.rating}</span>
            </div>
            <span className="text-sm text-muted">
              Based on {recipe.reviewCount} kitchen reviews
            </span>
          </div>

          {/* Key Culinary Metrics Grid */}
          <div className="detail-metrics-grid grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <div className="metric-pill">
              <span className="metric-label">Prep Time</span>
              <span className="metric-value">{recipe.prepTimeMinutes} <small>mins</small></span>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Cook Time</span>
              <span className="metric-value">{recipe.cookTimeMinutes} <small>mins</small></span>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Total Time</span>
              <span className="metric-value">{totalTime} <small>mins</small></span>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Servings</span>
              <span className="metric-value">{recipe.servings} <small>portions</small></span>
            </div>
            <div className="metric-pill sm:col-span-2">
              <span className="metric-label">Energy</span>
              <span className="metric-value">{recipe.caloriesPerServing} <small>kcal / serving</small></span>
            </div>
          </div>

          {/* Recipe Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="detail-tags flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted font-bold mr-1">Tags:</span>
              {recipe.tags.map((tag) => (
                <span key={tag} className="editorial-tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Dimensional Image Card with Specular Lighting */}
        <div className="lg:col-span-5 relative">
          <div
            className="recipe-hero-visual relative rounded-2xl overflow-hidden border border-champagne/40 bg-card shadow-2xl"
            onPointerMove={handleImagePointerMove}
            onPointerLeave={handleImagePointerLeave}
            style={{
              transform: tilt.active
                ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.015, 1.015, 1.015)`
                : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
              transition: tilt.active
                ? "transform 80ms ease-out"
                : "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            {/* Specular Spotlight reacting to pointer */}
            <div
              className="specular-spotlight absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
              style={{
                background: tilt.active
                  ? `radial-gradient(circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(255, 255, 255, 0.4) 0%, rgba(245, 235, 218, 0.14) 35%, transparent 68%)`
                  : "none",
                opacity: tilt.active ? 1 : 0,
              }}
              aria-hidden="true"
            />

            {/* Corner Editorial Marks */}
            <div className="visual-corner visual-corner-tl" aria-hidden="true" />
            <div className="visual-corner visual-corner-br" aria-hidden="true" />

            {/* Top Provenance Badge */}
            <div className="absolute top-4 right-4 z-20">
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-card/90 text-espresso backdrop-blur-md border border-champagne/60 shadow-sm">
                Cinematic Folio
              </span>
            </div>

            {/* Visual Container: Photograph */}
            <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-cream">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-full object-cover select-none transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
            </div>

            {/* Bottom Caption Pill */}
            <div className="p-4 border-t border-champagne/30 bg-card/90 flex justify-between items-center text-xs text-muted">
              <span className="font-serif italic">
                Artisanal food photograph · DummyJSON collection
              </span>
              <span className="uppercase tracking-widest text-[10px] text-accent font-bold">
                {recipe.cuisine}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body: Ingredients Checklist & Step-by-Step Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Ingredients Section: Interactive Checklist */}
        <section
          className="ingredients-section-card lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-card border border-champagne/40 shadow-sm"
          aria-labelledby="ingredients-heading"
        >
          <div className="flex justify-between items-end pb-4 mb-6 border-b border-champagne/30">
            <div>
              <p className="eyebrow mb-1">Mise en place</p>
              <h2 id="ingredients-heading" className="font-serif text-2xl font-bold text-text">
                Ingredients
              </h2>
            </div>
            <button
              type="button"
              onClick={toggleAllIngredients}
              className="text-xs uppercase tracking-wider font-bold text-accent hover:text-accent-hover transition-colors underline-offset-4 hover:underline"
            >
              {allIngredientsChecked ? "Reset list" : "Check all"}
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between text-xs text-muted">
            <span>
              {ingredientsCheckedCount} of {totalIngredients} ingredients prepared
            </span>
            <span className="font-serif italic text-accent font-semibold">
              {allIngredientsChecked ? "Ready to cook!" : "Gather items"}
            </span>
          </div>

          <ul className="space-y-2.5" role="list">
            {recipe.ingredients?.map((item, index) => {
              const isChecked = checkedIngredients.has(index);
              return (
                <li key={index}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleIngredient(index)}
                    className={`ingredient-item w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isChecked
                        ? "bg-amber-50/50 border-amber-200/50 text-muted"
                        : "bg-background/60 hover:bg-background border-champagne/30 text-text hover:border-accent/40"
                    }`}
                  >
                    <span
                      className={`ingredient-checkbox mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-accent border-accent text-white"
                          : "border-muted/40 bg-white"
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className={`text-sm leading-relaxed transition-all ${
                        isChecked ? "line-through opacity-75" : "font-medium"
                      }`}
                    >
                      {item}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Instructions Section: Detailed Step-by-Step Guide with Progress */}
        <section
          className="instructions-section-card lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-card border border-champagne/40 shadow-sm"
          aria-labelledby="instructions-heading"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end pb-4 mb-6 border-b border-champagne/30 gap-3">
            <div>
              <p className="eyebrow mb-1">Method & Technique</p>
              <h2 id="instructions-heading" className="font-serif text-2xl font-bold text-text">
                Instructions
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-wider text-muted font-bold">
                Progress: {completedStepsCount} of {totalSteps} steps ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-cream rounded-full h-1.5 mb-8 overflow-hidden">
            <div
              className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>

          <ol className="space-y-4" role="list">
            {recipe.instructions?.map((step, index) => {
              const isDone = completedSteps.has(index);
              return (
                <li
                  key={index}
                  className={`instruction-step-card p-5 rounded-xl border transition-all ${
                    isDone
                      ? "bg-amber-50/40 border-amber-200/50"
                      : "bg-background/50 hover:bg-background border-champagne/30 hover:border-accent/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`step-number font-serif font-bold text-lg flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                        isDone
                          ? "bg-accent text-white border-accent"
                          : "bg-white text-accent border-champagne/60"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex-1">
                      <p
                        className={`text-text text-sm sm:text-base leading-relaxed mb-3 transition-opacity ${
                          isDone ? "opacity-75" : ""
                        }`}
                      >
                        {step}
                      </p>

                      <button
                        type="button"
                        onClick={() => toggleStep(index)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
                          isDone
                            ? "bg-amber-100/70 border-amber-300/70 text-amber-900"
                            : "bg-card border-champagne/60 text-muted hover:text-accent hover:border-accent/50"
                        }`}
                      >
                        <svg
                          className={`w-3.5 h-3.5 ${
                            isDone ? "stroke-amber-800" : "stroke-current"
                          } fill-none`}
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{isDone ? "Step completed" : "Mark as done"}</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {/* Bottom Back Button */}
      <div className="mt-12 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-xl px-7 py-3.5 font-medium transition-all shadow-md hover:shadow-lg"
        >
          <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Return to Recipe Collection
        </Link>
      </div>
    </main>
  );
}

export default RecipeDetail;
