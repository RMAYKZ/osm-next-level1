import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

// Ömer: Buraya yeni video ID eklemek için YouTube linkinden ID kısmını al.
// Örnek: youtube.com/watch?v=Dw_qOc7y1Ug  →  id: "Dw_qOc7y1Ug"
interface VideoItem {
  id: string;
  title: string;
  description: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: "Dw_qOc7y1Ug",
    title: "OSM Anti-Taktik Rehberi",
    description: "5-2-3 kontra atak ile rakibi nasıl etkisiz hale getirirsin?",
  },
  {
    id: "w8C0NOx7iic",
    title: "OSM Taktik Analizi",
    description: "Üst düzey ligde kullandığım stratejilerin perde arkası.",
  },
  {
    id: "0zHsiomiCZk",
    title: "OSM Hızlı Satış Tekniği",
    description: "Oyuncularını piyasada en hızlı nasıl satarsın?",
  },
];

export default function YouTubeVideos() {
  const { t } = useLang();
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section id="videolar" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0" }}>

      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.35), transparent)",
        }} />
        <div style={{
          position: "absolute", top: "10%", left: "-5%",
          width: "35%", height: "50%", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(239,68,68,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 40, textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 12, color: "#f87171" }}>▶</span>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#f87171" }}>
              {t("videos.badge") || "Video Rehberler"}
            </span>
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#e2e8f0" }}>{t("videos.title1") || "YouTube"} </span>
            <span style={{ color: "#f87171" }}>{t("videos.title2") || "Kanalı"}</span>
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(148,163,184,0.65)", lineHeight: 1.6 }}>
            {t("videos.desc") || "Taktiklerin saha üstünde nasıl uygulandığını videolarla izle. Yeni içerikler için abone ol."}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,280px), 1fr))", gap: 16, marginBottom: 32 }}>
          {VIDEOS.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              active={activeId === video.id}
              onPlay={() => setActiveId(video.id)}
              delay={i * 0.1}
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <motion.a
            href="https://www.youtube.com/@OSMNextLevel?sub_confirmation=1"
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(239,68,68,0.5)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#ef4444",
              borderRadius: 999, padding: "14px 28px",
              color: "#fff", fontSize: 13, fontWeight: 900,
              textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em",
              boxShadow: "0 4px 20px rgba(239,68,68,0.35)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z" />
            </svg>
            {t("videos.subscribe") || "YouTube'a Abone Ol"}
          </motion.a>
        </div>
      </div>
    </section>
  );
}

function VideoCard({
  video,
  active,
  onPlay,
  delay,
}: {
  video: VideoItem;
  active: boolean;
  onPlay: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      style={{
        background: "rgba(9,11,33,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(239,68,68,0.12)",
        borderRadius: 20, overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
        {active ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <button
            onClick={onPlay}
            aria-label="Videoyu oynat"
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}
          >
            <img
              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt={video.title}
              loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.42)", transition: "background 0.2s" }} />
            <motion.div
              whileHover={{ scale: 1.14 }}
              style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 54, height: 38, borderRadius: 11,
                background: "#ef4444",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(239,68,68,0.65)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
          </button>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: "#e2e8f0", lineHeight: 1.3 }}>{video.title}</h3>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "rgba(148,163,184,0.6)" }}>{video.description}</p>
      </div>
    </motion.div>
  );
}
