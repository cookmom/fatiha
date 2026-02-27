// Global image error handler — replace broken images with placeholder
document.addEventListener('error',function(e){
  if(e.target.tagName==='IMG'&&!e.target.dataset.fallback){
    e.target.dataset.fallback='1';
    e.target.src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22400%22%20height=%22300%22%3E%3Cdefs%3E%3ClinearGradient%20id=%22g%22%20x1=%220%22%20y1=%220%22%20x2=%221%22%20y2=%221%22%3E%3Cstop%20offset=%220%25%22%20stop-color=%22%23111118%22/%3E%3Cstop%20offset=%22100%25%22%20stop-color=%22%230e0e14%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20fill=%22url(%23g)%22%20width=%22400%22%20height=%22300%22/%3E%3C/svg%3E";
  }
},true);

const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const now=new Date();
function daysBetween(a,b){return Math.ceil((b-a)/86400000);}
function formatTime(d){return new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function urlify(text){
  const re=/(https?:\/\/[^\s]+)/g;let out='',m,last=0;
  while((m=re.exec(text))!==null){
    if(m.index>last) out+=esc(text.slice(last,m.index));
    out+=`<a class="link-card" href="${esc(m[1])}" target="_blank" rel="noopener">${esc(m[1])}</a>`;
    last=re.lastIndex;
  }
  if(last<text.length) out+=esc(text.slice(last));
  return out;
}

// ── Date ──
$('#stageDate').textContent=now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});

// ── Deadlines ──
(function(){
  const sorted=[...DEADLINES].sort((a,b)=>a.date-b.date);
  const nearest=sorted.find(d=>d.date>=now)||sorted[sorted.length-1];
  const days=daysBetween(now,nearest.date);
  const dotColor=days<7?'var(--red)':days<30?'var(--amber)':'var(--emerald)';
  $('#dlDot').style.background=dotColor;
  $('#dlCountdown').textContent=days+'d';
  $('#dlName').textContent=nearest.emoji+' '+nearest.name;
  $('#dlExpand').innerHTML=sorted.map(d=>{
    const dd=daysBetween(now,d.date);
    const c=dd<7?'var(--red)':dd<30?'var(--amber)':'var(--emerald)';
    return `<div class="dl-row"><span class="dot" style="background:${c}"></span><span>${d.emoji} ${esc(d.name)}</span><span class="dl-days">${d.date.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · ${dd}d</span></div>`;
  }).join('');
  $('#deadlineBar').addEventListener('click',()=>$('#deadlineBar').classList.toggle('open'));
})();

// ── Code Canvas Tabs (Preview/Editor) ──
function switchStageTab(tab){
  $$('.code-canvas-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  $('#canvasView').classList.toggle('hidden',tab!=='canvas');
  $('#codeView').classList.toggle('hidden',tab!=='code');
}
$$('.code-canvas-tab').forEach(t=>t.addEventListener('click',()=>switchStageTab(t.dataset.tab)));

// ── Reference Tabs ──
function switchRefTab(tab){
  $$('.ref-tab').forEach(t=>t.classList.toggle('active',t.dataset.ref===tab));
  $$('.ref-pane').forEach(p=>p.classList.toggle('active',p.dataset.refpane===tab));
}
$$('.ref-tab').forEach(t=>t.addEventListener('click',()=>switchRefTab(t.dataset.ref)));

// ── Code Editor ──
const codeEditor=$('#codeEditor');
const canvasFrame=$('#canvasFrame');
const lineNumbers=$('#lineNumbers');
codeEditor.value=STARTER_SKETCH;
updateLineNumbers();

function updateLineNumbers(){
  const lines=codeEditor.value.split('\n').length;
  lineNumbers.textContent=Array.from({length:lines},(_,i)=>i+1).join('\n');
}
codeEditor.addEventListener('input',()=>{
  updateLineNumbers();
  if($('#autoRun').checked){clearTimeout(codeEditor._d);codeEditor._d=setTimeout(runCode,500);}
});
codeEditor.addEventListener('scroll',()=>{lineNumbers.style.transform=`translateY(-${codeEditor.scrollTop}px)`;});
codeEditor.addEventListener('keydown',e=>{
  if(e.key==='Tab'){e.preventDefault();const s=codeEditor.selectionStart,end=codeEditor.selectionEnd;codeEditor.value=codeEditor.value.substring(0,s)+'  '+codeEditor.value.substring(end);codeEditor.selectionStart=codeEditor.selectionEnd=s+2;updateLineNumbers();}
});

// ── Canvas ──
let currentAspect='9:16';

function updateCanvasSize(){
  const container=$('#canvasContainer');
  const cw=container.clientWidth;
  const ch=container.clientHeight;
  const frame=canvasFrame;
  if(currentAspect==='fill'){
    frame.style.width='100%';frame.style.height='100%';
  } else {
    let ratio;
    if(currentAspect==='1:1') ratio=1;
    else if(currentAspect==='9:16') ratio=9/16;
    else ratio=16/9;
    let w=cw,h=cw/ratio;
    if(h>ch){h=ch;w=ch*ratio;}
    frame.style.width=w+'px';frame.style.height=h+'px';
  }
}

function runCode(){
  const code=codeEditor.value;
  updateCanvasSize();
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:#0a0a0b;width:100%;height:100%;}canvas{display:block;}</style><script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"><\/script></head><body><script>${code}<\/script></body></html>`;
  canvasFrame.srcdoc=html;
}

$('#runBtn').addEventListener('click',()=>{switchStageTab('canvas');runCode();});

$$('.aspect-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('.aspect-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentAspect=btn.dataset.aspect;
    updateCanvasSize();
  });
});

