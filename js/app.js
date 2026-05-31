"use strict";
/* ---------- app actions ---------- */
const app = {
  setWeek(w){ S.week=w; S.editId=null; renderWeekChips(); renderDayChips(); renderExercises(); persistUI(); },
  setDay(d){ S.day=d; S.editId=null; renderDayChips(); renderExercises(); persistUI(); },
  async addWeekPrompt(){
    const nw = maxWeek()+1;
    // sensible default: keep periodisation going (volume → intensity → volume → deload)
    const seq = {7:"p2",8:"p2",9:"p3",10:"p3",11:"p2",12:"deload"};
    S.weeks[nw] = seq[nw] || "p2";
    await save("weeks", S.weeks);
    S.week=nw; S.day="A"; S.editId=null;
    renderWeekChips(); renderDayChips(); renderExercises();
    toast("Woche "+nw+" angelegt – Vorlage wählbar");
  },
  async setWeekTemplate(w,key){
    S.weeks[w]=key; await save("weeks",S.weeks);
    S.day="A"; renderWeekChips(); renderDayChips(); renderExercises(); toast("Vorlage gesetzt");
  },
  async removeWeek(w){
    const used = S.sessions.some(s=>s.week===w);
    if(used && !confirm("In Woche "+w+" sind bereits Einheiten gespeichert. Woche trotzdem aus dem Plan entfernen? (Einträge bleiben im Verlauf erhalten)")) return;
    delete S.weeks[w]; await save("weeks",S.weeks);
    S.week=Math.min(w, maxWeek()); if(S.week>6 && !S.weeks[S.week]) S.week=6;
    renderWeekChips(); renderDayChips(); renderExercises(); toast("Woche entfernt");
  },
  async addVacation(){
    const from=$("#vac-from").value, to=$("#vac-to").value||from, note=$("#vac-note").value.trim();
    if(!from){ toast("Bitte Startdatum wählen"); return; }
    if(to<from){ toast("Enddatum vor Startdatum"); return; }
    S.vacations.push({id:Date.now().toString(36), from, to, note});
    await save("vacations",S.vacations);
    $("#vac-note").value="";
    renderVacations(); renderProg(); toast("Pause eingetragen ✓");
  },
  async delVacation(id){ S.vacations=S.vacations.filter(v=>v.id!==id); await save("vacations",S.vacations); renderVacations(); renderProg(); },
  step(ei,si,f,delta){
    const row=document.querySelector(`#exlist .setrow[data-ex="${ei}"][data-set="${si}"]`);
    const inp=row.querySelector(`[data-f="${f}"]`);
    let v=num(inp.value)||0; v=Math.max(0, Math.round((v+delta)*100)/100);
    inp.value = f==="kg" ? (Number.isInteger(v)?v:v.toFixed(2).replace(/0$/,"")) : v;
  },
  setRpe(ei,si,r){
    const box=document.querySelector(`#exlist .rpe[data-ex="${ei}"][data-set="${si}"]`);
    [...box.children].forEach(c=>c.classList.toggle("on", +c.textContent===r));
  },
  touch(){},
  async saveSession(){
    const entries=readForm();
    if(!entries.length){ toast("Keine Werte eingegeben"); return; }
    if(S.editId!==null){
      const s=S.sessions.find(x=>x.id===S.editId);
      s.entries=entries; s.week=S.week; s.day=S.day;
      S.editId=null;
    } else {
      S.sessions.push({ id:Date.now().toString(36), date:todayISO(), week:S.week, day:S.day, entries });
    }
    await save("sessions",S.sessions);
    toast("Einheit gespeichert ✓");
    renderExercises(); renderSessions(); renderProg();
  },
  editSession(id){
    const s=S.sessions.find(x=>x.id===id); if(!s) return;
    S.editId=id; S.week=s.week; S.day=s.day;
    renderWeekChips(); renderDayChips(); renderExercises();
    window.scrollTo({top:0,behavior:"smooth"});
  },
  cancelEdit(){ S.editId=null; renderExercises(); },
  async delSession(id){
    S.sessions=S.sessions.filter(x=>x.id!==id);
    if(S.editId===id)S.editId=null;
    await save("sessions",S.sessions);
    renderExercises(); renderSessions(); renderProg(); toast("Gelöscht");
  },
  pickEnergy(n){ pendingEnergy=n; renderEnergyChips(n); },
  async saveWeight(){
    const date=$("#w-date").value||todayISO();
    const kg=num($("#w-kg").value);
    if(kg==null){ toast("Bitte Gewicht eingeben"); return; }
    const sleep=num($("#w-sleep").value);
    S.weights=S.weights.filter(w=>w.date!==date);
    S.weights.push({date, kg, sleep, energy:pendingEnergy});
    await save("weights",S.weights);
    $("#w-kg").value="";$("#w-sleep").value="";pendingEnergy=null;renderEnergyChips(null);
    renderWeight(); toast("Gewicht gespeichert ✓");
  },
  async delWeight(date){ S.weights=S.weights.filter(w=>w.date!==date); await save("weights",S.weights); renderWeight(); },
  async saveMeas(){
    const date=$("#m-date").value||todayISO();
    const o={date, taille:num($("#m-taille").value), bauch:num($("#m-bauch").value),
             bein:num($("#m-bein").value), arm:num($("#m-arm").value)};
    if([o.taille,o.bauch,o.bein,o.arm].every(v=>v==null)){ toast("Mindestens einen Wert eingeben"); return; }
    S.measures=S.measures.filter(m=>m.date!==date); S.measures.push(o);
    await save("measures",S.measures);
    ["m-taille","m-bauch","m-bein","m-arm"].forEach(i=>$("#"+i).value="");
    renderMeas(); toast("Umfänge gespeichert ✓");
  },
  async delMeas(date){ S.measures=S.measures.filter(m=>m.date!==date); await save("measures",S.measures); renderMeas(); },
  exportData(){
    const blob=new Blob([JSON.stringify({sessions:S.sessions,weights:S.weights,measures:S.measures,vacations:S.vacations,weeks:S.weeks},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download="recomp_tracker_export.json"; a.click(); URL.revokeObjectURL(url);
    toast("Export erstellt");
  },
};
window.app=app;

async function persistUI(){ await save("ui",{week:S.week,day:S.day}); }
