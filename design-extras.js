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
  host.innerHTML = `<div class="sculpture-label"><strong>MATZE / FORM STUDY</strong>${en ? 'IDEAS TAKE SHAPE' : 'IDEEN NEHMEN FORM AN'}</div><canvas class="sculpture-canvas" tabindex="0" role="img" aria-label="${en ? 'Interactive M sculpture. Use arrow keys to rotate; Home to reset.' : 'Interaktive M-Skulptur. Mit Pfeiltasten drehen; mit Pos1 zurücksetzen.'}"></canvas><div class="sculpture-controls" role="group" aria-label="Material"><button type="button" data-material="metal" aria-pressed="true">${en ? 'Metal' : 'Metall'}</button><button type="button" data-material="glass" aria-pressed="false">${en ? 'Glass' : 'Glas'}</button><button type="button" data-material="light" aria-pressed="false">${en ? 'Light' : 'Licht'}</button></div><p class="sculpture-hint">${en ? 'MOVE TO EXPLORE · ↑ ↓ ← →' : 'BEWEGEN & ENTDECKEN · ↑ ↓ ← →'}</p>`;
  const canvas = host.querySelector('canvas'), ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw Error('Canvas unavailable');
  figure.append(host); figure.classList.add('sculpture-active');
  // Extruded, bevel-edged polygon. Geometry is projected once per interaction frame.
  const outline = [[-1,-1],[-.48,-1],[0,-.12],[.48,-1],[1,-1],[1,1],[.49,1],[.49,-.06],[0,.71],[-.49,-.06],[-.49,1],[-1,1]];
  let width = 0, height = 0, frame = 0, visible = false, destroyed = false, material = 'metal';
  let yaw = -.32, pitch = -.14, targetYaw = yaw, targetPitch = pitch, activePointer = null, lastX = 0;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  function project(x,y,z) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const xx = x*cy+z*sy, zz = z*cy-x*sy, yy = y*cp-zz*sp, depth = y*sp+zz*cp;
    const scale = Math.min(width*.28,height*.27) * 5/(5-depth);
    return [width*.5+xx*scale,height*.49+yy*scale,depth];
  }
  function path(points) { ctx.beginPath(); points.forEach((p,i)=>i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1])); ctx.closePath(); }
  function paint() {
    const bg = ctx.createRadialGradient(width*.48,height*.36,0,width*.5,height*.45,width*.8);
    bg.addColorStop(0,material==='light'?'#24364c':'#283e45'); bg.addColorStop(1,'#0c161d'); ctx.fillStyle=bg; ctx.fillRect(0,0,width,height);
    // A quiet plinth and construction orbit ground the floating object.
    ctx.save(); ctx.translate(width*.5,height*.80); ctx.scale(1,.17);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,width*.3);shadow.addColorStop(0,'#02080ed0');shadow.addColorStop(1,'#02080e00');ctx.fillStyle=shadow;ctx.fillRect(-width*.4,-width*.4,width*.8,width*.8);
    ctx.strokeStyle=material==='light'?'#97cbef50':'#b9c5c32b';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,width*.34,0,Math.PI*2);ctx.stroke();ctx.restore();
    const front=outline.map(([x,y])=>project(x,y,.22)), back=outline.map(([x,y])=>project(x,y,-.22));
    const faces=outline.map((_,i)=>{const j=(i+1)%outline.length;return {p:[back[i],back[j],front[j],front[i]],index:i};});
    faces.push({p:back,index:13},{p:front,index:12});
    faces.sort((a,b)=>a.p.reduce((s,p)=>s+p[2],0)/a.p.length-b.p.reduce((s,p)=>s+p[2],0)/b.p.length);
    for(const face of faces){
      const p=face.p;path(p);
      const gradient=ctx.createLinearGradient(width*(.15+yaw*.12),height*.2,width*.86,height*.76);
      const frontFace=face.index===12;
      if(material==='metal'){
        const colors=frontFace?['#fbecd0','#a89c86','#e9e0cb','#697679','#d4ba8e']:['#829493','#344850','#a9ac9c','#283840','#8e958a'];
        colors.forEach((c,i)=>gradient.addColorStop([0,.31,.48,.56,1][i],c));
      }else if(material==='glass'){
        ['#c3f4edc9','#488cac80','#b2eaf67d','#27637bce','#cbf2ebad'].forEach((c,i)=>gradient.addColorStop([0,.28,.45,.63,1][i],c));
      }else{
        ['#f5f4ff','#82bdea','#b3a1ed','#416eaa','#e1c1f1'].forEach((c,i)=>gradient.addColorStop([0,.29,.48,.65,1][i],c));
      }
      ctx.fillStyle=gradient;ctx.fill();
      ctx.strokeStyle=material==='glass'?'#d3ffffa8':material==='light'?'#e7e1ffcf':'#ffeed575';ctx.lineWidth=frontFace?1.4:.65;ctx.stroke();
      if(frontFace){
        ctx.save();path(p);ctx.clip();
        const glint=ctx.createLinearGradient(0,height*.23,width,height*.65);glint.addColorStop(0,'#ffffff00');glint.addColorStop(.43+yaw*.12,'#ffffff00');glint.addColorStop(.49+yaw*.12,'#ffffff70');glint.addColorStop(.53+yaw*.12,'#ffffff00');glint.addColorStop(1,'#ffffff00');ctx.fillStyle=glint;ctx.fillRect(0,0,width,height);ctx.restore();
        // Inset contour suggests a machined bevel without expensive image filters.
        path(outline.map(([x,y])=>project(x*.975,y*.975,.225)));ctx.strokeStyle=material==='glass'?'#ebffff78':'#fff8e93b';ctx.lineWidth=.8;ctx.stroke();
      }
    }
    if(material==='light'){
      ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(width*.45,height*.43,0,width*.45,height*.43,width*.42);g.addColorStop(0,'#99baff1b');g.addColorStop(1,'#99baff00');ctx.fillStyle=g;ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation='source-over';
    }
  }
  function sculptureFrame(){frame=0;if(destroyed||!visible||document.hidden)return;
    if(motion.matches){yaw=targetYaw;pitch=targetPitch;}else{yaw+=(targetYaw-yaw)*.16;pitch+=(targetPitch-pitch)*.16;}
    paint();if(Math.abs(yaw-targetYaw)+Math.abs(pitch-targetPitch)>.001)wake();
  }
  function wake(){if(!frame&&!destroyed&&visible&&!document.hidden)frame=requestAnimationFrame(sculptureFrame);}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
  function resize(){const rect=host.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,1.5,1000/Math.max(1,width));canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);wake();}
  function move(e){
    if(motion.matches)return;
    if(e.pointerType==='touch'&&activePointer!==e.pointerId)return;
    if(activePointer===e.pointerId){targetYaw=clamp(targetYaw+(e.clientX-lastX)*.006,-1.05,1.05);lastX=e.clientX;}
    else{const r=canvas.getBoundingClientRect();targetYaw=clamp((e.clientX-r.left)/r.width-.5,-.5,.5)*1.3;targetPitch=clamp((e.clientY-r.top)/r.height-.5,-.5,.5)*-.55;}
    wake();
  }
  function down(e){if(e.button!==0||motion.matches)return;activePointer=e.pointerId;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);}
  function release(){activePointer=null;}
  function reset(){if(activePointer!==null)return;targetYaw=-.32;targetPitch=-.14;wake();}
  function keys(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){targetYaw=-.32;targetPitch=-.14;}else{targetYaw=clamp(targetYaw+(e.key==='ArrowLeft'?-.16:e.key==='ArrowRight'?.16:0),-1.05,1.05);targetPitch=clamp(targetPitch+(e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0),-.5,.5);}wake();}
  function choose(e){const button=e.target.closest('[data-material]');if(!button)return;material=button.dataset.material;host.querySelectorAll('[data-material]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));wake();}
  function visibility(){if(document.hidden)stop();else wake();}
  function reduced(){stop();targetYaw=yaw=-.32;targetPitch=pitch=-.14;wake();}
  canvas.addEventListener('pointermove',move,{passive:true});canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);canvas.addEventListener('pointerleave',reset);canvas.addEventListener('keydown',keys);host.addEventListener('click',choose);
  document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',reduced);
  const ro=new ResizeObserver(resize);ro.observe(host);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else stop();});io.observe(figure);
  resize();
  return {destroy(){destroyed=true;stop();ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',reduced);host.remove();figure.classList.remove('sculpture-active');canvas.width=canvas.height=1;}};
}