// Save/Load
const SK_KEY='chef-workspace-sketches';
function getSketches(){try{return JSON.parse(localStorage.getItem(SK_KEY)||'[]');}catch(e){return[];}}
function saveSketches(a){localStorage.setItem(SK_KEY,JSON.stringify(a));}
function refreshLoad(){
  const sel=$('#loadSelect');const sk=getSketches();
  sel.innerHTML='<option value="">Load…</option>'+sk.map((s,i)=>`<option value="${i}">${esc(s.name)}</option>`).join('');
}
refreshLoad();
$('#saveBtn').addEventListener('click',()=>{
  const name=$('#saveName').value.trim()||('Sketch '+new Date().toLocaleTimeString());
  const sk=getSketches();sk.push({name,code:codeEditor.value,timestamp:Date.now()});
  saveSketches(sk);refreshLoad();$('#saveName').value='';
});
$('#loadSelect').addEventListener('change',e=>{
  const idx=e.target.value;if(idx==='')return;
  const sk=getSketches();if(sk[idx]){codeEditor.value=sk[idx].code;updateLineNumbers();switchStageTab('canvas');runCode();}
  e.target.value='';
});

// Run on load
setTimeout(()=>{updateCanvasSize();runCode();},100);
window.addEventListener('resize',()=>{updateCanvasSize();});

// ── Bookmarks ──
const BM_KEY='chef-kitchen-bookmarks';
const VOTE_KEY='chef-kitchen-votes';
function getVotes(){try{return JSON.parse(localStorage.getItem(VOTE_KEY)||'{}');}catch(e){return {};}}
function setVotes(v){localStorage.setItem(VOTE_KEY,JSON.stringify(v));}
function getVote(id){return getVotes()[id]||0;}
function vote(id,dir,e){
  if(e)e.stopPropagation();
  const votes=getVotes();
  const cur=votes[id]||0;
  votes[id]=cur===dir?0:dir; // toggle if same direction
  setVotes(votes);
  sendContext((votes[id]>0?'👍 upvoted':votes[id]<0?'👎 downvoted':'removed vote on')+': "'+INSPIRATIONS.find(i=>i.id===id).title+'"',true);
  renderInspoCards();
}
window.vote=vote;
function getBookmarks(){try{return JSON.parse(localStorage.getItem(BM_KEY)||'[]');}catch(e){return[];}}
function saveBookmarks(bm){localStorage.setItem(BM_KEY,JSON.stringify(bm));}
function isBookmarked(id){return getBookmarks().includes(id);}
function toggleBookmark(id,e){
  e.stopPropagation();
  let bm=getBookmarks();
  const wasBookmarked=bm.includes(id);
  if(wasBookmarked) bm=bm.filter(b=>b!==id); else bm.push(id);
  saveBookmarks(bm);
  renderInspoCards();
  const item=INSPIRATIONS.find(it=>it.id===id);
  if(item) sendContext((wasBookmarked?'unbookmarked':'bookmarked')+': "'+item.title+'"', true);
}
window.toggleBookmark=toggleBookmark;

