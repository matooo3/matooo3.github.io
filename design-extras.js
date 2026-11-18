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

export function createSculpture(figure, { bouncy = false } = {}) {
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
  const bevel=.065, halfDepth=.27, steps=5, vertices=[], faces=[];
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
      if(sign>0) faces.push(ids);
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
    uniform float uPass, uScale;
    uniform vec3 uBounce;
    uniform vec2 uStretch;
    varying vec3 vPosition, vNormal;
    varying float vBevel;
    void main(){
      vPosition=uRotation*aPosition; vNormal=uRotation*aNormal; vBevel=1.-abs(aNormal.z);
      if(uPass<.5){gl_Position=vec4(aPosition.xy,0.,1.);return;}
      vPosition.xy*=uStretch; vNormal.xy/=uStretch; vPosition.z+=uBounce.z;
      float w=4.8-vPosition.z;
      float scale=min(uResolution.x*.29,uResolution.y*.24)*uScale;
      gl_Position=vec4(vPosition.xy*scale*2./uResolution*4.8+uBounce.xy*2./uResolution*w,1.01005025*w-.201005,w);
    }`;
  const fragmentSource=`
    precision highp float;
    uniform vec2 uResolution;
    uniform float uMaterial, uPass;
    uniform vec3 uShadow;
    uniform float uBouncy;
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
      vec2 shadowCentre=mix(vec2(.5,.205),uShadow.xy,uBouncy);
      vec2 floor=(uv-shadowCentre)/mix(vec2(.34,.04),vec2(.105+.08*uShadow.z,.012+.026*uShadow.z),uBouncy);
      c*=1.-mix(.48,.56*(1.-uShadow.z*.72),uBouncy)*exp(-dot(floor,floor)*1.6);
      float ring=exp(-pow((length(floor)-1.)*32.,2.));
      return c+vec3(.10,.14,.15)*ring*(1.-uBouncy);
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
      uniforms=Object.fromEntries(['uResolution','uRotation','uMaterial','uPass','uBack','uScale','uBounce','uStretch','uShadow','uBouncy'].map(name=>[name,gl.getUniformLocation(program,name)]));
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
  let frame=0, visible=false, destroyed=false, lost=false, material=0, lastTime=0;
  const bounce = createSoftBody(outline, faces);
  const elasticMesh = mesh.slice();
  const bindings = [];
  const surfaceEdges = [];
  const edgeNormals = new Float32Array(outline.length*2);
  for(let i=0;i<mesh.length;i+=6){
    const distances=outline.map(([x,y])=>Math.hypot(mesh[i]-x,mesh[i+1]-y));
    const corner=distances.indexOf(Math.min(...distances));
    bindings.push(corner);
    const previous=(corner+outline.length-1)%outline.length;
    const alignment=edge=>edges[edge][0]*mesh[i+3]+edges[edge][1]*mesh[i+4];
    surfaceEdges.push(alignment(previous)>alignment(corner)?previous:corner);
  }
  let meshDirty=false;
  function updateMesh(pose){
    if(!pose && !meshDirty)return;
    if(pose){
      const cosine=Math.cos(pose.roll),sine=Math.sin(pose.roll);
      // Keep bevel highlights aligned with the actual bent side of the letter.
      for(let edge=0;edge<outline.length;edge++){
        const a=bounce.nodes[edge],b=bounce.nodes[(edge+1)%outline.length];
        const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
        edgeNormals[2*edge]=length?(cosine*dy-sine*dx)/length:edges[edge][0];
        edgeNormals[2*edge+1]=length?(-sine*dy-cosine*dx)/length:edges[edge][1];
      }
      for(let i=0;i<mesh.length;i+=6){
        const n=bounce.nodes[bindings[i/6]];
        const dx=(n.x-pose.x)/pose.unit,dy=(n.y-pose.y)/pose.unit;
        elasticMesh[i]=mesh[i]-n.rx+cosine*dx+sine*dy;
        elasticMesh[i+1]=mesh[i+1]-n.ry-sine*dx+cosine*dy;
        elasticMesh[i+2]=mesh[i+2]*(1+n.bulge);
        const edge=2*surfaceEdges[i/6],side=Math.hypot(mesh[i+3],mesh[i+4]);
        elasticMesh[i+3]=side*edgeNormals[edge];
        elasticMesh[i+4]=side*edgeNormals[edge+1];
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,pose?elasticMesh:mesh);
    meshDirty=!!pose;
  }
  let bouncePose = null;
  // Screen-space quaternion rotations avoid both angle limits and gimbal lock.
  const multiply=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
  const initial=normalize(multiply([Math.sin(.11),0,0,Math.cos(.11)],[0,Math.sin(-.18),0,Math.cos(-.18)]));
  let orientation=[...initial],target=[...initial],activePointer=null,lastX=0,lastY=0;
  function matrix([x,y,z,w]) { return new Float32Array([1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w),2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w),2*(x*z+y*w),2*(y*z-x*w),1-2*(x*x+y*y)]); }
  function paint() {
    gl.useProgram(program); gl.viewport(0,0,canvas.width,canvas.height);
    const pose = bouncy && !motion.matches ? bouncePose : null;
    let rotation = orientation;
    if (pose) {
      const roll=[0,0,Math.sin(pose.roll/2),Math.cos(pose.roll/2)];
      const tilt=multiply([Math.sin(pose.pitch/2),0,0,Math.cos(pose.pitch/2)],[0,Math.sin(pose.yaw/2),0,Math.cos(pose.yaw/2)]);
      rotation=multiply(roll,tilt);
    }
    updateMesh(pose);
    gl.uniform2f(uniforms.uResolution,canvas.width,canvas.height); gl.uniformMatrix3fv(uniforms.uRotation,false,matrix(rotation));
    gl.uniform1f(uniforms.uScale,pose?.scale ?? 1);
    gl.uniform3f(uniforms.uBounce,pose?.x ?? 0,pose?.y ?? 0,pose?.z ?? 0);
    gl.uniform2f(uniforms.uStretch,pose?.sx ?? 1,pose?.sy ?? 1);
    gl.uniform3f(uniforms.uShadow,pose?.shadowX ?? .5,pose?.shadowY ?? .205,pose?.height ?? 0);
    gl.uniform1f(uniforms.uBouncy,pose ? 1 : 0);
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
  function sculptureFrame(time){
    frame=0;if(destroyed||lost||!visible||document.hidden)return;
    const animate = bouncy && !motion.matches;
    if (bouncy && !motion.matches) bouncePose = bounce.step(animate && lastTime ? Math.min((time-lastTime)/1000,.05) : 0,canvas.width,canvas.height);
    lastTime = animate ? time : 0;
    let dot=orientation.reduce((sum,v,i)=>sum+v*target[i],0);
    if(dot<0){target=target.map(v=>-v);dot=-dot;}
    const settled=dot>.9999999;
    orientation=motion.matches||activePointer!==null||settled?[...target]:normalize(orientation.map((v,i)=>v+(target[i]-v)*.23));
    paint();if(animate || (!settled&&!motion.matches&&activePointer===null))wake();
  }
  function wake(){if(!frame&&!destroyed&&!lost&&visible&&!document.hidden)frame=requestAnimationFrame(sculptureFrame);}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;}
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
  function pointer(e){
    const rect=canvas.getBoundingClientRect();
    return [(e.clientX-rect.left-rect.width/2)*canvas.width/rect.width,
            (rect.height/2-e.clientY+rect.top)*canvas.height/rect.height,e.timeStamp];
  }
  function move(e){
    if(activePointer!==e.pointerId)return;
    if(bouncy&&!motion.matches)bounce.move(...pointer(e));
    else rotate(e.clientX-lastX,e.clientY-lastY);
    lastX=e.clientX;lastY=e.clientY;
  }
  function down(e){
    if(e.button!==0||activePointer!==null)return;
    if(bouncy&&!motion.matches&&!bounce.grab(...pointer(e)))return;
    activePointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;
    canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});host.classList.add('is-dragging');wake();
  }
  function release(e){
    if(activePointer!==e.pointerId)return;
    activePointer=null;
    if(e.type==='pointerup')bounce.move(...pointer(e));
    bounce.release(e.type==='pointerup');
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    host.classList.remove('is-dragging');wake();
  }
  function reset(){target=[...initial];bounce.reset();lastTime=0;wake();}
  function keys(e){if(bouncy&&!motion.matches&&e.key.startsWith('Arrow')){e.preventDefault();bounce.nudge(e.key);wake();return;}if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home')reset();else rotate((e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0)*20,(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)*20);}
  function choose(e){const button=e.target.closest('[data-material]');if(!button)return;material={metal:0,glass:1,liquid:2,light:3}[button.dataset.material];host.querySelectorAll('[data-material]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));wake();}
  function visibility(){if(document.hidden)stop();else wake();}
  function reduced(){updateHint();bounce.release(false);stop();orientation=[...target];wake();}
  function contextLost(e){e.preventDefault();lost=true;stop();host.querySelector('.sculpture-status').hidden=false;}
  function contextRestored(){try{resources();lost=false;resize();host.querySelector('.sculpture-status').hidden=true;}catch{host.querySelector('.sculpture-status').textContent=en?'Please toggle the sculpture off and on to retry.':'Bitte die Skulptur aus- und wieder einschalten.';}}
  canvas.addEventListener('pointermove',move,{passive:true});canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);canvas.addEventListener('keydown',keys);
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);host.addEventListener('click',choose);host.querySelector('.sculpture-reset').addEventListener('click',reset);
  document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',reduced);
  const ro=new ResizeObserver(resize);ro.observe(host);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else stop();});io.observe(figure);
  function updateHint(){
    canvas.setAttribute('aria-label',bouncy&&!motion.matches
      ? (en?'Soft M sculpture. Grab and throw it, or use the arrow keys to nudge it.':'Weiche M-Skulptur. Greifen und werfen oder mit den Pfeiltasten anstoßen.')
      : (en?'Interactive M sculpture. Drag or use arrow keys to rotate.':'Interaktive M-Skulptur. Ziehen oder mit den Pfeiltasten drehen.'));
    host.querySelector('.sculpture-hint').textContent=bouncy&&!motion.matches?(en?'GRAB THE M · DRAG & THROW':'M GREIFEN · ZIEHEN & WERFEN'):(en?'DRAG TO ROTATE 360° · ↑ ↓ ← →':'ZIEHEN ZUM DREHEN · 360° · ↑ ↓ ← →');}
  updateHint();resize();
  return {setBouncy(value){if(bouncy===value)return;bouncy=value;updateHint();bounce.reset();bouncePose=null;lastTime=0;wake();},destroy(){destroyed=true;stop();ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',reduced);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);dispose();gl.getExtension('WEBGL_lose_context')?.loseContext();host.remove();figure.classList.remove('sculpture-active');canvas.width=canvas.height=1;}};
}


// Each corner carries mass. Shape matching restores the outline while allowing
// individual feet and shoulders to lag, compress and recoil on contact.
export function createSoftBody(outline, faces, random=Math.random){
  const nodes=outline.map(([rx,ry])=>({rx,ry,x:0,y:0,vx:0,vy:0,bulge:0}));
  const mean=key=>nodes.reduce((sum,n)=>sum+n[key],0)/nodes.length;
  const ox=mean('rx'),oy=mean('ry');
  let width=0,height=0,unit=1,hold=null,trail=[],grounded=false;
  let floor,roof,left,right;
  let rebound=0,contactCooldown=0,previousWalls=0;
  function dimensions(w,h){
    const newUnit=Math.max(1,Math.min(w*.11,h*.112));
    for(const n of nodes){
      if(width){
        n.x*=w/width;n.y*=h/height;n.vx*=w/width;n.vy*=h/height;
      }else{
        n.x=n.rx*newUnit;n.y=n.ry*newUnit;
        n.vx=w*.18-n.ry*newUnit*.3;n.vy=h*.20+n.rx*newUnit*.3;
      }
    }
    hold=null;previousWalls=0;unit=newUnit;width=w;height=h;
    left=-w*.43;right=w*.43;roof=h*.29;floor=-h*.25;
  }
  function frame(){
    const x=mean('x'),y=mean('y');
    let cross=0,dot=0;
    for(const n of nodes){
      const dx=n.rx-ox,dy=n.ry-oy;
      cross+=dx*(n.y-y)-dy*(n.x-x);dot+=dx*(n.x-x)+dy*(n.y-y);
    }
    return {x,y,roll:Math.atan2(cross,dot)};
  }
  function tick(dt){
    const {x,y,roll}=frame(),c=Math.cos(roll),s=Math.sin(roll);
    const vx=mean('vx'),vy=mean('vy');
    let inertia=0,momentum=0;
    for(const n of nodes){
      const dx=n.x-x,dy=n.y-y;
      inertia+=dx*dx+dy*dy;momentum+=dx*(n.vy-vy)-dy*(n.vx-vx);
    }
    const spin=momentum/Math.max(1,inertia);
    contactCooldown=Math.max(0,contactCooldown-dt);
    const push=rebound*(1-Math.exp(-dt*28));
    rebound-=push;
    for(const n of nodes){
      const dx=n.rx-ox,dy=n.ry-oy;
      const ex=x+unit*(c*dx-s*dy)-n.x,ey=y+unit*(s*dx+c*dy)-n.y;
      const stiffness=n.ry<-.9||Math.abs(n.rx)<.1?212:242;
      n.vx+=(stiffness*ex-7*(n.vx-vx+spin*(n.y-y)))*dt;
      n.vy+=(stiffness*ey-8*(n.vy-vy-spin*(n.x-x))-height*.28)*dt+push;
      n.bulge=Math.min(.23,Math.hypot(ex,ey)/unit*.4);
    }
    if(hold){
      const {ids,weights}=hold;
      const at=key=>ids.reduce((v,id,i)=>v+weights[i]*nodes[id][key],0);
      const limit=unit*90;
      const spring=(axis,velocity)=>Math.max(-limit,Math.min(limit,(hold[axis]-at(axis))*620-at(velocity)*21));
      const ax=spring('x','vx'),ay=spring('y','vy');
      ids.forEach((id,i)=>{nodes[id].vx+=weights[i]*ax*dt;nodes[id].vy+=weights[i]*ay*dt;});
    }
    let contact=false,walls=0;
    for(const n of nodes){
      n.x+=n.vx*dt;n.y+=n.vy*dt;
      if(n.x<left||n.x>right){walls|=n.x<left?1:2;n.vx=(n.x<left?1:-1)*Math.abs(n.vx)*.32;n.x=Math.max(left,Math.min(right,n.x));}
      if(n.y>roof){walls|=4;n.y=roof;n.vy=-Math.abs(n.vy)*.32;}
      if(n.y<=floor){walls|=8;n.y=floor;n.vy=Math.abs(n.vy)*.32;n.vx*=.91;contact=true;}
    }
    // Share the impact across the silhouette. At a corner the two incoming
    // velocity components define one compression axis and one sideways bulge.
    const entered=walls&~previousWalls;
    previousWalls=walls;
    const hitX=(entered&1)?Math.max(0,-vx):(entered&2)?-Math.max(0,vx):0;
    const hitY=(entered&4)?-Math.max(0,vy):(entered&8)?Math.max(0,-vy):0;
    const speed=Math.hypot(hitX,hitY);
    if(speed>unit*.35&&!hold){
      const nx=hitX/speed,ny=hitY/speed;
      const afterX=mean('vx'),afterY=mean('vy');
      const rate=Math.min(3.6,speed/unit*.62);
      // Load each leg where its tip actually touches. Its two foot vertices
      // bend together about the shoulder, even when the letter is rotated.
      const proximity=n=>{
        const gapX=hitX>0?n.x-left:right-n.x;
        const gapY=hitY>0?n.y-floor:roof-n.y;
        const gap=Math.min(hitX?gapX:Infinity,hitY?gapY:Infinity);
        return Math.exp(-Math.max(0,gap)/(unit*.32));
      };
      let leftFoot=0,rightFoot=0,crown=0;
      for(const n of nodes){
        const load=proximity(n);
        if(n.ry<-.9&&n.rx<0)leftFoot=Math.max(leftFoot,load);
        if(n.ry<-.9&&n.rx>0)rightFoot=Math.max(rightFoot,load);
        if(n.ry>.9)crown=Math.max(crown,load);
      }
      const flex=Math.min(speed*.20,unit*1.35);
      for(const n of nodes){
        const dx=n.x-x,dy=n.y-y,along=dx*nx+dy*ny;
        if(hitX)n.vx=-vx*.50+.28*(n.vx-afterX)-.72*spin*dy;
        if(hitY)n.vy=-vy*.50+.28*(n.vy-afterY)+.72*spin*dx;
        n.vx+=rate*(.45*dx-1.45*along*nx);
        n.vy+=rate*(.45*dy-1.45*along*ny);
        const legLoad=n.rx<0?leftFoot:rightFoot;
        const bend=n.ry<-.9?-Math.sign(n.rx)*legLoad*flex:0;
        const fold=Math.abs(n.rx)<.1?-crown*flex*.65:0;
        n.vx+=c*bend-s*fold;
        n.vy+=s*bend+c*fold;
      }
    }
    // A compliant floor replenishes energy once per landing. The contacting
    // corners already received their individual impulses, generating torque.
    if(contact&&!grounded&&!hold&&contactCooldown===0){
      const launch=Math.min(height*.54,Math.hypot(Math.min(0,vy)*.76,height*(.29+.09*random())));
      const impulse=Math.max(0,launch-mean('vy')),side=(random()-.5)*height*.12;
      rebound=impulse;contactCooldown=.16;
      for(const n of nodes)n.vx+=side;
    }
    grounded=contact;
  }
  function move(x,y,t){
    if(!hold)return;
    hold.x=Math.max(left,Math.min(right,x));hold.y=Math.max(floor,Math.min(roof,y));
    trail.push({x:hold.x,y:hold.y,t});
    while(trail.length>1&&trail[0].t<t-110)trail.shift();
  }
  function grab(x,y,t){
    if(!width)return false;
    for(const ids of faces){
      const [a,b,c]=ids.map(i=>nodes[i]);
      const det=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
      if(Math.abs(det)<.01)continue;
      const u=((b.y-c.y)*(x-c.x)+(c.x-b.x)*(y-c.y))/det;
      const v=((c.y-a.y)*(x-c.x)+(a.x-c.x)*(y-c.y))/det;
      if(Math.min(u,v,1-u-v)<-.02)continue;
      hold={ids,weights:[u,v,1-u-v],x,y};trail=[];move(x,y,t);return true;
    }
    // The bevel and depth extend a few pixels beyond the front contour.
    let best=null,distance=unit*.20;
    nodes.forEach((a,i)=>{
      const j=(i+1)%nodes.length,b=nodes[j],dx=b.x-a.x,dy=b.y-a.y;
      const f=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));
      const d=Math.hypot(a.x+f*dx-x,a.y+f*dy-y);
      if(d<distance){distance=d;best={ids:[i,j],weights:[1-f,f],x,y};}
    });
    if(best){hold=best;trail=[];move(x,y,t);}
    return !!best;
  }
  function release(throwing){
    if(hold&&throwing&&trail.length>1){
      const first=trail[0],last=trail.at(-1),seconds=Math.max(.016,(last.t-first.t)/1000);
      const limit=height*1.7;
      for(const [axis,vel] of [['x','vx'],['y','vy']]){
        const speed=Math.max(-limit,Math.min(limit,(last[axis]-first[axis])/seconds));
        const change=(speed-mean(vel))*.7;
        for(const n of nodes)n[vel]+=change;
      }
    }
    hold=null;trail=[];
  }
  function step(dt,w,h){
    if(w!==width||h!==height)dimensions(w,h);
    let remaining=Math.min(.05,Math.max(0,dt));
    while(remaining>1e-8){const d=Math.min(remaining,1/180);tick(d);remaining-=d;}
    const {x,y,roll}=frame();
    const lowest=nodes.reduce((min,node)=>Math.min(min,node.y),Infinity);
    const lift=Math.max(0,Math.min(1,(lowest-floor)/Math.max(1,roof-floor-2*unit)));
    let weightSum=0,weightedX=0;
    for(const node of nodes){
      const weight=Math.exp(-(node.y-lowest)/(.25*unit));
      weightedX+=node.x*weight;weightSum+=weight;
    }
    const shadowX=(1-lift)*weightedX/weightSum+lift*x;
    return {x,y,roll,unit,scale:unit/Math.min(w*.29,h*.24),pitch:.10,yaw:-.13,z:lift*.09,sx:1,sy:1,
      shadowX:.5+shadowX/w,shadowY:.5+floor/h,height:lift};
  }
  function nudge(key){
    for(const n of nodes){
      if(key==='ArrowLeft')n.vx-=unit;if(key==='ArrowRight')n.vx+=unit;
      if(key==='ArrowUp')n.vy+=unit;if(key==='ArrowDown')n.vy-=unit;
    }
  }
  return {nodes,step,grab,move,release,nudge,reset(){width=0;hold=null;trail=[];grounded=false;rebound=0;contactCooldown=0;}};
}
