(function(){
const E=SITE.esc, NW=168, NH=62, GAP=12, GW=200, GG=44, HEAD=74, X0=28, RW=132, TOP=64;
let D, collapsed={}, query="";
const stepOf=id=>D.steps.find(s=>s.id===id);
function nodeSvg(s,x,y,c){
  const tags=[]; if(s.manual)tags.push("手動 manual"); if(s.kind==="agent")tags.push("agent");
  const dim=query&&!(s.id+s.zh+s.en+s.shortZh+s.shortEn).toLowerCase().includes(query);
  let t="";tags.forEach((g,i)=>{const w=g.length*5.4+12;t+=`<g class="tagp" transform="translate(${x+NW-w-6-i*4},${y-8})"><rect width="${w}" height="15" rx="7.5"/><text x="${w/2}" y="10.5" text-anchor="middle">${g}</text></g>`});
  return `<g class="nd${s.cond?" cond":""}${dim?" dim":""}" style="--c:${c}" role="button" tabindex="0" data-id="${s.id}" aria-label="${E(s.id)}: ${E(s.shortEn)}">
<rect x="${x}" y="${y}" width="${NW}" height="${NH}" rx="9"/>
<text class="t1" x="${x+NW/2}" y="${y+22}" text-anchor="middle">${E(s.id.length>24?s.id.slice(0,22)+"…":s.id)}</text>
<text class="t2" x="${x+NW/2}" y="${y+38}" text-anchor="middle">${E(s.shortZh)}</text>
<text class="t3" x="${x+NW/2}" y="${y+51}" text-anchor="middle">${E(s.shortEn)}</text>${t}</g>`;
}
function chev(x,y,c,id,open){return `<g class="chev" style="--c:${c}" data-g="${id}" role="button" tabindex="0" aria-label="toggle ${id}"><circle cx="${x}" cy="${y}" r="8"/><path d="${open?`M${x-4},${y-2} l4,4 l4,-4`:`M${x-2},${y-4} l4,4 l-4,4`}"/></g>`}
function arrow(x1,y,x2){return `<path class="arr" d="M${x1},${y} H${x2-6}"/><path class="arrh" d="M${x2},${y} l-8,-4.5 v9z"/>`}
function render(){
  const main=D.steps.filter(s=>s.id!=="side"), side=stepOf("side");
  const gx=i=>X0+RW+GG+i*(GW+GG), pad=(GW-NW)/2;
  let out="", maxH=0; const hy=TOP+44;
  // start node
  out+=`<text class="rk" x="${X0+4}" y="${TOP+14}">START 起點</text><g class="rt"><rect x="${X0}" y="${TOP+22}" width="${RW}" height="54" rx="20"/><text class="t1" x="${X0+RW/2}" y="${TOP+45}" text-anchor="middle">需求 request</text><text class="t3" x="${X0+RW/2}" y="${TOP+60}" text-anchor="middle">一張票 a ticket</text></g>`;
  // dashed top line: ai-pair covers build + review
  const bx=gx(1)+GW/2, rx=gx(2)+GW/2;
  out+=`<path class="dash" d="M${X0+RW-24},${TOP+20} V${TOP-28} H${rx} V${TOP-8}"/><path class="dash" d="M${bx},${TOP-28} V${TOP-8}"/><path class="dashh" d="M${bx},${TOP-2} l-4,-7 h8z"/><path class="dashh" d="M${rx},${TOP-2} l-4,-7 h8z"/><text class="t3" x="${(bx+rx)/2}" y="${TOP-34}" text-anchor="middle">複雜需求：ai-pair 取代開發與審查 · complex work: ai-pair replaces build + review</text>`;
  main.forEach((st,i)=>{
    const x=gx(i), list=D.skills.filter(s=>s.step===st.id), open=!collapsed[st.id];
    const h=HEAD+(open?list.length*(NH+GAP)+6:0); maxH=Math.max(maxH,h);
    out+=`<g style="--c:${st.color}"><rect class="gbox" x="${x}" y="${TOP}" width="${GW}" height="${h}" rx="12"/>
<text class="gs" x="${x+pad}" y="${TOP+20}">STAGE ${i+1} · GROUP</text>
<text class="gt" x="${x+pad}" y="${TOP+40}">${E(st.zh.replace(/^[①-⑨]\s*/,""))} <tspan class="gt2">${E(st.en.replace(/^\d+\.\s*/,""))}</tspan></text>
<line class="gline" x1="${x+pad}" x2="${x+GW-pad}" y1="${TOP+50}" y2="${TOP+50}"/></g>`+chev(x+GW-18,TOP+18,st.color,st.id,open);
    out+=arrow(i?gx(i-1)+GW+4:X0+RW+4,hy,x-2);
    if(open)list.forEach((s,k)=>out+=nodeSvg(s,x+pad,TOP+HEAD+k*(NH+GAP),st.color));
  });
  // end node
  const ex=gx(main.length);
  out+=arrow(gx(main.length-1)+GW+4,hy,ex-2)+`<g class="rt"><rect x="${ex}" y="${TOP+22}" width="${RW}" height="54" rx="20"/><text class="t1" x="${ex+RW/2}" y="${TOP+45}" text-anchor="middle">MR</text><text class="t3" x="${ex+RW/2}" y="${TOP+60}" text-anchor="middle">人工開 by a person</text></g>`;
  const W=ex+RW+X0;
  // utilities row
  const uy=TOP+maxH+34, ul=D.skills.filter(s=>s.step==="side"), uopen=!collapsed.side;
  const per=Math.floor((W-2*X0-24)/(NW+GAP)), rows=uopen?Math.ceil(ul.length/per):0, uh=34+rows*(NH+GAP)+(uopen?8:0);
  out+=`<g style="--c:${side.color}"><rect class="gbox" x="${X0}" y="${uy}" width="${W-2*X0}" height="${uh}" rx="12"/><text class="gk" x="${X0+14}" y="${uy+21}">UTILITIES · 隨時可用，順序不限 · USE ANY TIME, IN ANY ORDER</text></g>`+chev(W-X0-18,uy+17,side.color,"side",uopen);
  if(uopen)ul.forEach((s,k)=>out+=nodeSvg(s,X0+14+(k%per)*(NW+GAP),uy+34+Math.floor(k/per)*(NH+GAP),side.color));
  const H=uy+uh+20;
  document.getElementById("canvas").innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Skill map">${out}</svg>`;
}
function hl(t,words){words.forEach(w=>{t=t.replace(w,`<mark>${w}</mark>`)});return t}
function openModal(id,push){
  const s=D.skills.find(x=>x.id===id); if(!s)return;
  const st=stepOf(s.step), md=document.getElementById("md");
  md.style.setProperty("--c",st.color);
  md.innerHTML=`<button class="x" aria-label="Close">✕</button><h2>${E(s.id)}</h2>
<div class="pills"><span class="p c">${E(s.shortZh)} · ${E(s.shortEn)}</span><span class="p">${E(st.zh.replace(/^[①-⑨]\s*/,""))} ${E(st.en.replace(/^\d+\.\s*/,""))}</span><span class="p">${s.plugin}${s.version?" · v"+s.version:""}</span>${s.manual?'<span class="p">手動 manual</span>':""}${s.cond?'<span class="p">有條件 conditional</span>':""}${s.claudeOnly?'<span class="p">Claude only</span>':""}</div>
<span class="lbl w">WHEN TO USE IT 什麼時候用</span>
${s.whens.map(w=>`<div class="wr"><div>${E(w.zh)}<span class="en">When: ${E(w.en)}</span></div><span aria-hidden="true">→</span><button data-go="${w.to}">${w.to}</button></div>`).join("")}
<span class="lbl i">WHAT IT IS 這是什麼</span>
<p>${E(s.zh)}</p><p class="en">${E(s.en)}</p>
<p><span class="inv">${E(s.invoke)}</span></p>${s.source?`<p class="en" style="font-size:12.5px;margin-top:10px">Source: ${E(s.source)}</p>`:""}`;
  document.getElementById("ov").hidden=false; md.querySelector(".x").focus();
  if(push!==false)history.replaceState(null,"","#skill="+id);
}
function closeModal(){document.getElementById("ov").hidden=true;history.replaceState(null,"",location.pathname+location.search)}
function act(t){
  const n=t.closest(".nd"), c=t.closest(".chev");
  if(n)openModal(n.dataset.id); else if(c){collapsed[c.dataset.g]=!collapsed[c.dataset.g];render()}
}
document.addEventListener("click",e=>{
  if(e.target.closest("#canvas"))return act(e.target);
  const go=e.target.closest("[data-go]"); if(go)return openModal(go.dataset.go);
  if(e.target.closest(".x")||e.target.id==="ov")closeModal();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape")closeModal();
  if((e.key==="Enter"||e.key===" ")&&e.target.closest&&e.target.closest("#canvas")){e.preventDefault();act(e.target)}
});
document.getElementById("q").addEventListener("input",e=>{query=e.target.value.trim().toLowerCase();render()});
document.getElementById("collapse").addEventListener("click",e=>{
  const all=D.steps.every(s=>collapsed[s.id]); D.steps.forEach(s=>collapsed[s.id]=!all);
  e.target.textContent=all?"Collapse all 全部收合":"Expand all 全部展開"; render();
});
document.getElementById("fs").addEventListener("click",()=>{const el=document.getElementById("sm");document.fullscreenElement?document.exitFullscreen():el.requestFullscreen&&el.requestFullscreen()});
if(new URLSearchParams(location.search).has("embed"))document.body.classList.add("embed");
SITE.theme(document.getElementById("theme"));
SITE.load("../").then(d=>{
  D=d; document.getElementById("gh").href=SITE.repo;
  document.getElementById("count").textContent=d.skills.length+" skills · "+d.plugins.length+" plugins";
  document.getElementById("order").innerHTML=d.steps.filter(s=>s.id!=="side").map((st,i)=>`<div class="ostep" style="--c:${st.color}"><b class="n">${i+1}</b><strong>${E(st.zh.replace(/^[①-⑨]\s*/,""))} ${E(st.en.replace(/^\d+\.\s*/,""))}</strong><small>${d.skills.filter(s=>s.step===st.id&&!s.cond).map(s=>s.id).join(" · ")}</small></div>`).join("")+`<div class="ostep" style="--c:var(--purple)"><b class="n">5</b><strong>MR</strong><small>人工 commit、push、開 MR · by a person</small></div>`;
  render(); const m=location.hash.match(/skill=([\w-]+)/); if(m)openModal(m[1],false);
});
})();
