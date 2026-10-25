import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import GlowCursor from "./components/GlowCursor";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import RecipeDetail from "./pages/RecipeDetail";

function App() {
  return (
    <div className="min-h-screen bg-background text-text font-sans relative">
      <GlowCursor />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
