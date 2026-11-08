const today = new Date();
const key = 'equilibrio-v1';
const initial = {weights:[], activities:[], meals:[], completed:[]};
let state = {...initial, ...JSON.parse(localStorage.getItem(key) || '{}')};
const routine = [
  {day:'Día 1',focus:'Pecho + abdomen',exercises:[['Flexiones inclinadas o en suelo','3 × 8–12 repeticiones'],['Press de pecho con mancuernas','3 × 10–12'],['Aperturas con mancuernas','3 × 12'],['Plancha frontal','3 × 20–40 s'],['Dead bug','3 × 8 por lado']]},
  {day:'Día 2',focus:'Espalda + hombros',exercises:[['Remo con mancuerna','3 × 10 por lado'],['Press de hombros sentado','3 × 8–12'],['Elevaciones laterales','3 × 12–15'],['Bird-dog','3 × 8 por lado'],['Plancha lateral','2 × 20–30 s por lado']]},
  {day:'Día 3',focus:'Pecho + brazos + core',exercises:[['Flexiones (variante cómoda)','3 × 8–12'],['Remo con banda o mancuerna','3 × 10–12'],['Fondos de tríceps en silla estable','2 × 8–10'],['Crunch corto controlado','3 × 10–15'],['Puente de glúteos','3 × 12']]}
];
const save = () => localStorage.setItem(key, JSON.stringify(state));
const dateKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
document.querySelector('#today-label').textContent = new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long'}).format(today).toUpperCase();
function render(){
  const weights=[...state.weights].sort((a,b)=>a.date.localeCompare(b.date));
  const latest=weights.at(-1); document.querySelector('#current-weight').textContent=latest?latest.value.toFixed(1).replace('.',','):'—';
  const trend=document.querySelector('#weight-trend'); trend.textContent=weights.length>1?`${(latest.value-weights.at(-2).value>0?'+':'')+(latest.value-weights.at(-2).value).toFixed(1).replace('.',',')} kg desde el registro anterior`:latest?'Último registro · '+new Date(latest.date+'T12:00:00').toLocaleDateString('es-CL'):'Registra tu primer peso';
  const mins=state.activities.filter(a=>a.date===dateKey()).reduce((n,a)=>n+a.minutes,0);document.querySelector('#activity-count').textContent=mins;document.querySelector('#activity-progress').style.width=Math.min(mins/30*100,100)+'%';
  const meals=state.meals.filter(m=>m.date===dateKey());document.querySelector('#meal-list').innerHTML=meals.length?meals.map(m=>`<div class="meal-row"><span class="meal-dot">${m.type==='Desayuno'?'☕':m.type==='Almuerzo'?'🥗':m.type==='Cena'?'🍽️':'🍎'}</span><div><strong>${escapeHtml(m.name)}</strong><small>${m.type} · ${m.time}</small></div></div>`).join(''):'<div class="empty-state">Aún no hay comidas registradas.<br><button class="inline-link" data-open="meal-modal">Añade la primera</button></div>';
  document.querySelector('#routine-days').innerHTML=routine.map((d,i)=>`<article class="day-card"><div class="day-title"><strong>${d.day}</strong><span>${d.focus}</span></div>${d.exercises.map(e=>`<div class="exercise"><strong>${e[0]}</strong><small>${e[1]}</small></div>`).join('')}<button class="done-button ${state.completed.includes(dateKey()+':'+i)?'done':''}" data-routine="${i}">${state.completed.includes(dateKey()+':'+i)?'✓ Completado hoy':'Marcar como completado'}</button></article>`).join('');
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
document.addEventListener('click',e=>{const opener=e.target.closest('[data-open]');if(opener)document.getElementById(opener.dataset.open).showModal();const closer=e.target.closest('.close-action');if(closer){e.preventDefault();closer.closest('dialog').close()}const done=e.target.closest('[data-routine]');if(done){const id=dateKey()+':'+done.dataset.routine;state.completed=state.completed.includes(id)?state.completed.filter(x=>x!==id):[...state.completed,id];save();render()}});
document.querySelectorAll('.close').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();b.closest('dialog').close()}));
document.querySelector('#save-weight').addEventListener('click',e=>{e.preventDefault();const value=Number(document.querySelector('#weight-input').value);if(value<20||!value)return;state.weights.push({value,date:dateKey()});save();render();e.target.closest('dialog').close();document.querySelector('#weight-input').value=''});
document.querySelector('#save-activity').addEventListener('click',e=>{e.preventDefault();const minutes=Number(document.querySelector('#activity-minutes').value);if(!minutes)return;state.activities.push({minutes,type:document.querySelector('#activity-type').value,date:dateKey()});save();render();e.target.closest('dialog').close();document.querySelector('#activity-minutes').value=''});
document.querySelector('#save-meal').addEventListener('click',e=>{e.preventDefault();const name=document.querySelector('#meal-name').value.trim();if(!name)return;state.meals.push({name,type:document.querySelector('#meal-type').value,date:dateKey(),time:new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})});save();render();e.target.closest('dialog').close();document.querySelector('#meal-name').value=''});
document.querySelectorAll('.nav-item').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));a.classList.add('active')}));
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
