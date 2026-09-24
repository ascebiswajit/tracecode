import test from 'node:test';
import assert from 'node:assert/strict';
import {exercises,starterFor} from '../src/practice.mjs';
import {languages} from '../dist/engine.mjs';
import {parse} from '../dist/acorn.mjs';
test('curriculum contains 20 distinct complete exercises at each level',()=>{
 assert.equal(exercises.length,60);assert.equal(new Set(exercises.map(e=>e.id)).size,60);assert.equal(new Set(exercises.map(e=>e.title)).size,60);
 for(const level of [1,2,3])assert.equal(exercises.filter(e=>e.level===level).length,20);
 for(const e of exercises)for(const key of ['title','topic','question','input','expected','hint'])assert.ok(e[key]);
});
test('every language receives the same 60 prompts in a marked starter',()=>{
 for(const l of languages)for(const e of exercises){const s=starterFor(e,l);assert.ok(s.includes(e.question));assert.ok(s.includes(e.expected));assert.ok(s.includes('TODO'));}
});
test('all JavaScript starters parse and Python starters use Python comments',()=>{
 for(const e of exercises){parse(starterFor(e,'JavaScript'),{ecmaVersion:2022});assert.ok(starterFor(e,'Python').startsWith('# '));}
});
