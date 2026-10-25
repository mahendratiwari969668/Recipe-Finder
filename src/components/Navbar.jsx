import { Link, useLocation } from "react-router";

function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-champagne/40 shadow-sm transition-all duration-300">
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center"
        aria-label="Main Navigation"
      >
        {/* Brand Logo */}
        <Link
          to="/"
          className="navbar-brand-logo group flex items-center gap-2.5 font-serif font-bold text-xl text-espresso tracking-tight transition-transform duration-200 hover:scale-101"
        >
          <span className="navbar-logo-seal flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent to-[#943822] flex items-center justify-center text-white shadow-sm shadow-accent/30 transition-transform duration-300 group-hover:rotate-12">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.5 2 5.5 4.5 5 8c-.5 3.5 1.5 6.5 4 8v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4c2.5-1.5 4.5-4.5 4-8-.5-3.5-3.5-6-7-6zm-1 18h2v-2h-2v2zm1-5c-2.8 0-5-2.2-5-5 0-.6.1-1.1.3-1.6.4 1 1.4 1.6 2.7 1.6 1.7 0 3-1.3 3-3 0-1.3-.6-2.3-1.6-2.7.5-.2 1-.3 1.6-.3 2.8 0 5 2.2 5 5s-2.2 5-5 5z" />
            </svg>
          </span>
          <span className="group-hover:text-accent transition-colors duration-200">
            Recipe<span className="text-accent font-normal italic">Finder</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`navbar-nav-link text-sm font-medium tracking-wide transition-colors duration-200 relative py-1 ${
              location.pathname === "/"
                ? "text-accent font-semibold"
                : "text-espresso/80 hover:text-accent"
            }`}
          >
            Home
            {location.pathname === "/" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
            )}
          </Link>

          <a
            href="/#discover"
            className="navbar-cta-pill text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-champagne/60 bg-cream/60 hover:bg-accent hover:text-white hover:border-accent text-espresso transition-all shadow-xs"
          >
            Browse
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
