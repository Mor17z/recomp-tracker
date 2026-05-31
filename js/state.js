"use strict";
/* ---------- state ---------- */
let S = { week:1, day:"A", sessions:[], weights:[], measures:[], vacations:[], weeks:{}, editId:null };
const $ = s=>document.querySelector(s);
const todayISO = ()=> new Date().toISOString().slice(0,10);
const fmtD = iso=>{const d=new Date(iso+"T00:00:00");return d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});};
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1700);}
function num(v){const n=parseFloat(String(v).replace(",","."));return isFinite(n)?n:null;}
function firstInt(s){const m=String(s).match(/\d+/);return m?parseInt(m[0]):0;}
function repTarget(r){ return r.includes("+") ? r.split("+").reduce((a,b)=>a+(+b||0),0) : firstInt(r); }

/* autofill: most recent logged values for an exercise name */
function lastEntry(name){
  for(let i=S.sessions.length-1;i>=0;i--){
    const e=S.sessions[i].entries.find(x=>x.n===name);
    if(e) return e;
  }
  return null;
}
