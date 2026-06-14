import type { UserHistoryEntry } from "../types/agentTypes";

// TODO: Replace stubs below with Firestore reads/writes.
// Collection path: userSuccessLogs/{userId}/entries (auto-ID docs, ordered by matchDate desc).

export async function logUserSuccess(
  userId: string,
  tacticUsed: string,
  sliders?: { press: number; style: number; tempo: number },
): Promise<void> {
  console.info("USER_SUCCESS_LOG", { userId, tacticUsed, sliders, timestamp: new Date().toISOString() });
}

export async function getUserHistory(userId: string): Promise<UserHistoryEntry[]> {
  // db.collection("userSuccessLogs").doc(userId).collection("entries")
  //   .orderBy("matchDate", "desc").limit(10).get()
  void userId;
  return [];
}

export async function fetchLastMatchData(userId: string): Promise<UserHistoryEntry | null> {
  const history = await getUserHistory(userId);
  return history[0] ?? null;
}
