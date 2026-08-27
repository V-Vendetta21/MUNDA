/* MUNDA — explicit game-state transition guard */
(function(global){'use strict';const M=global.MUNDA=global.MUNDA||{};
 const NEXT={MENU:['INTRO','PLAYING'],INTRO:['PLAYING','MENU'],PLAYING:['PAUSED','PANIC','SUCCESS','FAILURE','MENU'],PANIC:['PAUSED','SUCCESS','FAILURE','MENU'],PAUSED:['PLAYING','PANIC','MENU'],SUCCESS:['RESULTS'],FAILURE:['RESULTS'],RESULTS:['TRANSITION','MENU'],TRANSITION:['PLAYING','MENU']};
 function create(initial){let state=initial||'MENU';return{get state(){return state},transition(next){if(!(NEXT[state]||[]).includes(next))throw new Error('Invalid game transition '+state+' → '+next);state=next;return state},force(next){state=next;return state},canInput(){return state==='PLAYING'||state==='PANIC'}}}
 M.StateMachine={create,states:Object.keys(NEXT)};
})(typeof window!=='undefined'?window:this);
