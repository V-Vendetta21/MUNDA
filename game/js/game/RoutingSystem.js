/* MUNDA — route geometry, collision and cable-quality metrics */
(function(global){'use strict';const M=global.MUNDA=global.MUNDA||{};
 const EPS=1e-7;
 function same(a,b){return Math.abs(a.x-b.x)<EPS&&Math.abs(a.y-b.y)<EPS}
 function orient(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)}
 function segmentsCross(a,b,c,d){
  if(same(a,c)||same(a,d)||same(b,c)||same(b,d))return false;
  const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);
  return ((o1>EPS&&o2<-EPS)||(o1<-EPS&&o2>EPS))&&((o3>EPS&&o4<-EPS)||(o3<-EPS&&o4>EPS));
 }
 function countCrossings(routes){let total=0;for(let a=0;a<routes.length;a++)for(let b=a+1;b<routes.length;b++)for(let i=1;i<routes[a].length;i++)for(let j=1;j<routes[b].length;j++)if(segmentsCross(routes[a][i-1],routes[a][i],routes[b][j-1],routes[b][j]))total++;return total}
 function length(points){let n=0;for(let i=1;i<points.length;i++)n+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);return n}
 function bends(points){let n=0;for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1];const u=Math.atan2(b.y-a.y,b.x-a.x),v=Math.atan2(c.y-b.y,c.x-b.x);let d=Math.abs(v-u);if(d>Math.PI)d=Math.PI*2-d;if(d>.42)n++}return n}
 function segmentHitsRect(a,b,r,pad){pad=pad||0;const box={x:r.x-pad,y:r.y-pad,w:r.w+pad*2,h:r.h+pad*2};if(a.x>=box.x&&a.x<=box.x+box.w&&a.y>=box.y&&a.y<=box.y+box.h)return true;if(b.x>=box.x&&b.x<=box.x+box.w&&b.y>=box.y&&b.y<=box.y+box.h)return true;const p=[{x:box.x,y:box.y},{x:box.x+box.w,y:box.y},{x:box.x+box.w,y:box.y+box.h},{x:box.x,y:box.y+box.h}];return segmentsCross(a,b,p[0],p[1])||segmentsCross(a,b,p[1],p[2])||segmentsCross(a,b,p[2],p[3])||segmentsCross(a,b,p[3],p[0])}
 function routeBlocked(points,obstacles,pad){for(let i=1;i<points.length;i++)for(const o of obstacles||[])if(segmentHitsRect(points[i-1],points[i],o,pad))return true;return false}
 function measure(points,direct,opts){opts=opts||{};const len=length(points);const bendCount=bends(points);const efficiency=Math.max(0,Math.min(1,direct/Math.max(direct,len)));const guideRatio=opts.optionalGuides?Math.min(1,(opts.guidesUsed||0)/opts.optionalGuides):1;const quality=Math.max(0,Math.min(100,Math.round(efficiency*78+guideRatio*14-bendCount*5+8)));return{length:len,efficiency,bends:bendCount,guideRatio,quality}}
 function simplify(points,min){const out=[];for(const p of points||[]){if(!out.length||Math.hypot(p.x-out.at(-1).x,p.y-out.at(-1).y)>=(min||8))out.push({x:p.x,y:p.y})}return out}
 M.Routing={segmentsCross,countCrossings,length,bends,segmentHitsRect,routeBlocked,measure,simplify};
})(typeof window!=='undefined'?window:this);
