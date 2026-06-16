import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { blogPosts, type BlogPost } from "../data/blog";
import { useLang } from "../contexts/LanguageContext";

const ease = [0.16, 1, 0.3, 1] as const;

type TFn = (key: string) => string;

export default function Blog() {
  const { t, lang } = useLang();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openPost = blogPosts.find((p) => p.slug === openSlug);

  return (
    <section id="blog" className="relative overflow-hidden py-20 md:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-10 text-center md:mb-12"
        >
          <div className="badge-pro mb-5">
            📚 {t("blog.badge")}
          </div>
          <h2 className="section-title text-4xl leading-none text-cream md:text-6xl">
            {t("blog.title1")} <span className="text-gold">{t("blog.title2")}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-400">{t("blog.desc")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!openPost ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {blogPosts.map((post, i) => (
                <PostCard key={post.slug} post={post} onOpen={() => setOpenSlug(post.slug)} index={i} t={t} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={openPost.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease }}
            >
              <PostDetail post={openPost} onBack={() => setOpenSlug(null)} t={t} lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function PostCard({ post, onOpen, index, t }: { post: BlogPost; onOpen: () => void; index: number; t: TFn }) {
  return (
    <motion.a
      // Real href so crawlers/no-JS visitors land on the indexable static
      // page (/blog/<slug>/); JS users get the faster in-app modal instead.
      href={`/blog/${post.slug}/`}
      onClick={(e) => { e.preventDefault(); onOpen(); }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.42, delay: index * 0.07, ease }}
      whileHover={{ y: -4, scale: 1.012, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="opus-card group block rounded-3xl p-6 text-start"
      style={{ transition: "border-color 0.25s" }}
    >
      <div className="mb-3 flex items-center gap-3">
        <motion.span
          whileHover={{ scale: 1.06 }}
          className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200"
        >
          {post.category}
        </motion.span>
        <span className="text-[10px] font-bold text-stone-500">{post.readTime}</span>
      </div>
      <h3 className="font-display text-lg font-black text-white transition-colors duration-200 group-hover:text-amber-100 md:text-xl">
        {post.title}
      </h3>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-400">{post.metaDesc}</p>
      <div className="mt-4 text-xs font-black uppercase tracking-widest text-amber-300">{t("blog.readMore")}</div>
    </motion.a>
  );
}

function PostDetail({ post, onBack, t, lang }: { post: BlogPost; onBack: () => void; t: TFn; lang: string }) {
  const isRTL = lang === "ar";

  return (
    <article className="mx-auto max-w-3xl">
      <motion.button
        onClick={onBack}
        whileHover={{ x: isRTL ? 4 : -4, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.96 }}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-amber-300 transition-colors duration-200 hover:text-white"
      >
        {t("blog.backToGuides")}
      </motion.button>

      <div className="opus-glass rounded-3xl p-6 md:p-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200">
            {post.category}
          </span>
          <span className="text-[10px] font-bold text-stone-500">{post.date}</span>
          <span className="text-[10px] font-bold text-stone-500">{post.readTime}</span>
        </div>

        <h1 className="font-display text-3xl font-black text-white md:text-4xl">{post.title}</h1>

        <div className="mt-8 space-y-6">
          {post.content.map((block, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <ContentBlock text={block} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 text-center"
        >
          <p className="text-sm font-bold text-amber-100">{t("blog.tryCta")}</p>
          <motion.a
            href="#anti-taktik"
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="mt-3 inline-block rounded-full bg-amber-400 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-stone-900"
          >
            {t("blog.openEngine")}
          </motion.a>
        </motion.div>
      </div>
    </article>
  );
}

function ContentBlock({ text }: { text: string }) {
  if (text.startsWith("## ")) {
    const heading = text.split("\n")[0].replace("## ", "");
    const body = text.split("\n").slice(1).join("\n");
    return (
      <div>
        <h2 className="mb-3 font-display text-xl font-black text-amber-200">{heading}</h2>
        <div className="whitespace-pre-line text-sm leading-7 text-stone-300">{body}</div>
      </div>
    );
  }
  return <p className="text-sm leading-7 text-stone-300">{text}</p>;
}
