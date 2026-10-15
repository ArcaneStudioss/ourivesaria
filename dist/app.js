'use strict';
(() => {
  document.documentElement.classList.add('js');
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const storage = {get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}},remove(k){try{localStorage.removeItem(k)}catch{}}};
  let config = {instagram:'https://www.instagram.com/ourivesaria_medeiros/',instagramHandle:'@ourivesaria_medeiros',whatsappNumber:'',address:'',mapsUrl:'',responsePromise:'',gaMeasurementId:''};
  let analyticsLoaded = false;
  let toastTimer;
  const toast = (message) => {const el=$('#toast');if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,5000)};
  const track = (event,props={}) => {if(analyticsLoaded && typeof window.gtag==='function')window.gtag('event',event,props)};
  const cleanPhone = () => config.whatsappNumber.replace(/\D/g,'');
  const validPhone = () => /^55\d{10,11}$/.test(cleanPhone());
  const validGA = () => /^G-[A-Z0-9]+$/.test(config.gaMeasurementId);
  const loadAnalytics = () => {
    if(!validGA() || analyticsLoaded || storage.get('medeiros-consent')!=='accepted')return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments)};
    window.gtag('js',new Date());
    window.gtag('config',config.gaMeasurementId,{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});
    const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.gaMeasurementId);document.head.append(script);analyticsLoaded=true;
  };
  const showCookies = () => {const el=$('#cookie-banner');if(el)el.hidden=!validGA()};
  const applyConfig = () => {
    $$('[data-instagram]').forEach(a=>a.href=config.instagram);
    const note=$('#response-note');if(note && config.responsePromise)note.textContent=config.responsePromise;
    if(config.address && $('#address-block')){
      $('#address-text').textContent=config.address;$('#address-block').hidden=false;
      $('#maps-link').href=config.mapsUrl || 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(config.address);
    }
    if(config.address || validPhone()){
      const schema=document.createElement('script');schema.type='application/ld+json';
      schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'JewelryStore','@id':config.origin+'/#business','name':config.brand||'Ourivesaria Medeiros',...(config.address?{address:{'@type':'PostalAddress',streetAddress:config.address,addressCountry:'BR'}}:{}),...(validPhone()?{telephone:'+'+cleanPhone()}: {})});document.head.append(schema);
    }
    if(validGA() && !storage.get('medeiros-consent'))showCookies();loadAnalytics();
    setupThanks();
  };
  const configReady=fetch('/config.json').then(r=>{if(!r.ok)throw new Error('config');return r.json()}).then(c=>{config={...config,...c};applyConfig()}).catch(()=>applyConfig());
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('IntersectionObserver' in window && !reducedMotion){
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.06,rootMargin:'0px 0px 35px 0px'});
    $$('.reveal').forEach(el=>observer.observe(el));
  }else{$$('.reveal').forEach(el=>el.classList.add('visible'))}
  $$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  const menu=$('#mobile-menu'),menuToggle=$('.menu-toggle');
  const closeMenu=()=>{if(menu){menu.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Abrir menu')}};
  if(menuToggle)menuToggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});
  if(menu)menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  window.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
  window.addEventListener('resize',()=>{if(innerWidth>800)closeMenu()},{passive:true});
  const inquiry=$('#inquiry-dialog'),form=$('#inquiry-form');
  const openInquiry=(idea)=>{
    if(!inquiry)return;
    closeMenu();
    try{const d=JSON.parse(storage.get('medeiros-draft')||'null');if(d){$('#client-name').value=d.name||'';$('#client-idea').value=d.idea||'';if(d.type)$('#jewel-type').value=d.type}}catch{}
    if(idea && [...$('#jewel-type').options].some(o=>o.value===idea))$('#jewel-type').value=idea;
    inquiry.showModal();track('open_inquiry');
  };
  $$('[data-inquiry]').forEach(button=>button.addEventListener('click',()=>openInquiry(button.dataset.idea)));
  $$('dialog').forEach(dialog=>{
    dialog.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}});
  });
  if(form)form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const button=$('#inquiry-submit');button.disabled=true;
    await configReady;
    const data=new FormData(form),draft={name:String(data.get('name')).trim(),type:String(data.get('type')),idea:String(data.get('idea')).trim(),savedAt:new Date().toISOString()};
    if(!draft.name){$('#client-name').value='';$('#client-name').reportValidity();button.disabled=false;return}
    if(!storage.set('medeiros-draft',JSON.stringify(draft))){$('#form-status').textContent='Seu navegador bloqueou o armazenamento. Libere o armazenamento local para preparar o rascunho, ou fale diretamente pelo Instagram.';button.disabled=false;return}
    track('prepare_inquiry',{jewel_type:draft.type});location.assign('/obrigado/');
  });
  const products={
    aliancas:{title:'Alianças de moeda',image:'aliancas',description:'Alianças de moeda antiga com forro de prata, largura de 4 mm e formato abaulado, conforme a peça apresentada pela marca. Uma combinação de textura, brilho e significado.',features:['Moeda antiga com forro de prata','Modelo apresentado: 4 mm, abaulado','Medidas, valor e prazo sob consulta'],idea:'Aliança personalizada'},
    pingentes:{title:'Pingente Santa Luzia',image:'pingentes',description:'Uma joia de devoção e significado. O pingente Santa Luzia em prata 950 traz os detalhes da imagem religiosa em uma medalha de contorno trabalhado.',features:['Peça apresentada em prata 950','Medalha de Santa Luzia','Consulte tamanho, valor e disponibilidade'],idea:'Pingente personalizado'},
    prata:{title:'Alianças em prata 950',image:'prata',description:'O conjunto apresentado pela marca reúne alianças em prata 950 de 4 mm com acabamento chanfrado e diamantado, acompanhadas de um solitário Dois Fios.',features:['Alianças apresentadas em prata 950','Modelo de 4 mm, chanfrado e diamantado','Consulte o conjunto e as medidas desejadas'],idea:'Joia em prata'},
    formatura:{title:'Anéis de formatura',image:'formatura',photos:['formatura','formatura-rubi'],description:'Uma conquista para levar com você. Conheça dois modelos de formatura apresentados pela marca: em prata 950, com pedra verde ou vermelha e detalhes próprios em cada criação.',features:['Modelos apresentados em prata 950','Consulte a cor da pedra conforme o curso','Gravação a laser nas laterais sob consulta'],idea:'Anel de formatura'}
  };
  $$('[data-product]').forEach(button=>button.addEventListener('click',()=>{
    const p=products[button.dataset.product],dialog=$('#product-dialog');
    $('#product-image').src='/assets/'+p.image+'.webp';$('#product-image').alt='Fotografia tratada da marca: '+p.title.toLowerCase();$('#product-title').textContent=p.title;$('#product-description').textContent=p.description;
    $('#product-photos').replaceChildren(...(p.photos||[]).map((photo,i)=>{const b=document.createElement('button');b.type='button';b.className=i===0?'selected':'';b.setAttribute('aria-label',i===0?'Ver modelo com pedra verde':'Ver modelo com pedra vermelha');b.setAttribute('aria-pressed',String(i===0));const image=document.createElement('img');image.src='/assets/'+photo+'.webp';image.alt=i===0?'Modelo com pedra verde':'Modelo com pedra vermelha';b.append(image);b.onclick=()=>{$('#product-image').src=image.src;$('#product-image').alt=image.alt+' | fotografia tratada da marca';$('#product-photos').querySelectorAll('button').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b))})};return b}));
    $('#product-features').replaceChildren(...p.features.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
    $('#product-inquiry').onclick=()=>{dialog.close();openInquiry(p.idea)};dialog.showModal();track('view_inspiration',{category:button.dataset.product});
  }));
  $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    $$('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
    $$('.creation-card').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)card.classList.add('visible')});
    track('filter_inspiration',{category:button.dataset.filter});
  }));
  $('#privacy-settings')?.addEventListener('click',()=>{if(validGA())showCookies();else toast('Nenhum serviço de Analytics está ativo nesta versão.')});
  $('#cookies-accept')?.addEventListener('click',()=>{storage.set('medeiros-consent','accepted');$('#cookie-banner').hidden=true;loadAnalytics()});
  $('#cookies-decline')?.addEventListener('click',()=>{storage.set('medeiros-consent','declined');$('#cookie-banner').hidden=true;if(analyticsLoaded){window['ga-disable-'+config.gaMeasurementId]=true;location.reload()}});
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);return true}catch{
      const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px';document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy')}catch{}area.remove();return ok;
    }
  }
  function setupThanks(){
    const summary=$('#draft-summary');if(!summary)return;
    let draft;try{draft=JSON.parse(storage.get('medeiros-draft')||'null')}catch{}
    const send=$('#send-message'),copy=$('#copy-message'),erase=$('#erase-draft');
    if(!draft){summary.hidden=true;$('#thanks-intro').textContent='Uma boa criação começa com uma conversa. Fale com a marca pelo canal oficial e compartilhe sua ideia.';copy.hidden=true;erase.hidden=true;send.href=config.instagram;send.textContent='Conversar pelo Instagram ↗';return}
    const message='Olá, Ourivesaria Medeiros! Meu nome é '+draft.name+'.\n\nTenho interesse em: '+draft.type+'.'+(draft.idea?'\n\nMinha ideia: '+draft.idea:'')+'\n\nGostaria de saber as possibilidades, o orçamento e o prazo. Obrigado(a)!';
    summary.textContent=message;
    const officialLink=validPhone()?'https://wa.me/'+cleanPhone()+'?text='+encodeURIComponent(message):config.instagram;
    send.href=officialLink;send.textContent=validPhone()?'Enviar pelo WhatsApp ↗':'Abrir o Instagram da marca ↗';
    $('#thanks-channel-note').textContent=validPhone()?'Ao abrir o WhatsApp, revise e envie a mensagem. O ateliê só recebe sua ideia depois do envio.':'Copie a mensagem e cole na conversa do Instagram. O WhatsApp oficial pode ser consultado na bio da marca. Este rascunho ainda não foi enviado.';
    copy.onclick=async()=>{const success=await copyText(message);$('#copy-status').textContent=success?'Mensagem copiada. Agora é só colar na conversa com a marca.':'Selecione e copie o texto acima para enviar.'};
    send.onclick=()=>track('contact_channel',{channel:validPhone()?'whatsapp':'instagram'});
    erase.onclick=()=>{storage.remove('medeiros-draft');$('#copy-status').textContent='Rascunho apagado deste navegador.';summary.hidden=true;copy.hidden=true;erase.hidden=true;send.href=config.instagram;send.textContent='Conversar pelo Instagram ↗';$('#thanks-channel-note').textContent='Você pode começar uma nova conversa pelo canal oficial da marca.'};
  }
  $('#clear-privacy-draft')?.addEventListener('click',()=>{storage.remove('medeiros-draft');$('#privacy-clear-status').textContent='Rascunho apagado deste navegador.'});
})();
