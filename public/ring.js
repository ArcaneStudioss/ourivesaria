import * as THREE from './assets/three.module.js';
const viewer=document.querySelector('#ring-viewer');
if(viewer){
try {
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;renderer.outputColorSpace=THREE.SRGBColorSpace;
 viewer.appendChild(renderer.domElement);viewer.querySelector('.ring-fallback').hidden=true;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,.3,7.5);
 const studio=document.createElement('canvas');studio.width=1024;studio.height=512;const ctx=studio.getContext('2d');
 ctx.fillStyle='#33362c';ctx.fillRect(0,0,1024,512);
 const glow=(x,y,w,h,color)=>{const g=ctx.createRadialGradient(x,y,0,x,y,w);g.addColorStop(0,color);g.addColorStop(.5,color);g.addColorStop(1,'rgba(35,35,28,0)');ctx.save();ctx.scale(1,h/w);ctx.fillStyle=g;ctx.fillRect(x-w,(y-w)*w/h,w*2,w*2*h/w);ctx.restore()};
 // Broad studio windows create soft metal reflections without external textures.
 const grad=ctx.createLinearGradient(0,0,0,512);grad.addColorStop(0,'#e9e8cf');grad.addColorStop(.42,'#73665f');grad.addColorStop(.65,'#b3a397');grad.addColorStop(1,'#302127');ctx.fillStyle=grad;ctx.fillRect(0,0,1024,512);
 ctx.fillStyle='#fff7e5';ctx.fillRect(100,25,110,235);ctx.fillStyle='#faf5e4';ctx.fillRect(650,50,155,240);ctx.fillStyle='#c2c7b5';ctx.fillRect(420,10,55,190);ctx.fillStyle='#302127';ctx.fillRect(240,0,65,512);ctx.fillStyle='#785f60';ctx.fillRect(850,0,85,512);
 const envTexture=new THREE.CanvasTexture(studio);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;
 const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(envTexture).texture;envTexture.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfffae8,0x573e40,2));
 const light=new THREE.DirectionalLight(0xfff4d3,4);light.position.set(2,4,4);scene.add(light);
 const fill=new THREE.DirectionalLight(0xffffff,2);fill.position.set(-3,1,-2);scene.add(fill);
 const shape=new THREE.Shape();shape.moveTo(1.01,-.26);shape.quadraticCurveTo(1.01,-.34,1.1,-.36);shape.quadraticCurveTo(1.27,-.39,1.36,-.27);shape.quadraticCurveTo(1.46,0,1.36,.27);shape.quadraticCurveTo(1.27,.39,1.1,.36);shape.quadraticCurveTo(1.01,.34,1.01,.26);shape.lineTo(1.01,-.26);
 const geometry=new THREE.LatheGeometry(shape.getPoints(70),160);geometry.computeVertexNormals();
 const material=new THREE.MeshPhysicalMaterial({color:0xd4aa57,metalness:1,roughness:.18,envMapIntensity:1.35,clearcoat:.5,clearcoatRoughness:.2});
 const group=new THREE.Group();const ring=new THREE.Mesh(geometry,material);group.add(ring);group.rotation.set(.95,.2,.4);scene.add(group);
 const floorCanvas=document.createElement('canvas');floorCanvas.width=256;floorCanvas.height=256;const fctx=floorCanvas.getContext('2d');const fg=fctx.createRadialGradient(128,128,10,128,128,115);fg.addColorStop(0,'rgba(31,43,27,.2)');fg.addColorStop(1,'rgba(31,43,27,0)');fctx.fillStyle=fg;fctx.fillRect(0,0,256,256);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.3,1.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(floorCanvas),transparent:true,depthWrite:false}));shadow.position.set(0,-1.9,-.6);scene.add(shadow);
 const range=document.querySelector('#ring-rotation'),pauseButton=document.querySelector('#rotate-toggle');
 let rotation=0,tilt=.95,playing=!reducedMotion,dragging=false,lastX=0,lastY=0,visible=false,lastTime=0;
 const pause=(paused)=>{playing=!paused;pauseButton.textContent=paused?'▷':'Ⅱ';pauseButton.setAttribute('aria-label',paused?'Iniciar rotação automática':'Pausar rotação automática');pauseButton.setAttribute('aria-pressed',String(paused))};pause(reducedMotion);
 pauseButton.addEventListener('click',()=>{pause(playing);render()});
 range.addEventListener('input',()=>{rotation=Number(range.value)*Math.PI/180;pause(true);render()});
 const pointerDown=event=>{dragging=true;lastX=event.clientX;lastY=event.clientY;pause(true);viewer.setPointerCapture(event.pointerId)};
 viewer.addEventListener('pointerdown',pointerDown);
 viewer.addEventListener('pointermove',event=>{if(!dragging)return;rotation+=(event.clientX-lastX)*.009;tilt=Math.max(.2,Math.min(2.4,tilt+(event.clientY-lastY)*.008));lastX=event.clientX;lastY=event.clientY;range.value=String(((rotation*180/Math.PI)%360+360)%360);render()});
 const stopDrag=()=>dragging=false;viewer.addEventListener('pointerup',stopDrag);viewer.addEventListener('pointercancel',stopDrag);viewer.addEventListener('lostpointercapture',stopDrag);
 const render=()=>{group.rotation.set(tilt,rotation,.4);renderer.render(scene,camera)};
 const resize=()=>{const width=viewer.clientWidth,height=viewer.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render()};new ResizeObserver(resize).observe(viewer);resize();
 const animate=time=>{const dt=Math.min((time-lastTime)/1000,.1);lastTime=time;if(visible && !document.hidden && playing){rotation+=dt*.19;range.value=String(((rotation*180/Math.PI)%360+360)%360);render()}requestAnimationFrame(animate)};
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)render()},{rootMargin:'50px'}).observe(viewer);requestAnimationFrame(animate);
 document.querySelectorAll('[data-material]').forEach(button=>button.addEventListener('click',()=>{
  const colors={gold:0xd4aa57,silver:0xd7dedf,rose:0xd99a82};material.color.setHex(colors[button.dataset.material]);material.roughness=button.dataset.material==='silver'?.16:.18;
  document.querySelectorAll('[data-material]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});render();
 }));
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();viewer.querySelector('.ring-fallback').hidden=false;renderer.domElement.hidden=true;document.querySelector('.viewer-hint').textContent='VISUALIZAÇÃO ILUSTRATIVA';pause(true)});
} catch(error){
 viewer.querySelector('.ring-fallback').hidden=false;document.querySelector('.viewer-hint').textContent='VISUALIZAÇÃO ILUSTRATIVA';document.querySelector('#ring-rotation').disabled=true;document.querySelector('#rotate-toggle').disabled=true;
}
}
