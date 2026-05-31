"use strict";
/* ---------- TRAINING view ---------- */
function renderWeekChips(){
  const mx=maxWeek(); let html="";
  for(let w=1; w<=mx; w++){
    const custom = w>6;
    const blk = w>6 ? ` <span class="xs" style="opacity:.6">·${TEMPLATES[phaseKey(w)].slice(0,3)}</span>` : "";
    html += `<button class="chip ${w===S.week?"on":""}" onclick="app.setWeek(${w})">${w}${custom?blk:""}</button>`;
  }
  html += `<button class="chip" style="border-style:dashed;color:var(--teal)" onclick="app.addWeekPrompt()">＋ Woche</button>`;
  $("#weekchips").innerHTML = html;
}
function renderDayChips(){
  const ds=daysFor(S.week);
  if(!ds.includes(S.day)) S.day=ds[0];
  $("#daychips").innerHTML = ds.map(d=>
    `<button class="chip day ${d===S.day?"on":""}" onclick="app.setDay('${d}')">Tag ${d}</button>`).join("");
  const p=PLAN[phaseKey(S.week)];
  let extra="";
  if(S.week>6){
    extra = `<div style="display:flex;gap:7px;margin-top:9px;align-items:center">
      <select class="inp" style="flex:1;padding:9px" onchange="app.setWeekTemplate(${S.week}, this.value)">
        ${Object.keys(TEMPLATES).map(k=>`<option value="${k}" ${phaseKey(S.week)===k?"selected":""}>Vorlage: ${TEMPLATES[k]}</option>`).join("")}
      </select>
      <button class="chip" style="color:var(--red);border-color:var(--line2)" onclick="app.removeWeek(${S.week})">Woche löschen</button>
    </div>`;
  }
  $("#phasebar").innerHTML =
    `<div class="phasebar ${p.deload?"deload":""}"><span class="dot"></span><span class="sm">Woche ${S.week} · ${p.label}</span></div>${extra}`;
}
function renderExercises(){
  const p=PLAN[phaseKey(S.week)], day=p.days[S.day];
  const editing = S.editId!==null ? S.sessions.find(x=>x.id===S.editId) : null;
  $("#editbar").innerHTML = editing
    ? `<div class="editbar"><span>Bearbeite Einheit vom ${fmtD(editing.date)}</span><button onclick="app.cancelEdit()">abbrechen</button></div>` : "";
  let html = `<div class="card tight" style="margin-bottom:13px"><b class="cond" style="font-size:16px">${day.title}</b></div>`;
  day.ex.forEach((e,ei)=>{
    const tagTxt={M:"Maschine",K:"Kabel",L:"Langhantel",G:"Körpergew."}[e.tag];
    // prefill source: editing entry, else last logged entry
    let pre=null;
    if(editing) pre = editing.entries.find(x=>x.n===e.n) || null;
    if(!pre) pre = lastEntry(e.n);
    const defKg = pre ? (pre.sets[0]?.kg ?? "") : (e.sk!=null ? e.sk : "");
    const setNote = pre ? (pre.setting||"") : "";
    let rows="";
    for(let si=0; si<e.sets; si++){
      const ps = pre && pre.sets[si] ? pre.sets[si] : null;
      const kg = ps ? ps.kg : defKg;
      const reps = ps ? ps.reps : repTarget(e.reps);
      const rpe = ps ? ps.rpe : null;
      rows += `<div class="setgroup">
        <div class="setrow" data-ex="${ei}" data-set="${si}">
        <div class="setno">${si+1}</div>
        <div class="stp">
          <button onclick="app.step(${ei},${si},'kg',-2.5)">−</button>
          <div class="field"><input inputmode="decimal" data-f="kg" value="${kg??""}" oninput="app.touch()"><div class="u">kg</div></div>
          <button onclick="app.step(${ei},${si},'kg',2.5)">+</button>
        </div>
        <div class="stp">
          <button onclick="app.step(${ei},${si},'reps',-1)">−</button>
          <div class="field"><input inputmode="numeric" data-f="reps" value="${reps??""}" oninput="app.touch()"><div class="u">Wdh</div></div>
          <button onclick="app.step(${ei},${si},'reps',1)">+</button>
        </div>
      </div>
      <div class="rpecap">RPE</div>
      <div class="rpe" data-ex="${ei}" data-set="${si}">
        ${[5,6,7,8,9,10].map(r=>`<div class="r ${rpe===r?"on":""}" onclick="app.setRpe(${ei},${si},${r})">${r}</div>`).join("")}
      </div></div>`;
    }
    html += `<div class="ex" data-name="${e.n.replace(/"/g,'&quot;')}">
      <div class="hd">
        <div><div class="nm">${e.n}</div><div class="meta">Ziel: ${e.sets} × ${e.reps} · ${e.int}</div></div>
        <span class="tag ${e.tag}">${tagTxt}</span>
      </div>
      <div class="body">${rows}
        <div class="setting">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke-linecap="round"/></svg>
          <input data-f="setting" placeholder="Einstellung (z.B. Sitz 4, Lehne 2)" value="${setNote.replace(/"/g,'&quot;')}">
        </div>
      </div></div>`;
  });
  $("#exlist").innerHTML = html;
  $("#saveBtn").textContent = editing ? "Änderungen speichern" : "Einheit speichern";
}
function renderSessions(){
  const el=$("#sessionList");
  if(!S.sessions.length){ el.innerHTML=emptyBox("Noch keine Einheit gespeichert."); return; }
  el.innerHTML = S.sessions.slice().reverse().slice(0,25).map(s=>{
    const topVol = s.entries.reduce((a,e)=>a+e.sets.reduce((b,st)=>b+(num(st.kg)||0)*(num(st.reps)||0),0),0);
    return `<div class="hist">
      <div class="hbadge"><b>${s.day}</b><span>WK ${s.week}</span></div>
      <div class="hmid" onclick="app.editSession('${s.id}')" style="cursor:pointer">
        <div class="t">${fmtD(s.date)} · ${s.entries.length} Übungen</div>
        <div class="xs mut">${Math.round(topVol).toLocaleString("de-DE")} kg Volumen · tippen zum Bearbeiten</div>
      </div>
      <button class="del" onclick="app.delSession('${s.id}')">✕</button>
    </div>`;
  }).join("");
}
function emptyBox(t){
  return `<div class="empty"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8" stroke-linecap="round"/></svg><div>${t}</div></div>`;
}
function readForm(){
  const exs=[...document.querySelectorAll("#exlist .ex")];
  const p=PLAN[phaseKey(S.week)], day=p.days[S.day];
  const entries=[];
  exs.forEach((node,i)=>{
    const meta=day.ex[i];
    const sets=[...node.querySelectorAll(".setrow")].map(r=>{
      const kg=r.querySelector('[data-f="kg"]').value;
      const reps=r.querySelector('[data-f="reps"]').value;
      const onR=r.parentNode.querySelector(`.rpe[data-set="${r.dataset.set}"] .r.on`);
      return { kg:kg===""?null:num(kg), reps:reps===""?null:num(reps), rpe:onR?+onR.textContent:null };
    });
    const setting=node.querySelector('[data-f="setting"]').value.trim();
    // include only if any data present
    if(sets.some(st=>st.kg!==null||st.reps!==null) || setting)
      entries.push({ n:meta.n, tag:meta.tag, sets, setting });
  });
  return entries;
}

