'use strict';
const cells=[...document.querySelectorAll('.board button')],lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let b=Array(9).fill(''),turn='X',ended=false,mode='two',timer=null,gameId=0;
let score={X:0,O:0,D:0};
try{const s=JSON.parse(localStorage.getItem('iksoks-score'));if(s&&['X','O','D'].every(k=>Number.isInteger(s[k])&&s[k]>=0))score=s}catch(e){}
const $=id=>document.getElementById(id);
function persist(){try{localStorage.setItem('iksoks-score',JSON.stringify(score))}catch(e){}}
function result(a){for(const line of lines){const [i,j,k]=line;if(a[i]&&a[i]===a[j]&&a[i]===a[k])return {winner:a[i],line}}return a.every(Boolean)?{draw:true}:null}
function render(){const r=result(b);cells.forEach((c,i)=>{c.textContent=b[i];c.className=(b[i]||'').toLowerCase()+(r?.line?.includes(i)?' win':'');c.disabled=ended||!!b[i]||(mode==='phone'&&turn==='O');c.setAttribute('aria-label','Polje '+(i+1)+': '+(b[i]||'prazno'))});$('status').textContent=ended?(r.draw?'Nerešeno! 🤝':'Pobedio je '+r.winner+'! 🎉'):(mode==='phone'&&turn==='O'?'Telefon razmišlja…':'Na potezu: '+turn);$('scoreX').textContent=score.X;$('scoreO').textContent=score.O;$('scoreD').textContent=score.D}
function place(i){if(ended||b[i])return;b[i]=turn;const r=result(b);if(r){ended=true;score[r.draw?'D':r.winner]++;persist()}else turn=turn==='X'?'O':'X';render()}
function free(a){return a.map((v,i)=>v?-1:i).filter(i=>i>=0)}
function minimax(a,isMax,depth){const r=result(a);if(r)return r.draw?0:(r.winner==='O'?10-depth:depth-10);let best=isMax?-Infinity:Infinity;for(const i of free(a)){a[i]=isMax?'O':'X';const v=minimax(a,!isMax,depth+1);a[i]='';best=isMax?Math.max(best,v):Math.min(best,v)}return best}
function ai(){const moves=free(b);if(!moves.length)return;const level=$('difficulty').value;let choice;if(level==='easy'||level==='medium'&&Math.random()<.5){choice=moves[Math.floor(Math.random()*moves.length)]}else{let best=-Infinity,opts=[];for(const i of moves){b[i]='O';const v=minimax(b,false,0);b[i]='';if(v>best){best=v;opts=[i]}else if(v===best)opts.push(i)}choice=opts[Math.floor(Math.random()*opts.length)]}place(choice)}
function move(i){if(ended||b[i]||mode==='phone'&&turn==='O')return;place(i);if(!ended&&mode==='phone'&&turn==='O'){const id=gameId;timer=setTimeout(()=>{timer=null;if(id===gameId&&!ended&&turn==='O')ai()},400)}}
function newGame(){gameId++;if(timer!==null){clearTimeout(timer);timer=null}b=Array(9).fill('');turn='X';ended=false;render()}
function setMode(m){mode=m;$('two').classList.toggle('active',m==='two');$('phone').classList.toggle('active',m==='phone');$('difficultyWrap').hidden=m!=='phone';$('labelO').textContent=m==='phone'?'TELEFON O':'IGRAČ O';score={X:0,O:0,D:0};persist();newGame()}
cells.forEach((c,i)=>c.addEventListener('click',()=>move(i)));$('two').onclick=()=>setMode('two');$('phone').onclick=()=>setMode('phone');$('new').onclick=newGame;$('reset').onclick=()=>{score={X:0,O:0,D:0};persist();newGame()};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));render();