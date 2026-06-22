import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { FieldValue } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { runDivanKurulu } from "./framework/divanKurulu";
import { Resend } from "resend";

admin.initializeApp();
const db = admin.firestore();

// ── Secrets ───────────────────────────────────────────────────────────────────
const openRouterKey = defineSecret("OPENROUTER_API_KEY");
const resendKey = defineSecret("RESEND_API_KEY");

// ── Seed: Premium kodları Firestore'a yükle (tek seferlik) ───────────────────
export const seedPremiumCodes = onRequest(
  { region: "europe-west1" },
  async (req, res) => {
    // Güvenlik: sadece GET + secret param ile çalışır
    if (req.query.secret !== "OSM-SEED-2026") { res.status(403).send("forbidden"); return; }

    const codes = [
      "OSM-A7K2-XPREM","OSM-B3N8-YTACT","OSM-C9M4-ZVIP1","OSM-D1P6-WGOLD",
      "OSM-E5R3-UPLUS","OSM-F8T7-ELITE","OSM-G2V9-SACCS","OSM-H4W1-RPROX",
      "OSM-I6Y5-QMAXS","OSM-J0Z8-PNEXT","OSM-K3L2-OSUPR","OSM-L7Q6-NULTX",
      "OSM-M1S4-MBOSS","OSM-N9U0-LKING","OSM-O5X3-KHERO","OSM-P2A7-JACES",
      "OSM-Q8D1-ISPRO","OSM-R4G5-HVIPS","OSM-S6J9-GGOLD","OSM-T0M3-FELTS",
      "OSM-U7P8-ETOPP","OSM-V1R2-DSTAR","OSM-W3T6-CRANK","OSM-X9W0-BAPEX",
      "OSM-Y5Z4-AWAVE","OSM-Z2B8-9PEAK","OSM-2C1F-8FIRE","OSM-3D5H-7WIND",
      "OSM-4E9K-6BOLT","OSM-5F3N-5RUSH","OSM-6G7Q-4BLAD","OSM-7H0T-3STRM",
      "OSM-8I4V-2FLSH","OSM-9J6Y-1FORC","OSM-0K8Z-0TITN","OSM-1L2A-XBLAZ",
      "OSM-2M5D-WSHCK","OSM-3N9G-VSPIK","OSM-4O1J-USWFT","OSM-5P3M-TSLSH",
      "OSM-6Q7P-SSCOT","OSM-7R0S-RROYL","OSM-8S4V-QQUST","OSM-9T8Y-PPWER",
      "OSM-0U2B-ONOVA","OSM-1V5E-NMGHT","OSM-2W9H-MLVLX","OSM-3X1K-LKNGT",
      "OSM-4Y3N-KJUDG","OSM-5Z7Q-JIRON",
    ];

    const batch = db.batch();
    for (const code of codes) {
      const ref = db.collection("premiumCodes").doc(code);
      batch.set(ref, { code, used: false, usedBy: null, usedAt: null }, { merge: true });
    }
    await batch.commit();
    res.status(200).json({ ok: true, count: codes.length });
  }
);