let inspoFilterMode='all'; // 'all' | 'bookmarked'

let inspoLoaded=0;
const INSPO_BATCH=20;
let inspoFiltered=[];

function renderInspoCards(){
  const bm=getBookmarks();
  const items=INSPIRATIONS.map((item,i)=>({...item,idx:i}));
  const votes=getVotes();
  if(inspoFilterMode==='bookmarked') inspoFiltered=items.filter(it=>bm.includes(it.id));
  else if(inspoFilterMode==='ranked') inspoFiltered=[...items].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0));
  else inspoFiltered=items;
  inspoLoaded=0;
  $('#inspoPane').innerHTML='';
  loadMoreInspo();
  $('#bookmarkCount').textContent=bm.length ? bm.length+' saved' : '';
}

function loadMoreInspo(){
  const bm=getBookmarks();
  const batch=inspoFiltered.slice(inspoLoaded, inspoLoaded+INSPO_BATCH);
  if(!batch.length) return;
  const votes=getVotes();
  const html=batch.map(item=>{
    const starred=bm.includes(item.id);
    const vt=votes[item.id]||0;
    return `<div class="insp-card-s" onclick="showInspDetail(${item.idx})" style="display:flex;gap:8px;align-items:flex-start;">
      ${(item.img && !item.img.startsWith('data:')) ? '<img src="'+item.img+'" style="width:52px;height:40px;object-fit:cover;border-radius:6px;flex-shrink:0;margin-top:2px;border:1px solid var(--border-subtle);">' : ''}
      <div style="min-width:0;flex:1;">
        <span class="cat-pill cat-${item.cat}">${item.cat}</span>
        <h4>${esc(item.title)}</h4>
        <div class="desc">${esc(item.desc)}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;">
        <button onclick="vote('${item.id}',1,event)" style="background:none;border:none;cursor:pointer;font-size:11px;padding:0;opacity:${vt===1?'1':'.3'};color:${vt===1?'var(--emerald)':'var(--text-muted)'}" title="Upvote">▲</button>
        <span style="font-size:10px;color:${vt>0?'var(--emerald)':vt<0?'var(--red)':'var(--text-muted)'};font-weight:600;">${vt||''}</span>
        <button onclick="vote('${item.id}',-1,event)" style="background:none;border:none;cursor:pointer;font-size:11px;padding:0;opacity:${vt===-1?'1':'.3'};color:${vt===-1?'var(--red)':'var(--text-muted)'}" title="Downvote">▼</button>
      </div>
    </div>`;
  }).join('');
  // Remove old load-more button if exists
  const oldBtn=$('#inspoPane .load-more-btn');
  if(oldBtn)oldBtn.remove();
  
  $('#inspoPane').insertAdjacentHTML('beforeend', html);
  inspoLoaded+=batch.length;
  
  // Add load more button if there are more
  if(inspoLoaded<inspoFiltered.length){
    $('#inspoPane').insertAdjacentHTML('beforeend', 
      '<button class="load-more-btn" onclick="loadMoreInspo()" style="width:100%;padding:10px;margin:8px 0;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:11px;cursor:pointer;transition:all .18s;">↓ Load more ('+( inspoFiltered.length-inspoLoaded)+' remaining)</button>'
    );
  }
}

$('#filterAll').addEventListener('click',()=>{
  inspoFilterMode='all';
  $$('.bookmark-filter-btn').forEach(b=>b.classList.remove('active'));
  $('#filterAll').classList.add('active');
  renderInspoCards();
});
$('#filterBookmarked').addEventListener('click',()=>{
  inspoFilterMode='bookmarked';
  $$('.bookmark-filter-btn').forEach(b=>b.classList.remove('active'));
  $('#filterBookmarked').classList.add('active');
  renderInspoCards();
});
$('#filterRanked').addEventListener('click',()=>{
  inspoFilterMode='ranked';
  $$('.bookmark-filter-btn').forEach(b=>b.classList.remove('active'));
  $('#filterRanked').classList.add('active');
  renderInspoCards();
});

