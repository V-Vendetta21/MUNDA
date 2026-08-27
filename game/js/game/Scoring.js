/* MUNDA — multi-category assembly scoring and ranks */
(function(global){'use strict';const M=global.MUNDA=global.MUNDA||{};
 const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
 function grade(n){return n>=97?'S+':n>=90?'S':n>=80?'A':n>=68?'B':n>=54?'C':'D'}
 function calculate(d){const attempts=(d.correct||0)+(d.mistakes||0);const precision=clamp(attempts?(d.correct||0)/attempts*100:100);const routing=clamp(d.routeQuality==null?100:d.routeQuality);const speed=clamp((d.idealSeconds||1)/Math.max(1,d.elapsed||0)*88);const cableOrder=clamp(100-(d.crossings||0)*12);const sequence=clamp(100-(d.sequenceErrors||0)*24);const total=clamp(precision*.30+routing*.28+speed*.14+cableOrder*.18+sequence*.10);return{precision,routing,speed,cableOrder,sequence,total,grade:grade(total)}}
 const RANKS=['TRAINEE','ASSEMBLER','TECHNICIAN','SPECIALIST','ENGINEER','MASTER TECHNICIAN','SYSTEMS EXPERT','PRECISION MASTER'];
 function rank(progress){progress=progress||{};const points=(progress.highestLevel||1)*3+(progress.endlessLongest||0)*2+(progress.perfectBoards||0)*5+(progress.majorCompleted||0)*18+Math.round((progress.averageRouting||0)*.4);return RANKS[Math.min(RANKS.length-1,Math.floor(points/55))]}
 M.Scoring={calculate,grade,rank,RANKS};
})(typeof window!=='undefined'?window:this);