// ── BMC Webhook — Premium kod emaili ─────────────────────────────────────────
export const bmcWebhook = onRequest(
  { region: "europe-west1", secrets: [resendKey] },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).send("Method Not Allowed"); return; }

    const { type, supporter_email, supporter_name } = req.body ?? {};

    // Sadece satın alma eventlerini işle
    const validTypes = ["membership.started", "extras.purchased", "one_time.succeeded"];
    if (!validTypes.includes(type)) { res.status(200).send("ignored"); return; }

    if (!supporter_email) { res.status(400).send("no email"); return; }

    // Firestore'dan boş kod al ve kilitle (transaction — aynı kodu 2 kişiye vermez)
    let code: string;
    try {
      code = await db.runTransaction(async (t) => {
        const snap = await t.get(
          db.collection("premiumCodes").where("used", "==", false).limit(1)
        );
        if (snap.empty) throw new Error("Kod kalmadı");
        const doc = snap.docs[0];
        t.update(doc.ref, {
          used: true,
          usedBy: supporter_email,
          usedAt: FieldValue.serverTimestamp(),
        });
        return doc.data().code as string;
      });
    } catch (err) {
      console.error("Kod atama hatası:", err);
      res.status(500).send("Kod bulunamadı");
      return;
    }

    // Email gönder
    const resend = new Resend(resendKey.value());
    const name = supporter_name ?? "Değerli Üye";

    await resend.emails.send({
      from: "OSM Next Level <noreply@resend.dev>",
      to: supporter_email,
      subject: "👑 Premium Kodun Hazır! — OSM Next Level",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0a0a1a;color:#e2e8f0;padding:32px;border-radius:16px">
          <h2 style="color:#f59e0b;margin-top:0">👑 OSM Next Level Premium</h2>
          <p>Merhaba <strong>${name}</strong>!</p>
          <p>Premium üyeliğin onaylandı. Özel kodun aşağıda:</p>
          <div style="background:#1e1b4b;border:2px solid #f59e0b;border-radius:12px;padding:20px;text-align:center;margin:24px 0">
            <span style="font-size:28px;font-weight:900;letter-spacing:6px;color:#f59e0b">${code}</span>
          </div>
          <p><strong>Nasıl kullanılır?</strong></p>
          <ol style="color:#94a3b8">
            <li>Siteye git: <a href="https://osmnextlevel.com/#premium" style="color:#f59e0b">osmnextlevel.com</a></li>
            <li>Premium bölümüne in</li>
            <li>Kodu gir ve kilidi aç 🔓</li>
          </ol>
          <p style="color:#64748b;font-size:12px;margin-top:32px">Bu kodu kimseyle paylaşma — tek cihazda çalışır.</p>
        </div>
      `,
    });

    console.log(`Premium kod gönderildi: ${supporter_email} → ${code}`);
    res.status(200).send("ok");
  }
);

// ── Premium expiry tarihi set etme (tek seferlik admin çağrısı) ──────────────
export const setCodeExpiry = onRequest(
  { region: "europe-west1" },
  async (req, res) => {
    if (req.query.secret !== "OSM-ADMIN-EXPIRY-2026") { res.status(403).send("forbidden"); return; }
    const { code, expiresAt } = (req.body ?? {}) as { code?: string; expiresAt?: string };
    if (!code || !expiresAt) { res.status(400).send("code ve expiresAt gerekli"); return; }

    const expDate = new Date(expiresAt);
    if (isNaN(expDate.getTime())) { res.status(400).send("geçersiz tarih formatı"); return; }

    await db.collection("usedCodes").doc(code).set(
      { expiresAt: admin.firestore.Timestamp.fromDate(expDate) },
      { merge: true }
    );
    res.status(200).json({ ok: true, code, expiresAt: expDate.toISOString() });
  }
);

// Bilinen 3 aktif aboneliğin expiry tarihlerini tek seferde set eder
export const seedActiveExpiries = onRequest(
  { region: "europe-west1" },
  async (req, res) => {
    if (req.query.secret !== "OSM-ADMIN-EXPIRY-2026") { res.status(403).send("forbidden"); return; }

    const subscriptions = [
      { code: "OSM-H4W1-RPROX", expiresAt: new Date("2026-07-15T23:59:59+03:00") }, // DENIZ 1 ay
      { code: "OSM-D1P6-WGOLD", expiresAt: new Date("2026-07-15T23:59:59+03:00") }, // OGUZHAN 1 ay
      { code: "OSM-F8T7-ELITE", expiresAt: new Date("2026-09-16T23:59:59+03:00") }, // 3 ay
    ];

    const batch = db.batch();
    for (const sub of subscriptions) {
      const ref = db.collection("usedCodes").doc(sub.code);
      batch.set(ref, { expiresAt: admin.firestore.Timestamp.fromDate(sub.expiresAt) }, { merge: true });
    }
    await batch.commit();

    res.status(200).json({
      ok: true,
      seeded: subscriptions.map(s => ({ code: s.code, expiresAt: s.expiresAt.toISOString() })),
    });
  }
);

// ── Dîvan Kurulu — admin-only 3-model LLM council ────────────────────────────

export const divanKurulu = onCall(
  { region: "europe-west1", secrets: [openRouterKey] },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Admin girişi gerekli.");
    const prompt: string = request.data?.prompt ?? "";
    if (!prompt) throw new HttpsError("invalid-argument", "Prompt boş olamaz.");
    try {
      return await runDivanKurulu(prompt, openRouterKey.value());
    } catch (err) {
      throw new HttpsError("internal", `Dîvan Kurulu hatası: ${String(err)}`);
    }
  }
);

// ── Yardımcı Fonksiyonlar ─────────────────────────────────────────────────────
function resolveToken() {
  return "2e7b9492427041daa8ec41fd3e14ec58";
}
function todayISOInIstanbul() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}
function toIstanbulDate(utcStr: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", year: "numeric",
  }).formatToParts(new Date(utcStr));
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}`;
}
function toIstanbulTime(utcStr: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(utcStr));
}

