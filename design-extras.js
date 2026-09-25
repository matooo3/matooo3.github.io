/* Loaded on demand. No libraries, network services or perpetual animation loop. */
export function createBlueprint() {
  const layer = document.createElement('div'); layer.className = 'blueprint-layer'; layer.setAttribute('aria-hidden', 'true');
  const scan = document.createElement('div'); scan.className = 'blueprint-scan'; layer.append(scan);
  scan.addEventListener('animationend', () => scan.remove(), { once: true });
  const targets = [...document.querySelectorAll('main>section')];
  const tags = new Map(), positioned = [];
  const observer = new ResizeObserver(entries => {
    for (const { target, contentRect } of entries) {
      const tag = tags.get(target); if (tag) tag.textContent = `${String(targets.indexOf(target) + 1).padStart(2, '0')} / ${Math.round(contentRect.width)} PX`;
    }
  });
  for (const target of targets) {
    if (getComputedStyle(target).position === 'static') { target.classList.add('blueprint-positioned'); positioned.push(target); }
    const tag = document.createElement('span'); tag.className = 'blueprint-tag'; tag.setAttribute('aria-hidden', 'true');
    target.classList.add('blueprint-target'); target.append(tag); tags.set(target, tag); observer.observe(target);
  }
  document.body.append(layer); document.body.classList.add('blueprint-active');
  return { destroy() { observer.disconnect(); layer.remove(); tags.forEach(tag => tag.remove()); targets.forEach(el => el.classList.remove('blueprint-target')); positioned.forEach(el => el.classList.remove('blueprint-positioned')); document.body.classList.remove('blueprint-active'); } };
}

