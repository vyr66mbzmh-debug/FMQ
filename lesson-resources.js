'use strict';
window.FMQ_LESSONS=(()=>{
 const data=window.FMQ_LESSON_RESOURCES,bar=document.getElementById('lesson-resources');
 let selected=null;
 const note=document.createElement('small');note.style.cssText='flex-basis:100%;line-height:1.4;color:#526575';bar.append(note);
 const slides=document.getElementById('teaching-slides'),book=document.getElementById('book-chapter');
 function open(kind){if(!selected)return;const a=document.createElement('a');a.href=kind==='slides'?'lesson-viewer.html?skill='+encodeURIComponent(selected.code):selected[kind];a.target='_blank';a.rel='noopener';a.click();}
 slides.onclick=()=>open('slides');book.onclick=()=>open('pdf');book.textContent='Book sections';
 return {update({course,book:currentBook,skill}){
 selected=course.id===data.course&&currentBook.id===data.book?data.skillResources?.find(s=>s.code===skill.code):null;
 bar.hidden=!selected;
 if(!selected)return;
 slides.setAttribute('aria-label',`Teaching slides for ${selected.code} ${selected.title}`);
 book.setAttribute('aria-label',`Book sections for ${selected.code} ${selected.title}`);
 const coverage=selected.coverage==='direct'?'':selected.coverage==='partial'?' · Partial coverage':' · Related support only';
 note.textContent=`${selected.code} ${selected.title}${coverage}`;
 note.title=selected.note;
 slides.title=`${selected.slideCount} selected slides`;book.title=`${selected.pageCount} textbook pages · ${selected.sections.map(s=>s.section).join(', ')}${selected.code==='1.30'?' · Source page 257 is missing':''}`;
 }};
})();