/* ---------- GEWICHT view ---------- */
function renderEnergyChips(sel){
  $("#energychips").innerHTML=[1,2,3,4,5,6,7,8,9,10].map(n=>
    `<button class="chip ${sel===n?"on":""}" style="min-width:38px;padding:8px 0;flex:1" onclick="app.pickEnergy(${n})">${n}</button>`).join("");
}
let pendingEnergy=null;
function rollingAvg(arr,days){
  if(!arr.length) return null;
  const sorted=arr.slice().sort((a,b)=>a.date<b.date?1:-1);
  const cutoff=new Date(sorted[0].date); cutoff.setDate(cutoff.getDate()-(days-1));
  const win=sorted.filter(x=>new Date(x.date+"T00:00:00")>=cutoff && x.kg!=null);
  if(!win.length) return null;
  return win.reduce((a,b)=>a+b.kg,0)/win.length;
}
function renderWeight(){
  const ws=S.weights.filter(w=>w.kg!=null).slice().sort((a,b)=>a.date<b.date?-1:1);
  const avg=rollingAvg(S.weights,7);
  $("#wAvg").textContent = avg!=null ? avg.toFixed(1) : "–";
  if(ws.length>=2){
    const d = ws[ws.length-1].kg - ws[0].kg;
    $("#wDelta").textContent=(d>0?"+":"")+d.toFixed(1);
    $("#wDelta").className="v "+(d<=0?"":"amber");
    $("#wDeltaL").textContent="seit Start";
  } else { $("#wDelta").textContent="–"; $("#wDeltaL").textContent="Veränderung"; }
  $("#wChart").innerHTML = lineChart(ws.map(w=>({label:fmtD(w.date),value:w.kg})), "kg");
  $("#wList").innerHTML = ws.length? ws.slice().reverse().slice(0,30).map(w=>
    `<div class="hist"><div class="hbadge"><b>${w.kg}</b><span>KG</span></div>
      <div class="hmid"><div class="t">${fmtD(w.date)}</div>
      <div class="xs mut">${w.energy?("Energie "+w.energy+"/10"):""}${w.energy&&w.sleep?" · ":""}${w.sleep?(w.sleep+" h Schlaf"):""}</div></div>
      <button class="del" onclick="app.delWeight('${w.date}')">✕</button></div>`).join("")
    : emptyBox("Noch kein Gewicht eingetragen.");
  updateHeader();
}

