/* A locally rendered concept study: sketch → points → object → useful app.
   No video download, external renderer or work while hidden/offscreen. */
(() => {
  const figure=document.querySelector('.hero-art');if(!figure)return;
  const originalLabel=figure.getAttribute('aria-label');
  const en=document.documentElement.lang==='en',motion=matchMedia('(prefers-reduced-motion: reduce)');
  const titles=en?['An idea takes shape.','A new dimension.','Built with intention.','Made to be useful.']:['Eine Idee nimmt Form an.','Eine neue Dimension.','Mit Absicht gebaut.','Für den Alltag gemacht.'];
  const stages=en?['Sketch','Depth','Form','App']:['Skizze','Tiefe','Form','App'];
  const host=document.createElement('div');host.className='idea-story';
  host.innerHTML=`<div class="idea-heading"><span>MATZE / FROM IDEA TO REALITY</span><strong>${titles[0]}</strong></div><canvas class="idea-canvas" aria-hidden="true"></canvas><div class="idea-assembly" aria-hidden="true"><div class="idea-object"><div class="idea-back"></div><div class="idea-rim"></div><div class="idea-front"><div class="idea-screen"><div class="idea-camera"></div><div class="idea-app"><div class="idea-app-label"><span>DAILY FOCUS</span><span>◌</span></div><h3>${en?'Small steps.<br>Real progress.':'Dein Tag.<br>Dein Fokus.'}</h3><div class="idea-chart"><div><span>${en?'This week':'Diese Woche'}</span><strong>+24%</strong></div><svg viewBox="0 0 120 44" fill="none"><path d="M0 36H120M0 18H120" stroke="#9eae972e"/><path class="idea-chart-path" d="M2 36C15 36 14 30 25 30S38 35 45 24S58 28 68 17S78 23 88 12S100 16 117 3" pathLength="200" stroke="#5f8358" stroke-width="2.6" stroke-linecap="round"/></svg></div><div class="idea-task"><i>✓</i><span>${en?'Time to move':'Zeit für Bewegung'}</span><small>09:00</small></div><div class="idea-task"><i>✓</i><span>${en?'Build something':'Etwas erschaffen'}</span><small>10:30</small></div><div class="idea-app-bottom"></div></div></div></div></div></div><p class="sr-only">${en?'Animated concept with sample data: a sketch becomes a point cloud, a 3D device and an everyday app.':'Animierte Konzeptansicht mit Beispieldaten: Eine Skizze wird zur Punktwolke, zum 3D-Gerät und zur Alltags-App.'}</p><button type="button" class="idea-toggle"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="idea-pause-icon" d="M9 7v10M15 7v10"/><path class="idea-play-icon" d="m9 6 9 6-9 6Z"/></svg></button><div class="idea-stages" role="group" aria-label="${en?'Animation stages':'Animationsphasen'}">${stages.map((s,i)=>`<button type="button" data-stage="${i}" aria-pressed="${i===0}">${s}</button>`).join('')}</div>`;
  const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  const object=host.querySelector('.idea-object'),heading=host.querySelector('.idea-heading strong'),toggle=host.querySelector('.idea-toggle'),buttons=[...host.querySelectorAll('[data-stage]')];
  figure.append(host);figure.classList.add('idea-active');figure.setAttribute('aria-label',en?'From idea to reality':'Aus Ideen wird Wirklichkeit');
  const duration=15500,TAU=Math.PI*2;
  let width=1,height=1,unit=1,dpr=1,frame=0,visible=false,playing=!motion.matches,time=motion.matches?11200:0,last=0,phase=-1,destroyed=false,px=0,py=0,targetX=0,targetY=0,motionState=motion.matches;
  const clamp=x=>Math.max(0,Math.min(1,x)),smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
  const outline=[];
  for(let corner=0;corner<4;corner++)for(let j=0;j<18;j++){
    const a=-Math.PI/2+corner*Math.PI/2+j/17*Math.PI/2;
    const cx=corner===0||corner===1?.52:-.52,cy=corner<2?(corner===0?-.86:.86):(corner===2?.86:-.86);
    outline.push([cx+Math.cos(a)*.14,cy+Math.sin(a)*.14,.08]);
  }
  // A rounded shell closes the bevel without intersecting side facets.
  // Keep the 3D object opaque; the outer assembly handles the crossfade.
  const rim=host.querySelector('.idea-rim');
  for(let i=1;i<12;i++){
    const shell=document.createElement('span');shell.className='idea-shell';
    shell.style.transform=`translateZ(calc(var(--unit)*${-.08+i*.16/12}))`;
    rim.append(shell);
  }
  // Deterministic points on the front/back surfaces plus their rounded boundary.
  const points=[];
  for(let y=-.9;y<=.901;y+=.12)for(let x=-.55;x<=.551;x+=.12)for(const z of [-.08,.08])points.push([x,y,z]);
  points.push(...outline,...outline.map(([x,y])=>[x,y,-.08]));
  function transform(p,yaw,pitch,roll){
    const x=p[0]*Math.cos(roll)-p[1]*Math.sin(roll),y=p[0]*Math.sin(roll)+p[1]*Math.cos(roll);
    const xx=x*Math.cos(yaw)+p[2]*Math.sin(yaw),z=p[2]*Math.cos(yaw)-x*Math.sin(yaw);
    const yy=y*Math.cos(pitch)-z*Math.sin(pitch),zz=y*Math.sin(pitch)+z*Math.cos(pitch),perspective=900/(900-zz*unit);
    return [width*.5+xx*unit*perspective,height*.49+yy*unit*perspective,zz];
  }
  function line(coords,amount,alpha,color,widthPx=1){
    if(alpha<=0||amount<=0)return;ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=widthPx;ctx.beginPath();
    const end=(coords.length-1)*clamp(amount);coords.forEach((p,i)=>{if(i===0)ctx.moveTo(p[0],p[1]);else if(i<=end)ctx.lineTo(p[0],p[1]);else if(i-1<end){const q=coords[i-1],f=end-i+1;ctx.lineTo(q[0]+(p[0]-q[0])*f,q[1]+(p[1]-q[1])*f);}});ctx.stroke();
  }
  function paint(){
    const t=time/1000,end=1-smooth(13.7,15.5,t),turn=smooth(1.6,6,t);
    const yaw=(-10-23*turn+14*smooth(7,12.5,t)+px)*Math.PI/180,pitch=(7+5*turn+py)*Math.PI/180,roll=-5*Math.PI/180;
    const project=p=>transform(p,yaw,pitch,roll);
    object.style.transform=`perspective(900px) rotateX(${pitch}rad) rotateY(${yaw}rad) rotateZ(${roll}rad)`;
    host.style.setProperty('--solid',smooth(5.4,7.6,t)*end);
    host.style.setProperty('--app',smooth(8.0,9.3,t));
    host.style.setProperty('--progress',smooth(9.1,11.2,t));
    const next=t<2.7?0:t<5.8?1:t<8.5?2:3;
    if(next!==phase){phase=next;host.dataset.phase=String(phase);heading.textContent=titles[phase];if(!motion.matches){heading.getAnimations().forEach(a=>a.cancel());heading.animate([{opacity:.25,transform:'translateY(2px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});}buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===phase)));}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.globalAlpha=1;ctx.lineCap='round';ctx.lineJoin='round';
    // Quiet ground plane and shadow anchor the object without a perpetual effect.
    const shadow=ctx.createRadialGradient(width*.5,height*.80,1,width*.5,height*.80,unit*.8);shadow.addColorStop(0,'#02090e65');shadow.addColorStop(1,'#02090e00');
    ctx.save();ctx.translate(0,height*.8*.82);ctx.scale(1,.18);ctx.fillStyle=shadow;ctx.fillRect(0,0,width,height*3);ctx.restore();
    ctx.beginPath();ctx.ellipse(width*.5,height*.805,unit*.96,unit*.12,0,0,TAU);ctx.strokeStyle='#92acb41e';ctx.lineWidth=1;ctx.stroke();
    const wire=(1-smooth(5.8,7.8,t))*end,draw=smooth(.1,2.4,t),front=outline.map(project);
    line([...front,front[0]],draw,wire,'#edb38b',1.5);
    const back=outline.map(([x,y])=>project([x,y,-.08]));
    line([...back,back[0]],smooth(2.3,4.8,t),wire*.42,'#aac7ce',.8);
    for(const i of [0,17,35,53])line([front[i],back[i]],smooth(2.7,4.3,t),wire*.45,'#aecbd2');
    const sketch=[[-.43,-.62,.081],[.38,-.62,.081],[.38,-.38,.081],[-.43,-.38,.081],[-.43,-.62,.081]].map(project);
    line(sketch,smooth(.9,2.2,t),wire*.5,'#edb38b');
    line([[-.42,.05,.081],[-.25,.0,.081],[-.09,.08,.081],[.06,-.13,.081],[.21,-.10,.081],[.42,-.27,.081]].map(project),smooth(1.3,2.6,t),wire*.65,'#edb38b');
    const cloud=smooth(2.0,3.0,t)*(1-smooth(6.3,7.6,t))*end,scatter=Math.sin(smooth(2.2,5.6,t)*Math.PI)*.24;
    if(cloud>.002){
      const projected=points.map((p,i)=>{const seed=i*2.399963;return {p:project([p[0]+Math.sin(seed)*scatter,p[1]+Math.cos(seed*.7)*scatter*.36,p[2]+Math.sin(seed*.3)*scatter*1.6]),i};}).sort((a,b)=>a.p[2]-b.p[2]);
      for(const {p,i} of projected){ctx.globalAlpha=cloud*(.22+clamp((p[2]+.7)/1.4)*.48)*smooth(height*.18,height*.23,p[1])*(1-smooth(height*.77,height*.82,p[1]));ctx.fillStyle=i%6===0?'#fac392':'#9dc9d1';ctx.beginPath();ctx.arc(p[0],p[1],i%6===0?1.15:.75,0,TAU);ctx.fill();}
    }
    ctx.globalAlpha=1;
  }
  function blocked(){return !visible||document.hidden||figure.classList.contains('sculpture-active')||figure.classList.contains('hero-static');}
  function tick(now){
    frame=0;if(destroyed||blocked()){last=0;return;}
    syncMotion();
    const delta=last?Math.min(now-last,70):16.67;last=now;
    if(playing&&!motion.matches)time=(time+delta)%duration;
    const ease=1-Math.exp(-delta/95);
    px+=(targetX-px)*ease;py+=(targetY-py)*ease;
    const settling=Math.abs(targetX-px)+Math.abs(targetY-py)>.008;
    if(!settling){px=targetX;py=targetY;}
    paint();if((playing&&!motion.matches)||settling)frame=requestAnimationFrame(tick);else last=0;
  }
  function wake(){if(!frame&&!destroyed&&!blocked())frame=requestAnimationFrame(tick);}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;}
  function updateButton(){toggle.classList.toggle('is-paused',!playing);toggle.setAttribute('aria-label',en?(playing?'Pause animation':'Play animation'):(playing?'Animation pausieren':'Animation abspielen'));toggle.title=toggle.getAttribute('aria-label');toggle.hidden=motion.matches;}
  function select(e){const b=e.target.closest('[data-stage]');if(!b)return;time=[1600,4200,7500,11200][Number(b.dataset.stage)];playing=false;stop();paint();updateButton();}
  function togglePlay(){playing=!playing;if(playing&&time>13500)time=0;updateButton();stop();wake();}
  function resize(){const r=host.getBoundingClientRect();width=r.width;height=r.height;unit=Math.min(width*.34,height*.29);dpr=Math.min(devicePixelRatio||1,1.75,1000/Math.max(1,width,height));canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));host.style.setProperty('--unit',`${unit}px`);wake();}
  function syncDisplay(){
    const isStatic=figure.classList.contains('hero-static');
    host.hidden=isStatic;figure.classList.toggle('idea-active',!isStatic);
    if(isStatic){host.getAnimations({subtree:true}).forEach(a=>a.cancel());if(originalLabel===null)figure.removeAttribute('aria-label');else figure.setAttribute('aria-label',originalLabel);}
    else figure.setAttribute('aria-label',en?'From idea to reality':'Aus Ideen wird Wirklichkeit');
  }
  function state(){stop();syncDisplay();if(!blocked())resize();}
  function syncMotion(){if(motionState===motion.matches)return;motionState=motion.matches;px=py=targetX=targetY=0;playing=!motionState;time=motionState?11200:0;updateButton();}
  function reduced(){syncMotion();stop();wake();}
  function quiet(){playing=false;time=11200;stop();updateButton();wake();}
  function move(e){if(motion.matches||e.pointerType==='touch')return;if(e.target.closest('button')){leave();return;}const r=host.getBoundingClientRect();targetX=((e.clientX-r.left)/width-.5)*5;targetY=-((e.clientY-r.top)/height-.5)*3.5;wake();}
  function leave(){targetX=targetY=0;wake();}
  host.querySelector('.idea-stages').addEventListener('click',select);toggle.addEventListener('click',togglePlay);host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);
  motion.addEventListener('change',reduced);document.addEventListener('visibilitychange',state);document.addEventListener('portfolio:quiet',quiet);
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;state();},{threshold:.05});intersection.observe(figure);
  const modeObserver=new MutationObserver(state);modeObserver.observe(figure,{attributes:true,attributeFilter:['class']});
  syncDisplay();updateButton();resize();
  window.addEventListener('pagehide',e=>{stop();if(!e.persisted){destroyed=true;resizeObserver.disconnect();intersection.disconnect();modeObserver.disconnect();motion.removeEventListener('change',reduced);document.removeEventListener('visibilitychange',state);document.removeEventListener('portfolio:quiet',quiet);} });
  window.addEventListener('pageshow',e=>{if(e.persisted)state();});
})();
