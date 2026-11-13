(function(){
const E=SITE.esc, NW=168, NH=64, NS="http://www.w3.org/2000/svg", TOUR=16;
const $=id=>document.getElementById(id);
const KIND={skill:{c:"--k-skill",tab:"SKILL",name:"Skill"},manual:{c:"--k-manual",tab:"MANUAL",name:"Manual skill"},agent:{c:"--k-agent",tab:"AGENT",name:"Agent"},step:{c:"--k-step",tab:"STEP",name:"Process step"},human:{c:"--k-human",tab:"YOU",name:"You"}};
// 位置（左上角）。主線在 y=200 這一列。
const POS={"figma-to-requirements":[120,80],requirements:[120,200],grilling:[120,320],
 tdd:[340,80],"flutter-ui-compare":[530,80],implement:[435,200],"diagnosing-bugs":[340,320],"doubt-check":[530,320],
 "ai-pair":[610,-70],"stack-review":[790,200],"code-reviewer":[830,320],"doc-update":[1040,200],pr:[1270,200],mr:[1500,200],
 "project-documentation":[1760,-70],"multiagent-handoff":[1760,14],"grill-me":[1760,98],retro:[1760,182],"writing-for-agents":[1760,266],"cross-platform-archive-agent":[1760,350]};
const FAM=[{t:"需求 Requirements",x:105,y:48,w:198,h:352},{t:"開發 Build",x:325,y:48,w:388,h:352},{t:"審查 Review",x:775,y:168,w:238,h:232},{t:"收尾 Wrap-up",x:1025,y:168,w:428,h:112},{t:"隨時可用 Run on their own",x:1745,y:-102,w:198,h:532}];
const EXTRA=[
 {id:"implement",label:"開發 implement",kind:"step",shortZh:"照任務文件實作",shortEn:"build from the task doc",plugin:"",zh:"Claude 照任務文件實作，改完跑分析與測試。每一行變更都要對應需求，不順手改旁邊的程式。",en:"Claude implements from the task document, then runs analysis and tests. Every changed line must trace to a requirement.",
  whens:[{zh:"任務文件寫好之後",en:"After the task document is ready",to:"implement"},{zh:"寫新程式，先約定介面",en:"New code: agree on the interface first",to:"tdd"},{zh:"bug 卡住",en:"A bug is stuck",to:"diagnosing-bugs"},{zh:"碰到高風險決定，寫程式之前",en:"A high-risk decision, before coding",to:"doubt-check"}],invoke:"(conversation)"},
 {id:"mr",label:"MR",kind:"human",shortZh:"人工開 MR",shortEn:"opened by a person",plugin:"",zh:"commit、push、開 MR 一律由人處理；agent 不自動執行。",en:"Committing, pushing and opening the MR are always done by a person; agents never do it automatically.",
  whens:[{zh:"MR 說明寫好之後",en:"After the MR description is written",to:"mr"}],invoke:"(you)"}];
// 連線：pts 是折線轉折點；w=calls|feeds；back=退回
const EDGES=[
 {f:"@in",t:"requirements",w:"feeds",pts:[[34,232],[120,232]]},
 {f:"figma-to-requirements",t:"requirements",w:"feeds",l:"有設計稿 design file",pts:[[204,144],[204,200]]},
 {f:"requirements",t:"grilling",w:"calls",l:"需求模糊 ambiguous",pts:[[204,264],[204,320]]},
 {f:"requirements",t:"implement",w:"feeds",l:"任務文件 task doc",pts:[[288,232],[435,232]]},
 {f:"implement",t:"tdd",w:"calls",l:"新程式 new code",pts:[[470,200],[470,144]]},
 {f:"implement",t:"flutter-ui-compare",w:"calls",l:"畫面比對 UI match",pts:[[566,200],[566,144]]},
 {f:"implement",t:"diagnosing-bugs",w:"calls",l:"bug 卡住 stuck",pts:[[470,264],[470,320]]},
 {f:"implement",t:"doubt-check",w:"calls",l:"高風險 risky",pts:[[566,264],[566,320]]},
 {f:"implement",t:"stack-review",w:"feeds",l:"diff",pts:[[603,232],[790,232]]},
 {f:"stack-review",t:"code-reviewer",w:"calls",l:"派出 dispatch",pts:[[914,264],[914,320]]},
 {f:"stack-review",t:"doc-update",w:"feeds",l:"通過 passed",pts:[[958,232],[1040,232]]},
 {f:"doc-update",t:"pr",w:"feeds",pts:[[1208,232],[1270,232]]},
 {f:"pr",t:"mr",w:"feeds",pts:[[1438,232],[1500,232]]},
 {f:"requirements",t:"ai-pair",w:"feeds",l:"複雜需求 complex work",pts:[[288,212],[312,212],[312,-38],[610,-38]]},
 {f:"ai-pair",t:"doc-update",w:"feeds",l:"取代開發與審查 replaces build + review",pts:[[778,-38],[1124,-38],[1124,200]]},
 {f:"stack-review",t:"implement",w:"feeds",back:1,l:"審查沒過 → 退回開發 review failed → back to build",pts:[[808,264],[808,424],[519,424],[519,264]]}];
const TOURPATH="M34,232 H1500", TOURSTOPS=["requirements","implement","stack-review","doc-update","pr","mr"];
let D,N=[],byId={},sel=null,readOn=false;
const stage=$("stage"); let svg,mini,B;

function roundPath(p,r=9){let d=`M ${p[0][0]} ${p[0][1]}`;
 for(let i=1;i<p.length-1;i++){const[a,b,c]=[p[i-1],p[i],p[i+1]],l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]),q=Math.min(r,l1/2,l2/2);
  d+=` L ${b[0]-(b[0]-a[0])/l1*q} ${b[1]-(b[1]-a[1])/l1*q} Q ${b[0]} ${b[1]} ${b[0]+(c[0]-b[0])/l2*q} ${b[1]+(c[1]-b[1])/l2*q}`}
 const e=p[p.length-1];return d+` L ${e[0]} ${e[1]}`}
