import "../styles/auth.css";
import { SignInButton } from "@clerk/clerk-react";
import ShinyText from "../components/ShinyText";
import { useEffect, useRef, useState, useCallback } from "react";

/* ── Data ── */
const stats = [
  { value: "500+", label: "Teams Active" },
  { value: "12k+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "100%", label: "Free to Use" },
];

const features = [
  {
    icon: "💬",
    title: "Real-time Chat",
    desc: "Instant messaging with threads, reactions, and organized channels for your team.",
  },
  {
    icon: "📹",
    title: "Video Calls",
    desc: "Crystal-clear 1-on-1 and group video meetings built right into your workflow.",
  },
  {
    icon: "📊",
    title: "Team Polls",
    desc: "Make decisions fast with built-in polling, anonymous votes, and live results.",
  },
  {
    icon: "🖥️",
    title: "Screen Share",
    desc: "Share your screen during calls for seamless presentations and walkthroughs.",
  },
  {
    icon: "📁",
    title: "File Sharing",
    desc: "Drag-and-drop images, PDFs, ZIPs directly into conversations with rich previews.",
  },
  {
    icon: "🔒",
    title: "Enterprise Security",
    desc: "Enterprise-grade auth, encrypted channels, and role-based access controls.",
  },
];

const integrations = [
  { icon: "⚡", name: "Stream" },
  { icon: "🛡️", name: "Clerk" },
  { icon: "🔍", name: "Sentry" },
  { icon: "▲", name: "Vercel" },
];

const activities = [
  {
    dot: "",
    text: (
      <>
        <strong>Arjun</strong> started a video call in{" "}
        <strong>#design-team</strong>
      </>
    ),
    time: "Just now",
  },
  {
    dot: "land-activity-dot--blue",
    text: (
      <>
        <strong>Priya</strong> shared a file in <strong>#engineering</strong>
      </>
    ),
    time: "2 min ago",
  },
  {
    dot: "land-activity-dot--purple",
    text: (
      <>
        <strong>Rahul</strong> created a poll in <strong>#general</strong>
      </>
    ),
    time: "5 min ago",
  },
  {
    dot: "land-activity-dot--amber",
    text: (
      <>
        <strong>Sneha</strong> joined <strong>#marketing</strong> channel
      </>
    ),
    time: "12 min ago",
  },
];

const testimonials = [
  {
    text: "This is hands down the best team communication tool I've ever used. The video calls are seamless and the UI is incredibly clean.",
    name: "Arjun R.",
    role: "Engineering Lead",
    initials: "AR",
    avatarClass: "",
  },
  {
    text: "The real-time polls feature alone saves us hours of back-and-forth emails. Our team adopted it in a day.",
    name: "Priya S.",
    role: "Product Manager",
    initials: "PS",
    avatarClass: "land-testimonial-avatar--alt",
  },
];

const faqs = [
  {
    q: "Is the platform really free?",
    a: "Yes, the Synchronous Communication Hub is 100% free to use. You get access to all features including messaging, video calls, file sharing, and polls with no hidden charges.",
  },
  {
    q: "How many team members can I add?",
    a: "There are no hard limits on team size. The platform is built on scalable infrastructure powered by Stream, so it handles teams of all sizes with zero-latency delivery.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use enterprise-grade authentication via Clerk, encrypted data transmission, and continuous monitoring through Sentry to ensure your data stays safe around the clock.",
  },
  {
    q: "Can I use it on mobile?",
    a: "The platform is fully responsive and works beautifully on any device — desktop, tablet, or mobile. Access your channels and calls from anywhere.",
  },
];

/* ── Component ── */
const AuthPage = () => {
  const sectionsRef = useRef([]);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = useCallback(
    (i) => setOpenFaq((prev) => (prev === i ? null : i)),
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("land-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (i) => (el) => {
    sectionsRef.current[i] = el;
  };

  return (
    <div className="land-page">
      {/* ═══════════ HERO ═══════════ */}
      <header className="land-hero">
        <div className="land-hero-inner">
          <div className="land-brand">
            <img src="/logo.png" alt="Logo" className="land-brand-logo" />
            <span className="land-brand-name">
              <ShinyText
                text="Synchronous Communication Hub"
                speed={2.7}
                color="#d5d5d5"
              />
            </span>
          </div>

          <div className="land-hero-badge" style={{ display: "flex", justifyContent: "center" }}>
            <ShinyText
              text="✨ Free forever • Pro features • Real-time"
              speed={2}
              color="#a0a0a0"
            />
          </div>

          <h1 className="land-hero-title">
            <ShinyText
              text="Your team's hub, always in sync."
              speed={3.6}
              color="#d5d5d5"
            />
          </h1>

          <p className="land-hero-sub">
            Chat, video, polls, file sharing — everything your team needs in
            one minimalist platform built for modern collaboration.
          </p>

          <div className="land-cta-row">
            <SignInButton mode="modal">
              <button className="land-cta" id="hero-cta">
                Get Started
                <span className="land-cta-arrow">→</span>
              </button>
            </SignInButton>
            <button
              className="land-cta land-cta--outline"
              id="hero-demo"
              onClick={() => {
                document
                  .getElementById("section-features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Features
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════ FEATURES ═══════════ */}
      <section
        id="section-features"
        className="land-section"
        ref={addRef(0)}
      >
        <div className="land-section-header">
          <span className="land-badge">
            <ShinyText
              text="Core Features"
              speed={1.8}
              color="#d5d5d5"
            />
          </span>
          <h2 className="land-section-title">
            <ShinyText
              text="Everything you need to collaborate."
              speed={2.7}
              color="#d5d5d5"
            />
          </h2>
          <p className="land-section-desc">
            Six powerful tools working together seamlessly. No plugins, no
            extra apps — it all just works.
          </p>
        </div>

        <div className="land-features-grid">
          {features.map((f) => (
            <div className="land-feature-card" key={f.title}>
              <div className="land-feature-icon">{f.icon}</div>
              <h3>
                <ShinyText
                  text={f.title}
                  speed={1.8}
                  color="#d5d5d5"
                />
              </h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ INTEGRATIONS ═══════════ */}
      <section className="land-section" ref={addRef(1)}>
        <div className="land-section-header">
          <span className="land-badge">
            <ShinyText
              text="Powered By"
              speed={1.8}
              color="#d5d5d5"
            />
          </span>
          <h2 className="land-section-title">
            <ShinyText
              text="Built on world-class infrastructure."
              speed={2.7}
              color="#d5d5d5"
            />
          </h2>
          <p className="land-section-desc">
            Enterprise-grade tools and services under the hood, so you don't
            have to worry about reliability.
          </p>
        </div>

        <div className="land-integrations">
          {integrations.map((int) => (
            <div className="land-integration-card" key={int.name}>
              <div className="land-integration-icon">{int.icon}</div>
              <span className="land-integration-name">{int.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ LIVE ACTIVITY ═══════════ */}
      <section className="land-section" ref={addRef(2)}>
        <div className="land-section-header">
          <span className="land-badge">
            <ShinyText
              text="Live Activity"
              speed={1.8}
              color="#d5d5d5"
            />
          </span>
          <h2 className="land-section-title">
            <ShinyText
              text="See what's happening right now."
              speed={2.7}
              color="#d5d5d5"
            />
          </h2>
          <p className="land-section-desc">
            Real-time updates from your team. Stay in the loop without
            switching between a dozen tools.
          </p>
        </div>

        <div className="land-activity-list">
          {activities.map((a, i) => (
            <div className="land-activity-item" key={i}>
              <div className={`land-activity-dot ${a.dot}`} />
              <span className="land-activity-text">{a.text}</span>
              <span className="land-activity-time">{a.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="land-section" ref={addRef(3)}>
        <div className="land-section-header">
          <span className="land-badge">
            <ShinyText
              text="What People Say"
              speed={1.8}
              color="#d5d5d5"
            />
          </span>
          <h2 className="land-section-title">
            <ShinyText
              text="Trusted by teams everywhere."
              speed={2.7}
              color="#d5d5d5"
            />
          </h2>
        </div>

        <div className="land-testimonials">
          {testimonials.map((t) => (
            <div className="land-testimonial-card" key={t.name}>
              <p className="land-testimonial-text">{t.text}</p>
              <div className="land-testimonial-author">
                <div
                  className={`land-testimonial-avatar ${t.avatarClass}`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="land-testimonial-name">{t.name}</div>
                  <div className="land-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ PRESENCE & PROFILES ═══════════ */}
      <section className="land-section" ref={addRef(4)}>
        <div className="land-section-header">
          <span className="land-badge">
            <ShinyText
              text="Real-Time Presence"
              speed={1.8}
              color="#d5d5d5"
            />
          </span>
          <h2 className="land-section-title">
            <ShinyText
              text="Know exactly who is around."
              speed={2.7}
              color="#d5d5d5"
            />
          </h2>
          <p className="land-section-desc">
            Bring the energy of a physical office to your digital workspace.
            Seamless real-time presence indicators show you who is online, who
            is typing, and who has stepped away. Let team members express
            themselves with customizable profiles, avatars, and personalized
            status messages.
          </p>
        </div>

        <div className="land-features-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="land-feature-card">
            <div className="land-feature-icon">🟢</div>
            <h3>
              <ShinyText text="Live Status" speed={1.8} color="#d5d5d5" />
            </h3>
            <p>Accurate online, away, and typing indicators in real time.</p>
          </div>
          <div className="land-feature-card">
            <div className="land-feature-icon">👤</div>
            <h3>
              <ShinyText text="Custom Profiles" speed={1.8} color="#d5d5d5" />
            </h3>
            <p>Personalized avatars and bios managed securely via Clerk.</p>
          </div>
          <div className="land-feature-card">
            <div className="land-feature-icon">✍️</div>
            <h3>
              <ShinyText text="Custom Statuses" speed={1.8} color="#d5d5d5" />
            </h3>
            <p>Let the team know when you're in focus mode or out for lunch.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ FLUID & RESPONSIVE ═══════════ */}
      <section className="land-section" ref={addRef(5)}>
        <div className="land-section-header">
          <span className="land-badge">
            <ShinyText
              text="Responsive Design"
              speed={1.8}
              color="#d5d5d5"
            />
          </span>
          <h2 className="land-section-title">
            <ShinyText
              text="Take your workspace anywhere."
              speed={2.7}
              color="#d5d5d5"
            />
          </h2>
          <p className="land-section-desc">
            Your conversations shouldn't be chained to a desk. Built with
            modern, component-driven architecture, the interface is completely
            fluid — delivering a flawless experience on any screen size.
          </p>
        </div>

        <div className="land-features-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <div className="land-feature-card">
            <div className="land-feature-icon">📱</div>
            <h3>
              <ShinyText text="Mobile-Optimized" speed={1.8} color="#d5d5d5" />
            </h3>
            <p>Full functionality right from your smartphone browser. No app download required.</p>
          </div>
          <div className="land-feature-card">
            <div className="land-feature-icon">🖥️</div>
            <h3>
              <ShinyText text="Adaptive UI" speed={1.8} color="#d5d5d5" />
            </h3>
            <p>Sidebars and video grids that intelligently resize and stack for any viewport.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="land-section" ref={addRef(6)}>
        <div className="land-section-header">
          <span className="land-badge">
            <ShinyText text="FAQ" speed={1.8} color="#d5d5d5" />
          </span>
          <h2 className="land-section-title">
            <ShinyText
              text="Got questions? We've got answers."
              speed={2.7}
              color="#d5d5d5"
            />
          </h2>
        </div>

        <div className="land-faq-list">
          {faqs.map((faq, i) => (
            <div
              className={`land-faq-item ${
                openFaq === i ? "land-faq-open" : ""
              }`}
              key={i}
            >
              <button
                className="land-faq-question"
                onClick={() => toggleFaq(i)}
              >
                {faq.q}
                <span className="land-faq-chevron">▾</span>
              </button>
              <div className="land-faq-answer">
                <div className="land-faq-answer-inner">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="land-section" ref={addRef(7)}>
        <div className="land-bottom-cta">
          <h2>
            <ShinyText
              text="Ready to connect?"
              speed={2.7}
              color="#d5d5d5"
            />
          </h2>
          <p>
            Join thousands of teams already communicating better, together.
          </p>
          <SignInButton mode="modal">
            <button className="land-cta" id="footer-cta">
              Start Collaborating Now
              <span className="land-cta-arrow">→</span>
            </button>
          </SignInButton>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="land-footer">
        <div className="land-footer-links">
          <span className="land-footer-link">Privacy Policy</span>
          <span className="land-footer-link">Terms of Service</span>
          <span className="land-footer-link">Documentation</span>
          <span className="land-footer-link">Contact Support</span>
        </div>
        <p className="land-footer-copy">
          © {new Date().getFullYear()} Synchronous Communication Hub. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AuthPage;
