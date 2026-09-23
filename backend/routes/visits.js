import crypto from "crypto";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import mongoose from "mongoose";
import Visitor from "../models/Visitor.js";
import { requireAdmin } from "../utils/auth.js";
import { readJson, writeJson } from "../utils/localJson.js";
import { rateLimit } from "../utils/rateLimit.js";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/visitors-store.json");
const router = Router();

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || req.ip || "";
}

function withId(row) {
  return { ...row, id: String(row.id || row._id) };
}

function identityKey(row) {
  const ip = String(row.ip || "").trim();
  const ua = String(row.userAgent || "").trim();
  if (ip && ua) return `net:${ip}|${ua}`;
  return `sid:${row.sessionId || row.id}`;
}

function collapseVisitors(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = identityKey(row);
    const current = groups.get(key);
    if (!current) {
      groups.set(key, { ...row });
      continue;
    }
    const firstSeen = new Date(current.firstSeen || 0) <= new Date(row.firstSeen || 0) ? current.firstSeen : row.firstSeen;
    const lastSeen = new Date(current.lastSeen || 0) >= new Date(row.lastSeen || 0) ? current.lastSeen : row.lastSeen;
    const lastPath = new Date(current.lastSeen || 0) >= new Date(row.lastSeen || 0) ? current.lastPath : row.lastPath;
    groups.set(key, {
      ...current,
      firstSeen,
      lastSeen,
      lastPath,
      pageViews: (current.pageViews || 1) + (row.pageViews || 1),
      visitorNo: Math.min(current.visitorNo || Number.MAX_SAFE_INTEGER, row.visitorNo || Number.MAX_SAFE_INTEGER),
    });
  }
  return [...groups.values()].map((row) => ({
    ...row,
    visitorNo: row.visitorNo === Number.MAX_SAFE_INTEGER ? 0 : row.visitorNo,
  }));
}

function assignVisitorNumbers(rows) {
  return [...rows]
    .sort((a, b) => {
      const time = new Date(a.firstSeen || 0) - new Date(b.firstSeen || 0);
      if (time !== 0) return time;
      return String(a.id || a.sessionId || "").localeCompare(String(b.id || b.sessionId || ""));
    })
    .map((row, index) => ({ ...row, visitorNo: index + 1 }));
}

function publicVisitor(row) {
  const item = withId(row);
  return {
    id: item.id,
    sessionId: item.sessionId,
    ip: item.ip || "",
    userAgent: String(item.userAgent || "").slice(0, 180),
    firstPath: item.firstPath || "/",
    lastPath: item.lastPath || "/",
    pageViews: item.pageViews || 1,
    visitorNo: item.visitorNo || 0,
    firstSeen: item.firstSeen,
    lastSeen: item.lastSeen,
  };
}

function findLocalMatch(list, sessionId, ip, userAgent) {
  const bySession = list.find((item) => item.sessionId === sessionId);
  if (bySession) return bySession;
  if (ip && userAgent) {
    return list.find((item) => item.ip === ip && item.userAgent === userAgent) || null;
  }
  return null;
}

async function nextVisitorNo(list = []) {
  if (mongoose.connection.readyState === 1) {
    const last = await Visitor.findOne().sort({ visitorNo: -1 }).select("visitorNo").lean();
    return (last?.visitorNo || 0) + 1;
  }
  return (list.reduce((max, item) => Math.max(max, item.visitorNo || 0), 0) || 0) + 1;
}

async function allVisitors() {
  let rows = [];
  if (mongoose.connection.readyState === 1) {
    rows = (await Visitor.find().lean()).map(withId);
  } else {
    rows = readJson(storePath, []).map(withId);
  }
  const numbered = assignVisitorNumbers(collapseVisitors(rows)).map(publicVisitor);
  if (mongoose.connection.readyState !== 1) {
    writeJson(storePath, numbered);
  }
  return numbered;
}

router.post("/", rateLimit({ max: 80, windowMs: 15 * 60 * 1000 }), async (req, res) => {
  const sessionId = String(req.body?.sessionId || "").trim().slice(0, 80);
  const path = String(req.body?.path || "/").trim().slice(0, 300) || "/";
  if (!sessionId || path.startsWith("/admin") || path.includes("HassAz-i-HUb@")) {
    return res.json({ ok: true });
  }

  const now = new Date().toISOString();
  const ip = clientIp(req);
  const userAgent = String(req.headers["user-agent"] || "").slice(0, 250);
  const patch = { sessionId, ip, userAgent, lastPath: path, lastSeen: now };

  try {
    if (mongoose.connection.readyState === 1) {
      const existing =
        (await Visitor.findOne({ sessionId })) ||
        (ip && userAgent ? await Visitor.findOne({ ip, userAgent }) : null);
      if (existing) {
        existing.sessionId = existing.sessionId || sessionId;
        existing.ip = ip;
        existing.userAgent = userAgent;
        existing.lastPath = path;
        existing.lastSeen = now;
        existing.pageViews = (existing.pageViews || 1) + 1;
        if (!existing.visitorNo) existing.visitorNo = await nextVisitorNo();
        await existing.save();
      } else {
        await Visitor.create({
          ...patch,
          firstPath: path,
          pageViews: 1,
          firstSeen: now,
          visitorNo: await nextVisitorNo(),
        });
      }
    } else {
      const list = readJson(storePath, []);
      const existing = findLocalMatch(list, sessionId, ip, userAgent);
      if (existing) {
        const index = list.findIndex((item) => item.id === existing.id || item.sessionId === existing.sessionId);
        list[index] = {
          ...existing,
          ...patch,
          sessionId: existing.sessionId || sessionId,
          pageViews: (existing.pageViews || 1) + 1,
          visitorNo: existing.visitorNo || (await nextVisitorNo(list)),
        };
      } else {
        list.push({
          ...patch,
          id: crypto.randomUUID(),
          firstPath: path,
          pageViews: 1,
          firstSeen: now,
          visitorNo: await nextVisitorNo(list),
        });
      }
      writeJson(storePath, assignVisitorNumbers(collapseVisitors(list)).slice(-5000));
    }
  } catch {
    // tracking must never break the site
  }

  return res.json({ ok: true });
});

router.get("/", requireAdmin, async (_req, res) => {
  res.json({ visitors: await allVisitors() });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = String(req.params.id || "");
  try {
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const removed = await Visitor.findByIdAndDelete(id).lean();
      if (removed) return res.json({ ok: true, id });
    }
    const list = readJson(storePath, []);
    const next = list.filter((item) => String(item.id) !== id && String(item.sessionId) !== id);
    if (next.length === list.length) return res.status(404).json({ message: "Visitor not found." });
    writeJson(storePath, next);
    return res.json({ ok: true, id });
  } catch (error) {
    return res.status(400).json({ message: "Could not update this visitor record." });
  }
});

export default router;