function labelPos(p){let best=0,bi=0;for(let i=0;i<p.length-1;i++){const l=Math.hypot(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1]);if(l>best){best=l;bi=i}}return[(p[bi][0]+p[bi+1][0])/2,(p[bi][1]+p[bi+1][1])/2]}
const tw=s=>[...s].reduce((a,ch)=>a+(ch.charCodeAt(0)>255?8.6:4.7),0);

function build(){
 N=D.skills.map(s=>({...s,label:s.id,kind:s.kind==="agent"?"agent":s.manual?"manual":"skill"})).concat(EXTRA).filter(n=>POS[n.id]);
 N.forEach(n=>{[n.x,n.y]=POS[n.id];byId[n.id]=n;n.deg=EDGES.filter(e=>e.f===n.id||e.t===n.id).length});
 const xs=N.map(n=>n.x),ys=N.map(n=>n.y);
 B={x:Math.min(...xs,-70)-50,y:Math.min(...ys,...FAM.map(f=>f.y))-60};B.w=Math.max(...xs)+NW+60-B.x;B.h=Math.max(...ys,430)+NH+60-B.y;
 let s=`<defs>${["calls","feeds"].map(w=>`<marker id="m-${w}" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0 L10 4 L0 8 Z" fill="var(--w-${w})"/></marker>`).join("")}</defs>`;
 s+=FAM.map(f=>`<g class="family"><rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="12"/><text x="${f.x+10}" y="${f.y+15}">${E(f.t)}</text></g>`).join("");
 s+=`<g class="edges">`+EDGES.map((e,i)=>{const d=roundPath(e.pts);return `<g class="edge-g w-${e.w}${e.back?" back":""}" data-from="${e.f}" data-to="${e.t}" data-i="${i}"><path d="${d}" class="halo"/><path d="${d}" class="edge" stroke="var(--w-${e.w})" marker-end="url(#m-${e.w})"/><path d="${d}" class="flowline" stroke="var(--w-${e.w})"/></g>`}).join("")+`</g>`;
 s+=`<g class="intake"><circle class="intake-dot" cx="28" cy="232" r="6"/><text class="intake-tx" x="16" y="228" text-anchor="end">需求</text><text class="intake-tx depth-read" x="16" y="241" text-anchor="end" style="font-weight:400;fill:var(--muted)">request</text></g>`;
 s+=`<g class="tour" aria-hidden="true"><circle r="5.5" class="tour-dot"><animateMotion path="${TOURPATH}" dur="${TOUR}s" repeatCount="indefinite"/></circle></g>`;
 s+=`<g class="nodes">`+N.map(n=>{const k=KIND[n.kind],c=`var(${k.c})`,ti=TOURSTOPS.indexOf(n.id),tabw=k.tab.length*5.2+12;
  const delay=ti<0?"":` style="animation-delay:${(((n.x+NW/2-34)/(1500-34))*TOUR-0.04*TOUR).toFixed(2)}s"`;
  const tag=n.plugin?`<g class="ntag"><rect class="ntag-bg" x="${n.x+NW-n.plugin.length*5.6-22}" y="${n.y+NH-9}" width="${n.plugin.length*5.6+14}" height="16" rx="8"/><text class="ntag-tx" x="${n.x+NW-n.plugin.length*2.8-15}" y="${n.y+NH+2.5}" text-anchor="middle">${n.plugin}</text></g>`:"";
  const lab=n.label.length>20?n.label.slice(0,19)+"…":n.label;
  return `<g class="node${ti>=0?" tour-stop":""}" data-id="${n.id}" tabindex="0" role="button" aria-label="${E(n.label)}: ${E(n.shortEn)}"${delay}><title>${E(n.label)} · ${E(n.shortEn)}</title>
<rect x="${n.x}" y="${n.y}" width="${NW}" height="${NH}" rx="10" class="n-mask"/><rect x="${n.x}" y="${n.y}" width="${NW}" height="${NH}" rx="10" class="n-body" fill="var(${k.c}-f)" stroke="${c}"${n.cond?' stroke-dasharray="6 4"':""}/>
<text x="${n.x+NW/2}" y="${n.y+27}" text-anchor="middle" class="n-label" style="font-size:${lab.length>16?11:13}px">${E(lab)}</text>
<text x="${n.x+NW/2}" y="${n.y+42}" text-anchor="middle" class="n-sub depth-read">${E(n.shortZh)}</text><text x="${n.x+NW/2}" y="${n.y+54}" text-anchor="middle" class="n-sub en depth-read">${E(n.shortEn)}</text>
<g class="pub-tab"><rect x="${n.x+12}" y="${n.y-8}" width="${tabw}" height="15" rx="4" fill="${c}"/><text x="${n.x+12+tabw/2}" y="${n.y+2.6}" text-anchor="middle" class="tab-tx">${k.tab}</text></g>${tag}</g>`}).join("")+`</g>`;
 s+=`<g class="labels depth-read">`+EDGES.filter(e=>e.l).map(e=>{const[x,y]=labelPos(e.pts),w=tw(e.l)+12;return `<g class="e-lab" data-from="${e.f}" data-to="${e.t}"><rect x="${x-w/2}" y="${y-8}" width="${w}" height="16" rx="4"/><text x="${x}" y="${y+3}" text-anchor="middle">${E(e.l)}</text></g>`}).join("")+`</g>`;
 stage.insertAdjacentHTML("afterbegin",`<svg class="map-svg" role="img" aria-label="dev-workflow skill map" xmlns="${NS}" preserveAspectRatio="xMidYMid meet">${s}</svg>`);
 svg=stage.querySelector("svg.map-svg");
 $("mini").innerHTML=`<svg viewBox="${B.x} ${B.y} ${B.w} ${B.h}" preserveAspectRatio="xMidYMid meet">${N.map(n=>`<rect x="${n.x}" y="${n.y}" width="${NW}" height="${NH}" rx="8" fill="var(${KIND[n.kind].c})" opacity=".55"/>`).join("")}<rect id="mv" fill="var(--accent)" fill-opacity=".12" stroke="var(--accent)" stroke-width="8"/></svg>`;
 mini=$("mini").firstChild;
 $("nn").textContent=N.length+" nodes";
 $("side").innerHTML=`<h2>dev-workflow</h2>`+N.map(n=>`<button data-id="${n.id}"><span>${n.kind==="manual"||n.kind==="skill"?"/":""}${E(n.label)}</span><small>${n.deg||""}</small></button>`).join("");
}

