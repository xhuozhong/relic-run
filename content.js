/* Deterministic encounters after the authored 20-second opening. */
(function(){
const zones=['藤蔓回廊','瀑布廊桥','祭火遗庭'];
window.RELIC_CONTENT={zones,zoneAt:s=>s<202?-1:Math.floor((s-202)/300)%3,
 build(sec,index,seed){let n=(Math.imul(index+1,2654435761)^seed)>>>0;const random=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);const objects=[],coins=[],relics=[];const lane=random()<.5?-1:1;const tier=Math.min(3,Math.floor((index-2)/4));const pattern=(index-2+Math.floor(random()*3))%6;
 const add=(type,offset,lanes,extra={})=>objects.push({type,s:sec.s+offset,lanes,...extra});
 const line=(offset,count,l,height=1.35)=>{for(let k=0;k<count;k++)coins.push({s:sec.s+offset+k*2.5,lane:l,height,taken:false,object:null});};
 // Every encounter has at least one safe lane. Risk lanes carry more coins.
 if(pattern===0){add('rubble',27,[lane]);line(21,6,lane,1.75);line(25,2,0);add('beam',57);add('spikes',86,[-lane,0]);line(87,3,lane);}
 if(pattern===1){add('jets',27,[lane,0],{phase:random()*6});line(20,5,lane);line(24,2,-lane);add('fire',57);add('rubble',85,[-lane]);line(79,6,-lane,1.75);}
 if(pattern===2){add('sweep',28,[],{phase:random()*6});line(24,4,lane);add('beam',56);add('fire',84);line(90,3,0);}
 if(pattern===3){add('spikes',26,[0,-lane]);line(21,4,lane);add('rubble',49,[lane]);line(44,5,lane,1.75);line(46,2,-lane);add('jets',78,[lane,-lane],{phase:random()*6});line(77,4,0);}
 if(pattern===4){add('fire',27);add('beam',51);add('sweep',79,[],{phase:random()*6});line(14,4,0);line(65,4,lane);}
 if(pattern===5){add('rubble',24,[lane]);add('jets',51,[0,lane],{phase:random()*6});add('beam',81);line(18,6,lane,1.75);line(46,2,-lane);line(88,3,0);}
 if(tier>0&&sec.end-sec.s>=120){add('rubble',106,[-lane]);line(100,5,-lane,1.75);}
 // Optional relic sits on the obstacle route; taking the other lane is safer.
 if(index%2===0){const risk=objects.find(o=>o.type==='rubble');if(risk)relics.push({s:risk.s,lane:risk.lanes[0],height:2.6,id:'relic-'+index,taken:false,object:null});else relics.push({s:sec.s+40,lane:lane,height:1.55,id:'relic-'+index,taken:false,object:null});}
 return{objects,coins,relics,pattern,zone:Math.floor((sec.s-202)/300)%3,tier};
 },
 jetActive:(o,t)=>((t+(o.phase||0))%3.4)<2.2,
 sweepX:(o,t)=>Math.sin(t*1.8+(o.phase||0))*2.05
};
})();
