/* MUNDA — deterministic offline daily challenge */
(function(global){'use strict';const M=global.MUNDA=global.MUNDA||{};
 function seedFor(d){d=d||new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
 function create(d){const seed=seedFor(d),mods=['ZERO CROSS','MEMORY','CLEAN ROOM','RUSH ORDER','BLACKOUT','MOVING LINE','PERFECT SHIFT','ROUTE MASTER','LOCKDOWN'];return{seed,date:String(seed),level:18+(seed%8),modifier:mods[seed%mods.length]}}
 M.Daily={seedFor,create};
})(typeof window!=='undefined'?window:this);