// ---- camera ----
const cam={cx:0,cy:0,k:1,anim:0,
 size(){const r=stage.getBoundingClientRect();return[r.width,r.height]},
 apply(){const[W,H]=this.size(),{cx,cy,k}=this;svg.setAttribute("viewBox",`${cx-W/2/k} ${cy-H/2/k} ${W/k} ${H/k}`);svg.setAttribute("width",W);svg.setAttribute("height",H);
  $("zv").textContent=Math.round(k*100)+"%";svg.classList.toggle("far",k<0.5&&!readOn);
  const mv=$("mv");mv.setAttribute("x",cx-W/2/k);mv.setAttribute("y",cy-H/2/k);mv.setAttribute("width",W/k);mv.setAttribute("height",H/k)},
 fitState(){const[W,H]=this.size();return{cx:B.x+B.w/2,cy:B.y+B.h/2,k:Math.min(W/B.w,H/B.h,1.4)}},
 to(dest,ms=420){cancelAnimationFrame(this.anim);if(matchMedia("(prefers-reduced-motion: reduce)").matches||!ms){Object.assign(this,dest);return this.apply()}
  const from={cx:this.cx,cy:this.cy},lk0=Math.log(this.k),lk1=Math.log(dest.k),t0=performance.now();
  const step=now=>{const t=Math.min(1,(now-t0)/ms),e=1-Math.pow(1-t,3);this.cx=from.cx+(dest.cx-from.cx)*e;this.cy=from.cy+(dest.cy-from.cy)*e;this.k=Math.exp(lk0+(lk1-lk0)*e);this.apply();if(t<1)this.anim=requestAnimationFrame(step)};
  this.anim=requestAnimationFrame(step)},
 fit(a=true){this.to(this.fitState(),a?420:0)},
 zoomAt(f,sx,sy){const[W,H]=this.size();if(sx==null){sx=W/2;sy=H/2}const k=Math.max(.15,Math.min(4,this.k*f)),wx=this.cx+(sx-W/2)/this.k,wy=this.cy+(sy-H/2)/this.k;
  cancelAnimationFrame(this.anim);this.k=k;this.cx=wx-(sx-W/2)/k;this.cy=wy-(sy-H/2)/k;this.apply()},
 center(n){this.to({cx:n.x+NW/2,cy:n.y+NH/2,k:Math.max(this.k,.9)})}};