interface FdResponse {
  matches: any[];
}

export const syncMatches = onCall({ region: "europe-west1" }, async (request) => {
  console.log("SYNC_BASLADI");

  try {
    const ALLOWED_COMPETITIONS = new Set(["PL", "CL", "WC", "BL1", "PD", "SA", "FL1", "ELC", "PPL", "DED", "BSA", "EC"]);
    // Tournaments often missing from general /matches endpoint on free tier — fetch separately
    const EXTRA_COMPETITION_CODES = ["WC", "EC", "CL"];

    if (!request.auth) throw new HttpsError("unauthenticated", "Admin girişi gerekli.");

    const token = resolveToken();
    const dateISO = todayISOInIstanbul();
    const headers = { "X-Auth-Token": token };

    // 1) General endpoint
    const res = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateISO}&dateTo=${dateISO}`,
      { headers }
    );
    if (!res.ok) throw new HttpsError("unavailable", `API Hatası: ${res.status}`);

    const body = await res.json() as FdResponse;
    const matchMap = new Map<number, any>();
    for (const m of (body.matches ?? [])) matchMap.set(m.id, m);

    // 2) Competition-specific endpoints (silently skip on error)
    await Promise.all(
      EXTRA_COMPETITION_CODES.map(async (code) => {
        try {
          const r = await fetch(
            `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${dateISO}&dateTo=${dateISO}`,
            { headers }
          );
          if (!r.ok) return;
          const b = await r.json() as FdResponse;
          for (const m of (b.matches ?? [])) matchMap.set(m.id, m);
        } catch {
          // ignore
        }
      })
    );

    const allMatches = Array.from(matchMap.values());
    const total = allMatches.length;
    console.log("DEBUG_API_TOPLAM_MAC_SAYISI:", total);
    console.log("DEBUG_TUM_LIG_KODLARI:", allMatches.map(m => m.competition?.code));

    const eligible = allMatches.filter(m => ALLOWED_COMPETITIONS.has(m.competition?.code));
    const filtered = eligible.length;

    let added = 0;
    let skipped = 0;

    for (const m of eligible) {
      const docId = `fd_${m.id}`;
      const ref = db.collection("matches").doc(docId);

      const existing = await ref.get();
      if (existing.exists) {
        skipped++;
        continue;
      }

      await ref.set({
        teamA: m.homeTeam?.shortName ?? m.homeTeam?.name ?? "Bilinmiyor",
        teamB: m.awayTeam?.shortName ?? m.awayTeam?.name ?? "Bilinmiyor",
        teamACrest: m.homeTeam?.crest ?? "",
        teamBCrest: m.awayTeam?.crest ?? "",
        competition: m.competition?.name ?? "Bilinmiyor",
        competitionCode: m.competition?.code ?? "",
        matchDate: toIstanbulDate(m.utcDate),
        matchTime: toIstanbulTime(m.utcDate),
        status: "open",
        source: "football-data.org",
        fdMatchId: m.id,
        votesHome: 0,
        votesDraw: 0,
        votesAway: 0,
        totalVotes: 0,
        omerPick: "",
        createdAt: FieldValue.serverTimestamp(),
      });
      added++;
    }

    return { added, skipped, total, filtered };
  } catch (err) {
    console.error("KRITIK_HATA:", err);
    throw err;
  }
});