renderInspoCards();
// Load more on scroll — listen on ref-content AND check periodically
document.querySelector('.ref-content').addEventListener('scroll', function(){
  if(this.scrollTop+this.clientHeight>=this.scrollHeight-200) loadMoreInspo();
});

let lbImages=[], lbIndex=0;
function openLightbox(src, galleryArr){
  const item=INSPIRATIONS[+localStorage.getItem('chef-kitchen-lastInspo')||0];
  lbImages=galleryArr||(item&&item.gallery)||[src];
  lbIndex=Math.max(0,lbImages.indexOf(src));
  renderLightbox();
}
function renderLightbox(){
  let lb=document.querySelector('.gallery-lightbox');
  if(!lb){
    lb=document.createElement('div');lb.className='gallery-lightbox';
    $('#spotlightViewer').appendChild(lb);
  }
  const src=lbImages[lbIndex];
  const hasMultiple=lbImages.length>1;
  lb.innerHTML=`
    ${hasMultiple?'<button class="lb-nav lb-prev" onclick="event.stopPropagation();lbNav(-1)">‹</button>':''}
    <img src="${src}">
    ${hasMultiple?'<button class="lb-nav lb-next" onclick="event.stopPropagation();lbNav(1)">›</button>':''}
    ${hasMultiple?'<span class="lb-counter">'+(lbIndex+1)+' / '+lbImages.length+'</span>':''}
  `;
  lb.onclick=function(e){if(e.target===lb)lb.remove();};
  // Tell chef (debounced — only fires after 1s pause)
  const item=INSPIRATIONS[+localStorage.getItem('chef-kitchen-lastInspo')||0];
  sendContext('🖼️ viewing image '+(lbIndex+1)+'/'+lbImages.length+': '+src+' (from "'+item.title+'")');
}
function lbNav(dir){
  lbIndex=(lbIndex+dir+lbImages.length)%lbImages.length;
  renderLightbox();
}
window.openLightbox=openLightbox;
window.lbNav=lbNav;
document.addEventListener('keydown',function(e){
  const lb=document.querySelector('.gallery-lightbox');
  if(!lb)return;
  if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();lbNav(1);}
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();lbNav(-1);}
  else if(e.key==='Escape'){lb.remove();}
});
window.openLightbox=openLightbox;

let currentInspoIdx=-1;

// Keyboard nav for inspo viewer
document.addEventListener('keydown',function(e){
  if(currentInspoIdx<0)return;
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  const item=INSPIRATIONS[currentInspoIdx];
  const sameCat=INSPIRATIONS.map((it,i)=>({...it,idx:i})).filter(it=>it.cat===item.cat);
  const pos=sameCat.findIndex(it=>it.idx===currentInspoIdx);
  if(e.key==='ArrowLeft'){e.preventDefault();showInspDetail(sameCat[(pos-1+sameCat.length)%sameCat.length].idx);}
  if(e.key==='ArrowRight'){e.preventDefault();showInspDetail(sameCat[(pos+1)%sameCat.length].idx);}
});