function wirePointer(){
 const ptrs=new Map();let moved=0,pinch=0;
 stage.addEventListener("wheel",e=>{if(e.target.closest(".ov"))return;e.preventDefault();const r=stage.getBoundingClientRect();cam.zoomAt(Math.exp(-e.deltaY*(e.ctrlKey?.01:.0018)),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 svg.addEventListener("pointerdown",e=>{if(e.button!==0&&e.pointerType==="mouse")return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1])}});
 svg.addEventListener("pointermove",e=>{const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.clientX-p[0],dy=e.clientY-p[1];ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===1){moved+=Math.abs(dx)+Math.abs(dy);if(moved>4){try{if(!svg.hasPointerCapture(e.pointerId))svg.setPointerCapture(e.pointerId)}catch(_){}stage.classList.add("drag");cancelAnimationFrame(cam.anim);cam.cx-=dx/cam.k;cam.cy-=dy/cam.k;cam.apply()}}
  else if(ptrs.size===2){const[a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]),r=stage.getBoundingClientRect();if(pinch)cam.zoomAt(d/pinch,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top);pinch=d;moved=99}});
 const up=e=>{ptrs.delete(e.pointerId);stage.classList.remove("drag");if(ptrs.size<2)pinch=0};
 svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
 svg.addEventListener("click",e=>{if(moved>4)return;const n=e.target.closest(".node");n?select(n.dataset.id):select(null)});
 mini.addEventListener("pointerdown",e=>{const r=mini.getBoundingClientRect(),s=Math.min(r.width/B.w,r.height/B.h),ox=(r.width-B.w*s)/2,oy=(r.height-B.h*s)/2;cam.to({cx:B.x+(e.clientX-r.left-ox)/s,cy:B.y+(e.clientY-r.top-oy)/s,k:cam.k},250)});
 new ResizeObserver(()=>cam.apply()).observe(stage);
}

