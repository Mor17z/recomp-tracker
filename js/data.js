"use strict";
/* ---------- the plan ---------- */
const M="M",K="K",L="L",G="G";
function ex(n,tag,sets,reps,int,sk){return{n,tag,sets,reps,int,sk:sk??null};}
const PLAN = {
  p1:{label:"Phase 1 · Technik & Adaptation · RPE 6–7", deload:false, days:{
    A:{title:"Tag A · Brust, Schultern, Quadrizeps", ex:[
      ex("Beinpresse",M,3,"12","60–65% 1RM",70),
      ex("Brustpresse",M,3,"12","RPE 6–7",35),
      ex("Beinstrecker",M,3,"15","Technik",30),
      ex("Schulterpresse",M,3,"12","RPE 6",25),
      ex("Butterfly / Pec-Deck",M,3,"12","leicht",30),
      ex("Trizepsdrücken",K,3,"15","leicht",20),
      ex("Bauchpresse",M,3,"15","—",25),
    ]},
    B:{title:"Tag B · Rücken, hintere Schulter, Beinbeuger", ex:[
      ex("Latzug breit",M,3,"12","RPE 6–7",40),
      ex("Beinbeuger liegend",M,3,"12","Technik",30),
      ex("Sitzrudern eng",K,3,"12","RPE 6",40),
      ex("Reverse Butterfly",M,3,"15","RPE 6",20),
      ex("Bizeps-Curls 21er",L,3,"7+7+7","leicht",8),
      ex("Wadenheben sitzend",M,3,"15","—",35),
    ]},
    D:{title:"Tag D · Ganzkörper (optional)", ex:[
      ex("Hack-Squat",M,3,"12","RPE 6",40),
      ex("Schrägbank-Brustpresse",M,3,"12","RPE 6–7",30),
      ex("Rudermaschine (T-Bar)",M,3,"12","RPE 6",30),
      ex("Seitheben",M,3,"15","leicht",7),
      ex("Trizeps-Dips",G,3,"10–12","RPE 6",0),
      ex("Rückenstrecker",M,3,"12","RPE 6",20),
    ]},
  }},
  p2:{label:"Phase 2 · Volumen aufbauen · RPE 7–8", deload:false, days:{
    A:{title:"Tag A · Brust, Schultern, Quadrizeps (4 Sätze)", ex:[
      ex("Beinpresse",M,4,"10","70% / RPE 7"),
      ex("Brustpresse",M,4,"8","RPE 7–8"),
      ex("Hack-Squat",M,4,"10","RPE 7"),
      ex("Schulterpresse",M,3,"10","RPE 7"),
      ex("Trizeps-Maschine",M,3,"12","RPE 7"),
      ex("Bauchpresse",M,3,"15","RPE 7"),
    ]},
    B:{title:"Tag B · Rücken, hintere Schulter, Beinbeuger (4 Sätze)", ex:[
      ex("Latzug enger Untergriff",M,4,"8","RPE 7–8"),
      ex("Beinbeuger sitzend",M,4,"10","RPE 7"),
      ex("Sitzrudern breit",K,4,"10","RPE 7"),
      ex("Reverse Butterfly",M,3,"12","RPE 7"),
      ex("Bizeps-Curls 21er",L,3,"7+7+7","RPE 7"),
      ex("Wadenheben stehend",M,4,"15","RPE 6–7"),
    ]},
    D:{title:"Tag D · Ganzkörper / Schwachstellen", ex:[
      ex("Beinpresse eng/tief",M,3,"12","RPE 7"),
      ex("Butterfly",M,3,"12","RPE 7"),
      ex("Latzug eng parallel",M,3,"10","RPE 7"),
      ex("Seitheben",M,3,"15","RPE 7"),
      ex("Bizeps-Maschine (Scott)",M,3,"12","RPE 7"),
      ex("Rotationsmaschine",M,3,"15","—"),
    ]},
  }},
  p3:{label:"Phase 3 · Intensitätspeak · RPE 8–9", deload:false, days:{
    A:{title:"Tag A · Push & Beine (Woche 5)", ex:[
      ex("Kniebeuge (Multipresse)",L,4,"6","RPE 8–9"),
      ex("Bankdrücken (Multipresse)",L,4,"6","RPE 8"),
      ex("Beinpresse (Dropset)",M,3,"10","RPE 8"),
      ex("Schulterpresse",M,3,"8","RPE 8"),
      ex("Trizeps-Dips",G,3,"10","RPE 7–8"),
      ex("Bauchpresse schwer",M,3,"12","RPE 8"),
    ]},
    B:{title:"Tag B · Pull & Beine (Woche 5)", ex:[
      ex("Latzug schwer",M,4,"6","RPE 8–9"),
      ex("Rudermaschine (T-Bar)",M,4,"8","RPE 8"),
      ex("Beinbeuger liegend",M,4,"8","RPE 8"),
      ex("Beinstrecker (Dropset)",M,3,"10","RPE 8"),
      ex("Bizeps 21er + Maschine",L,3,"7+7+7","RPE 8"),
      ex("Wadenheben schwer",M,4,"10","RPE 8"),
    ]},
  }},
  deload:{label:"Phase 3 · Deload-Woche · RPE 5–6 · kein Muskelversagen", deload:true, days:{
    A:{title:"Tag A · Deload (Woche 6)", ex:[
      ex("Kniebeuge (Multipresse)",L,2,"10","RPE 5"),
      ex("Bankdrücken (Multipresse)",L,2,"10","RPE 5"),
      ex("Beinpresse",M,2,"12","RPE 5"),
      ex("Schulterpresse",M,2,"12","RPE 5"),
      ex("Bauchpresse",M,2,"12","leicht"),
    ]},
    B:{title:"Tag B · Deload (Woche 6)", ex:[
      ex("Latzug",M,2,"12","RPE 5"),
      ex("Rudermaschine",M,2,"12","RPE 5"),
      ex("Beinbeuger",M,2,"12","RPE 5"),
      ex("Beinstrecker",M,2,"12","RPE 5"),
      ex("Bizeps-Maschine",M,2,"12","RPE 5"),
      ex("Wadenheben",M,2,"12","leicht"),
    ]},
  }},
};
const TEMPLATES = { p1:"Technik & Adaptation", p2:"Volumen aufbauen", p3:"Intensitätspeak", deload:"Deload" };
function phaseKey(w){
  if(w<=2)return"p1"; if(w<=4)return"p2"; if(w===5)return"p3"; if(w===6)return"deload";
  const c=S.weeks && S.weeks[w]; return c || "p2";
}
function maxWeek(){ const extra=Object.keys(S.weeks||{}).map(Number); return Math.max(6, ...(extra.length?extra:[6])); }
function daysFor(w){ return Object.keys(PLAN[phaseKey(w)].days); }