function showInspDetail(idx){
  const item=INSPIRATIONS[idx];
  sendContext('viewing inspo: "'+item.title+'" ['+item.cat+'] — '+item.desc+(item.chefTake?' | chef noted: '+item.chefTake.slice(0,200)+'…':''));
  const sameCat=INSPIRATIONS.map((it,i)=>({...it,idx:i})).filter(it=>it.cat===item.cat);
  const pos=sameCat.findIndex(it=>it.idx===idx);
  const prev=sameCat[(pos-1+sameCat.length)%sameCat.length].idx;
  const next=sameCat[(pos+1)%sameCat.length].idx;
  const imgs=item.gallery||[item.img].filter(Boolean);
  const vids=item.videos||[];
  const heroImg=imgs[0]||'';
  const thumbs=imgs.length>1?imgs:[];

  currentInspoIdx=idx;
  // Update header nav
  $('#spotNavInfo').textContent=`${pos+1}/${sameCat.length} ${item.cat}`;
  const prevBtn=$('#spotPrev'), nextBtn=$('#spotNext');
  prevBtn.style.display='inline-block'; nextBtn.style.display='inline-block';
  prevBtn.onclick=()=>showInspDetail(prev);
  nextBtn.onclick=()=>showInspDetail(next);
  
  const sc=$('#spotlightContent');
  let html='';
  // Info
  html+=`<span class="cat-pill cat-${item.cat}">${item.cat}</span>`;
  html+=`<h2>${esc(item.title)}</h2>`;
  html+=`<div class="desc">${esc(item.desc)}</div>`;
  const bmd=isBookmarked(item.id);
  html+=`<div style="display:flex;align-items:center;gap:10px;margin:10px 0 16px;">
    <button class="bookmark-btn ${bmd?'bookmarked':''}" onclick="toggleBookmark('${item.id}',event);showInspDetail(${idx});" style="font-size:18px;padding:6px 14px;" title="${bmd?'Remove bookmark':'Save to bookmarks'}">${bmd?'saved':'save'}</button>
    <a class="source-link" href="${esc(item.link)}" target="_blank" rel="noopener">View source ↗</a>
  </div>`;
  // Detail section
  if(item.detail){
    html+=`<div class="detail-section"><div class="detail-section-label">About this project</div>${esc(item.detail)}</div>`;
  }
  // Chef's take
  if(item.chefTake){
    html+=`<div class="chef-take"><div class="chef-take-label">chef's take</div>${esc(item.chefTake)}</div>`;
  }
  // Hero image
  if(heroImg && !heroImg.startsWith('data:')) html+=`<img class="gallery-hero" src="${heroImg}" onclick="openLightbox('${heroImg}')" style="margin-top:16px;">`;
  // Video embeds
  if(vids.length){
    html+='<div class="gallery-section-label">Video</div>';
    vids.forEach(v=>{
      if(v.endsWith('.mp4')||v.endsWith('.webm')){
        html+=`<video class="gallery-video" src="${v}" controls loop muted playsinline style="aspect-ratio:auto;max-height:500px;"></video>`;
      } else {
        html+=`<iframe class="gallery-video" src="${v}" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      }
    });
  }
  // Thumbnail grid
  if(thumbs.length>1){
    html+='<div class="gallery-section-label">Gallery ('+imgs.length+')</div><div class="gallery-grid">';
    thumbs.forEach(src=>{html+=`<img src="${src}" onclick="openLightbox('${src}')" loading="lazy">`;});
    html+='</div>';
  }
  html+=`<div class="insp-nav" style="margin-top:20px;">
      <button class="back-btn" onclick="hideSpotlight()">✕ Close</button>
    </div>`;
  sc.innerHTML=html;
  sc.classList.add('active');
  $('#spotlightPlaceholder').style.display='none';

  // Track + remember selection
  try{
    const interactions=JSON.parse(localStorage.getItem('chef-kitchen-interactions')||'{}');
    interactions[item.id]=(interactions[item.id]||0)+1;
    interactions._lastClick={id:item.id,time:Date.now()};
    localStorage.setItem('chef-kitchen-interactions',JSON.stringify(interactions));
    localStorage.setItem('chef-kitchen-lastInspo',String(idx));
  }catch(e){}
}
window.showInspDetail=showInspDetail;

function hideSpotlight(){
  $('#spotlightContent').classList.remove('active');
  $('#spotlightPlaceholder').style.display='';
}
window.hideSpotlight=hideSpotlight;

// ── Techniques Panel ──
$('#techPane').innerHTML=TECHNIQUES.map((t,i)=>`
  <div class="tech-card-s">
    <div class="info">
      <span class="cat-pill cat-${t.cat}">${t.cat}</span>
      <h4>${esc(t.name)}</h4>
    </div>
    <button class="load-btn" onclick="loadTechnique(${i})">Load</button>
  </div>
`).join('');

function loadTechnique(idx){
  const t=TECHNIQUES[idx];
  sendContext('loaded technique: "'+t.name+'" ['+t.cat+'] into stove');
  codeEditor.value=t.code;
  updateLineNumbers();
  switchStageTab('canvas');
  runCode();
}
window.loadTechnique=loadTechnique;

// ── Concepts Panel ──
(function(){
  let html='<div class="concepts-wrap"><div class="concepts-nav">';
  CONCEPTS.forEach((_,i)=>{
    const ch=i===0?'checked':'';
    html+=`<input type="radio" name="concept" id="c${i+1}" ${ch}><label for="c${i+1}">${i+1}</label>`;
  });
  html+='<div class="concept-panels">';
  CONCEPTS.forEach((c,i)=>{
    html+=`<div class="concept-panel cp${i+1}"><h3>"${esc(c.title)}"</h3><p>${esc(c.body)}</p></div>`;
  });
  html+='</div></div></div>';
  $('#conceptsPane').innerHTML=html;
})();

// ── Chat (OpenClaw WebSocket) ──
const CHAT_KEY='chef-kitchen-chat';
const GW_URL='ws://localhost:18789';
// Token is safe here — gateway binds to loopback only (127.0.0.1)
const GW_TOKEN='ea37aa65c6e799a551a5145a36eaa0d0015daf6c2739d313';
let ws=null, wsReady=false, currentRunId=null, streamBuffer='';
let chatMsgs=[];  // in-memory store (no localStorage dependency for file://)
let processMsgs=[];  // background process messages

// Detect process/system messages that should go to drawer instead of main chat
let expectingKitchenReply=false;

function isProcessMsg(text){
  if(!text)return false;
  if(text.startsWith('[ctx]'))return true;
  return false;
}

function addProcessMsg(text){
  processMsgs.push({text,time:Date.now()});
  if(processMsgs.length>50)processMsgs.shift();
  renderProcessPopup();
}

function renderProcessPopup(){
  const panel=$('#processPanel');
  const container=$('#processMessages');
  const count=$('#processCount');
  if(!panel||!container)return;
  if(!processMsgs.length){panel.classList.remove('open');if(count)count.textContent='idle';return;}
  if(count)count.textContent=processMsgs.length+' msgs';
  const now=Date.now();
  container.innerHTML=processMsgs.map(m=>{
    const fresh=(now-m.time)<10000;
    const time=new Date(m.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    return `<div class="process-msg ${fresh?'fresh':''}">[${time}] ${m.text.slice(0,300)}${m.text.length>300?'…':''}</div>`;
  }).join('');
  container.scrollTop=container.scrollHeight;
}

const _pt=$('#processToggle');
if(_pt) _pt.addEventListener('click',()=>$('#processPanel').classList.toggle('open'));

// Extract text from message content (handles string and array formats)
function extractText(msg){
  if(!msg)return null;
  if(typeof msg==='string')return msg;
  if(typeof msg.content==='string')return msg.content;
  if(Array.isArray(msg.content)){
    return msg.content.filter(c=>c.type==='text').map(c=>c.text||'').join('');
  }
  if(Array.isArray(msg)){
    return msg.filter(c=>c.type==='text').map(c=>c.text||'').join('');
  }
  return null;
}
function loadMsgs(){return chatMsgs;}
function saveMsgs(m){chatMsgs=m.slice(-200);}
function renderMsgs(){
  const msgs=loadMsgs().filter(m=>!m.text.startsWith('[ctx]')&&!isProcessMsg(m.text)&&m.text!=='⏳...');
  const html=msgs.map(m=>{
    const cls=m.sender==='user'?'user':'chef';
    return `<div class="chat-msg ${cls}">${urlify(m.text)}<span class="msg-time">${formatTime(m.timestamp)}</span></div>`;
  }).join('');
  const el=$('#chatMessages');if(el){el.innerHTML=html;el.scrollTop=el.scrollHeight;}
  const el2=$('#chatMessagesMobile');if(el2){el2.innerHTML=html;el2.scrollTop=el2.scrollHeight;}
}
function addChefMsgDirect(text){
  const msgs=loadMsgs();
  msgs.push({text,timestamp:Date.now(),sender:'chef'});
  saveMsgs(msgs);renderMsgs();
}
function addChefMsg(text){
  if(isProcessMsg(text))return;
  if(!expectingKitchenReply&&!text.startsWith('⚠️')&&!text.startsWith('❌')){addProcessMsg(text);return;}
  const msgs=loadMsgs();
  msgs.push({text,timestamp:Date.now(),sender:'chef'});
  saveMsgs(msgs);renderMsgs();
}
function updateLastChefMsg(text){
  if(isProcessMsg(text))return;
  if(!expectingKitchenReply&&!text.startsWith('⚠️')&&!text.startsWith('❌')){
    if(processMsgs.length){processMsgs[processMsgs.length-1].text=text;renderProcessPopup();}
    else addProcessMsg(text);
    return;
  }
  const msgs=loadMsgs();
  const lastChef=msgs.findLastIndex(m=>m.sender==='chef');
  if(lastChef>=0){msgs[lastChef].text=text;saveMsgs(msgs);renderMsgs();}
  else addChefMsg(text);
}

function wsConnect(){
  const token=GW_TOKEN;
  
  try{ ws=new WebSocket(GW_URL); }catch(e){ console.error('WS create failed:',e); addChefMsg('❌ WebSocket failed: '+e.message); return; }
  ws.onopen=()=>{
    console.log('WS open, sending connect...');
    ws.send(JSON.stringify({type:'req',method:'connect',id:'c1',params:{auth:{token},minProtocol:3,maxProtocol:3,client:{id:'webchat-ui',version:'0.3',platform:'web',mode:'webchat'}}}));
  };
  ws.onmessage=(e)=>{
    try{
      const msg=JSON.parse(e.data);
      console.log('WS msg:',msg.type,msg.method||msg.event||msg.id,msg.error||'');
      // Connection error
      if(msg.type==='res'&&msg.id==='c1'&&msg.error){
        addChefMsg('❌ Gateway: '+(msg.error.message||JSON.stringify(msg.error)));
        updateChatStatus('error');
        return;
      }
      // Connection ack
      if(msg.type==='res'&&msg.id==='c1'){
        wsReady=true;
        updateChatStatus('connected');
      }

      // chat.send ack
      if(msg.type==='res'&&msg.id==='s1'){
        const sendRes=msg.result||msg.payload;
        currentRunId=sendRes?.runId||null;
        if(sendRes?.status==='started'){streamBuffer='';expectingKitchenReply=true;addChefMsgDirect('...');}
      }
      // Streaming chat events (matches control UI protocol)
      if(msg.type==='event'&&msg.event==='chat'){
        const d=msg.payload||msg.data||{};
        const text=extractText(d.message);
        if(!expectingKitchenReply){
          if(text&&!text.startsWith('[ctx]')&&!text.match(/^(NO_REPLY|HEARTBEAT_OK)$/)) addProcessMsg(text);
          return;
        }
        // Skip NO_REPLY/HEARTBEAT_OK responses (from ctx events)
        if(text&&text.match(/^(NO_REPLY|HEARTBEAT_OK)$/)) return;
        // Skip empty/ctx
        if(!text||text.startsWith('[ctx]')) return;
        // This is a real reply — stream it
        if(d.state==='delta'){
          streamBuffer=text;
          const msgs=loadMsgs();
          const lc=msgs.findLastIndex(m=>m.sender==='chef');
          if(lc>=0){msgs[lc].text=text;saveMsgs(msgs);renderMsgs();}
        }
        if(d.state==='final'){
          if(text){const msgs=loadMsgs();const lc=msgs.findLastIndex(m=>m.sender==='chef');if(lc>=0){msgs[lc].text=text;saveMsgs(msgs);renderMsgs();}}
          streamBuffer='';currentRunId=null;expectingKitchenReply=false;
        }
        if(d.state==='error'||d.state==='aborted'){
          if(d.errorMessage){const msgs=loadMsgs();const lc=msgs.findLastIndex(m=>m.sender==='chef');if(lc>=0){msgs[lc].text='error: '+d.errorMessage;saveMsgs(msgs);renderMsgs();}}
          expectingKitchenReply=false;
          streamBuffer='';currentRunId=null;
        }
        // Legacy format fallback
        if(d.kind==='text-delta'&&d.delta){streamBuffer+=d.delta;updateLastChefMsg(streamBuffer);}
        if(d.kind==='text-done'&&d.text){updateLastChefMsg(d.text);streamBuffer='';currentRunId=null;}
        if(d.kind==='done'){if(streamBuffer)updateLastChefMsg(streamBuffer);streamBuffer='';currentRunId=null;}
      }
    }catch(err){console.error('WS parse error',err);}
  };
  ws.onclose=()=>{wsReady=false;updateChatStatus('disconnected');setTimeout(()=>wsConnect(),5000);};
  ws.onerror=()=>{wsReady=false;updateChatStatus('error');};
}

function updateChatStatus(s){
  const dot=s==='connected'?'🟢':s==='disconnected'?'🔴':'🟡';
  const el=$('#chatStatus');if(el)el.textContent=dot;
  const el2=$('#chatStatusMobile');if(el2)el2.textContent=dot;
}

function fetchLastResponse(){
  if(!wsReady||!ws)return;
  ws.send(JSON.stringify({type:'req',method:'chat.history',id:'h2',params:{sessionKey:'agent:main:main',limit:5}}));
}

// Silent context events — sent to chef but not shown in chat or mirrored to Telegram
let _ctxTimer=null, _ctxQueue='';
function sendContext(ctx, immediate){
  if(!wsReady||!ws)return;
  if(immediate){
    // Send immediately (for actions like bookmarks)
    ws.send(JSON.stringify({type:'req',method:'chat.send',id:'ctx-'+Date.now(),params:{message:'[ctx] '+ctx,sessionKey:'agent:main:main',deliver:false,idempotencyKey:'ctx-'+Date.now()}}));
    return;
  }
  _ctxQueue=ctx; // overwrite — only send latest
  clearTimeout(_ctxTimer);
  _ctxTimer=setTimeout(()=>{
    if(!_ctxQueue)return;
    const msg='[ctx] '+_ctxQueue;
    _ctxQueue='';
    ws.send(JSON.stringify({type:'req',method:'chat.send',id:'ctx-'+Date.now(),params:{message:msg,sessionKey:'agent:main:main',deliver:false,idempotencyKey:'ctx-'+Date.now()}}));
  },800); // 800ms debounce — if you click fast, only sends the last one
}
window.sendContext=sendContext;

function sendMsg(text){
  if(!text.trim())return;
  const msgs=loadMsgs();
  msgs.push({text:text.trim(),timestamp:Date.now(),sender:'user'});
  saveMsgs(msgs);renderMsgs();
  expectingKitchenReply=true;
  
  if(wsReady&&ws){
    ws.send(JSON.stringify({type:'req',method:'chat.send',id:'s1',params:{message:text.trim(),sessionKey:'agent:main:main',deliver:true,idempotencyKey:'k-'+Date.now()}}));
  } else {
    addChefMsg("⚠️ Not connected to gateway. Paste token in chat or check that OpenClaw is running on localhost:18789");
  }
}

// Auto-connect on load
wsConnect();
$('#chatSend').addEventListener('click',()=>{sendMsg($('#chatInput').value);$('#chatInput').value='';});
$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){sendMsg($('#chatInput').value);$('#chatInput').value='';}});
$('#chatFab').addEventListener('click',()=>{$('#chatSheet').classList.add('open');$('#chatOverlay').style.display='block';renderMsgs();});
$('#chatOverlay').addEventListener('click',()=>{$('#chatSheet').classList.remove('open');$('#chatOverlay').style.display='none';});
$('#chatSendMobile').addEventListener('click',()=>{sendMsg($('#chatInputMobile').value);$('#chatInputMobile').value='';});
$('#chatInputMobile').addEventListener('keydown',e=>{if(e.key==='Enter'){sendMsg($('#chatInputMobile').value);$('#chatInputMobile').value='';}});
renderMsgs();

// ── Auto-select last inspo (or first) ──
try{
  const lastIdx=localStorage.getItem('chef-kitchen-lastInspo');
  const idx=(lastIdx!==null && INSPIRATIONS[+lastIdx]) ? +lastIdx : 0;
  setTimeout(()=>showInspDetail(idx),150);
}catch(e){setTimeout(()=>showInspDetail(0),150);}

// ── Mobile Tabs ──
$$('.m-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    $$('.m-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const t=tab.dataset.mtab;
    document.body.classList.remove('mobile-ref','mobile-chat','mobile-code','mobile-canvas');
    if(t==='ref') document.body.classList.add('mobile-ref');
    else if(t==='chat') document.body.classList.add('mobile-chat');
    else if(t==='code'){document.body.classList.add('mobile-code');switchStageTab('code');}
    else if(t==='spotlight') document.body.classList.add('mobile-canvas');
    else {document.body.classList.add('mobile-code');switchStageTab('canvas');}
  });
});