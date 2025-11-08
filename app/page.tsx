"use client";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UpcomingEvents from "./components/UpcomingEvents";
import MakeEvent from "./components/MakeEvent";
import Brands from "./components/Brands";
import Blog from "./components/Blog";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/Hero/background.png')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(237, 70, 144, 0.8), rgba(85, 34, 204, 0.75), rgba(60, 31, 136, 0.8))",
          }}
        />

        {/* Content */}
        <div className="relative z-20">
          <Navbar />
          <Hero />
        </div>
      </div>

      {/* Main Content Sections */}
      <UpcomingEvents />
      <MakeEvent />
      <Brands />
      <Blog />
      <Footer />
    </div>
  );
}
