/* 3D skinned character. CMU 09_01 motion capture running; Quaternius CC0 action clips. */
(function(){
window.createRelicRunner=async function(url){
 const gltf=await new RelicGLTFLoader().loadAsync(url),model=gltf.scene,bones={};
 const key=s=>s.replace(/[^a-z0-9]/gi,'').toLowerCase();
 model.traverse(o=>{if(o.isBone)bones[key(o.name)]=o;if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.envMapIntensity=.48;m.side=THREE.FrontSide;if(/hair/i.test(o.name)||/hair/i.test(m.name)){o.receiveShadow=false;m.roughness=.49;m.envMapIntensity=.45;m.transparent=false;m.depthWrite=true;}}}});
 const clips=gltf.animations,mixer=new THREE.AnimationMixer(model),actions={};
 for(const clip of clips){const a=mixer.clipAction(clip);if(clip.name!=='run'){a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;}actions[clip.name]=a;}
 let current='run',air=false,landLeft=0,lastTime=-1,lastX=0,lastTurn=0,turnLean=0,lean=0,hairTime=0;
 // Three bounded secondary joints follow the captured pose. Gameplay owns movement.
 const hairJoints=[0,1,2].map(i=>({bone:bones['hair'+i],pitch:0,yaw:0,pv:0,yv:0})),hairDelta=new THREE.Quaternion(),hairEuler=new THREE.Euler();
 actions.run.play();mixer.update(0);
 function change(name,fade){if(name===current)return;const next=actions[name];next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();actions[current].crossFadeTo(next,fade,false);current=name;}
 function reset(){mixer.stopAllAction();current='run';actions.run.reset().setEffectiveWeight(1).play();air=false;landLeft=0;lastX=0;lastTurn=0;lean=0;turnLean=0;hairTime=0;for(const h of hairJoints)h.pitch=h.yaw=h.pv=h.yv=0;model.rotation.z=0;mixer.update(0); }
 return {model,mixer,clips,bones,reset,update(state,dt){
  dt=Math.min(dt,.05);if(state.time!==undefined&&state.time<lastTime)reset();lastTime=state.time??0;
  const airborne=state.y>.005||(state.vy||0)>0;if(air&&!airborne)landLeft=.16;landLeft=Math.max(0,landLeft-dt);
  const name=state.slide>0?'slide':airborne?'jump':state.stumble>0?'stumble':landLeft>0?'land':'run';
  change(name,name==='slide'?.045:name==='land'?.05:.10);actions.run.setEffectiveTimeScale(Math.pow((state.speed||10)/10,.55));mixer.update(dt);air=airborne;
  const x=state.x||0,sideVelocity=(x-lastX)/Math.max(.001,dt);lastX=x;
  if((state.turns||0)!==lastTurn){turnLean=lastTurn%2===0?.16:-.16;lastTurn=state.turns||0;}
  turnLean*=Math.exp(-dt*5);const desired=THREE.MathUtils.clamp(sideVelocity*.014,-.15,.15)+turnLean;lean+=(desired-lean)*(1-Math.exp(-dt*12));model.rotation.z=lean;
  hairTime+=dt;const cadence=hairTime*2*Math.PI/.66,drag=THREE.MathUtils.clamp(-sideVelocity*.008-turnLean*.16,-.09,.09);
  for(let i=0;i<hairJoints.length;i++){const h=hairJoints[i];if(!h.bone)continue;const targetPitch=(state.slide>0?-.018:.014)+Math.sin(cadence-i*.7)*.022-THREE.MathUtils.clamp((state.vy||0)*.004,-.025,.025),targetYaw=drag+Math.sin(cadence*.5-i*.8)*.023;
   // Substeps keep the spring stable on a slow frame, with no allocations per frame.
   for(let n=0;n<2;n++){const d=dt*.5;h.pv+=(targetPitch-h.pitch)*85*d-h.pv*15*d;h.yv+=(targetYaw-h.yaw)*65*d-h.yv*13*d;h.pitch=THREE.MathUtils.clamp(h.pitch+h.pv*d,-.08,.08);h.yaw=THREE.MathUtils.clamp(h.yaw+h.yv*d,-.1,.1);}
   hairEuler.set(h.pitch,0,h.yaw);hairDelta.setFromEuler(hairEuler);h.bone.quaternion.multiply(hairDelta);
  }
 },get animationState(){return{clip:current,time:actions[current].time,loop:actions[current].loop,lean,hair:hairJoints.map(h=>({pitch:h.pitch,yaw:h.yaw}))};},info:{type:'SkinnedMesh',bones:Object.keys(bones).length,clips:clips.map(c=>c.name),animationSource:'CMU Graphics Lab 09_01 (120Hz), frames 7-95; Quaternius CC0 other actions',revision:5}};
};
})();
