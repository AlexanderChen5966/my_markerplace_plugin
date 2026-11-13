window.SITE={
  repo:"https://github.com/AlexanderChen5966/my_marketplace_plugin",
  load(base){return fetch(base+"data/skills.json").then(r=>r.json())},
  esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))},
  bi(zh,en){return `${this.esc(zh)}<span class="en">${this.esc(en)}</span>`},
  badges(s){let h="";if(s.manual)h+='<span class="badge manual">手動 manual</span>';if(s.cond)h+='<span class="badge cond">有條件 conditional</span>';if(s.claudeOnly)h+='<span class="badge">Claude only</span>';if(s.kind==="agent")h+='<span class="badge cond">agent</span>';return h}
};
