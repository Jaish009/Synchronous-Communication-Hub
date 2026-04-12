import "../styles/auth.css";
import { SignInButton } from "@clerk/clerk-react";
import ShinyText from "../components/ShinyText";
import { useEffect, useRef } from "react";

const sections = [
  {
    id: "messaging",
    badge: "Real-Time Messaging",
    headline: "Communication that actually flows.",
    description:
      "Keep your team perfectly aligned with instant, zero-latency messaging. Go beyond simple text with organized threads, instant emoji reactions, and pinned messages for critical updates. Whether you're spinning up a private channel, securely sharing project files, or running an interactive team poll, everything happens instantly without dropping a single beat.",
    bullets: [
      {
        icon: "🔒",
        title: "Dynamic Channels",
        text: "Secure Direct Messages and Private Channels.",
      },
      {
        icon: "💬",
        title: "Rich Interaction",
        text: "Threads, reactions, and advanced interactive polls.",
      },
      {
        icon: "📎",
        title: "Seamless Sharing",
        text: "Drag-and-drop sharing for images, PDFs, ZIPs, and more.",
      },
    ],
  },
  {
    id: "video",
    badge: "Video Collaboration",
    headline: "Face-to-face, from anywhere.",
    description:
      "Bridge the distance with high-fidelity video meetings built right into your workflow. Seamlessly escalate from a quick direct message to a 1-on-1 or group video sync with a single click. With powerful moderation tools, you can share your screen, record sessions for asynchronous viewing, and keep the energy high with real-time on-screen reactions.",
    bullets: [
      {
        icon: "📹",
        title: "Instant Syncs",
        text: "1-on-1 and Group Video Calls.",
      },
      {
        icon: "🖥️",
        title: "Built for Work",
        text: "Seamless screen sharing and session recording.",
      },
      {
        icon: "🔥",
        title: "Engaging UI",
        text: "Fire off real-time visual reactions during meetings.",
      },
    ],
  },
  {
    id: "security",
    badge: "Security & Infrastructure",
    headline: "Enterprise-grade infrastructure.",
    description:
      "A beautiful interface demands an equally powerful backend. The Synchronous Communication Hub is engineered for scale and unparalleled reliability. Your data and user access are locked down with enterprise-grade authentication, while background processing and active error monitoring ensure the platform runs flawlessly 24/7, no matter how large your team grows.",
    bullets: [
      {
        icon: "🛡️",
        title: "Secure Access",
        text: "Ironclad user management powered by Clerk.",
      },
      {
        icon: "⚡",
        title: "Built to Scale",
        text: "Powered by Stream for zero-latency, high-volume delivery.",
      },
      {
        icon: "🟢",
        title: "Always On",
        text: "Continuous production-grade monitoring to prevent downtime.",
      },
    ],
  },
  {
    id: "polling",
    badge: "Team Polling",
    headline: "Make decisions without the noise.",
    description:
      "Stop scrolling through endless replies to see what the team thinks. Built-in interactive polling lets you gather feedback, vote on ideas, and finalize decisions instantly. Keep things objective with anonymous modes, or open the floor for collaborative input by allowing team members to add their own suggestions and comments directly to the poll.",
    bullets: [
      {
        icon: "📊",
        title: "Flexible Voting",
        text: "Multiple-choice options with real-time result bars.",
      },
      {
        icon: "🕵️",
        title: "Objective Feedback",
        text: "Toggle on anonymous mode for honest answers.",
      },
      {
        icon: "🤝",
        title: "Collaborative Input",
        text: "Allow users to add custom suggestions and comments.",
      },
    ],
  },
  {
    id: "assets",
    badge: "Asset Management",
    headline: "Your workspace, fully integrated.",
    description:
      "Never lose track of important documents again. Share massive design files, vital contracts, or quick screenshots instantly without leaving the conversation. The platform seamlessly handles high-resolution images, secure PDFs, and heavy ZIP archives, rendering rich previews right in the chat stream so your team stays focused and in context.",
    bullets: [
      {
        icon: "📁",
        title: "Universal Support",
        text: "Easily share Images, PDFs, ZIPs, and more.",
      },
      {
        icon: "👁️",
        title: "Rich Previews",
        text: "View documents and media directly in the chat feed.",
      },
      {
        icon: "🚀",
        title: "Instant Access",
        text: "Drag-and-drop functionality for frictionless uploading.",
      },
    ],
  },
  {
    id: "devex",
    badge: "Developer Experience",
    headline: "Production-ready from day one.",
    description:
      "Getting off the ground shouldn't require weeks of DevOps overhead. This platform is built with a cutting-edge, developer-first architecture designed to scale effortlessly. Enjoy automated background jobs, AI-driven code reviews, and comprehensive error tracking right out of the box. Plus, with a completely free deployment setup, you can take your application from local development to a live production environment in minutes.",
    bullets: [
      {
        icon: "🤖",
        title: "AI & Automation",
        text: "AI-powered code suggestions with CodeRabbit and background jobs via Inngest.",
      },
      {
        icon: "🎯",
        title: "Frictionless Launch",
        text: "Step-by-step free deployment setup included.",
      },
      {
        icon: "🔍",
        title: "Monitor Everything",
        text: "Catch and resolve issues instantly with Sentry integration.",
      },
    ],
  },
];

