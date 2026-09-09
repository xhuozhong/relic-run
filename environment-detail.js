/* Relic Run: inexpensive, world-anchored wear and bridge-edge undergrowth.
 * All artwork here is procedural geometry/data. Existing licensed PBR textures
 * remain the surface source; this module does not replace the playable view.
 */
(function (global) {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function hash(a, b = 0) {
    let n = Math.imul((a | 0) ^ 0x6a09e667, 374761393) ^ Math.imul((b | 0) + 1013, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function periodicNoise(x, y, scale) {
    x *= scale; y *= scale;
    const ix = Math.floor(x), iy = Math.floor(y), u = x - ix, v = y - iy;
    const sx = u * u * (3 - 2 * u), sy = v * v * (3 - 2 * v);
    const p = (a, b) => hash((a + scale) % scale, (b + scale) % scale);
    const a = p(ix, iy) * (1 - sx) + p(ix + 1, iy) * sx;
    const b = p(ix, iy + 1) * (1 - sx) + p(ix + 1, iy + 1) * sx;
    return a * (1 - sy) + b * sy;
  }
  function weatherTexture(THREE) {
    const size = 128, bytes = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size, i = (y * size + x) * 4;
      bytes[i] = Math.round(255 * (.58 * periodicNoise(u, v, 4) + .30 * periodicNoise(u, v, 12) + .12 * periodicNoise(u, v, 32)));
      bytes[i + 1] = Math.round(255 * (.64 * periodicNoise(u, v, 7) + .36 * periodicNoise(u, v, 23)));
      bytes[i + 2] = Math.round(255 * periodicNoise(u, v, 43));
      bytes[i + 3] = 255;
    }
    const texture = new THREE.DataTexture(bytes, size, size, THREE.RGBAFormat);
    texture.name = 'World anchored moss, mineral bloom and moisture data';
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.colorSpace = THREE.NoColorSpace;
    texture.needsUpdate = true;
    return texture;
  }
  function weatherMaterial(material, texture, strength) {
    if (!material || !material.isMeshStandardMaterial || material.userData.relicWeather) return null;
    const originalCompile = material.onBeforeCompile;
    const originalKey = material.customProgramCacheKey;
    const shared = { value: strength };
    material.onBeforeCompile = function (shader, renderer) {
      originalCompile.call(this, shader, renderer);
      shader.uniforms.relicWeatherMap = { value: texture };
      shader.uniforms.relicWeatherAmount = shared;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRelicWearPosition;');
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvRelicWearPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vRelicWearPosition;\nuniform sampler2D relicWeatherMap;\nuniform float relicWeatherAmount;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        vec2 relicWearUv = vRelicWearPosition.xz * 0.073 + vRelicWearPosition.y * vec2(0.047, 0.031);
        vec3 relicWear = texture2D(relicWeatherMap, relicWearUv).rgb;
        float relicMoss = smoothstep(0.39, 0.65, relicWear.r) * relicWeatherAmount;
        float relicMoisture = smoothstep(0.57, 0.80, relicWear.g) * relicWeatherAmount;
        float relicMineral = smoothstep(0.70, 0.92, relicWear.b) * (1.0 - relicMoss);
        diffuseColor.rgb *= mix(vec3(1.045, 1.025, 0.975), vec3(0.52, 0.69, 0.33), relicMoss * 0.72);
        diffuseColor.rgb *= 1.0 - relicMoisture * 0.16;
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.25, 1.22, 1.02), relicMineral * 0.27);
      `);
      shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor *= mix(1.025, 0.81, relicMoisture);
        roughnessFactor = clamp(roughnessFactor + relicMoss * 0.035, 0.42, 1.0);
      `);
    };
    material.customProgramCacheKey = () => 'relic-world-wear-v1:' + originalKey.call(material);
    material.userData.relicWeather = true;
    material.needsUpdate = true;
    return () => { material.onBeforeCompile = originalCompile; material.customProgramCacheKey = originalKey; delete material.userData.relicWeather; material.needsUpdate = true; };
  }
  function undergrowthGeometry(THREE) {
    const positions = [], normals = [], colors = [];
    // Nine narrow leaves with a raised centre vein: no large opaque fern cards.
    for (let k = 0; k < 9; k++) {
      const angle = k * 2.399963 + hash(k, 16) * .23;
      const len = .18 + hash(k, 45) * .29, spread = .11 + hash(k, 22) * .22;
      const width = .017 + hash(k, 66) * .017;
      const dx = Math.sin(angle), dz = Math.cos(angle), sx = Math.cos(angle), sz = -Math.sin(angle);
      const vertices = [[0,0,0], [dx*spread*.47+sx*width,len*.60,dz*spread*.47+sz*width], [dx*spread*.5,len*.67,dz*spread*.5], [dx*spread*.47-sx*width,len*.60,dz*spread*.47-sz*width], [dx*spread,len*.71,dz*spread]];
      for (const tri of [[0,1,2],[0,2,3],[1,4,2],[2,4,3]]) {
        const a = new THREE.Vector3(...vertices[tri[0]]), b = new THREE.Vector3(...vertices[tri[1]]), c = new THREE.Vector3(...vertices[tri[2]]);
        const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
        for (const j of tri) {
          positions.push(...vertices[j]); normals.push(normal.x,normal.y,normal.z);
          const light = j === 2 ? 1 : .65 + j * .055;
          colors.push(.16 * light, .23 * light, .060 * light);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geometry.computeBoundingSphere();
    return geometry;
  }
  global.initRelicEnvironment = function initRelicEnvironment(options) {
    const { THREE, scene, materials = {}, path, obstacles = [], greenPool = [], leafGeometry } = options;
    if (!THREE || !scene || typeof path !== 'function') throw new Error('Relic environment requires THREE, scene and path(s).');
    const texture = weatherTexture(THREE), restore = [];
    const strengths = { stone: .91, dark: .88, sculpture: .84, moss: .25 };
    for (const [key, strength] of Object.entries(strengths)) {
      const undo = weatherMaterial(materials[key], texture, strength);
      if (undo) restore.push(undo);
    }
    // Existing vine leaves were oversize at the rear chase-camera scale.
    if (leafGeometry && !leafGeometry.userData.relicRefined) {
      leafGeometry.scale(.66, .66, .66);
      leafGeometry.userData.relicRefined = true;
    }
    if (materials.foliage) { materials.foliage.color.set(0x9aab60); materials.foliage.envMapIntensity = .72; }
    if (materials.fern) { materials.fern.color.set(0xd0d2a8); materials.fern.envMapIntensity = .64; }
    for (const group of greenPool) for (const child of group.children) {
      if (child.isGroup && child.children.some(o => o.isMesh && o.material === materials.fern) && !child.userData.relicRefined) {
        child.scale.multiplyScalar(.72);
        child.rotation.z = Math.sign(child.position.x) * -.12;
        child.updateMatrix();
        child.userData.relicRefined = true;
      }
    }
    const geometry = undergrowthGeometry(THREE);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color:0xffffff, vertexColors:true, side:THREE.DoubleSide, roughness:1, metalness:0, envMapIntensity:.8 });
    const capacity = options.quality === 'low' ? 96 : 192;
    const foliage = new THREE.InstancedMesh(geometry, foliageMaterial, capacity);
    foliage.name = 'Low seam vegetation, outside playable lanes';
    foliage.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    foliage.receiveShadow = true;
    foliage.castShadow = false;
    foliage.frustumCulled = false;
    scene.add(foliage);
    const pebbleGeometry = new THREE.IcosahedronGeometry(1,0);
    const pebbleMaterial = new THREE.MeshStandardMaterial({ color:0x7b7860, roughness:1, envMapIntensity:.35 });
    const pebbles = new THREE.InstancedMesh(pebbleGeometry,pebbleMaterial,capacity);
    pebbles.name = 'Weathered stone chips at bridge margins';
    pebbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pebbles.receiveShadow = true; pebbles.castShadow = false; pebbles.frustumCulled = false;
    scene.add(pebbles);
    const dummy = new THREE.Object3D(), tint = new THREE.Color();
    let lastBlock = null, invalidated = true;
    function isOpen(s,x) {
      return obstacles.some(o => Math.abs(o.s-s)<1.80 && (o.type==='fire' || o.type==='crumble' || o.type==='spikes' && o.lanes.includes(-1) && x<-.86));
    }
    function update(distance, force = false) {
      const block = Math.floor(distance / 4);
      if (!force && !invalidated && block === lastBlock) return;
      invalidated = false; lastBlock = block;
      let plants=0, stones=0;
      const firstIndex = Math.max(0,Math.floor((block*4-12)/1.32)), intervals = options.quality==='low'?36:64;
      for (let k=0;k<intervals;k++) {
        const key = firstIndex+k;
        for (const side of [-1,1]) {
          if(hash(key,side+93)<.19)continue;
          const s = key*1.32+(hash(key,side+101)-.5)*.92;
          if(s<0)continue;
          const p = path(s), sin = Math.sin(p.angle), cos = Math.cos(p.angle);
          const x = side*(2.65+hash(key,side+6)*.30);
          if (isOpen(s,x)) continue;
          dummy.position.set(p.x+cos*x,.027,p.z+sin*x);
          dummy.rotation.set((hash(key,21)-.5)*.28,hash(key,12)*Math.PI*2,(hash(key,9)-.5)*.34);
          const scale=.43+hash(key,side+51)*.79;
          dummy.scale.set(scale,scale*(.56+hash(key,72)*.55),scale);
          dummy.updateMatrix();foliage.setMatrixAt(plants,dummy.matrix);
          tint.setRGB(.76+hash(key,88)*.23,.83+hash(key,63)*.17,.65+hash(key,27)*.23);
          foliage.setColorAt(plants++,tint);
          if (hash(key,side+39)>.23 && stones<capacity) {
            const px=side*(2.59+hash(key,48)*.20);
            dummy.position.set(p.x+cos*px,.035,p.z+sin*px+.09);
            dummy.rotation.set(hash(key,71),hash(key,72)*5,hash(key,73));
            const size=.025+hash(key,side+25)*.052;
            dummy.scale.set(size*1.3,size*.45,size*.8);dummy.updateMatrix();pebbles.setMatrixAt(stones,dummy.matrix);
            tint.setRGB(.76+hash(key,81)*.24,.73+hash(key,83)*.22,.62+hash(key,87)*.28);
            pebbles.setColorAt(stones++,tint);
          }
        }
      }
      foliage.count=plants;pebbles.count=stones;
      foliage.instanceMatrix.needsUpdate=pebbles.instanceMatrix.needsUpdate=true;
      if(foliage.instanceColor)foliage.instanceColor.needsUpdate=true;
      if(pebbles.instanceColor)pebbles.instanceColor.needsUpdate=true;
    }
    update(0,true);
    return {
      update,
      invalidate() { invalidated=true; },
      stats() { return {additionalDrawCalls:2,visiblePlants:foliage.count,visibleStoneChips:pebbles.count,additionalTriangles:foliage.count*36+pebbles.count*20,weatherDataPixels:128*128,geometryCutoutsPreserved:true}; },
      dispose() { scene.remove(foliage,pebbles);geometry.dispose();foliageMaterial.dispose();pebbleGeometry.dispose();pebbleMaterial.dispose();texture.dispose();restore.forEach(fn=>fn()); }
    };
  };
})(window);
