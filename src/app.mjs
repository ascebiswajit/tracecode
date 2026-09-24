import {openPractice} from './practice-ui.mjs';
import {languages,plugins} from './engine.mjs';
import {examples} from './examples.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let result={events:[],error:null},index=0,tab='memory',consoleTab='output',timer=null,worker=null,timeout=null,dirty=false;
$('#language').innerHTML=languages.map(l=>'<option value="'+l+'">'+l+(plugins.has(l)?'':' — planned')+'</option>').join('');
$('#code').value=examples[0].code;
function highlight(){
 const lines=$('#code').value.split('\n'),line=!dirty?result.events[index]?.line:0;
 $('#numbers').innerHTML=lines.map((_,i)=>'<div class="'+(i+1===line?'current':'')+'">'+(i+1)+'</div>').join('');
 $('#highlight').innerHTML=lines.map((s,i)=>'<div class="row '+(i+1===line?'current':'')+'">'+(escape(s)||' ')+'</div>').join('');
 $('#code').style.height=lines.length*25+'px';
 $('#linecount').textContent=$('#language').value+' · '+lines.length+' lines';
}
function stop(){clearInterval(timer);timer=null;$('#play').textContent='▶';$('#play').ariaLabel='Play';}
function modal(title,html){stop();$('#modaltitle').textContent=title;$('#modalbody').innerHTML=html;$('#modal').showModal();}
function display(v){return v&&typeof v==='object'?'↗ ref #'+v.ref:typeof v==='string'&&v!=='undefined'&&!v.startsWith('[Function')?'"'+v+'"':String(v);}
function render(){
 $$('[data-console]').forEach(b=>b.classList.toggle('selected',b.dataset.console===consoleTab));
 const e=result.events[index];
 $('#steptext').textContent=e?'Step '+(index+1)+' of '+result.events.length:'No execution';
 $('#steplabel').textContent=e?.label||'Run code to begin';
 $('#scrub').max=Math.max(0,result.events.length-1);$('#scrub').value=index;
 $('#stackcount').textContent=e?.stack.length||0;
 $('#prev').disabled=!index||dirty;$('#next').disabled=!e||index>=result.events.length-1||dirty;
 $('#play').disabled=!e||dirty;$('#scrub').disabled=!e||dirty;
 $('#outputcount').textContent=e?.output.length||0;$('#errorcount').textContent=result.error?'1':'0';
 if(!e){$('#visualbody').innerHTML='<div class="emptylarge">Run JavaScript to inspect its execution.<br>Try an example to begin.</div>';}
 else if(tab==='memory'){
  const heap=new Map();
  function collect(v){if(v&&typeof v==='object'&&v.ref&&v.data){if(heap.has(v.ref))return;heap.set(v.ref,v);Object.values(v.data).forEach(collect);}}
  let html='';
  e.scopes.forEach((scope,i)=>{
   const entries=Object.entries(scope);if(!entries.length&&e.scopes.length>1)return;
   html+='<div class="scopeheading">'+(i===e.scopes.length-1?'GLOBAL SCOPE':i===0?'CURRENT SCOPE':'ENCLOSING SCOPE')+'<small>'+entries.length+' bindings</small></div>';
   html+=entries.map(([name,v])=>{collect(v);return '<div class="variable"><div><div class="varname">'+escape(name)+'</div><div class="vartype">'+escape(v?.type||(v==='[Function]'?'function':typeof v))+'</div></div><span class="'+(v&&typeof v==='object'?'reference':'val')+'">'+escape(display(v))+'</span></div>';}).join('')||'<p class="explain">No variables declared yet. Step forward to watch them appear.</p>';
  });
  if(heap.size)html+='<div class="scopeheading">HEAP OBJECTS<small>Aliases share a reference ID</small></div>';
  heap.forEach(v=>{html+='<div class="arraycard"><div class="arrayhead"><span>'+escape(v.type)+'</span><span>ref #'+v.ref+'</span></div><div class="cells">'+Object.entries(v.data).map(([k,x])=>'<div class="cell"><strong>'+escape(display(x))+'</strong><small>'+escape(k)+'</small></div>').join('')+'</div></div>';});
  $('#visualbody').innerHTML=html;
 }else if(tab==='stack'){
  $('#visualbody').innerHTML='<div class="scopeheading">CALL STACK<small>Most recent call first</small></div>'+[...e.stack].reverse().map((s,i)=>'<div class="stackitem">'+(i===0?'→ ':'')+escape(s)+(s==='global'?'':'()')+'</div>').join('')+'<p class="explain">Calls add frames. Returns remove them. Rewind to inspect earlier calls.</p>';
 }else{
  const from=Math.max(0,index-3);
  $('#visualbody').innerHTML='<div class="scopeheading">EXECUTION FLOW<small>Recorded events</small></div>'+result.events.slice(from,index+5).map((s,i)=>'<button class="flowitem '+(s===e?'active':'')+'" data-step="'+(from+i)+'">'+escape(s.label)+'<span>line '+s.line+'</span></button>').join('');
  $$('[data-step]').forEach(b=>b.onclick=()=>{if(dirty)return;stop();index=+b.dataset.step;render();});
 }
 if(consoleTab==='errors')$('#consolebody').innerHTML=result.error?'<div class="error">'+escape(result.error)+'</div>':'<span class="empty">No errors in the last execution.</span>';
 else $('#consolebody').innerHTML=e?.output.length?e.output.map((s,i)=>'<div class="outrow"><span>'+String(i+1).padStart(2,'0')+'</span><span>'+escape(s)+'</span></div>').join(''):'<span class="empty">Output appears when execution reaches console.log().</span>';
 highlight();
}
function cancelRun(){worker?.terminate();worker=null;clearTimeout(timeout);$('#run').disabled=false;}
function run(start=0){
 stop();cancelRun();dirty=false;
 if(!plugins.has($('#language').value)){result={events:[],error:$('#language').value+' runtime is not installed. Choose JavaScript for real execution.'};index=0;consoleTab='errors';$('#status').textContent='Runtime unavailable';render();return;}
 $('#run').disabled=true;$('#status').textContent='Executing…';
 const currentWorker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});worker=currentWorker;
 const finish=r=>{if(worker!==currentWorker)return;cancelRun();result=r;index=Math.min(start,Math.max(0,r.events.length-1));$('#status').textContent=r.error?'Execution stopped':'Trace ready';consoleTab=r.error?'errors':'output';render();};
 currentWorker.onmessage=e=>finish(e.data);
 currentWorker.onerror=e=>finish({events:[],error:e.message||'Worker failed to start.'});
 timeout=setTimeout(()=>finish({events:[],error:'Execution stopped after 2 seconds.'}),2000);
 currentWorker.postMessage({language:$('#language').value,source:$('#code').value});
}
$('#run').onclick=()=>run();
$('#code').oninput=()=>{stop();cancelRun();dirty=true;$('#status').textContent='Code changed · run again';render();};
$('#code').onkeydown=e=>{
 if(e.key==='Tab'){e.preventDefault();const t=e.target;t.setRangeText('  ',t.selectionStart,t.selectionEnd,'end');t.dispatchEvent(new Event('input'));}
 if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();run();}
};
$('#language').onchange=()=>{stop();cancelRun();dirty=true;$('#filename').textContent='main.'+({JavaScript:'js',TypeScript:'ts',Python:'py',Java:'java',C:'c','C++':'cpp',Go:'go',Rust:'rs',Kotlin:'kt',Swift:'swift'}[$('#language').value]);result={events:[],error:null};index=0;$('#status').textContent=plugins.has($('#language').value)?'Ready to run':'Runtime not installed';render();};
$('#next').onclick=()=>{stop();index=Math.min(index+1,result.events.length-1);render();};
$('#prev').onclick=()=>{stop();index=Math.max(0,index-1);render();};
$('#reset').onclick=()=>{stop();index=0;render();};
$('#scrub').oninput=e=>{stop();index=+e.target.value;render();};
function play(){if(timer){stop();return;}if(!result.events.length||dirty)return;if(index>=result.events.length-1)index=0;$('#play').textContent='Ⅱ';$('#play').ariaLabel='Pause';render();timer=setInterval(()=>{if(index>=result.events.length-1){stop();return;}index++;render();},+$('#speed').value);}
$('#play').onclick=play;
$('#speed').onchange=()=>{if(timer){stop();play();}};
$$('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;$$('[data-tab]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});render();});
$$('[data-console]').forEach(b=>b.onclick=()=>{consoleTab=b.dataset.console;render();});
$('#close').onclick=()=>$('#modal').close();
$('#modal').onclick=e=>{if(e.target===$('#modal'))$('#modal').close();};
function openExamples(){openPractice({language:$('#language').value,modal,load:({language,code,run:execute})=>{
 stop();cancelRun();$('#language').value=language;$('#language').dispatchEvent(new Event('change'));$('#code').value=code;
 if(execute){run();}else{dirty=true;result={events:[],error:null};index=0;$('#status').textContent='Starter loaded · write your solution';render();$('#code').focus();}
}});}
$('#examples').onclick=openExamples;$('#loadexample').onclick=openExamples;$('#workspace').onclick=()=>$('#code').focus();
$('#trace').onclick=()=>{modal('Trace data','<p>Snapshots from the last execution'+(dirty?' (the editor has since changed)':'')+'.</p><button class="example" id="download">↓ Download trace.json</button><pre>'+escape(JSON.stringify(result,null,2))+'</pre>');$('#download').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='trace.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};};
$('#support').onclick=()=>modal('Language & runtime support','<p>This release has a restricted JavaScript interpreter. Other languages are planned adapters, not executable runtimes.</p><table>'+languages.map(l=>'<tr><td>'+l+'</td><td>'+(plugins.has(l)?'Core subset available':'Adapter required')+'</td></tr>').join('')+'</table><p>Async/event-loop, API and framework lifecycle tracing are not implemented. Memory is conceptual, not native addresses. The interpreter is a teaching prototype, not a hardened sandbox.</p>');
run(8);
