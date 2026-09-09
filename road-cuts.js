// Subtract real openings from the stone mesh; matching collision volumes live in game.js.
const relicRoadCache=new Map();
window.cutRelicRoad=function(group,s,obstacles,route){
 route=route||(typeof sections!=='undefined'?sections:[]);
 const gaps=obstacles.filter(o=>Math.abs(o.s-s)<3.6&&(o.type==='fire'||o.type==='crumble'||o.type==='spikes'&&o.s===163&&o.lanes.includes(-1))).map(o=>({x0:o.type==='spikes'?-2.83:-3.1,x1:o.type==='spikes'?-.92:3.1,z0:s-o.s-1.55,z1:s-o.s+1.55}));
 // Remove the parapet only where the adjoining road enters the corner. The
 // outer wall and complete floor remain; players no longer run through masonry.
 const wallCuts=[];
 let lo=0,hi=route.length-1;
 while(lo<hi){const mid=(lo+hi)>>1;if(s>=route[mid].end)lo=mid+1;else hi=mid;}
 const current=route[lo];
 if(current){
  const ca=Math.cos(current.angle),sa=Math.sin(current.angle);
  const px=current.x+sa*(s-current.s),pz=current.z-ca*(s-current.s);
  for(const i of [lo-1,lo]){
   const before=route[i],after=route[i+1];
   if(!before||!after||Math.abs(before.end-s)>8)continue;
   const other=lo===i?after:before,oa=other.angle;
   const from=lo===i?0:-12,to=lo===i?12:0,points=[];
   for(const side of [-3.12,3.12])for(const along of [from,to]){
    const dx=after.x+Math.cos(oa)*side+Math.sin(oa)*along-px;
    const dz=after.z+Math.sin(oa)*side-Math.cos(oa)*along-pz;
    points.push([ca*dx+sa*dz,-sa*dx+ca*dz]);
   }
   const round=v=>Math.round(v*10000)/10000;
   wallCuts.push({x0:round(Math.min(...points.map(p=>p[0]))),x1:round(Math.max(...points.map(p=>p[0]))),z0:round(Math.min(...points.map(p=>p[1]))),z1:round(Math.max(...points.map(p=>p[1])))});
  }
 }
 for(const mesh of group.children){if(!mesh.isMesh)continue;const source=mesh.userData.uncut||mesh.geometry;mesh.userData.uncut=source;mesh.geometry=source;if(!gaps.length&&!wallCuts.length)continue;const cacheKey=source.uuid+JSON.stringify([gaps,wallCuts]);if(relicRoadCache.has(cacheKey)){mesh.geometry=relicRoadCache.get(cacheKey);continue;}
 const p=source.attributes.position,n=source.attributes.normal,u=source.attributes.uv,rows=[];
 function split(poly,axis,value,sign){const inside=[],outside=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-value)*sign,db=(b[axis]-value)*sign;(da>=0?inside:outside).push(a);if((da>=0)!==(db>=0)){const t=da/(da-db),v=a.map((x,k)=>x+(b[k]-x)*t);inside.push(v);outside.push(v);}}return[inside,outside];}
 function subtract(poly,gap){let candidate=poly,output=[];for(const [axis,v,sign] of [[0,gap.x0,1],[0,gap.x1,-1],[2,gap.z0,1],[2,gap.z1,-1]]){if(candidate.length<3)break;const [inn,out]=split(candidate,axis,v,sign);if(out.length>=3)output.push(out);candidate=inn;}return output;}
 for(let i=0;i<p.count;i+=3){let polys=[Array.from({length:3},(_,j)=>[p.getX(i+j),p.getY(i+j),p.getZ(i+j),n.getX(i+j),n.getY(i+j),n.getZ(i+j),u.getX(i+j),u.getY(i+j)])];const raised=Math.max(...polys[0].map(v=>v[1]))>.33;for(const gap of raised?wallCuts:gaps)polys=polys.flatMap(poly=>subtract(poly,gap));for(const poly of polys)for(let j=1;j<poly.length-1;j++)rows.push(poly[0],poly[j],poly[j+1]);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(rows.flatMap(v=>v.slice(0,3)),3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(rows.flatMap(v=>v.slice(3,6)),3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(rows.flatMap(v=>v.slice(6,8)),2));geo.computeBoundingSphere();mesh.geometry=geo;relicRoadCache.set(cacheKey,geo);
 }
};
