/* Native lesson rendering shared by the board viewer and student booklets. */
(function(root){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function geometry(s){const b=s.box,w=b.w,h=b.h,l=s.line||{},fill=s.fill||'transparent',stroke=l.color||'transparent';let body='',attrs=`fill="${fill}" stroke="${stroke}" stroke-width="${l.width||1}"${l.dash&&l.dash!=='solid'?' stroke-dasharray="'+(l.dash.toLowerCase().includes('dot')?'1 3':'5 3')+'"':''}`;
 const arrow=`<defs><marker id="arrow-${s.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="${stroke}"/></marker></defs>`;
 if(s.geometry==='line'||s.geometry==='straightConnector1')body=arrow+`<line x1="0" y1="0" x2="${w}" y2="${h}" ${attrs}${l.head&&l.head!=='none'?` marker-start="url(#arrow-${s.id})"`:''}${l.tail&&l.tail!=='none'?` marker-end="url(#arrow-${s.id})"`:''}/>`;
 else if(s.geometry==='ellipse')body=`<ellipse cx="${w/2}" cy="${h/2}" rx="${w/2}" ry="${h/2}" ${attrs}/>`;
 else if(s.geometry==='rtTriangle')body=`<path d="M0 0 L0 ${h} L${w} ${h}Z" ${attrs}/>`;
 else if(s.geometry==='rightArrow')body=`<path d="M0 ${h*.25} H${w*.65} V0 L${w} ${h*.5} L${w*.65} ${h} V${h*.75} H0Z" ${attrs}/>`;
 else if(s.geometry==='downArrow')body=`<path d="M${w*.25} 0 H${w*.75} V${h*.65} H${w} L${w/2} ${h} L0 ${h*.65} H${w*.25}Z" ${attrs}/>`;
 else if(s.geometry==='rightBrace'||s.geometry==='leftBrace'){const x=s.geometry==='rightBrace'?0:w,k=s.geometry==='rightBrace'?1:-1;body=`<path d="M${x} 0 Q${x+k*w*.5} 0 ${x+k*w*.5} ${h*.15} V${h*.35} Q${x+k*w*.5} ${h*.5} ${x+k*w} ${h*.5} Q${x+k*w*.5} ${h*.5} ${x+k*w*.5} ${h*.65} V${h*.85} Q${x+k*w*.5} ${h} ${x} ${h}" fill="none" stroke="${stroke}" stroke-width="${l.width||1}"/>`;}
 else if(s.customSvg)body=s.customSvg;
 else body=`<rect x="0" y="0" width="${w}" height="${h}" ${attrs}/>`;
 return `<svg class="lesson-drawing" xmlns="http://www.w3.org/2000/svg" width="${Math.max(w,1)}" height="${Math.max(h,1)}" viewBox="0 0 ${Math.max(w,1)} ${Math.max(h,1)}" aria-hidden="true">${body}</svg>`;
}
function imageContent(tex,o){
 if(!/\\begin|\\text|[=^_]|\\(?:frac|sqrt)|\\[([]/.test(tex)&&tex.split(/\s+/).length>8)return '<span class="lesson-image-prose">'+esc(tex).replace(/\\par\b\s*/g,'<br>').replace(/\n/g,'<br>')+'</span>';

 if(tex.includes('\\multicolumn')||tex.includes('\\cline')){
  const match=tex.match(/^\\begin\{array\}\{([^{}]*)\}([\s\S]*)\\end\{array\}$/);
  if(match){const specification=match[1],body=match[2],columns=specification.replace(/[^lcr]/g,'').length;let rows=[];
   for(let row of body.split('\\\\')){let rules=[];row=row.replace(/\\cline\{(\d+)-(\d+)\}/g,(_,a,b)=>{rules.push([Number(a),Number(b)]);return '';});let col=1,cells=[];
    for(const cell of row.split('&')){const m=cell.match(/^\\multicolumn(?:\{(\d+)\}|(\d+))(?:\{([lcr])\}|([lcr]))\{([\s\S]*)\}$/),span=m?Number(m[1]||m[2]):1,value=m?m[5]:cell;const top=rules.some(([a,b])=>col>=a&&col<=b);cells.push(`<td colspan="${span}" style="padding:1px 5px;text-align:right;${specification.includes('|')&&col===1?'border-right:1px solid currentColor;':''}${top?'border-top:1px solid currentColor;':''}"><span data-math="${esc(value)}">${o.math?o.math(value):''}</span></td>`);col+=span;}
    rows.push('<tr>'+cells.join('')+'</tr>');}
   return '<table class="lesson-tex-table" style="border-collapse:collapse;border-spacing:0">'+rows.join('')+'</table>';
  }
 }

 if(/\\\(|\\\[|(?<!\\)\$/.test(tex)){
  const pattern=/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$|(?<!\\)\$([^$\n]*?)(?<!\\)\$/g;let output='',last=0,m;
  const prose=text=>esc(text).replace(/\\textbf\{([^{}]*)\}/g,'<strong>$1</strong>').replace(/\\(?:emph|textit)\{([^{}]*)\}/g,'<em>$1</em>').replace(/\\([%&#_$])/g,'$1').replace(/\\par\b\s*/g,'<br>').replace(/\n/g,'<br>');
  while((m=pattern.exec(tex))){output+=prose(tex.slice(last,m.index));const math=m[1]??m[2]??m[3]??m[4],display=m[2]!==undefined||m[3]!==undefined;output+=(math.includes('\\multicolumn')||math.includes('\\cline'))?imageContent(math,o):`<${display?'div':'span'} class="${display?'lesson-image-block':'lesson-image-inline'}" data-math="${esc(math)}">${o.math?o.math(math):''}</${display?'div':'span'}>`;last=pattern.lastIndex;}
  return '<span class="lesson-image-prose">'+output+prose(tex.slice(last))+'</span>';
 }

 if(/\\begin\{(?:aligned|array|matrix|gathered|cases)/.test(tex))return `<span data-math="${esc(tex)}">${o.math?o.math(tex):''}</span>`;
 let pieces=[],start=0,depth=0,i=0;
 for(;i<tex.length;i++){
  if(tex[i]==='\\'){const m=tex.slice(i).match(/^\\(textbf|text)\{/);if(m&&depth===0){if(i>start)pieces.push({math:tex.slice(start,i)});let j=i+m[0].length,d=1;for(;j<tex.length&&d;j++){if(tex[j]==='{'&&tex[j-1]!=='\\')d++;if(tex[j]==='}'&&tex[j-1]!=='\\')d--;}pieces.push({text:tex.slice(i+m[0].length,j-1),bold:m[1]==='textbf'});i=j-1;start=j;continue;}i++;continue;}
  if(tex[i]==='{')depth++;if(tex[i]==='}')depth--;
 }
 if(start<tex.length)pieces.push({math:tex.slice(start)});
 if(!pieces.some(p=>p.text!==undefined))return `<span data-math="${esc(tex)}">${o.math?o.math(tex):''}</span>`;
 return '<span class="lesson-image-prose">'+pieces.map(p=>p.text!==undefined?`<span${p.bold?' style="font-weight:bold"':''}>${esc(p.text.replace(/\\([%&#_$])/g,'$1').replace(/~+/g,' '))}</span>`:(p.math.trim()?`<span data-math="${esc(p.math)}">${o.math?o.math(p.math):''}</span>`:' ')).join('')+'</span>';
}
function shape(s,o){const b=s.box;let transform=`translate(${b.x}px,${b.y}px)`;if(b.rotation)transform+=` rotate(${b.rotation}deg)`;if(b.flipH||b.flipV)transform+=` scale(${b.flipH?-1:1},${b.flipV?-1:1})`;let inner='';
 if(s.kind==='grpSp'){const sx=b.w/(b.childW||b.w||1),sy=b.h/(b.childH||b.h||1);inner=`<div style="position:absolute;transform-origin:0 0;transform:scale(${sx},${sy}) translate(${-b.childX}px,${-b.childY}px)">${s.children.map(x=>shape(x,o)).join('')}</div>`;}
 else {
  inner=geometry(s);
  if(s.asset){const c=s.crop||{},cw=1-(c.l||0)-(c.r||0),ch=1-(c.t||0)-(c.b||0);inner+=`<div class="lesson-picture-crop" style="overflow:hidden;position:absolute;inset:0"><img draggable="false" alt="Original mathematical diagram or question" src="${o.assetBase||''}${esc(s.asset)}" style="position:absolute;width:${100/cw}%;height:${100/ch}%;max-width:none;left:${-100*(c.l||0)/cw}%;top:${-100*(c.t||0)/ch}%;"/></div>`;}
  if(s.transcription){inner=geometry(s)+`<div class="lesson-image-tex" style="position:absolute;inset:0;font-size:${s.transcription.fontSize||20}px;line-height:1.2">${imageContent(s.transcription.tex,o)}</div>`;}
  if(s.textRegions&&s.assetSize){const [iw,ih]=s.assetSize,c=s.crop||{},cw=1-(c.l||0)-(c.r||0),ch=1-(c.t||0)-(c.b||0);for(const r of s.textRegions){const [x,y,w,h]=r.box;inner+=`<div class="lesson-image-tex" style="position:absolute;background:white;left:${(x/iw-(c.l||0))/cw*b.w}px;top:${(y/ih-(c.t||0))/ch*b.h}px;width:${w/iw/cw*b.w}px;height:${h/ih/ch*b.h}px;font-size:20px;line-height:1.15;overflow:hidden">${imageContent(r.tex,o)}</div>`;}}
  if(s.text){const t=s.text,[left,top,right,bottom]=t.insets;inner+=`<div class="lesson-text" style="position:absolute;left:${left}px;top:${top}px;right:${right}px;bottom:${bottom}px;display:flex;flex-direction:column;justify-content:${t.anchor==='ctr'?'center':t.anchor==='b'?'flex-end':'flex-start'};white-space:${t.wrap?'normal':'nowrap'};">`+t.paragraphs.map((p,index)=>`<div class="lesson-paragraph" data-paragraph="${index}" style="flex-shrink:0;white-space:${p.parts.some(r=>/\t| {5}/.test(r.text||''))?'nowrap':'normal'};margin:0;min-height:${p.fontSize*1.05}px;font-size:${p.fontSize}px;line-height:1.08;text-align:${{l:'left',ctr:'center',r:'right',just:'justify'}[p.align]||'left'};color:${s.cover?'white':p.color||'#000'};padding-left:${p.marginLeft||0}px;text-indent:${p.indent||0}px">${p.bullet?esc(p.bullet)+' ':''}${p.parts.map(r=>r.type==='math'?`<span style="font-size:${r.fontSize||p.fontSize}px" data-math="${esc(r.tex)}">${o.math?o.math(r.tex,p.color||'#000000'):''}</span>`:r.glyph?`<svg xmlns="http://www.w3.org/2000/svg" style="vertical-align:-.15em" width="${r.fontSize*r.glyph.width/r.glyph.em}px" height="${r.fontSize*r.glyph.height/r.glyph.em}px" viewBox="0 0 ${r.glyph.width} ${r.glyph.height}" fill="${r.color||p.color||'#000000'}">${r.glyph.paths}</svg>`:`<span style="white-space:inherit;font-size:${r.fontSize||p.fontSize}px;${r.fontFamily&&!r.fontFamily.startsWith('+')?'font-family:'+esc(r.fontFamily)+',Arial;':''}${r.bold?'font-weight:700;':''}${r.italic?'font-style:italic;':''}${r.color?'color:'+r.color+';':''}${r.baseline?'vertical-align:'+(r.baseline/1000)+'%;':''}">${esc((r.text||'').replace('‹#›',String(o.sourceSlide||''))).replace(/ {2,}/g,m=>'<span style="display:inline-block;width:'+m.length*.26+'em"></span>').replace(/\t/g,'<span style="display:inline-block;width:3em"></span>').replace(/\n/g,'<br>')}</span>`).join('')}</div>`).join('')+'</div>';}
 }
 if(o.textFits?.[s.id])inner=inner.replace('class="lesson-text" style="','class="lesson-text" style="transform-origin:left top;transform:'+o.textFits[s.id]+';');
 let fitIndex=0;if(o.fitFonts?.[s.id])inner=inner.replace(/(class="lesson-image-tex" style="[^"]*?font-size:)[0-9.]+px/g,(all,prefix)=>prefix+(o.fitFonts[s.id][fitIndex++]||20)+'px');
 return `<div class="lesson-shape${s.cover?' lesson-answer-cover':''}" data-shape="${esc(s.id)}" ${s.cover?'role="button" tabindex="0" aria-label="Reveal this answer" aria-expanded="false"':''} style="position:absolute;left:0;top:0;width:${b.w}px;height:${b.h}px;transform-origin:center;transform:${transform};">${inner}</div>`;
}
function render(slide,deck,options={}){return `<div class="lesson-canvas${options.paper?' lesson-paper':''}" style="width:${deck.width}px;height:${deck.height}px;position:relative;background:white;overflow:hidden" data-slide="${slide.id}">${slide.shapes.map(s=>shape(s,{...options,sourceSlide:slide.sourceSlide})).join('')}</div>`;}
const api={render,shape,geometry,imageContent,escape:esc};if(typeof module!=='undefined')module.exports=api;root.FMQ_SLIDE_RENDERER=api;
})(typeof window==='undefined'?globalThis:window);
