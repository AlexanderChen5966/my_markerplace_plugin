window.SITE={
  repo:"https://github.com/AlexanderChen5966/my_marketplace_plugin",
  load(base){return fetch(base+"data/skills.json").then(r=>r.json())},
  esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))},
  theme(btn){
    const root=document.documentElement;let saved=null;
    try{saved=localStorage.getItem("theme")}catch(e){}
    root.setAttribute("data-theme",saved||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));
    if(btn)btn.addEventListener("click",()=>{
      const cur=root.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
      const next=cur==="dark"?"light":"dark";root.setAttribute("data-theme",next);
      try{localStorage.setItem("theme",next)}catch(e){}
    });
  }
};
