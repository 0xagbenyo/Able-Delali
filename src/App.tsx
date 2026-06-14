import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HomeMarquee from "./components/HomeMarquee";
import HomeBooks from "./components/HomeBooks";
import HomeFacebookAdvocacy from "./components/HomeFacebookAdvocacy";
import AboutTeaser from "./components/AboutTeaser";
import LatestArticles from "./components/LatestArticles";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

import About from "./pages/About";
import Pastor from "./pages/Pastor";
import Analyst from "./pages/Analyst";
import Writer from "./pages/Writer";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Books from "./pages/Books";
import BookRead from "./pages/BookRead";
import BooksPreorder from "./pages/BooksPreorder";
import Contact from "./pages/Contact";
import RotatingFavicon from "./components/RotatingFavicon";
import { HomepageCMSProvider } from "./context/HomepageCMSProvider";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

function Home() {
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace(/^#/, "").trim();
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname]);

  return (
    <HomepageCMSProvider>
      <div className="page-with-fixed-nav ad-page ed-site cb-site">
        <a className="ed-skip" href="#home">
          Skip to content
        </a>
        <Navbar />

        <main className="ad-page__main">
          <div id="home">
            <Hero />
          </div>

          <HomeMarquee />

          <AboutTeaser />

          <HomeBooks />

          <LatestArticles />

          <Newsletter />

          <HomeFacebookAdvocacy />
        </main>

        <Footer />
      </div>
    </HomepageCMSProvider>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <RotatingFavicon />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pastor" element={<Pastor />} />
        <Route path="/data" element={<Analyst />} />
        <Route path="/writing" element={<Writer />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:blogName" element={<BlogDetail />} />
        <Route path="/books/preorder/:bookId" element={<BooksPreorder />} />
        <Route path="/books/:bookId/read" element={<BookRead />} />
        <Route path="/books" element={<Books />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
}