// ---- selection & panel ----
let tab="when";
function select(id,opts={}){
 sel=id&&byId[id]?id:null;
 svg.classList.toggle("focusing",!!sel);
 const hot=new Set(sel?[sel]:[]);
 svg.querySelectorAll(".edge-g,.e-lab").forEach(g=>{const on=sel&&(g.dataset.from===sel||g.dataset.to===sel);g.classList.toggle("hot",!!on);if(on){hot.add(g.dataset.from);hot.add(g.dataset.to)}});
 svg.querySelectorAll(".node").forEach(g=>{g.classList.toggle("hot",hot.has(g.dataset.id));g.classList.toggle("sel",g.dataset.id===sel)});
 $("side").querySelectorAll("button").forEach(b=>b.classList.toggle("sel",b.dataset.id===sel));
 history.replaceState(null,"",sel?"#node="+sel:location.pathname+location.search);
 renderPanel(); if(sel&&opts.center)requestAnimationFrame(()=>cam.center(byId[sel]));
}
function renderPanel(){
 const p=$("panel"); if(!sel){p.hidden=true;return}
 const n=byId[sel],k=KIND[n.kind],up=EDGES.filter(e=>e.t===sel&&byId[e.f]),down=EDGES.filter(e=>e.f===sel&&byId[e.t]);
 const src=n.plugin?(n.kind==="agent"?`${SITE.repo}/blob/master/plugins/${n.plugin}/agents/${n.id}.md`:`${SITE.repo}/tree/master/plugins/${n.plugin}/skills/${n.id}`):"";
 const go=id=>`<button class="go" data-go="${id}">${E(byId[id]?byId[id].label:id)}</button>`;
 const body={when:`<h3>WHEN TO USE 什麼時候用</h3><ul>${n.whens.map(w=>`<li>${E(w.zh)}${w.to!==n.id&&byId[w.to]?" → "+go(w.to):""}<span class="en">${E(w.en)}</span></li>`).join("")}</ul>`,
  what:`<h3>WHAT IT IS 這是什麼</h3><p style="margin:0 0 4px">${E(n.zh)}</p><p class="en" style="margin:0">${E(n.en)}</p>`,
  how:`<h3>HOW TO RUN 怎麼叫用</h3><p style="margin:0 0 10px"><code>${E(n.invoke)}</code>${n.manual?' <mark>只能手動叫 manual only</mark>':""}${n.cond?" 有條件才用 conditional":""}${n.claudeOnly?" · Claude only":""}</p>
   ${up.length?`<h3>UPSTREAM 上游</h3><p style="margin:0 0 10px">${up.map(e=>go(e.f)+(e.l?` <span style="color:var(--muted);font-size:12.5px">${E(e.l)}</span>`:"")).join(" ")}</p>`:""}
   ${down.length?`<h3>DOWNSTREAM 下游</h3><p style="margin:0 0 10px">${down.map(e=>go(e.t)+(e.l?` <span style="color:var(--muted);font-size:12.5px">${E(e.l)}</span>`:"")).join(" ")}</p>`:""}
   ${n.source?`<p class="en">Source: ${E(n.source)}</p>`:""}${src?`<p style="margin:6px 0 0"><a href="${src}" target="_blank" rel="noopener">Source on GitHub ↗</a></p>`:""}`};
 p.hidden=false;
 p.innerHTML=`<div class="ph" style="--c:var(${k.c})"><div class="ic">${E(n.label.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()||"·")}</div><div><h2>${E(n.label)}</h2><div class="meta">${k.name}${n.plugin?` <span class="tg">${n.plugin.toUpperCase()}</span>`:""}${n.version?` · v${n.version}`:""} · ${E(n.shortZh)} ${E(n.shortEn)}</div></div><span class="sp"></span><button class="ib" data-nav="-1" aria-label="Previous">‹</button><button class="ib" data-nav="1" aria-label="Next">›</button><button class="ib" data-close aria-label="Close">×</button></div>
<div class="tabs">${[["when","When to use 何時用"],["what","What it is 是什麼"],["how","How to run 怎麼叫用"]].map(t=>`<button data-tab="${t[0]}" class="${tab===t[0]?"on":""}">${t[1]}</button>`).join("")}</div><div class="pb">${body[tab]}</div>`;
}
function nav(d){const i=N.findIndex(n=>n.id===sel);select(N[(i+d+N.length)%N.length].id,{center:true})}

