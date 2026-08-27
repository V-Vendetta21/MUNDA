/* MUNDA — procedural-board validation */
(function(global){'use strict';const M=global.MUNDA=global.MUNDA||{};
 function validate(p){const errors=[];if(!p||p.count<1||p.wires?.length!==p.count||p.left?.length!==p.count||p.right?.length!==p.count)errors.push('terminal-count');if(p){const L=new Set((p.left||[]).map(t=>t.wire)),R=new Set((p.right||[]).map(t=>t.wire));for(let i=0;i<p.count;i++)if(!L.has(i)||!R.has(i))errors.push('missing-pair-'+i);for(const route of p.routes||[])if(M.Routing&&M.Routing.routeBlocked(route,p.obstacles||[],.01))errors.push('blocked-route');for(const g of (p.guides||[]).filter(g=>g.required))if(!Number.isInteger(g.wire)||g.wire<0||g.wire>=p.count)errors.push('invalid-guide');if(p.sequence){const seq=new Set(p.sequence);if(seq.size!==p.sequence.length||[...seq].some(i=>i<0||i>=p.count))errors.push('invalid-sequence')}if(p.timerSeconds&&p.timerSeconds<Math.max(6,p.count*1.2))errors.push('unfair-timer')}
 return{valid:errors.length===0,errors}}
 M.PuzzleValidator={validate};
})(typeof window!=='undefined'?window:this);
