"use strict";
/* ---------- storage layer ---------- */
const PFX = "recomp_";
const hasClaude = typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
async function load(key, def){
  try{
    if(hasClaude){ const r = await window.storage.get(key, false); return r ? JSON.parse(r.value) : def; }
    const v = localStorage.getItem(PFX+key); return v!=null ? JSON.parse(v) : def;
  }catch(e){ return def; }
}
async function save(key, val){
  try{
    if(hasClaude){ await window.storage.set(key, JSON.stringify(val), false); return; }
    localStorage.setItem(PFX+key, JSON.stringify(val));
  }catch(e){ console.error("save failed", e); }
}
