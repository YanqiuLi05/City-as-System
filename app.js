document.addEventListener('DOMContentLoaded', () => {

  const TRASH_MAP = {
    "fruit-package": {label:"Fruit package",        src:"assets/trash/fruit-package.png"},
    "plastic-cup":   {label:"Plastic cup",          src:"assets/trash/plastic-cup.png"},
    "beverage-bottle":{label:"Beverage bottle",     src:"assets/trash/beverage-bottle.png"},
    "milk-tea-bottle":{label:"Milk tea bottle",     src:"assets/trash/milk-tea-bottle.png"},
    "takis-package": {label:"Takis package",        src:"assets/trash/takis-package.png"},
    "cigarette-package":{label:"Cigarette package", src:"assets/trash/cigarette-package.png"},
    "trash-bag":     {label:"Trash bag",            src:"assets/trash/trash-bag.png"},
    "plastic-food-container":{label:"Plastic food container", src:"assets/trash/plastic-food-container.png"},
    "pill-bottle":   {label:"Pill bottle",          src:"assets/trash/pill-bottle.png"},
    "kitchen-trash": {label:"Kitchen trash",        src:"assets/trash/kitchen-trash.png"},
    "leaf":          {label:"Leaf",                 src:"assets/trash/leaf.png"},
    "chip-package":  {label:"Chip package",         src:"assets/trash/chip-package.png"},
    "crayon-package":{label:"Crayon package",       src:"assets/trash/crayon-package.png"},
    "restaurant-menu":{label:"Restaurant menu",     src:"assets/trash/restaurant-menu.png"}
  };

  const temp = document.getElementById('temp');
  const addTrashBtn = document.getElementById('addTrashBtn');
  const cleanBtn = document.getElementById('cleanBtn');
  const riverTrack = document.getElementById('riverTrack');
  const tileA = document.getElementById('tileA');
  const tileB = document.getElementById('tileB');
  const trashStream = document.getElementById('trashStream');
  const logEl = document.getElementById('log');
  const statePill = document.getElementById('statePill');
  const countPill = document.getElementById('countPill');
  const typeSel = document.getElementById('trashType');
  const scene = document.getElementById('scene');
  const legendEl = document.getElementById('legend');


  const store = {
    hydrantOn: false,
    weather: 'hot',
    trash: [],  
    log: []
  };

  function nowNice(){ return new Date().toLocaleString(); }
  function sceneSize(){ const r = scene.getBoundingClientRect(); return { w:r.width, h:r.height }; }

 
  (function buildLegend(){
    const frag = document.createDocumentFragment();
    Object.values(TRASH_MAP).forEach(v=>{
      const span = document.createElement('span'); span.className='key';
      const img = document.createElement('img'); img.src=v.src; img.alt=v.label; img.width=18; img.height=18; img.loading='lazy';
      span.appendChild(img); span.appendChild(document.createTextNode(' ' + v.label));
      frag.appendChild(span);
    });
    legendEl.appendChild(frag);
  })();


  function setRiverImage(srcPath){
    tileA.style.backgroundImage = `url('${srcPath}')`;
    tileB.style.backgroundImage = `url('${srcPath}')`;
  }

  function applyWeatherRule(){
    if (store.weather === 'hot'){
      setHydrant(true, 'Hot weather → neighbors turned hydrant ON');
      setRiverImage('assets/river-high.JPG');
    } else { // cold
      setHydrant(false, 'Cold weather → hydrant OFF');
      setRiverImage('assets/river-low.jpg');
    }
  }

  
  function setHydrant(on, reason){
    store.hydrantOn = !!on;
    statePill.innerHTML = `<span class="led" style="background:${on?'var(--ink-blue)':'var(--ink-red)'}"></span> Hydrant: ${on?'ON':'OFF'}`;
    if(!on && store.trash.length){
      log(`Hydrant OFF → gutter dried → ${store.trash.length} trash cleaned`);
      clearTrash();
    } else if (on) {
      log(reason || 'Hydrant turned ON');
    }
    updateCounts();
  }

 
  function clearTrash(){
    [...trashStream.children].forEach(n=>{
      n.style.transition='opacity .25s ease'; n.style.opacity='0'; setTimeout(()=>n.remove(),260);
    });
    store.trash = [];
    updateCounts();
  }

  function randomRotation(){ return Math.round((Math.random()*20 - 10)*10)/10; }

  function addTrash(kind){
    const id = Math.random().toString(36).slice(2,8);
    const kinds = Object.keys(TRASH_MAP);
    kind = kind || typeSel?.value || kinds[Math.floor(Math.random()*kinds.length)];
    const size = 100, rot = randomRotation();
    const { w, h } = sceneSize();
    const left = Math.round(Math.random() * Math.max(0, w - size));
    const top  = Math.round(Math.random() * Math.max(0, h - size));

    store.trash.push({id, kind, x:left, y:top, size, rot});

    const div = document.createElement('div');
    div.className='trash'; div.style.left=left+'px'; div.style.top=top+'px';
    div.style.width=size+'px'; div.style.height=size+'px'; div.style.transform=`rotate(${rot}deg)`;
    div.title = TRASH_MAP[kind]?.label || kind;
    const img=document.createElement('img'); img.src=TRASH_MAP[kind]?.src||''; img.alt=TRASH_MAP[kind]?.label||kind;
    div.appendChild(img); trashStream.appendChild(div);
    requestAnimationFrame(()=>div.classList.add('show'));

    log(`New trash: ${TRASH_MAP[kind]?.label || kind}`); updateCounts();
  }

  function repaintTrash(){
    trashStream.innerHTML='';
    store.trash.forEach(t=>{
      const div=document.createElement('div'); div.className='trash show';
      div.style.left=t.x+'px'; div.style.top=t.y+'px'; div.style.width=t.size+'px'; div.style.height=t.size+'px';
      div.style.transform=`rotate(${t.rot}deg)`;
      const img=document.createElement('img'); img.src=TRASH_MAP[t.kind]?.src||''; img.alt=TRASH_MAP[t.kind]?.label||t.kind;
      div.appendChild(img); trashStream.appendChild(div);
    });
  }


  function log(msg){ store.log.unshift({t: nowNice(), msg}); renderLog(); }
  function renderLog(){ logEl.innerHTML = store.log.map(e=>`<li><div class="time">${e.t}</div><div class="event">${e.msg}</div></li>`).join(''); }
  function updateCounts(){ countPill.innerHTML = `<span class="led" style="background:var(--ink-blue)"></span> Trash: ${store.trash.length}`; }


  temp.addEventListener('change', ()=>{
    store.weather = temp.value;
    log(`Weather set: ${store.weather}`);
    applyWeatherRule();
  });
  addTrashBtn.addEventListener('click', ()=> addTrash());
  cleanBtn.addEventListener('click', ()=>{
    if(store.hydrantOn){ log('Street cleaning attempted, but flowing water kept debris in place'); }
    else { log('Street cleaning: debris removed'); clearTrash(); }
  });

  
  repaintTrash(); renderLog(); updateCounts(); applyWeatherRule();
  window.addEventListener('resize', repaintTrash);
});
