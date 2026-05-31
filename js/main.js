"use strict";
/* ---------- nav ---------- */
document.querySelectorAll(".nb").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".nb").forEach(x=>x.classList.remove("on"));
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("on"));
  b.classList.add("on"); $("#v-"+b.dataset.v).classList.add("on");
  if(b.dataset.v==="weight")renderWeight();
  if(b.dataset.v==="meas")renderMeas();
  if(b.dataset.v==="prog")renderProg();
  window.scrollTo({top:0});
});
$("#liftSel").onchange=drawLift;
$("#saveBtn").onclick=()=>app.saveSession();
$("#wSave").onclick=()=>app.saveWeight();
$("#mSave").onclick=()=>app.saveMeas();
$("#exportBtn").onclick=()=>app.exportData();
$("#vacSave").onclick=()=>app.addVacation();

/* ---------- init ---------- */
(async function init(){
  S.sessions  = await load("sessions",[]);
  S.weights   = await load("weights",[]);
  S.measures  = await load("measures",[]);
  S.vacations = await load("vacations",[]);
  S.weeks     = await load("weeks",{});
  const ui    = await load("ui",{week:1,day:"A"});
  S.week=ui.week||1; S.day=ui.day||"A";
  $("#w-date").value=todayISO(); $("#m-date").value=todayISO(); $("#vac-from").value=todayISO();
  renderEnergyChips(null);
  renderWeekChips(); renderDayChips(); renderExercises(); renderSessions(); updateHeader();
})();
