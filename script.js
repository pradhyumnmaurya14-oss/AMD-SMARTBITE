/* SmartBite — Assistant Logic v3.1 */
(function(){
'use strict';

const state={foods:[],tips:[],insightTexts:{},selectedFood:null,context:{time:autoTime(),goal:'maintenance',mood:'active'},history:[],streak:0,bestStreak:0,lastLogDate:null,ok:true};
const $=id=>document.getElementById(id);
const $$=s=>document.querySelectorAll(s);

async function init(){
  try{localStorage.setItem('t','1');localStorage.removeItem('t')}catch(e){state.ok=false}
  await loadData();loadLS();setupGreeting();setupNav();setupSearch();setupChips();setupCtx();setupBtns();
  updateDash();renderHist();renderInsights();rotateTip();initAmbient();
}

async function loadData(){
  try{const r=await fetch('data.json');const d=await r.json();state.foods=d.foods||[];state.tips=d.tips||[];state.insightTexts=d.insights||{}}
  catch(e){toast('Could not load food data.')}
}

function loadLS(){
  if(!state.ok)return;
  state.history=JSON.parse(localStorage.getItem('sb_h')||'[]');
  state.streak=+(localStorage.getItem('sb_s')||0);
  state.bestStreak=+(localStorage.getItem('sb_bs')||0);
  state.lastLogDate=localStorage.getItem('sb_ld');
  if(state.lastLogDate){const d=Math.floor((new Date()-new Date(state.lastLogDate))/864e5);if(d>1)state.streak=0}
  $('streakCount').textContent=state.streak;
}

function saveLS(){
  if(!state.ok)return;
  localStorage.setItem('sb_h',JSON.stringify(state.history.slice(0,15)));
  localStorage.setItem('sb_s',state.streak);
  localStorage.setItem('sb_bs',state.bestStreak);
  localStorage.setItem('sb_ld',state.lastLogDate);
}

function autoTime(){const h=new Date().getHours();return h<12?'morning':h<17?'afternoon':'night'}

function setupGreeting(){
  const h=new Date().getHours();
  $('greetingText').textContent=(h<12?'Good morning':h<17?'Good afternoon':'Good evening')+' 👋';
}

function setupNav(){
  $$('.nav-btn').forEach(b=>b.onclick=()=>{
    $$('.nav-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    $$('.view').forEach(v=>v.classList.remove('active'));$('view-'+b.dataset.view).classList.add('active');
    if(b.dataset.view==='dashboard')updateDash();
    if(b.dataset.view==='history'){renderHist();renderInsights()}
  });
}

function setupSearch(){
  const inp=$('searchInput'),dd=$('autocomplete');
  inp.oninput=()=>{
    const q=inp.value.trim().toLowerCase();
    if(q.length<1){dd.classList.remove('show');return}
    const m=state.foods.filter(f=>f.name.toLowerCase().includes(q)||f.category.toLowerCase().includes(q)||(f.tags||[]).some(t=>t.includes(q))).slice(0,6);
    dd.innerHTML='';
    if(!m.length){dd.classList.remove('show');return}
    m.forEach(f=>{
      const d=document.createElement('div');d.className='autocomplete-item';d.tabIndex=0;
      d.innerHTML=`<span>${f.emoji}</span><span>${f.name}</span><span class="cal">${f.calories} kcal</span>`;
      const pick=()=>{selectFood(f);inp.value=f.name;dd.classList.remove('show')};
      d.onclick=pick;d.onkeydown=e=>{if(e.key==='Enter')pick()};
      dd.appendChild(d);
    });
    dd.classList.add('show');
  };
  inp.onkeydown=e=>{
    const items=[...dd.querySelectorAll('.autocomplete-item')];
    const i=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();items[Math.min(i+1,items.length-1)]?.focus()}
    else if(e.key==='ArrowUp'){e.preventDefault();items[Math.max(i-1,0)]?.focus()}
    else if(e.key==='Escape')dd.classList.remove('show');
    else if(e.key==='Enter'&&dd.classList.contains('show')&&items.length)items[0].click();
  };
  document.onclick=e=>{if(!e.target.closest('.search-wrap'))dd.classList.remove('show')};
}

function setupChips(){
  const ids=[7,1,6,24,14,27,8];
  const c=$('quickChips');
  ids.forEach(id=>{const f=state.foods.find(x=>x.id===id);if(f){
    const b=document.createElement('button');b.className='chip';b.textContent=f.emoji+' '+f.name;
    b.onclick=()=>{selectFood(f);$('searchInput').value=f.name};c.appendChild(b);
  }});
}

function selectFood(food){
  state.selectedFood=food;
  const p=$('resultPanel');p.classList.add('show');
  $('foodEmoji').textContent=food.emoji;
  $('foodName').textContent=food.name;
  $('foodCategory').textContent=food.category;

  anim('mCal',food.calories,'');anim('mPro',food.protein,'g');anim('mCarb',food.carbs,'g');anim('mFat',food.fats,'g');

  // Macro bar accents
  setTimeout(()=>{
    document.querySelectorAll('.macro').forEach(m=>{
      const w=m.classList.contains('cal')?Math.min(food.calories/2000*100,100):
              m.classList.contains('pro')?Math.min(food.protein/50*100,100):
              m.classList.contains('carb')?Math.min(food.carbs/300*100,100):
              Math.min(food.fats/70*100,100);
      m.querySelector('::after');//CSS handles via width
      m.style.setProperty('--bar-w',w+'%');
      // Actually set via pseudo — use a real element approach
    });
  },50);

  // Score ring
  const s=food.healthScore||0;
  const circ=2*Math.PI*34;
  const ring=$('ringFill');
  ring.style.strokeDasharray=circ;
  ring.style.stroke=s>=70?'var(--green)':s>=40?'var(--orange)':'var(--red)';
  setTimeout(()=>{ring.style.strokeDashoffset=circ-(s/100)*circ},50);
  anim('scoreNum',s,'');

  genSuggestions();
}

function anim(id,end,suf){
  const el=$(id);let start=0;const t0=performance.now();
  function step(now){
    const p=Math.min((now-t0)/700,1);
    el.textContent=Math.round(start+(end-start)*p)+suf;
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setupCtx(){
  ['contextTime','contextGoal','contextMood'].forEach(id=>{
    const key=id.replace('context','').toLowerCase();
    const btns=$(id).querySelectorAll('.ctx-btn');
    btns.forEach(b=>{
      if(b.dataset.value===state.context[key])b.classList.add('active');
      b.onclick=()=>{
        btns.forEach(x=>x.classList.remove('active'));b.classList.add('active');
        state.context[key]=b.dataset.value;
        if(state.selectedFood)genSuggestions();
      };
    });
  });
}

function genSuggestions(){
  const cur=state.selectedFood;if(!cur)return;
  const ctx=state.context;
  const scored=state.foods.filter(f=>f.id!==cur.id).map(f=>{
    let s=0;
    if((f.bestTime||[]).includes(ctx.time))s+=3;
    if((f.goals||[]).includes(ctx.goal))s+=4;
    if((f.moods||[]).includes(ctx.mood))s+=2;
    if(f.healthScore>cur.healthScore)s+=2;
    if(ctx.goal==='weight-loss'&&f.calories<cur.calories)s+=3;
    if(ctx.goal==='muscle-gain'&&f.protein>cur.protein)s+=3;
    return{...f,rel:s};
  }).sort((a,b)=>b.rel-a.rel).slice(0,3);

  const best=scored[0];
  if(cur.healthScore>=80){
    $('suggestTitle').textContent=`${cur.name} is already a great choice!`;
    $('suggestReason').textContent='Your selection scores highly for your current profile. Here are some tasty alternatives:';
  }else if(best){
    $('suggestTitle').textContent=`Try ${best.name} instead`;
    $('suggestReason').textContent=`For your ${ctx.goal.replace('-',' ')} goal during the ${ctx.time}, ${best.name} offers ${best.healthScore>cur.healthScore?'a better health score':'a more suitable macro balance'}${ctx.goal==='weight-loss'&&best.calories<cur.calories?' and fewer calories':ctx.goal==='muscle-gain'&&best.protein>cur.protein?' and more protein':''}.`;
  }

  const c=$('suggestCards');c.innerHTML='';
  scored.forEach(f=>{
    const card=document.createElement('div');card.className='sug-card';
    const sc=f.healthScore>=70?'high':'mid';
    card.innerHTML=`<span class="sug-emoji">${f.emoji}</span><span class="sug-name">${f.name}</span><span class="sug-meta">${f.calories} cal · ${f.protein}g protein</span><span class="sug-score ${sc}">${f.healthScore}</span>`;
    card.onclick=()=>{selectFood(f);$('searchInput').value=f.name};
    c.appendChild(card);
  });
  $('suggestBlock').classList.add('show');
}

function setupBtns(){
  $('btnLog').onclick=()=>{
    const f=state.selectedFood;if(!f)return;
    state.history.unshift({id:f.id,name:f.name,emoji:f.emoji,calories:f.calories,protein:f.protein,carbs:f.carbs,fats:f.fats,healthScore:f.healthScore,time:state.context.time,timestamp:new Date().toISOString()});
    if(state.history.length>15)state.history=state.history.slice(0,15);
    const today=new Date().toDateString();
    if(state.lastLogDate!==today){
      const yd=new Date();yd.setDate(yd.getDate()-1);
      state.streak=state.lastLogDate===yd.toDateString()?state.streak+1:1;
      state.lastLogDate=today;
      if(state.streak>state.bestStreak)state.bestStreak=state.streak;
    }
    $('streakCount').textContent=state.streak;
    saveLS();toast('Logged '+f.name+'! ✅');
  };

  $('btnSwap').onclick=()=>{
    const f=state.selectedFood;
    if(!f||!f.alternatives||!f.alternatives.length)return toast('No alternatives available.');
    const alt=state.foods.find(x=>x.id===f.alternatives[Math.floor(Math.random()*f.alternatives.length)]);
    if(alt){selectFood(alt);$('searchInput').value=alt.name;toast('Swapped to '+alt.name)}
  };
}

function updateDash(){
  const h=state.history;
  if(!h.length){$('dashCalTotal').textContent='0';$('statAvg').textContent='—';$('statMeals').textContent='0';$('statStreak').textContent=state.bestStreak;return}
  const today=h.filter(e=>new Date(e.timestamp).toDateString()===new Date().toDateString());
  const tc=today.reduce((s,e)=>s+e.calories,0);
  const tp=today.reduce((s,e)=>s+e.protein,0),tca=today.reduce((s,e)=>s+e.carbs,0),tf=today.reduce((s,e)=>s+e.fats,0);
  $('dashCalTotal').textContent=tc;
  const sum=tp+tca+tf||1;
  $('dashDonut').style.background=`linear-gradient(to right,var(--green) ${(tp/sum)*100}%,var(--orange) ${(tp/sum)*100}% ${((tp+tca)/sum)*100}%,var(--red) ${((tp+tca)/sum)*100}% 100%)`;
  $('dashLegend').textContent=`Protein: ${tp}g · Carbs: ${tca}g · Fats: ${tf}g`;

  const bars=$('dashBars');bars.innerHTML='';
  h.slice(0,5).forEach(e=>{
    const d=document.createElement('div');d.className='hist-item';
    d.innerHTML=`<span class="hist-emoji">${e.emoji}</span><div class="hist-info"><div class="hist-name">${e.name}</div></div><span class="hist-meta">${e.calories} cal</span>`;
    bars.appendChild(d);
  });

  $('statAvg').textContent=Math.round(h.reduce((s,e)=>s+e.healthScore,0)/h.length);
  $('statMeals').textContent=h.length;
  $('statStreak').textContent=state.bestStreak;
}

function renderHist(){
  const list=$('historyList');list.innerHTML='';
  if(!state.history.length){list.innerHTML='<div class="empty-msg">No meals logged yet. Search and log your first meal!</div>';return}
  state.history.forEach((e,i)=>{
    const d=document.createElement('div');d.className='hist-item';
    const sc=e.healthScore>=70?'high':e.healthScore>=40?'mid':'low';
    d.innerHTML=`<span class="hist-emoji">${e.emoji}</span><div class="hist-info"><div class="hist-name">${e.name}</div><div class="hist-meta">${new Date(e.timestamp).toLocaleDateString()} · ${e.calories} kcal</div></div><span class="hist-score ${sc}">${e.healthScore}</span><button class="hist-del" onclick="window._del(${i})">✕</button>`;
    list.appendChild(d);
  });
}

window._del=i=>{state.history.splice(i,1);saveLS();renderHist();renderInsights();updateDash()};

function renderInsights(){
  const g=$('insightsGrid');g.innerHTML='';const h=state.history;
  if(h.length<3){g.innerHTML='<div class="empty-msg">Log 3+ meals to unlock AI pattern insights.</div>';return}
  const ins=[];
  if(h.filter(e=>e.time==='night'&&e.calories>500).length>=2)ins.push({icon:'🌙',text:'Late-night high-calorie meals detected. Consider lighter options after 8 PM.'});
  if(h.filter(e=>e.protein<10).length>h.length*0.4)ins.push({icon:'💪',text:'Your protein intake is below recommended levels. Try adding eggs, chicken, or Greek yogurt.'});
  if(h.filter(e=>e.healthScore>=75).length>=3)ins.push({icon:'🌟',text:'Great streak! You\'ve consistently picked high-scoring meals. Keep it up!'});
  if(!ins.length)ins.push({icon:'📊',text:'Your patterns look stable. Keep logging to unlock deeper insights.'});
  ins.forEach(x=>{
    const c=document.createElement('div');c.className='insight-card';
    c.innerHTML=`<span class="insight-icon">${x.icon}</span><span class="insight-text">${x.text}</span>`;
    g.appendChild(c);
  });
}

function rotateTip(){if(state.tips.length)$('tipText').textContent=state.tips[Math.floor(Math.random()*state.tips.length)]}

function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}

// Ambient constellation canvas
function initAmbient(){
  const c=$('ambientCanvas');if(!c)return;
  const ctx=c.getContext('2d');
  let w,h,pts=[];
  function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight;pts=[];for(let i=0;i<40;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3})}
  resize();window.addEventListener('resize',resize);
  function draw(){
    ctx.clearRect(0,0,w,h);
    pts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>w)p.vx*=-1;
      if(p.y<0||p.y>h)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,Math.PI*2);ctx.fillStyle='rgba(0,212,255,0.22)';ctx.fill();
    });
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<120){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(0,212,255,${0.06*(1-dist/120)})`;ctx.stroke()}
    }
    requestAnimationFrame(draw);
  }
  if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches)draw();
}

document.addEventListener('DOMContentLoaded',init);
})();