// ---- export ----
function exportSvgText(){
 const c=svg.cloneNode(true);c.setAttribute("viewBox",`${B.x} ${B.y} ${B.w} ${B.h}`);c.setAttribute("width",B.w);c.setAttribute("height",B.h);c.setAttribute("class","map-svg");
 c.querySelectorAll(".tour").forEach(n=>n.remove());c.querySelectorAll(".hot,.sel").forEach(n=>n.classList.remove("hot","sel"));
 const cs=getComputedStyle(document.documentElement),vars=["--bg","--canvas","--soft","--ink","--muted","--line","--accent","--font","--mono","--w-calls","--w-feeds"].concat(Object.values(KIND).flatMap(k=>[k.c,k.c+"-f"]));
 const st=document.createElementNS(NS,"style");st.textContent=`svg{${vars.map(v=>`${v}:${cs.getPropertyValue(v)}`).join(";")};background:${cs.getPropertyValue("--canvas")}}`+$("mapcss").textContent;c.insertBefore(st,c.firstChild);
 return new XMLSerializer().serializeToString(c)}
function download(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
function doExport(kind){const txt=exportSvgText(),blob=new Blob([txt],{type:"image/svg+xml;charset=utf-8"});
 if(kind==="svg")return download(blob,"dev-workflow-skill-map.svg");
 const img=new Image(),url=URL.createObjectURL(blob);img.onload=()=>{const cv=document.createElement("canvas");cv.width=B.w*2;cv.height=B.h*2;const g=cv.getContext("2d");g.drawImage(img,0,0,cv.width,cv.height);URL.revokeObjectURL(url);cv.toBlob(b=>b&&download(b,"dev-workflow-skill-map.png"),"image/png")};img.src=url}

// ---- wiring ----
function wireUi(){
 $("z-fit").onclick=()=>cam.fit();$("z-in").onclick=()=>cam.zoomAt(1.25);$("z-out").onclick=()=>cam.zoomAt(.8);$("z-1").onclick=()=>cam.to({cx:cam.cx,cy:cam.cy,k:1},250);
 const flow=()=>{const on=stage.classList.toggle("flowing");$("z-flow").classList.toggle("on",on)};$("z-flow").onclick=flow;
 $("z-read").onclick=()=>{readOn=!readOn;$("z-read").classList.toggle("on",readOn);cam.apply()};
 $("b-leg").onclick=()=>{const m=$("legend").classList.toggle("min");$("b-leg").textContent=m?"+":"–"};
 $("b-side").onclick=()=>$("side").classList.toggle("off");
 $("b-help").onclick=()=>$("help").hidden=false;$("help").onclick=()=>$("help").hidden=true;
 $("b-exp").onclick=e=>{e.stopPropagation();$("menu").hidden=!$("menu").hidden};
 $("menu").onclick=e=>{const b=e.target.closest("[data-x]");if(b){doExport(b.dataset.x);$("menu").hidden=true}};
 $("side").onclick=e=>{const b=e.target.closest("[data-id]");if(b)select(b.dataset.id,{center:true})};
 $("panel").onclick=e=>{const t=e.target.closest("[data-tab]"),g=e.target.closest("[data-go]"),n=e.target.closest("[data-nav]");
  if(t){tab=t.dataset.tab;renderPanel()}else if(g)select(g.dataset.go,{center:true});else if(n)nav(+n.dataset.nav);else if(e.target.closest("[data-close]"))select(null)};
 const q=$("q"),res=$("res");
 const show=()=>{const v=q.value.trim().toLowerCase(),hits=N.filter(n=>!v||(n.id+n.label+n.zh+n.en+n.shortZh+n.shortEn).toLowerCase().includes(v)).slice(0,10);
  res.hidden=!hits.length;res.innerHTML=hits.map((n,i)=>`<button data-id="${n.id}" class="${i?"":"act"}">${E(n.label)}<small>${E(n.shortZh)}</small></button>`).join("")};
 q.addEventListener("input",show);q.addEventListener("focus",show);
 q.addEventListener("keydown",e=>{if(e.key==="Enter"){const b=res.querySelector("button");if(b){select(b.dataset.id,{center:true});res.hidden=true;q.blur()}}if(e.key==="Escape"){res.hidden=true;q.blur()}});
 res.addEventListener("mousedown",e=>{const b=e.target.closest("[data-id]");if(b){e.preventDefault();select(b.dataset.id,{center:true});res.hidden=true;q.value="";q.blur()}});
 document.addEventListener("click",e=>{if(!e.target.closest(".find"))res.hidden=true;if(!e.target.closest("#b-exp"))$("menu").hidden=true});
 document.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();q.focus();q.select();return}
  if(e.target.tagName==="INPUT")return;
  const node=e.target.closest&&e.target.closest(".node");
  if((e.key==="Enter"||e.key===" ")&&node){e.preventDefault();select(node.dataset.id)}
  else if(e.key==="/"){e.preventDefault();q.focus()}
  else if(e.key==="+"||e.key==="=")cam.zoomAt(1.25);else if(e.key==="-")cam.zoomAt(.8);else if(e.key==="0")cam.fit();
  else if(e.key==="f")flow();else if(e.key==="?")$("help").hidden=!$("help").hidden;
  else if(e.key==="Escape"){$("help").hidden=true;select(null)}
  else if(sel&&e.key==="ArrowRight")nav(1);else if(sel&&e.key==="ArrowLeft")nav(-1)});
 SITE.theme($("b-theme"));
}
SITE.load("../").then(d=>{
 D=d;build();wireUi();wirePointer();
 if(innerWidth<760||new URLSearchParams(location.search).has("embed")){$("side").classList.add("off");$("legend").classList.add("min");$("b-leg").textContent="+"}
 cam.fit(false);
 const m=location.hash.match(/node=([\w-]+)/);if(m)select(m[1]);
});
})();
