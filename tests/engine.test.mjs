import test from 'node:test';
import assert from 'node:assert/strict';
import {trace} from '../dist/engine.mjs';
import {examples} from '../dist/examples.mjs';
function run(code){const r=trace(code);assert.equal(r.error,null);return r;}
test('array sum returns actual output',()=>assert.deepEqual(run(examples[0].code).events.at(-1).output,['Total: 20']));
test('recursion records nested frames and returns to global',()=>{
 const r=run(examples[1].code);
 assert.deepEqual(r.events.at(-1).output,['120']);
 assert.ok(r.events.some(e=>e.stack.length===6));
 assert.deepEqual(r.events.at(-1).stack,['global']);
});
test('aliases share IDs and historical snapshots remain unchanged',()=>{
 const r=run('const a={x:1};const b=a;b.x=2;console.log(a.x);');
 const before=r.events.find(e=>e.label==='Initialize b').scopes[0];
 const after=r.events.at(-1).scopes[0];
 assert.equal(after.a.ref,after.b.ref);assert.equal(before.a.data.x,1);assert.equal(after.a.data.x,2);
});
test('block scopes preserve outer values',()=>assert.deepEqual(run('let x=1;{let x=2;console.log(x);}console.log(x);').events.at(-1).output,['2','1']));
test('infinite loops stop at the trace limit',()=>{const r=trace('while(true){}');assert.match(r.error,/limit|budget/);assert.ok(r.events.length<=1500);});
test('host APIs and prototype traversal are rejected',()=>{
 assert.match(trace('fetch("https://example.com")').error,/not defined/);
 assert.match(trace('const a=[];console.log(a.constructor);').error,/Prototype access/);
});
test('invalid source produces a parser error',()=>assert.throws(()=>trace('const = ;'),SyntaxError));
test('rainwater example passes all ten cases',()=>{
 assert.deepEqual(run(examples[3].code).events.at(-1).output,[9,3,0,0,6,0,0,0,15,7].map((v,i)=>'Test '+(i+1)+': '+v));
});
