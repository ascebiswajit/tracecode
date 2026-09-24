import {exercises,starterFor} from './practice.mjs';
import {languages,plugins} from './engine.mjs';
import {examples} from './examples.mjs';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function openPractice({language,modal,load}){
 let selected=language,level='1',query='';
 modal('Explore & practice',`<div class="practice-tools"><label>Language<select id="practice-language">${languages.map(l=>`<option value="${l}" ${l===selected?'selected':''}>${l}</option>`).join('')}</select></label><label>Find an exercise<input id="practice-search" type="search" placeholder="Search arrays, graphs, projects…"></label></div><div class="practice-levels" aria-label="Exercise level">${[['1','Level 1 · Foundations'],['2','Level 2 · Intermediate'],['3','Level 3 · Advanced'],['examples','Worked examples']].map(([id,title])=>`<button data-level="${id}" aria-pressed="${id===level}">${title}${id==='examples'?'':' <small>20</small>'}</button>`).join('')}</div><p id="practice-note"></p><div id="practice-count" role="status"></div><div id="practice-list"></div>`);
 const dialog=document.querySelector('#modal');dialog.classList.add('practice-dialog');dialog.addEventListener('close',()=>dialog.classList.remove('practice-dialog'),{once:true});
 const list=dialog.querySelector('#practice-list');
 function render(){
  dialog.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===level)));
  const available=plugins.has(selected);
  dialog.querySelector('#practice-note').textContent=available?'JavaScript subset execution is available. Advanced exercises may need syntax or APIs this interpreter does not yet support. Starters are unfinished solutions.':selected+' exercises are available for study. Execution and visualization are not installed for this language; run your solution locally.';
  if(level==='examples'){
   const filtered=selected==='JavaScript'?examples.filter(e=>(e.name+' '+e.desc).toLowerCase().includes(query.toLowerCase())):[];
   dialog.querySelector('#practice-count').textContent=filtered.length+' worked examples';
   list.innerHTML=filtered.length?filtered.map(e=>`<button class="example" data-worked="${examples.indexOf(e)}"><strong>${escape(e.name)}</strong><small>${escape(e.desc)} · Completed JavaScript example</small></button>`).join(''):'<p class="emptylarge">'+(selected==='JavaScript'?'No examples match your search.':'Worked solutions are currently available only for JavaScript. Choose a level to browse the shared questions.')+'</p>';
   list.querySelectorAll('[data-worked]').forEach(b=>b.onclick=()=>{load({language:'JavaScript',code:examples[+b.dataset.worked].code,run:true});dialog.close();});return;
  }
  const filtered=exercises.filter(e=>e.level===+level&&(e.title+' '+e.topic+' '+e.question).toLowerCase().includes(query.toLowerCase()));
  dialog.querySelector('#practice-count').textContent=filtered.length+' of 20 exercises · '+selected+' · 60 across all levels';
  list.innerHTML=filtered.length?filtered.map(e=>`<article class="exercise-card"><div class="exercise-meta"><span>${e.id.replace('exercise-','#')} · ${escape(e.topic)}</span><span>Level ${e.level}</span></div><h3>${escape(e.title)}</h3><p>${escape(e.question)}</p><dl><dt>Sample input</dt><dd><code>${escape(e.input)}</code></dd><dt>Expected result</dt><dd><code>${escape(e.expected)}</code></dd></dl><details><summary>Show hint</summary><p>${escape(e.hint)}</p></details><button class="load-starter" data-exercise="${e.id}">Load ${escape(selected)} starter →</button></article>`).join(''):'<p class="emptylarge">No exercises match. Try another search or level.</p>';
  list.querySelectorAll('[data-exercise]').forEach(b=>b.onclick=()=>{const e=exercises.find(x=>x.id===b.dataset.exercise);load({language:selected,code:starterFor(e,selected),run:false});dialog.close();});
 }
 dialog.querySelector('#practice-language').onchange=e=>{selected=e.target.value;render();};
 dialog.querySelector('#practice-search').oninput=e=>{query=e.target.value;render();};
 dialog.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=b.dataset.level;render();});render();
}
