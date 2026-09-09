/* Small stone inlays point into the real 90-degree junction; never a HUD cue. */
(function(){
window.createRelicRouteReadability=function({THREE,scene,path,material}){
 const shape=new THREE.Shape();
 shape.moveTo(-.48,-.52);shape.lineTo(-.10,-.52);shape.lineTo(-.10,.10);
 shape.lineTo(.38,.10);shape.lineTo(.38,-.10);shape.lineTo(.94,.32);
 shape.lineTo(.38,.75);shape.lineTo(.38,.49);shape.lineTo(-.48,.49);shape.closePath();
 const geometry=new THREE.ShapeGeometry(shape);
 const mat=new THREE.MeshStandardMaterial({color:0xbca77c,roughness:1,metalness:0,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const markers=Array.from({length:2},()=>{const group=new THREE.Group(),mesh=new THREE.Mesh(geometry,mat);mesh.rotation.x=-Math.PI/2;mesh.receiveShadow=true;group.add(mesh);scene.add(group);return group;});
 return{update(state,route){
  if(material&&mat.map!==material.map){mat.map=material.map;mat.needsUpdate=true;}
  for(let i=0;i<markers.length;i++){
   const marker=markers[i],section=route[state.nextTurn+i],s=section?section.end-6.6:0,d=s-state.s;
   marker.visible=!!section&&d>-1.5&&d<50;if(!marker.visible)continue;
   const p=path(s);marker.position.set(p.x,.09,p.z);marker.rotation.y=-p.angle;
   marker.children[0].scale.x=section.turn==='right'?1:-1;
  }
 },dispose(){for(const marker of markers)scene.remove(marker);geometry.dispose();mat.dispose();}};
};
})();
