'use strict';
window.FMQ_LESSONS=(()=>{
 const data=window.FMQ_LESSON_RESOURCES;
 const resourceBar=document.getElementById('lesson-resources');
 const dialog=document.getElementById('lesson-resource-dialog');
 let activeTopic=null,opener=null;
 function openChapter(chapter,kind){
  const link=document.createElement('a');link.href=chapter[kind];link.target='_blank';link.rel='noopener';
  if(kind==='slides')link.download=`P1-Chapter-${chapter.number}.pptx`;
  link.click();
 }
 function show(kind){
  if(!activeTopic)return;
  const entries=activeTopic.chapters.map(entry=>({entry,chapter:data.chapters.find(c=>c.number===entry.number)})).filter(x=>x.chapter?.[kind]);
  if(entries.length===1&&!entries[0].chapter.note){openChapter(entries[0].chapter,kind);return;}
  opener=document.activeElement;
  document.getElementById('lesson-resource-title').textContent=kind==='slides'?'Teaching slides':'Book chapters';
  document.getElementById('lesson-resource-context').textContent=activeTopic.title+' · Pure Year 1. Choose a chapter.';
  const links=entries.map(({entry,chapter})=>{
   const link=document.createElement('a');link.className='lesson-resource-link';link.href=chapter[kind];link.target='_blank';link.rel='noopener';
   if(kind==='slides')link.download=`P1-Chapter-${chapter.number}.pptx`;
   const title=document.createElement('strong');title.textContent=`Chapter ${chapter.number}: ${chapter.title}`;
   const detail=document.createElement('small');detail.textContent=kind==='slides'?`PowerPoint · ${chapter.slideCount} slides`:`PDF · textbook pages ${chapter.printedPages[0]}–${chapter.printedPages[1]}`;
   const sections=document.createElement('small');sections.textContent=entry.focus;
   link.append(title,detail,sections);
   if(kind==='pdf'&&chapter.note){const note=document.createElement('small');note.className='lesson-resource-note';note.textContent=chapter.note;link.append(note);}
   return link;
  });
  document.getElementById('lesson-resource-links').replaceChildren(...links);dialog.showModal();
 }
 document.getElementById('teaching-slides').onclick=()=>show('slides');
 document.getElementById('book-chapter').onclick=()=>show('pdf');
 document.getElementById('close-lesson-resources').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>opener?.focus());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 return {update({course,book,topic}){
  if(dialog.open)dialog.close();
  activeTopic=course.id===data.course&&book.id===data.book?data.topics.find(t=>t.id===topic.id):null;
  resourceBar.hidden=!activeTopic?.chapters.length;
  if(activeTopic){document.getElementById('teaching-slides').setAttribute('aria-label',`Teaching slides for ${topic.title}`);document.getElementById('book-chapter').setAttribute('aria-label',`Book chapters for ${topic.title}`);}
 }};
})();