export function createSculpture(figure) {
  const en = document.documentElement.lang === 'en', motion = matchMedia('(prefers-reduced-motion: reduce)');
  const host = document.createElement('div'); host.className = 'm-sculpture';
  host.innerHTML = `<div class="sculpture-label"><strong>MATZE / FORM STUDY</strong>${en ? 'IDEAS TAKE SHAPE' : 'IDEEN NEHMEN FORM AN'}</div><canvas class="sculpture-canvas" tabindex="0" role="img" aria-label="${en ? 'Interactive M sculpture. Drag to rotate freely in any direction. Arrow keys rotate; Home resets.' : 'Interaktive M-Skulptur. Ziehen zum freien Drehen in alle Richtungen. Pfeiltasten drehen; Pos1 setzt zurück.'}"></canvas><button type="button" class="sculpture-reset" title="${en ? 'Reset view' : 'Ansicht zurücksetzen'}" aria-label="${en ? 'Reset view' : 'Ansicht zurücksetzen'}">↺</button><div class="sculpture-controls" role="group" aria-label="Material"><button type="button" data-material="metal" aria-pressed="true">${en ? 'Metal' : 'Metall'}</button><button type="button" data-material="glass" aria-pressed="false">${en ? 'Glass' : 'Glas'}</button><button type="button" data-material="liquid" aria-pressed="false">Liquid Glass</button><button type="button" data-material="light" aria-pressed="false">${en ? 'Light' : 'Licht'}</button></div><p class="sculpture-hint">${en ? 'DRAG TO ROTATE 360° · ↑ ↓ ← →' : 'ZIEHEN ZUM DREHEN · 360° · ↑ ↓ ← →'}</p><p class="sculpture-status" role="status" hidden>${en ? 'Restoring the 3D view…' : '3D-Ansicht wird wiederhergestellt…'}</p>`;
  const canvas = host.querySelector('canvas');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: true, powerPreference: 'low-power' });
  if (!gl) throw Error('WebGL unavailable');

  // Closed, triangulated solid with actual rounded bevels. A depth buffer handles
  // occlusion at every angle, including the concave valleys of the letter.
  const outline = [[-1,1],[-.48,1],[0,.12],[.48,1],[1,1],[1,-1],[.49,-1],[.49,.06],[0,-.71],[-.49,.06],[-.49,-1],[-1,-1]].reverse();
  const cross = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const normalize = a => { const d = Math.hypot(...a); return a.map(v => v/d); };
  const edges = outline.map((p,i) => { const q=outline[(i+1)%outline.length]; return normalize([q[1]-p[1],p[0]-q[0]]); });
  const miters = outline.map((_,i) => { const a=edges[(i+edges.length-1)%edges.length], b=edges[i], d=1+a[0]*b[0]+a[1]*b[1]; return [(a[0]+b[0])/d,(a[1]+b[1])/d]; });
  const bevel=.065, halfDepth=.27, steps=5, vertices=[];
  const inset = outline.map((p,i)=>p.map((v,k)=>v-miters[i][k]*bevel));
  function triangle(a,b,c) { vertices.push(...a,...b,...c); }
  function cap(sign) {
    const remaining=inset.map((_,i)=>i);
    while (remaining.length>2) {
      const ear=remaining.findIndex((b,j)=>{
        const a=remaining[(j+remaining.length-1)%remaining.length], c=remaining[(j+1)%remaining.length];
        return cross(inset[a],inset[b],inset[c])>1e-8 && !remaining.some(p=>p!==a&&p!==b&&p!==c&&cross(inset[a],inset[b],inset[p])>=-1e-8&&cross(inset[b],inset[c],inset[p])>=-1e-8&&cross(inset[c],inset[a],inset[p])>=-1e-8);
      });
      if(ear<0) throw Error('Invalid sculpture geometry');
      const ids=[remaining[(ear+remaining.length-1)%remaining.length],remaining[ear],remaining[(ear+1)%remaining.length]];
      if(sign<0) ids.reverse();
      triangle(...ids.map(i=>[...inset[i],sign*halfDepth,0,0,sign]));
      remaining.splice(ear,1);
    }
  }
  cap(1); cap(-1);
  const rings=[];
  for(let j=0;j<=steps;j++) { const a=Math.PI/2-j/steps*Math.PI/2; rings.push({d:bevel*(1-Math.cos(a)),z:halfDepth-bevel+bevel*Math.sin(a),side:Math.cos(a),nz:Math.sin(a)}); }
  for(let j=0;j<=steps;j++) { const a=j/steps*Math.PI/2; rings.push({d:bevel*(1-Math.cos(a)),z:-halfDepth+bevel-bevel*Math.sin(a),side:Math.cos(a),nz:-Math.sin(a)}); }
  for(let r=0;r<rings.length-1;r++) for(let i=0;i<outline.length;i++) {
    const j=(i+1)%outline.length;
    // Keep the long side planes flat; smooth normals only around the bevel.
    const vertex=(index,ring)=>[outline[index][0]-miters[index][0]*ring.d,outline[index][1]-miters[index][1]*ring.d,ring.z,edges[i][0]*ring.side,edges[i][1]*ring.side,ring.nz];
    const a=vertex(i,rings[r]),b=vertex(j,rings[r]),c=vertex(j,rings[r+1]),d=vertex(i,rings[r+1]);
    triangle(a,d,c); triangle(a,c,b);
  }
  const mesh=new Float32Array(vertices);
  const vertexSource=`
    attribute vec3 aPosition, aNormal;
    uniform vec2 uResolution;
    uniform mat3 uRotation;
    uniform float uPass;
    varying vec3 vPosition, vNormal;
    varying float vBevel;
    void main(){
      vPosition=uRotation*aPosition; vNormal=uRotation*aNormal; vBevel=1.-abs(aNormal.z);
      if(uPass<.5){gl_Position=vec4(aPosition.xy,0.,1.);return;}
      float w=4.8-vPosition.z;
      float scale=min(uResolution.x*.29,uResolution.y*.24);
      gl_Position=vec4(vPosition.xy*scale*2./uResolution*4.8,1.01005025*w-.201005,w);
    }`;
  const fragmentSource=`
    precision highp float;
    uniform vec2 uResolution;
    uniform float uMaterial, uPass;
    uniform sampler2D uBack;
    varying vec3 vPosition, vNormal;
    varying float vBevel;
    vec3 background(vec2 uv){
      vec2 p=(uv-vec2(.47,.63))*vec2(1.,.85);
      vec3 c=mix(vec3(.035,.058,.071),vec3(.135,.195,.209),exp(-dot(p,p)*5.5));
      c+=vec3(.052,.031,.012)*exp(-dot(uv-vec2(.87,.28),uv-vec2(.87,.28))*13.);
      if(uMaterial>1.5&&uMaterial<2.5){
        // A soft studio backdrop makes the lensing visible through clear glass.
        vec2 cool=(uv-vec2(.25,.62))/vec2(.34,.30);
        vec2 warm=(uv-vec2(.76,.40))/vec2(.29,.34);
        c+=vec3(.045,.105,.16)*exp(-dot(cool,cool));
        c+=vec3(.105,.055,.075)*exp(-dot(warm,warm));
        float arc=exp(-pow((uv.y-.48-.12*sin(uv.x*5.))/.038,2.));
        c+=vec3(.022,.035,.047)*arc;
      }
      vec2 floor=(uv-vec2(.5,.205))/vec2(.34,.04);
      c*=1.-.48*exp(-dot(floor,floor)*1.6);
      float ring=exp(-pow((length(floor)-1.)*32.,2.));
      return c+vec3(.10,.14,.15)*ring;
    }
    vec3 environment(vec3 r, float rough){
      vec3 c=mix(vec3(.08,.12,.145),vec3(.52,.63,.66),smoothstep(-.75,.85,r.y));
      // Large studio softboxes, with a warm key and a cool rim. Reflections
      // follow the surface normal instead of sliding a gradient over the image.
      vec3 key=normalize(vec3(-.65,.65,1.));
      vec3 rim=normalize(vec3(.9,.15,.35));
      c+=vec3(1.,.86,.68)*1.8*pow(max(0.,dot(r,key)),mix(95.,12.,rough));
      c+=vec3(.68,.86,1.)*1.5*pow(max(0.,dot(r,rim)),mix(140.,18.,rough));
      float strip=exp(-pow((r.x+.28)/mix(.04,.19,rough),2.))*smoothstep(-.6,.35,r.y);
      c+=vec3(.82,.94,1.)*strip*1.3;
      c+=vec3(.6,.72,.85)*.35*pow(max(0.,dot(r,normalize(vec3(-.6,.2,-1.)))),10.);
      c+=vec3(.92,.96,1.)*1.4*pow(max(0.,dot(r,normalize(vec3(-.75,-.4,.8)))),mix(32.,8.,rough));
      float ribbon=exp(-pow((r.x+.63)/mix(.045,.13,rough),2.))*smoothstep(-.95,-.3,r.y);
      c+=vec3(1.,.94,.82)*ribbon*2.1;
      return c;
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/uResolution;
      if(uPass<.5){gl_FragColor=vec4(background(uv),1.);return;}
      vec3 n=normalize(vNormal),v=normalize(vec3(0.,0.,4.8)-vPosition);
      if(uPass<1.5){gl_FragColor=vec4(n*.5+.5,(vPosition.z+2.)*.25);return;}
      float facing=max(0.,dot(n,v)),fresnel=pow(1.-facing,5.);
      vec3 r=reflect(-v,n),color;
      if(uMaterial>.5&&uMaterial<2.5){
        vec4 back=texture2D(uBack,uv);
        float thickness=max(.02,vPosition.z-(back.a*4.-2.));
        vec3 ray=refract(-v,n,1./1.46);
        bool liquid=uMaterial>1.5;
        vec2 shift=(ray.xy+v.xy)*thickness*(liquid?.19:.065);
        vec3 transmitted=background(uv+shift);
        vec3 absorption=uMaterial<1.5?vec3(.72,.17,.10):vec3(.045,.027,.018);
        transmitted*=exp(-absorption*thickness);
        vec3 bn=normalize(back.rgb*2.-1.);
        vec3 backLight=environment(reflect(-v,-bn),.04);
        float f=.055+.945*fresnel;
        color=mix(transmitted,environment(r,.035)*.86,f);
        color+=backLight*.055*(1.-f);
        color+=vec3(.57,.81,.84)*pow(1.-facing,3.)*.085;
        if(liquid){
          // Liquid Glass-inspired lensing: a clear centre, softly polished edges,
          // broader specular highlights and very restrained colour separation.
          float edge=smoothstep(.02,.85,vBevel);
          vec2 dispersion=n.xy*edge*.0025;
          transmitted=vec3(background(uv+shift+dispersion).r,transmitted.g,background(uv+shift-dispersion).b);
          vec3 softReflection=environment(r,.17);
          float reflection=.075+.62*fresnel+.14*edge;
          color=mix(transmitted,softReflection*.84,clamp(reflection,0.,.8));
          color+=backLight*.024*(1.-fresnel);
          float rim=pow(1.-facing,2.5);
          float key=pow(max(0.,dot(r,normalize(vec3(-.6,.7,.65)))),18.);
          color+=vec3(.84,.93,1.)*(rim*.17+edge*(.07+key*.20));
        }
      }else{
        float diffuse=.35+.65*max(0.,dot(n,normalize(vec3(-.6,.8,1.))));
        vec3 base=uMaterial<.5?vec3(.73,.63,.46):mix(vec3(.31,.58,.82),vec3(.72,.52,.81),.5+.5*sin(n.x*3.+n.y*2.));
        vec3 reflection=environment(r,uMaterial<.5?.22:.13);
        color=base*(diffuse*.26+reflection*.72);
        color+=environment(r,.015)*(.025+.18*fresnel);
        color=color/(vec3(1.)+color*.42);
      }
      gl_FragColor=vec4(color,1.);
    }`;
  let program, buffer, quad, backTexture, backDepth, backTarget, uniforms, position, normal;
  function resources() {
    const shaders=[];
    try {
      for(const [type,source] of [[gl.VERTEX_SHADER,vertexSource],[gl.FRAGMENT_SHADER,fragmentSource]]) {
        const shader=gl.createShader(type); shaders.push(shader); gl.shaderSource(shader,source); gl.compileShader(shader);
        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
      }
      program=gl.createProgram(); shaders.forEach(s=>gl.attachShader(program,s)); gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      position=gl.getAttribLocation(program,'aPosition'); normal=gl.getAttribLocation(program,'aNormal');
      uniforms=Object.fromEntries(['uResolution','uRotation','uMaterial','uPass','uBack'].map(name=>[name,gl.getUniformLocation(program,name)]));
      buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.STATIC_DRAW);
      quad=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,quad); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      backTexture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,backTexture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      backDepth=gl.createRenderbuffer(); backTarget=gl.createFramebuffer();
    } catch(error) { dispose(); throw error; }
    finally { shaders.forEach(s=>gl.deleteShader(s)); }
  }
  function dispose() { gl.deleteBuffer(buffer);gl.deleteBuffer(quad);gl.deleteProgram(program);gl.deleteTexture(backTexture);gl.deleteRenderbuffer(backDepth);gl.deleteFramebuffer(backTarget); }
  resources();
  figure.append(host); figure.classList.add('sculpture-active');
  let frame=0, visible=false, destroyed=false, lost=false, material=0;
  // Screen-space quaternion rotations avoid both angle limits and gimbal lock.
  const multiply=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
  const initial=normalize(multiply([Math.sin(.11),0,0,Math.cos(.11)],[0,Math.sin(-.18),0,Math.cos(-.18)]));
  let orientation=[...initial],target=[...initial],activePointer=null,lastX=0,lastY=0;
  function matrix([x,y,z,w]) { return new Float32Array([1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w),2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w),2*(x*z+y*w),2*(y*z-x*w),1-2*(x*x+y*y)]); }
  function paint() {
    gl.useProgram(program); gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform2f(uniforms.uResolution,canvas.width,canvas.height); gl.uniformMatrix3fv(uniforms.uRotation,false,matrix(orientation));
    gl.uniform1f(uniforms.uMaterial,material); gl.uniform1i(uniforms.uBack,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.bindBuffer(gl.ARRAY_BUFFER,quad); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0); gl.disableVertexAttribArray(normal); gl.vertexAttrib3f(normal,0,0,1);
    gl.uniform1f(uniforms.uPass,0); gl.drawArrays(gl.TRIANGLES,0,6);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0); gl.enableVertexAttribArray(normal); gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.depthFunc(gl.LESS); gl.clearDepth(1);
    if(material===1||material===2) {
      gl.bindTexture(gl.TEXTURE_2D,null); gl.bindFramebuffer(gl.FRAMEBUFFER,backTarget); gl.clearColor(.5,.5,.5,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.cullFace(gl.FRONT); gl.uniform1f(uniforms.uPass,1); gl.drawArrays(gl.TRIANGLES,0,mesh.length/6);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.clear(gl.DEPTH_BUFFER_BIT); gl.cullFace(gl.BACK);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,backTexture); gl.uniform1f(uniforms.uPass,2); gl.drawArrays(gl.TRIANGLES,0,mesh.length/6);
  }
  function sculptureFrame(){
    frame=0;if(destroyed||lost||!visible||document.hidden)return;
    let dot=orientation.reduce((sum,v,i)=>sum+v*target[i],0);
    if(dot<0){target=target.map(v=>-v);dot=-dot;}
    const settled=dot>.9999999;
    orientation=motion.matches||activePointer!==null||settled?[...target]:normalize(orientation.map((v,i)=>v+(target[i]-v)*.23));
    paint();if(!settled&&!motion.matches&&activePointer===null)wake();
  }
  function wake(){if(!frame&&!destroyed&&!lost&&visible&&!document.hidden)frame=requestAnimationFrame(sculptureFrame);}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
  function resize(){
    if(lost||destroyed)return;
    const rect=host.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,1.75,1100/Math.max(1,rect.width,rect.height));
    canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));
    gl.bindTexture(gl.TEXTURE_2D,backTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,canvas.width,canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.bindRenderbuffer(gl.RENDERBUFFER,backDepth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,canvas.width,canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER,backTarget);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,backTexture,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,backDepth);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);wake();
  }
  function rotate(dx,dy){const length=Math.hypot(dx,dy);if(!length)return;const angle=length*.008,s=Math.sin(angle/2)/length;target=normalize(multiply([dy*s,dx*s,0,Math.cos(angle/2)],target));wake();}
  function move(e){if(activePointer!==e.pointerId)return;rotate(e.clientX-lastX,e.clientY-lastY);lastX=e.clientX;lastY=e.clientY;}
  function down(e){if(e.button!==0||activePointer!==null)return;activePointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});host.classList.add('is-dragging');}
  function release(e){if(activePointer!==e.pointerId)return;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);activePointer=null;host.classList.remove('is-dragging');}
  function reset(){target=[...initial];wake();}
  function keys(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home')reset();else rotate((e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0)*20,(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)*20);}
  function choose(e){const button=e.target.closest('[data-material]');if(!button)return;material={metal:0,glass:1,liquid:2,light:3}[button.dataset.material];host.querySelectorAll('[data-material]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));wake();}
  function visibility(){if(document.hidden)stop();else wake();}
  function reduced(){stop();orientation=[...target];wake();}
  function contextLost(e){e.preventDefault();lost=true;stop();host.querySelector('.sculpture-status').hidden=false;}
  function contextRestored(){try{resources();lost=false;resize();host.querySelector('.sculpture-status').hidden=true;}catch{host.querySelector('.sculpture-status').textContent=en?'Please toggle the sculpture off and on to retry.':'Bitte die Skulptur aus- und wieder einschalten.';}}
  canvas.addEventListener('pointermove',move,{passive:true});canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);canvas.addEventListener('keydown',keys);
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);host.addEventListener('click',choose);host.querySelector('.sculpture-reset').addEventListener('click',reset);
  document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',reduced);
  const ro=new ResizeObserver(resize);ro.observe(host);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else stop();});io.observe(figure);
  resize();
  return {destroy(){destroyed=true;stop();ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',reduced);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);dispose();gl.getExtension('WEBGL_lose_context')?.loseContext();host.remove();figure.classList.remove('sculpture-active');canvas.width=canvas.height=1;}};
}
