(function(){
const views=[["flow","流程 Flow"],["plugin","Plugin"],["role","角色 Role"]];
let D,view="flow",sel=null;
function parse(){const p=new URLSearchParams(location.hash.slice(1));view=views.some(v=>v[0]===p.get("view"))?p.get("view"):"flow";sel=p.get("skill")}
function setHash(){const p=new URLSearchParams();p.set("view",view);if(sel)p.set("skill",sel);history.replaceState(null,"","#"+p)}
function node(s){return `<button class="node${s.kind==="agent"?" agent":""}" data-id="${s.id}" data-cond="${!!s.cond}" aria-pressed="${sel===s.id}"><code>${s.id}</code><small>${SITE.esc(s.zh.slice(0,26))}…</small></button>`}
function render(){
 document.getElementById("tabs").innerHTML=views.map(v=>`<button role="tab" data-view="${v[0]}" aria-selected="${view===v[0]}">${v[1]}</button>`).join("");
 const el=document.getElementById("view");
 if(view==="flow") el.innerHTML='<div class="cols">'+D.steps.map(st=>`<div class="col"><h3>${SITE.bi(st.zh,st.en)}</h3>${D.skills.filter(s=>s.step===st.id).map(node).join("")}</div>`).join("")+"</div>";
 else if(view==="plugin") el.innerHTML='<div class="groups">'+D.plugins.map(p=>`<div class="group"><h3><code>${p.id}</code><span class="en">${p.deps.length?"depends on → "+p.deps.join(", "):"no dependencies"}</span></h3>${D.skills.filter(s=>s.plugin===p.id).map(node).join("")}</div>`).join("")+'</div><p style="margin-top:12px">dev-app / dev-web → dev → core</p>';
 else el.innerHTML='<div class="tw"><table><tr><th>專案類型 Project type</th>'+D.plugins.map(p=>`<th>${p.id}</th>`).join("")+"</tr>"+D.roles.map(r=>`<tr><td>${SITE.bi(r.zh,r.en)}</td>${D.plugins.map(p=>`<td>${r.plugins.includes(p.id)?"●":""}</td>`).join("")}</tr>`).join("")+"</table></div>";
 panel();
}
function panel(){
 const s=D.skills.find(x=>x.id===sel),el=document.getElementById("panel");
 if(!s){el.innerHTML='<p>點一個節點。<span class="en">Select a node.</span></p>';return}
 el.innerHTML=`<h3><code>${s.id}</code></h3><div>${SITE.badges(s)}</div><p style="font-size:13px;color:var(--muted)">${s.plugin}${s.version?" · v"+s.version:""}${s.source?" · "+SITE.esc(s.source):""}</p><p>${SITE.bi(s.zh,s.en)}</p><p style="font-size:13px"><b>何時用 When</b><br>${SITE.bi(s.whenZh,s.whenEn)}</p><p><code>${SITE.esc(s.invoke)}</code></p>`;
}
document.addEventListener("click",e=>{
 const t=e.target.closest("[data-view]"),n=e.target.closest(".node");
 if(t){view=t.dataset.view;setHash();render()}
 else if(n){sel=n.dataset.id;setHash();render();const b=document.querySelector(`.node[data-id="${sel}"]`);b&&b.focus()}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){sel=null;setHash();render()}});
window.addEventListener("hashchange",()=>{parse();render()});
SITE.load("../").then(d=>{D=d;document.getElementById("gh").href=SITE.repo;parse();render()});
})();