/* ---------- UMFÄNGE view ---------- */
function renderMeas(){
  const ms=S.measures.slice().sort((a,b)=>a.date<b.date?-1:1);
  if(!ms.length){ $("#mList").innerHTML=emptyBox("Noch keine Umfänge eingetragen."); return; }
  const base=ms[0];
  const fields=[["taille","Taille"],["bauch","Bauchnabel"],["bein","Oberschenkel"],["arm","Oberarm"]];
  $("#mList").innerHTML = ms.slice().reverse().map(m=>{
    const cells=fields.map(([k,lbl])=>{
      if(m[k]==null) return "";
      const d=(m[k]-(base[k]??m[k]));
      const ds=(m===base||d===0)?"":`<span class="${d<0?"up":"down"} xs"> (${d>0?"+":""}${d.toFixed(1)})</span>`;
      return `<div class="xs" style="margin-top:2px"><span class="mut">${lbl}:</span> ${m[k]} cm${ds}</div>`;
    }).join("");
    return `<div class="hist" style="align-items:flex-start">
      <div class="hbadge"><b>${fmtD(m.date).split(".")[0]}</b><span>${fmtD(m.date).split(".")[1]}</span></div>
      <div class="hmid">${cells||'<div class="xs mut">—</div>'}</div>
      <button class="del" onclick="app.delMeas('${m.date}')">✕</button></div>`;
  }).join("");
}

