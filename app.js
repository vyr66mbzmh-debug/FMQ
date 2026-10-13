'use strict';
const $=id=>document.getElementById(id),library=window.FMQ_LIBRARY;
let current=null,history=[],mode='hidden',stage=0,view='split';
const remembered=new Map(),pools=new Map();
const key=s=>[s.course,s.book,s.topic,s.skill].join('/');
function resolve(s={}){
 const course=library.courses.find(x=>x.id===s.course)||library.courses[0];
 const book=course.books.find(x=>x.id===s.book)||course.books[0];
 const topic=book.topics.find(x=>x.id===s.topic)||book.topics[0];
 const skill=topic.skills.find(x=>x.id===s.skill)||topic.skills[0];
 const state={course:course.id,book:book.id,topic:topic.id,skill:skill.id,question:Math.max(1,Math.min(skill.questions.length,Number(s.question)||1))};
 return {course,book,topic,skill,state};
}
function populate(id,items,selected){$(id).replaceChildren(...items.map(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.title;return o;}));$(id).value=selected;}
function navigate(s,record=true){
 const r=resolve(s),next=r.state;
 if(current){remembered.set(key(current),current.question);if(record&&(key(current)!==key(next)||current.question!==next.question))history.push({...current});}
 current=next;mode='hidden';stage=0;
 populate('course',library.courses,next.course);populate('book',r.course.books,next.book);populate('topic',r.book.topics,next.topic);
 $('breadcrumbs').textContent=[r.course.title,r.book.title,r.topic.title].join(' › ');
 $('skilltitle').textContent=`${r.skill.code} ${r.skill.title}`;
 $('qtitle').textContent=`Question ${next.question} of ${r.skill.questions.length}`;
 $('focus-question-number').textContent=$('qtitle').textContent;
 $('skills').replaceChildren(...r.topic.skills.map(skill=>{
  const button=document.createElement('button');button.className='skill-button';button.dataset.skill=skill.id;
  if(skill.id===next.skill)button.setAttribute('aria-current','page');
  const code=document.createElement('span');code.className='skill-code';code.textContent=skill.code;
  const title=document.createElement('span');title.textContent=skill.title;
  const count=document.createElement('span');count.className='skill-count';count.textContent=`${skill.questions.length} questions`;
  button.append(code,title,count);
  button.onclick=()=>{const target={...current,skill:skill.id};target.question=remembered.get(key(target))||1;navigate(target);};return button;
 }));
 $('choose').replaceChildren(...r.skill.questions.map(q=>{const o=document.createElement('option');o.value=q.number;o.textContent=`Question ${q.number}`;return o;}));$('choose').value=next.question;
 const q=r.skill.questions[next.question-1];$('question').innerHTML=q.question;$('question').parentElement.scrollTop=0;
 $('solution').innerHTML=q.steps.map((html,i)=>`<div class="solution-step" data-step="${i}">${html}</div>`).join('');$('solution').parentElement.parentElement.scrollTop=0;
 $('previous').disabled=!history.length&&next.question===1;
 const hash=new URLSearchParams({course:next.course,book:next.book,topic:next.topic,skill:next.skill,question:next.question});
 try{window.history.replaceState(null,'','#'+hash);}catch{}
 document.title=`FMQ · ${r.skill.code} · Question ${next.question}`;
 renderSolution();
}
function setView(next){
 view=next;document.body.classList.toggle('focus-view',next!=='split');
 document.body.classList.toggle('view-question',next==='question');document.body.classList.toggle('view-solution',next==='solution');
 for(const name of ['split','question','solution'])$('view-'+name).setAttribute('aria-pressed',String(name===next));
 if(next==='solution'&&mode==='hidden'){mode='full';stage=resolve(current).skill.questions[current.question-1].steps.length;renderSolution();}
 window.scrollTo({top:0,behavior:'auto'});
}
function renderSolution(){
 const total=resolve(current).skill.questions[current.question-1].steps.length;
 $('solutionempty').hidden=mode!=='hidden';$('solutionclip').hidden=mode==='hidden';$('stepbar').hidden=mode==='hidden';
 for(const [i,node] of [...$('solution').children].entries())node.hidden=mode==='progress'&&i>=stage;
 $('stepcount').textContent=mode==='full'?'Complete solution':`Step ${stage} of ${total}`;
 $('nextstep').disabled=stage>=total&&mode!=='hidden';$('backstep').disabled=stage===0;$('reset').disabled=stage===0;
}
$('course').onchange=()=>navigate({course:$('course').value});
$('book').onchange=()=>navigate({course:current.course,book:$('book').value});
$('topic').onchange=()=>navigate({course:current.course,book:current.book,topic:$('topic').value});
$('choose').onchange=e=>navigate({...current,question:Number(e.target.value)});
$('previous').onclick=()=>history.length?navigate(history.pop(),false):navigate({...current,question:Math.max(1,current.question-1)},false);
$('skip').onclick=()=>navigate({...current,question:current.question%resolve(current).skill.questions.length+1});
$('random').onclick=()=>{
 const k=key(current),count=resolve(current).skill.questions.length;let pool=pools.get(k);
 if(!pool?.some(n=>n!==current.question))pool=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==current.question);
 const candidates=pool.filter(n=>n!==current.question),n=candidates[Math.floor(Math.random()*candidates.length)];
 pools.set(k,pool.filter(x=>x!==n));navigate({...current,question:n});
};
$('nextstep').onclick=()=>{
 const total=resolve(current).skill.questions[current.question-1].steps.length;
 if(mode==='hidden'){mode='progress';stage=1;}else{mode='progress';stage=Math.min(total,stage+1);}
 renderSolution();const visible=[...$('solution').children].filter(x=>!x.hidden);visible[visible.length-1]?.scrollIntoView({block:'nearest',behavior:'smooth'});
};
$('full').onclick=()=>{mode='full';stage=resolve(current).skill.questions[current.question-1].steps.length;renderSolution();};
$('hide').onclick=()=>{mode='hidden';stage=0;renderSolution();};
$('backstep').onclick=()=>{mode='progress';stage=Math.max(0,stage-1);renderSolution();};
$('reset').onclick=()=>{mode='progress';stage=0;renderSolution();};
$('view-split').onclick=()=>setView('split');
$('view-question').onclick=()=>setView('question');
$('view-solution').onclick=()=>setView('solution');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&view!=='split')setView('split');});
$('present').onclick=()=>{$('present').setAttribute('aria-pressed',String(document.body.classList.toggle('present')));};
$('fullscreen').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();};
window.addEventListener('hashchange',()=>navigate(Object.fromEntries(new URLSearchParams(location.hash.slice(1)))));
navigate(Object.fromEntries(new URLSearchParams(location.hash.slice(1))),false);
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
