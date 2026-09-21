import {parse} from './acorn.mjs';
export const languages = ['JavaScript','TypeScript','Python','Java','C','C++','Go','Rust','Kotlin','Swift'];
export const plugins = new Map();
export function registerPlugin(plugin){plugins.set(plugin.id,plugin);}
export function trace(source){
 const ast=parse(source,{ecmaVersion:2022,locations:true});
 let events=[],output=[],stack=['global'],ops=0,refs=new WeakMap(),refId=0;
 const root={values:Object.create(null),parent:null};let current=root;
 function value(v,seen=new Set()){if(v===undefined)return 'undefined';if(v&&v.fn)return '[Function]';if(v&&typeof v==='object'){if(!refs.has(v))refs.set(v,++refId);if(seen.has(v))return {ref:refs.get(v)};seen.add(v);return {ref:refs.get(v),type:Array.isArray(v)?'Array':'Object',data:Object.fromEntries(Object.keys(v).slice(0,100).map(k=>[k,value(v[k],new Set(seen))]))};}return v;}
 function snap(n,label){if(events.length>=1500)throw Error('Trace limit reached (1,500 steps). Use smaller inputs.');let scopes=[];for(let s=current;s;s=s.parent)scopes.push(Object.fromEntries(Object.entries(s.values).map(([k,v])=>[k,value(v)])));events.push({line:n?.loc?.start.line||1,label,scopes,stack:[...stack],output:[...output]});}
 function lookup(name){for(let s=current;s;s=s.parent)if(Object.hasOwn(s.values,name))return s;throw Error(name+' is not defined');}
 function key(n){const k=n.computed?ev(n.property):n.property.name;if(['__proto__','prototype','constructor'].includes(String(k)))throw Error('Prototype access is not supported');return k;}
 function put(n,v){if(n.type==='Identifier'){lookup(n.name).values[n.name]=v;return v;}if(n.type==='MemberExpression'){const o=ev(n.object);o[key(n)]=v;return v;}throw Error('Unsupported assignment target');}
 const bin=(op,a,b)=>{switch(op){case '+':return a+b;case '-':return a-b;case '*':return a*b;case '/':return a/b;case '%':return a%b;case '**':return a**b;case '<':return a<b;case '>':return a>b;case '<=':return a<=b;case '>=':return a>=b;case '===':return a===b;case '!==':return a!==b;case '==':return a==b;case '!=':return a!=b;default:throw Error('Unsupported operator '+op);}};
 function ev(n){if(++ops>20000)throw Error('Execution budget reached');if(!n)return undefined;switch(n.type){
 case 'Literal':if(n.regex)throw Error('Regular expressions are not supported');return n.value;
 case 'Identifier':if(n.name==='undefined')return undefined;return lookup(n.name).values[n.name];
 case 'ArrayExpression':return n.elements.map(x=>ev(x));
 case 'ObjectExpression':{let o=Object.create(null);for(const p of n.properties){if(p.type!=='Property'||p.kind!=='init')throw Error('Unsupported object property');o[p.computed?ev(p.key):p.key.name??p.key.value]=ev(p.value);}return o;}
 case 'MemberExpression':return ev(n.object)[key(n)];
 case 'BinaryExpression':return bin(n.operator,ev(n.left),ev(n.right));
 case 'LogicalExpression':{let a=ev(n.left);return n.operator==='&&'?(a&&ev(n.right)):n.operator==='||'?(a||ev(n.right)):(a??ev(n.right));}
 case 'UnaryExpression':{let a=ev(n.argument);switch(n.operator){case '!':return !a;case '-':return -a;case '+':return +a;case 'typeof':return typeof a;default:throw Error('Unsupported unary operator');}}
 case 'ConditionalExpression':return ev(n.test)?ev(n.consequent):ev(n.alternate);
 case 'AssignmentExpression':{let v=n.operator==='='?ev(n.right):bin(n.operator.slice(0,-1),ev(n.left),ev(n.right));put(n.left,v);snap(n,'Assignment');return v;}
 case 'UpdateExpression':{let v=ev(n.argument);put(n.argument,n.operator==='++'?v+1:v-1);snap(n,'Update variable');return n.prefix?ev(n.argument):v;}
 case 'ArrowFunctionExpression':case 'FunctionExpression':if(n.async)throw Error('Async execution needs an async runtime plugin');return {fn:n,scope:current};
 case 'TemplateLiteral':return n.quasis.map((q,i)=>q.value.cooked+(i<n.expressions.length?String(ev(n.expressions[i])):'')).join('');
 case 'CallExpression':{
 if(n.callee.type==='MemberExpression'&&n.callee.object.name==='console'&&n.callee.property.name==='log'){const args=n.arguments.map(ev);output.push(args.map(v=>typeof v==='object'?JSON.stringify(value(v)):String(v)).join(' '));snap(n,'Console output');return undefined;}
 if(n.callee.type==='MemberExpression'){const obj=ev(n.callee.object),k=key(n),args=n.arguments.map(ev);if(Array.isArray(obj)&&['push','pop','shift','unshift','slice','join','indexOf','includes','reverse'].includes(k)){let result=Array.prototype[k].apply(obj,args);snap(n,'Array.'+k);return result;}throw Error('This method needs a runtime plugin');}
 const f=ev(n.callee);if(!f?.fn)throw Error('Only interpreted functions can be called');if(stack.length>80)throw Error('Call stack limit reached');const args=n.arguments.map(ev),prev=current;current={values:Object.create(null),parent:f.scope};f.fn.params.forEach((p,i)=>{if(p.type!=='Identifier')throw Error('Use simple function parameters');current.values[p.name]=args[i];});stack.push(n.callee.name||'anonymous');snap(n,'Call '+stack.at(-1));let result;try{result=f.fn.body.type==='BlockStatement'?exec(f.fn.body):{return:true,value:ev(f.fn.body)};snap(n,'Return '+stack.at(-1));}finally{stack.pop();current=prev;}return result?.value;
 }
 default:throw Error('Unsupported syntax: '+n.type);
 }}
 function body(nodes){for(const n of nodes){if(n.type==='FunctionDeclaration'){if(n.async)throw Error('Async functions require a runtime plugin');current.values[n.id.name]={fn:n,scope:current};}}for(const n of nodes){const r=exec(n);if(r)return r;}}
 function exec(n){if(++ops>20000)throw Error('Execution budget reached');switch(n.type){
 case 'Program':return body(n.body);
 case 'BlockStatement':{const prev=current;current={values:Object.create(null),parent:prev};try{return body(n.body);}finally{current=prev;}}
 case 'FunctionDeclaration':snap(n,'Declare function '+n.id.name);break;
 case 'VariableDeclaration':for(const d of n.declarations){if(d.id.type!=='Identifier')throw Error('Destructuring is not supported');current.values[d.id.name]=ev(d.init);snap(n,'Initialize '+d.id.name);}break;
 case 'ExpressionStatement':ev(n.expression);snap(n,'Execute expression');break;
 case 'IfStatement':{const yes=ev(n.test);snap(n,'Condition is '+Boolean(yes));return yes?exec(n.consequent):n.alternate?exec(n.alternate):undefined;}
 case 'ForStatement':{const prev=current;current={values:Object.create(null),parent:prev};try{if(n.init)n.init.type==='VariableDeclaration'?exec(n.init):ev(n.init);while(!n.test||ev(n.test)){snap(n,'Loop iteration');const r=exec(n.body);if(r?.return)return r;if(r?.break)break;if(n.update)ev(n.update);}snap(n,'Loop complete');}finally{current=prev;}break;}
 case 'WhileStatement':while(ev(n.test)){snap(n,'While condition is true');const r=exec(n.body);if(r?.return)return r;if(r?.break)break;}snap(n,'Loop complete');break;
 case 'ReturnStatement':{let v=ev(n.argument);snap(n,'Return value');return {return:true,value:v};}
 case 'BreakStatement':return {break:true};case 'ContinueStatement':return {continue:true};case 'EmptyStatement':break;
 case 'ThrowStatement':throw Error(String(ev(n.argument)));
 default:throw Error('Unsupported syntax: '+n.type);
 }}
 let error=null;try{snap(ast,'Program start');exec(ast);snap(ast,'Program complete');}catch(e){error=e.message;if(events.length<1500)snap(null,'Execution stopped: '+error);}return {events,error};
}
registerPlugin({id:'JavaScript',name:'JavaScript core',trace,capabilities:['variables','arrays','objects','references','functions','recursion','loops','conditions','scopes','call-stack']});