const AuthPage = () => {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("land-visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="land-page">
      {/* ── HERO ── */}
      <header className="land-hero">
        <div className="land-hero-inner">
          <div className="land-brand">
            <img src="/logo.png" alt="Logo" className="land-brand-logo" />
            <span className="land-brand-name">
              <ShinyText text="Synchronous Communication Hub" speed={2.7} color="#d5d5d5" />
            </span>
          </div>

          <h1 className="land-hero-title">
            <ShinyText text="The Ultimate Chat Experience" speed={3.6} color="#d5d5d5" />
          </h1>

          <p className="land-hero-sub">
            Seamless messaging, immersive video, enterprise security&mdash;all
            in one minimalist platform built for modern teams.
          </p>

          <SignInButton mode="modal">
            <button className="land-cta" id="hero-cta">
              Get Started
              <span className="land-cta-arrow">→</span>
            </button>
          </SignInButton>

          <div className="land-scroll-hint">
            <span>Scroll to explore</span>
            <div className="land-scroll-chevron" />
          </div>
        </div>
      </header>

      {/* ── SECTIONS ── */}
      {sections.map((s, i) => (
        <section
          key={s.id}
          id={`section-${s.id}`}
          className={`land-section ${i % 2 !== 0 ? "land-section--alt" : ""}`}
          ref={(el) => (sectionsRef.current[i] = el)}
        >
          <div className="land-section-inner">
            <span className="land-badge"><ShinyText text={s.badge} speed={1.8} color="#d5d5d5" /></span>
            <h2 className="land-section-title"><ShinyText text={s.headline} speed={2.7} color="#d5d5d5" /></h2>
            <p className="land-section-desc">{s.description}</p>

            <div className="land-bullets">
              {s.bullets.map((b) => (
                <div className="land-bullet" key={b.title}>
                  <span className="land-bullet-icon">{b.icon}</span>
                  <div>
                    <strong className="land-bullet-title"><ShinyText text={b.title} speed={1.8} color="#d5d5d5" /></strong>
                    <span className="land-bullet-text">{b.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── FOOTER CTA ── */}
      <footer className="land-footer">
        <h2 className="land-footer-title"><ShinyText text="Ready to get started?" speed={2.7} color="#d5d5d5" /></h2>
        <p className="land-footer-sub">
          Join thousands of teams already communicating better.
        </p>
        <SignInButton mode="modal">
          <button className="land-cta" id="footer-cta">
            Launch App
            <span className="land-cta-arrow">→</span>
          </button>
        </SignInButton>
        <p className="land-footer-copy">
          © {new Date().getFullYear()} Synchronous Communication Hub
        </p>
      </footer>
    </div>
  );
};
export default AuthPage;