/* ---------- VERLAUF view ---------- */
function allLoggedNames(){
  const set=new Set();
  S.sessions.forEach(s=>s.entries.forEach(e=>set.add(e.n)));
  return [...set];
}
function sessionVol(s){ let v=0; s.entries.forEach(e=>e.sets.forEach(st=>{v+=(num(st.kg)||0)*(num(st.reps)||0);})); return v; }
function isVacationDay(iso){ return S.vacations.some(v=> iso>=v.from && iso<=v.to); }
function dayOffset(iso,n){ const d=new Date(iso+"T00:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
/* streak = consecutive recent days that are either a training day OR a vacation day, allowing normal rest gaps */
function trainingStreak(){
  if(!S.sessions.length) return 0;
  const trained=new Set(S.sessions.map(s=>s.date));
  let day=todayISO(), streak=0, restRun=0;
  // walk backwards up to 365 days
  for(let i=0;i<365;i++){
    if(trained.has(day)){ streak++; restRun=0; }
    else if(isVacationDay(day)){ /* neutral, keep streak */ }
    else { restRun++; if(restRun>3) break; } // >3 rest days in a row ends the streak
    day=dayOffset(day,-1);
  }
  return streak;
}
function isoWeekKey(iso){
  const d=new Date(iso+"T00:00:00"); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); // Monday
  return d.toISOString().slice(0,10);
}
function renderProg(){
  const names=allLoggedNames();
  const sel=$("#liftSel");
  const prev=sel.value;
  sel.innerHTML = names.length? names.map(n=>`<option>${n}</option>`).join("") : `<option>– noch keine Daten –</option>`;
  if(names.includes(prev)) sel.value=prev;
  drawLift();

  // overview stats
  $("#cTotal").textContent=S.sessions.length;
  $("#cStreak").textContent=trainingStreak();
  let vol=0; S.sessions.forEach(s=>vol+=sessionVol(s));
  $("#cVol").textContent=(vol/1000).toFixed(1);
  const now=new Date(); const cut=new Date(now); cut.setDate(now.getDate()-7);
  $("#cWeek").textContent=S.sessions.filter(s=>new Date(s.date+"T00:00:00")>=cut).length;

  // per-week aggregation
  const byWeek={};
  S.sessions.forEach(s=>{ const k=isoWeekKey(s.date); (byWeek[k]=byWeek[k]||{n:0,vol:0}); byWeek[k].n++; byWeek[k].vol+=sessionVol(s); });
  const weeks=Object.keys(byWeek).sort();
  $("#cPerWk").textContent = weeks.length? (S.sessions.length/weeks.length).toFixed(1) : "0";

  // avg RPE
  let rsum=0,rn=0; S.sessions.forEach(s=>s.entries.forEach(e=>e.sets.forEach(st=>{ if(st.rpe){rsum+=st.rpe;rn++;} })));
  $("#cRpe").textContent = rn? (rsum/rn).toFixed(1) : "–";

  // charts
  const freqPts=weeks.map(k=>({label:fmtD(k), value:byWeek[k].n}));
  const volPts =weeks.map(k=>({label:fmtD(k), value:+(byWeek[k].vol/1000).toFixed(2)}));
  $("#freqChart").innerHTML = barChart(freqPts, "", true);
  $("#volChart").innerHTML  = barChart(volPts, "t", false);

  renderVacations();
}
function renderVacations(){
  const el=$("#vacList"); if(!el) return;
  const vs=S.vacations.slice().sort((a,b)=>a.from<b.from?1:-1);
  if(!vs.length){ el.innerHTML=`<div class="xs mut" style="padding:8px 0">Noch keine Pausen eingetragen.</div>`; return; }
  el.innerHTML = vs.map(v=>{
    const days=Math.round((new Date(v.to)-new Date(v.from))/86400000)+1;
    return `<div class="hist"><div class="hbadge" style="background:var(--amber-soft);border-color:#5a420f"><b style="color:var(--amber)">${days}</b><span>Tage</span></div>
      <div class="hmid"><div class="t">${fmtD(v.from)} – ${fmtD(v.to)}</div>
      <div class="xs mut">${v.note||"Pause"}</div></div>
      <button class="del" onclick="app.delVacation('${v.id}')">✕</button></div>`;
  }).join("");
}
function drawLift(){
  const name=$("#liftSel").value;
  const pts=[];
  S.sessions.slice().sort((a,b)=>a.date<b.date?-1:1).forEach(s=>{
    const e=s.entries.find(x=>x.n===name);
    if(e){ const best=Math.max(0,...e.sets.map(st=>num(st.kg)||0)); if(best>0) pts.push({label:fmtD(s.date),value:best}); }
  });
  if(pts.length){
    $("#liftStart").textContent=pts[0].value;
    $("#liftNow").textContent=pts[pts.length-1].value;
    const g=pts[pts.length-1].value-pts[0].value;
    $("#liftGain").textContent=(g>0?"+":"")+g;
  } else { $("#liftStart").textContent="–";$("#liftNow").textContent="–";$("#liftGain").textContent="–"; }
  $("#liftChart").innerHTML=lineChart(pts,"kg");
}

function updateHeader(){
  const avg=rollingAvg(S.weights,7);
  $("#hdrstat").innerHTML = avg!=null
    ? `<div style="font-size:18px;font-weight:800;line-height:1">${avg.toFixed(1)}<span class="xs mut"> kg Ø</span></div><div class="xs mut">${S.sessions.length} Einheiten</div>`
    : `<div class="xs mut">${S.sessions.length} Einheiten</div>`;
}
