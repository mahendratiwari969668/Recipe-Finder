import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RecipeCard from "../components/RecipeCard";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const heroContainerRef = useRef(null);

  // Hero interactive tilt state
  const [heroTilt, setHeroTilt] = useState({
    x: 0,
    y: 0,
    spotX: 50,
    spotY: 50,
    active: false,
  });

  const fetchRecipes = useCallback(async (skipCount, query) => {
    setLoading(true);
    try {
      let url = `https://dummyjson.com/recipes?limit=6&skip=${skipCount}`;

      if (query) {
        url = `https://dummyjson.com/recipes/search?limit=6&skip=${skipCount}&q=${query}`;
      }
      const { data } = await axios.get(url);
      setRecipes((prev) => (skipCount === 0 ? data.recipes : [...prev, ...data.recipes]));
      setTotal(data.total);
    } catch (error) {
      setErrorMsg("Please try again later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const { data } = await axios.get("https://dummyjson.com/recipes?limit=6&skip=0");
        if (!ignore) {
          setRecipes(data.recipes);
          setTotal(data.total);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMsg("Please try again later.");
          console.error(error);
          setLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  // Coordinated editorial GSAP entrance & scroll transitions
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-eyebrow-line",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.1 }
      )
        .fromTo(
          "#hero-title",
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.95 },
          "-=0.5"
        )
        .fromTo(
          ".hero-intro",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.85 },
          "-=0.6"
        )
        .fromTo(
          ".hero-cta-group",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          ".hero-photography-showcase",
          { opacity: 0, scale: 0.96, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "power2.out" },
          "-=0.85"
        );

      gsap.fromTo(
        ".collection-heading",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".collection-heading",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }, heroContainerRef);

    return () => ctx.revert();
  }, []);

  const handleHeroPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotX = (0.5 - y) * 9;
    const rotY = (x - 0.5) * 9;

    setHeroTilt({
      x: rotX,
      y: rotY,
      spotX: Math.round(x * 100),
      spotY: Math.round(y * 100),
      active: true,
    });
  };

  const handleHeroPointerLeave = () => {
    setHeroTilt((prev) => ({ ...prev, x: 0, y: 0, active: false }));
  };

  function handleSearch(e) {
    e.preventDefault();

    const form = new FormData(e.target);
    let query = form.get("query").trim();
    setSearchQuery(query);
    fetchRecipes(0, query);
  }

  if (errorMsg) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="p-8 border border-accent/20 rounded-xl bg-card text-center">
          <p className="font-serif text-xl text-accent mb-2">Recipe collection unavailable</p>
          <p className="text-muted text-sm">{errorMsg}</p>
        </div>
      </main>
    );
  }

  const featuredRecipe = recipes[0];
  const secondaryRecipe = recipes[1];

  return (
    <main ref={heroContainerRef} className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section: Luxury Editorial + Cinematic Food Photography */}
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-eyebrow-line flex items-center gap-2 mb-3">
            <span className="eyebrow m-0">The art of taste</span>
            <span className="text-champagne font-serif">·</span>
            <span className="text-[11px] uppercase tracking-widest text-accent font-semibold">
              Curated Folio
            </span>
          </div>

          <h1 id="hero-title">
            Good food.<br />Beautifully discovered.
          </h1>

          <p className="hero-intro">
            A considered collection of culinary recipes for every appetite, from quiet weeknights
            to your next memorable feast.
          </p>

          <div className="hero-cta-group flex flex-wrap items-center gap-4 mt-8">
            <a className="hero-cta" href="#discover">
              Explore the collection <span aria-hidden="true">↓</span>
            </a>
            <span className="text-xs text-muted uppercase tracking-wider font-semibold pl-2 hidden sm:inline-block">
              {total > 0 ? `${total}+ recipes available` : "Artisanal collection"}
            </span>
          </div>
        </div>

        {/* Hero Visual: Cinematic Photography Showcase with Perspective Tilt and Ambient Light */}
        <div className="hero-photography-showcase relative">
          {/* Warm background ambient aura */}
          <div
            className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-amber-200/25 via-terracotta/10 to-transparent blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Primary Featured Recipe Card with 3D perspective tilt */}
          <div
            onPointerMove={handleHeroPointerMove}
            onPointerLeave={handleHeroPointerLeave}
            className="hero-main-card relative rounded-2xl overflow-hidden border border-champagne/50 bg-card shadow-2xl transition-all duration-300"
            style={{
              transform: heroTilt.active
                ? `perspective(1000px) rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg) scale3d(1.015, 1.015, 1.015)`
                : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
              transition: heroTilt.active
                ? "transform 80ms ease-out"
                : "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            {/* Dynamic specular light highlight */}
            <div
              className="specular-spotlight absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
              style={{
                background: heroTilt.active
                  ? `radial-gradient(circle at ${heroTilt.spotX}% ${heroTilt.spotY}%, rgba(255, 255, 255, 0.45) 0%, rgba(245, 235, 218, 0) 16%, transparent 68%)`
                  : "none",
                opacity: heroTilt.active ? 1 : 0,
              }}
              aria-hidden="true"
            />

            {/* Corner Editorial Registration Marks */}
            <div className="visual-corner visual-corner-tl" aria-hidden="true" />
            <div className="visual-corner visual-corner-br" aria-hidden="true" />

            {/* Top Badge */}
            <div className="absolute top-3.5 right-3.5 z-20">
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-card/90 text-espresso backdrop-blur-md border border-champagne/60 shadow-sm">
                Featured Selection
              </span>
            </div>

            {/* Photographic Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
              <img
                src={
                  featuredRecipe?.image ||
                  "https://cdn.dummyjson.com/recipe-images/1.webp"
                }
                alt={featuredRecipe?.name || "Featured culinary preparation"}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent pointer-events-none" />

              {/* Bottom In-image Label */}
              <div className="absolute bottom-4 left-4 right-4 z-10 text-white flex justify-between items-end">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-amber-200 font-semibold mb-0.5">
                    {featuredRecipe?.cuisine || "Italian"} Heritage
                  </p>
                  <p className="font-serif text-xl sm:text-2xl font-medium tracking-tight drop-shadow-md">
                    {featuredRecipe?.name || "Classic Margherita Pizza"}
                  </p>
                </div>
                {featuredRecipe && (
                  <Link
                    to={`/recipe/${featuredRecipe.id}`}
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/95 text-espresso hover:bg-accent hover:text-white transition-all shadow-md"
                  >
                    <span>View Folio</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom Caption Pill */}
            <div className="p-3.5 border-t border-champagne/30 bg-card/95 flex justify-between items-center text-xs text-muted">
              <span className="font-serif italic">
                Cinematic culinary study · Fresh harvest ingredients
              </span>
              <span className="uppercase tracking-widest text-[10px] text-accent font-bold">
                {featuredRecipe?.difficulty || "Easy"} · {featuredRecipe?.prepTimeMinutes || 20}m prep
              </span>
            </div>
          </div>

          {/* Secondary Floating Accent Card (Tasteful Offset Composition) */}
          {secondaryRecipe && (
            <Link
              to={`/recipe/${secondaryRecipe.id}`}
              className="hero-accent-floating-card hidden sm:flex absolute -bottom-5 -left-6 z-20 items-center gap-3 p-3 rounded-xl bg-card/95 border border-champagne/60 shadow-xl backdrop-blur-md hover:border-accent/40 transition-all hover:scale-102"
            >
              <img
                src={secondaryRecipe.image}
                alt={secondaryRecipe.name}
                className="w-12 h-12 rounded-lg object-cover border border-champagne/40"
              />
              <div>
                <span className="text-[9px] uppercase tracking-wider text-olive font-bold block">
                  Next in Collection
                </span>
                <span className="font-serif text-sm font-semibold text-espresso line-clamp-1">
                  {secondaryRecipe.name}
                </span>
                <span className="text-[11px] text-muted flex items-center gap-1">
                  ★ {secondaryRecipe.rating} · {secondaryRecipe.cuisine}
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Collection Heading & Search */}
      <div className="collection-heading" id="discover">
        <div>
          <p className="eyebrow">Recipe collection</p>
          <h2>Find your next favourite.</h2>
        </div>
        <p className="text-xs text-muted font-sans uppercase tracking-wider font-semibold hidden sm:block">
          Explore by name, ingredient, or origin
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-10">
        <input
          type="text"
          name="query"
          placeholder="Search recipes (e.g. Pasta, Salad, Chicken)..."
          className="flex-1 border border-border rounded-xl px-4 py-2.5 bg-card text-text outline-none focus:border-accent shadow-sm"
        />
        <button
          type="submit"
          className="bg-accent hover:bg-accent-hover text-white rounded-xl px-5 py-2.5 font-medium shadow-sm transition-all hover:shadow-md"
        >
          Search
        </button>
      </form>

      {loading && (
        <div className="py-12 text-center">
          <div className="editorial-loading-spinner" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted font-serif italic">Curating recipes...</p>
        </div>
      )}

      {!loading && recipes.length === 0 && (
        <div className="text-center py-12 p-8 border border-champagne/40 rounded-xl bg-card">
          <p className="font-serif text-lg text-text mb-1">No recipes found for &lsquo;{searchQuery}&rsquo;</p>
          <p className="text-xs text-muted">Try searching with a broader keyword or return to all recipes.</p>
          <button
            type="button"
            onClick={() => fetchRecipes(0, "")}
            className="mt-4 text-2xl font-bold uppercase tracking-wider text-white hover:underline p-3 "
          >
            Show all recipes
          </button>
        </div>
      )}

      {/* Responsive Recipe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {recipes.length < total && (
        <div className="text-center mt-12 mb-8">
          <button
            type="button"
            onClick={() => fetchRecipes(recipes.length, searchQuery)}
            className="bg-accent hover:bg-accent-hover text-white rounded-xl px-8 py-3 font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Load More Recipes
          </button>
        </div>
      )}
    </main>
  );
}

export default Home;
