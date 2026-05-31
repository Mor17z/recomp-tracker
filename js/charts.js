"use strict";
/* ---------- chart helper ---------- */
function lineChart(points,unit){
  if(!points || points.length<2)
    return `<div class="empty" style="padding:18px"><div>Mindestens 2 Einträge für den Verlauf.</div></div>`;
  const W=320,H=130,pad=22, n=points.length;
  const vals=points.map(p=>p.value);
  let lo=Math.min(...vals), hi=Math.max(...vals);
  if(lo===hi){lo-=1;hi+=1;} const rng=hi-lo;
  const X=i=> pad + (i*(W-pad*2))/(n-1);
  const Y=v=> (H-18) - ((v-lo)/rng)*(H-34);
  const line=points.map((p,i)=>`${i?"L":"M"}${X(i).toFixed(1)},${Y(p.value).toFixed(1)}`).join(" ");
  const area=`M${pad},${H-18} `+points.map((p,i)=>`L${X(i).toFixed(1)},${Y(p.value).toFixed(1)}`).join(" ")+` L${(W-pad)},${H-18} Z`;
  const dots=points.map((p,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(p.value).toFixed(1)}" r="3" fill="var(--teal)"/>`).join("");
  // sparse labels
  const step=Math.ceil(n/5);
  const labels=points.map((p,i)=> (i%step===0||i===n-1)?`<text x="${X(i).toFixed(1)}" y="${H-4}" font-size="9" fill="var(--mut2)" text-anchor="middle" font-family="Barlow">${p.label}</text>`:"").join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--teal)" stop-opacity=".28"/>
      <stop offset="100%" stop-color="var(--teal)" stop-opacity="0"/></linearGradient></defs>
    <text x="2" y="12" font-size="9" fill="var(--mut2)" font-family="Barlow">${hi.toFixed(1)} ${unit}</text>
    <text x="2" y="${H-22}" font-size="9" fill="var(--mut2)" font-family="Barlow">${lo.toFixed(1)}</text>
    <path d="${area}" fill="url(#g)"/>
    <path d="${line}" fill="none" stroke="var(--teal)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${labels}
  </svg>`;
}
function barChart(points,unit,integer){
  if(!points || !points.length)
    return `<div class="empty" style="padding:18px"><div>Noch keine Daten.</div></div>`;
  const W=320,H=120,padB=18,padT=14, n=points.length;
  const hi=Math.max(1,...points.map(p=>p.value));
  const gap=4, bw=Math.max(6,(W-8)/n - gap);
  const X=i=> 4 + i*((W-8)/n) + ((W-8)/n - bw)/2;
  const Hb=v=> (v/hi)*(H-padB-padT);
  const bars=points.map((p,i)=>{
    const h=Hb(p.value), y=H-padB-h;
    const val = integer? p.value : p.value.toFixed(1);
    const lbl = (n<=10 || i%Math.ceil(n/8)===0 || i===n-1)
      ? `<text x="${(X(i)+bw/2).toFixed(1)}" y="${H-5}" font-size="8.5" fill="var(--mut2)" text-anchor="middle" font-family="Barlow">${p.label}</text>` : "";
    const vt = p.value>0 ? `<text x="${(X(i)+bw/2).toFixed(1)}" y="${(y-3).toFixed(1)}" font-size="8.5" fill="var(--teal)" text-anchor="middle" font-family="Barlow Semi Condensed" font-weight="700">${val}</text>` : "";
    return `<rect x="${X(i).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" rx="3" fill="var(--teal)" opacity="0.85"/>${vt}${lbl}`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${bars}
    ${unit?`<text x="2" y="11" font-size="9" fill="var(--mut2)" font-family="Barlow">max ${hi.toFixed(1)} ${unit}</text>`:""}
  </svg>`;
}
