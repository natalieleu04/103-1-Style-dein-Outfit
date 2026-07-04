/* ============ PRODUKTDATEN ============ */
// Die Produktdaten werden aus products.json geladen (siehe init()).
let PRODUCTS = { female:{}, male:{} };

/* ============ FIGUR-BILDER (freigestellte Croquis) ============ */
const FIG_IMG = {
  female: "assets/figures/figur_female.png",
  male:   "assets/figures/figur_male.png"
}

const SHOE_IMG = {
  female: "assets/figures/ballerinas.png",
  male:   "assets/figures/sneaker.png"
}

/* ============ DATEN (fiktive Produkte) ============ */
const CATS_BY_GENDER = {
  female: [
    {id:"tops",    label:"Oberteile"},
    {id:"bottoms", label:"Unterteile"},
    {id:"dress",   label:"Kleider"},
    {id:"outer",   label:"Jacken"},
  ],
  male: [
    {id:"tops",    label:"Oberteile"},
    {id:"bottoms", label:"Unterteile"},
    {id:"outer",   label:"Jacken"},
  ]
};
let CATS = CATS_BY_GENDER.female;

// Unterkategorien je Hauptkategorie und Geschlecht (in gewünschter Reihenfolge).
// "all" wird automatisch vorangestellt.
const SUBCATS = {
  female: {
    tops:    [{id:"tops",label:"Tops"},{id:"blusen",label:"Blusen"},{id:"tshirts",label:"T-Shirts"},{id:"pullover",label:"Pullover"}],
    bottoms: [{id:"stoffhosen",label:"Stoffhosen"},{id:"roecke",label:"Röcke"},{id:"jeans",label:"Jeans"},{id:"shorts",label:"Shorts"}],
  },
  male: {
    tops:    [{id:"hemden",label:"Hemden"},{id:"tshirts",label:"T-Shirts"},{id:"tanktops",label:"Tanktops"},{id:"pullover",label:"Pullover"}],
    bottoms: [{id:"anzughosen",label:"Anzughosen"},{id:"jeans",label:"Jeans"},{id:"shorts",label:"Shorts"}],
  }
};



/* ============ STATE ============ */
let gender = "female";
let activeCat = "tops";
let activeSub = "all";
let selection = {tops:null,bottoms:null,dress:null,outer:null};

/* ============ HELPERS ============ */
const $ = s=>document.querySelector(s);
const euro = n=>n.toFixed(2).replace(".",",")+" €";
function findProduct(id){
  const g = PRODUCTS[gender];
  for(const cat in g){const p=g[cat].find(x=>x.id===id);if(p)return{...p,cat};}
  return null;
}

/* ============ SWATCH ICON ============ */
function swatchSVG(p){
  const fallback = `this.style.display='none';this.parentNode.style.background='${p.color}'`;
  return `<img class="swatch-img" src="${p.img}" alt="${p.name}" loading="lazy" onerror="${fallback}">`;
}

/* ============ FIGURE (Croquis + echte Produktfotos) ============
   Die hochgeladene Figur dient als elegante Stütz-Silhouette. Die echten,
   freigestellten Produktfotos werden als Layer über die Körperzonen gelegt
   (Collage-Prinzip), sodass ein zusammengestelltes Outfit entsteht.
   Positionen in % relativ zur Bühne (figure-stage): top/left/width/height. */

// Platzierung der Kleidungsfotos, kalibriert auf die per object-fit:contain
// dargestellte Figur in der 300x580-Bühne.
// Oberteile/Jacken: 'w' = Breite in % der Bühne (Schulter+Ärmel).
// Unterteile/Kleider: 'h' = Höhe in % der Bühne (Bund bis Saum), Breite folgt automatisch.
// 'top' = Oberkante in % der Bühnenhöhe; 'cx' = horizontale Mitte in % der Bühnenbreite.
const PLACE = {
  female: {
    top:    {cx:50.5, top:14,   w:40},
    bottom: {cx:50.5, top:35,   h:57},
    skirt:  {cx:50.5, top:35,   h:36},
    dress:  {cx:50.5, top:14.5, h:64},
    outer:  {cx:50.5, top:13,   w:46},
    shoes:  {cx:53, top:96, w:27},
  },
  male: {
    top:    {cx:50, top:14,   w:44},
    bottom: {cx:50, top:38,   h:54},
    skirt:  {cx:50, top:38,   h:36},
    outer:  {cx:50, top:13,   w:50},
    shoes:  {cx:50.5, top:90.5, w:27},
  }
};

function layerStyle(place, z){
  // Höhenbasiert (Unterteile/Kleider) oder breitenbasiert (Oberteile)
  const size = ('h' in place)
    ? `height:${place.h}%;width:auto;`
    : `width:${place.w}%;height:auto;`;
  return `position:absolute;top:${place.top}%;left:${place.cx}%;transform:translateX(-50%);${size}z-index:${z};`;
}

function photoLayer(p, place, z, cat){
  if(!place) return '';
  const fallback = `this.style.display='none'`;
  return `<img class="garment-photo garment-clickable" src="${p.imgFig || p.img}" alt="${p.name}"
     data-cat="${cat}" title="Zum Entfernen klicken"
     style="${layerStyle(place, z)}" onerror="${fallback}">`;
}

function shoePlace(gender){
  return Object.assign({}, PLACE[gender].shoes);
}

function shoeLayer(gender){
  const place = shoePlace(gender);
  // Schuhe immer sichtbar, als unterste Ebene (z-index 1), nur zur Anprobe.
  return `<img class="garment-photo shoe-layer" src="${SHOE_IMG[gender]}" alt="Schuhe"
     style="${layerStyle(place, 1)}">`;
}

// Kombiniert Kategorie-Standardplatzierung mit dem produkt-eigenen 'fit'-Wert
// (die Passform-Werte sind fest in products.json hinterlegt).
function place(base, product){
  return product.fit ? Object.assign({}, base, product.fit) : Object.assign({}, base);
}

// Vertikale Mittelhöhe eines Teils in % der Bühne (für die Label-Position).
function itemMidY(place){
  if('h' in place) return place.top + place.h/2;
  // bei breitenbasierten Teilen Höhe grob aus typischem Seitenverhältnis schätzen
  return place.top + 16;
}

function buildFigure(gender){
  const pl = PLACE[gender];
  const top = selection.tops?findProduct(selection.tops):null;
  const bot = selection.bottoms?findProduct(selection.bottoms):null;
  const drs = selection.dress?findProduct(selection.dress):null;
  const out = selection.outer?findProduct(selection.outer):null;

  let layers = shoeLayer(gender); // feste Schuhe zuerst (unterste Ebene)
  const labels = []; // {cat,name,catLabel,midY,side}
  // Kleid ersetzt Top+Bottom optisch
  if(drs){
    const p = place(pl.dress, drs);
    layers += photoLayer(drs, p, 3, "dress");
    labels.push({name:drs.name, catLabel:"Kleid", midY:itemMidY(p), side:"left"});
  } else {
    if(top){
      const p = place(pl.top, top);
      layers += photoLayer(top, p, 4, "tops");
      labels.push({name:top.name, catLabel:"Oberteil", midY:itemMidY(p), side:"left"});
    }
    if(bot){
      const p = place(bot.skirt? pl.skirt : pl.bottom, bot);
      layers += photoLayer(bot, p, 2, "bottoms");
      labels.push({name:bot.name, catLabel:bot.skirt?"Rock":"Unterteil", midY:itemMidY(p), side:"right"});
    }
  }
  // Jacke immer ganz oben
  if(out){
    const p = place(pl.outer, out);
    layers += photoLayer(out, p, 5, "outer");
    // Label bewusst höher ansetzen (Schulter/Kragen), damit es nicht auf einer Linie mit dem Oberteil sitzt
    labels.push({name:out.name, catLabel:"Jacke", midY:itemMidY(p) - 12, side:"right"});
  }

  return `<div class="figure-frame">
      <div class="figure-stage">
        <img class="figure-img" src="${FIG_IMG[gender]}" alt="Figur ${gender==='female'?'Damen':'Herren'}">
        <div class="garment-wrap">${layers}</div>
      </div>
      ${buildLabels(labels)}
    </div>`;
}

// Erzeugt die seitlichen Labels samt Verbindungslinien (als SVG + HTML-Text).
// Frame 620px, Stage 300px mittig => Stage-Ränder bei 160px und 460px.
function buildLabels(labels){
  if(labels.length===0) return '';
  const FRAME_W = 620, STAGE_W = 300, STAGE_H = 580;
  const stageLeft = (FRAME_W - STAGE_W)/2; // 160
  const figEdgeL = stageLeft + STAGE_W*0.30;
  const figEdgeR = stageLeft + STAGE_W*0.70;
  const MIN_GAP = 46; // Mindestabstand zwischen Labels auf einer Seite (px)

  const lefts = labels.filter(l=>l.side==="left");
  const rights = labels.filter(l=>l.side==="right");

  // Kollisionsvermeidung: y-Positionen auf einer Seite auseinanderziehen
  function spread(list){
    list.sort((a,b)=>a.midY-b.midY);
    let prevY = -Infinity;
    list.forEach(l=>{
      let y = STAGE_H * l.midY/100;
      if(y - prevY < MIN_GAP) y = prevY + MIN_GAP;
      l._y = y; prevY = y;
    });
  }
  spread(lefts); spread(rights);

  let lines = '', texts = '';
  function emit(list, side){
    list.forEach(l=>{
      const yAnchor = STAGE_H * l.midY/100; // Anknüpfpunkt an der Figur
      const yLabel = l._y;                  // ggf. verschobene Label-Höhe
      const figX = side==="left"? figEdgeL : figEdgeR;
      const endX = side==="left"? stageLeft - 8 : stageLeft + STAGE_W + 8;
      // Linie: von Figurkante zum Label-Anschluss (leichter Knick wenn verschoben)
      lines += `<polyline class="label-line" points="${figX},${yAnchor} ${endX},${yLabel}"></polyline>`;
      lines += `<circle class="label-dot" cx="${figX}" cy="${yAnchor}" r="2"></circle>`;
      const sideCls = side==="left"?"left":"right";
      const posCss = side==="left"
        ? `left:0;width:${stageLeft-14}px;`
        : `right:0;width:${stageLeft-14}px;`;
      texts += `<div class="fig-label ${sideCls}" style="top:${yLabel}px;${posCss}transform:translateY(-50%)">
          <span class="fl-cat">${l.catLabel}</span>${l.name}
        </div>`;
    });
  }
  emit(lefts,"left");
  emit(rights,"right");

  return `<svg class="label-svg" viewBox="0 0 ${FRAME_W} ${STAGE_H}" preserveAspectRatio="none">${lines}</svg>${texts}`;
}

function femaleFigure(){ return buildFigure('female'); }
function maleFigure(){ return buildFigure('male'); }

/* ============ RENDER ============ */
function renderCats(){
  $("#cats").innerHTML = CATS.map(c=>`
    <button class="cat-tab ${c.id===activeCat?'active':''}" data-cat="${c.id}">
      <span class="dot"></span>${c.label}
    </button>`).join("");
  document.querySelectorAll(".cat-tab").forEach(b=>{
    b.onclick=()=>{activeCat=b.dataset.cat;activeSub="all";styleFilter="all";prodPage=0;renderCats();renderProducts();};
  });
}

let styleFilter = "all";
let prodPage = 0;
const PER_PAGE = 6;

function renderProducts(){
  let list = PRODUCTS[gender][activeCat] || [];

  // Unterkategorien dieser Hauptkategorie (falls vorhanden)
  const subs = (SUBCATS[gender] && SUBCATS[gender][activeCat]) || null;

  // Nach aktiver Unterkategorie filtern
  if(subs && activeSub!=="all"){
    list = list.filter(p=>p.sub===activeSub);
  }

  const subBar = subs ? `
    <div class="sub-filter">
      <button class="sf ${activeSub==='all'?'on':''}" data-sub="all">Alle</button>
      ${subs.map(s=>`<button class="sf ${activeSub===s.id?'on':''}" data-sub="${s.id}">${s.label}</button>`).join("")}
    </div>` : '';

  // Paginierung
  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
  if(prodPage > pageCount-1) prodPage = pageCount-1;
  if(prodPage < 0) prodPage = 0;
  const pageItems = list.slice(prodPage*PER_PAGE, prodPage*PER_PAGE + PER_PAGE);

  const grid = `<div class="product-grid">` + pageItems.map(p=>`
    <div class="product ${selection[activeCat]===p.id?'selected':''}" data-id="${p.id}">
      <div class="swatch">${swatchSVG(p)}</div>
      <div class="meta">
        <div class="name">${p.name}</div>
        <div class="price-row"><span class="price">${euro(p.price)}</span>${p.style?`<span class="style-tag">${p.style}</span>`:''}</div>
      </div>
    </div>`).join("") + `</div>`;

  const pager = pageCount>1 ? `
    <div class="pager">
      <button class="pg-arrow" data-dir="-1" ${prodPage===0?'disabled':''} aria-label="Zurück">‹</button>
      <span class="pg-info">${prodPage+1} / ${pageCount}</span>
      <button class="pg-arrow" data-dir="1" ${prodPage===pageCount-1?'disabled':''} aria-label="Weiter">›</button>
    </div>` : '';

  $("#products").innerHTML = subBar + grid + pager;

  document.querySelectorAll(".sf").forEach(b=>{
    b.onclick=()=>{activeSub=b.dataset.sub;prodPage=0;renderProducts();};
  });
  document.querySelectorAll(".pg-arrow").forEach(b=>{
    b.onclick=()=>{ if(!b.disabled){ prodPage += parseInt(b.dataset.dir,10); renderProducts(); } };
  });
  document.querySelectorAll(".product").forEach(el=>{
    el.onclick=()=>{
      const id=el.dataset.id;
      const newVal = (selection[activeCat]===id)? null : id;
      selection[activeCat] = newVal;
      if(newVal){
        if(activeCat==="dress"){ selection.tops=null; selection.bottoms=null; }
        if(activeCat==="tops" || activeCat==="bottoms"){ selection.dress=null; }
      }
      renderProducts();renderFigure();renderOutfit();
    };
  });
}

function renderFigure(){
  $("#figure").innerHTML = gender==="female"? femaleFigure(): maleFigure();
  // Klick auf ein getragenes Kleidungsstück entfernt es
  document.querySelectorAll("#figure .garment-clickable").forEach(el=>{
    el.onclick=()=>{
      const cat = el.dataset.cat;
      selection[cat] = null;
      renderProducts(); renderFigure(); renderOutfit();
    };
  });
}

function renderOutfit(){
  const items = CATS.map(c=>{
    const id=selection[c.id]; if(!id)return null;
    const p=findProduct(id); const lbl=CATS.find(x=>x.id===c.id).label;
    return {...p,catLabel:lbl};
  }).filter(Boolean);

  if(items.length===0){
    $("#outfitList").innerHTML=`<div class="out-empty">Noch nichts ausgewählt.<br>Wähle links ein Teil, um deinen Look aufzubauen.</div>`;
  }else{
    $("#outfitList").innerHTML = items.map(p=>`
      <div class="out-item">
        <div>
          <div class="oi-cat">${p.catLabel}</div>
          ${p.url? `<a class="oi-name" href="${p.url}" target="_blank" rel="noopener">${p.name}</a>` : `<div class="oi-name">${p.name}</div>`}
        </div>
        <span class="oi-price">${euro(p.price)}</span>
        <button class="oi-remove" data-cat="${p.cat}" title="Entfernen">✕</button>
      </div>`).join("");
    document.querySelectorAll(".oi-remove").forEach(b=>{
      b.onclick=()=>{selection[b.dataset.cat]=null;renderProducts();renderFigure();renderOutfit();};
    });
  }
  const total = items.reduce((s,p)=>s+p.price,0);
  $("#total").textContent = euro(total);
}

/* ============ EVENTS ============ */
document.querySelectorAll("#gender button").forEach(b=>{
  b.onclick=()=>{
    gender=b.dataset.g;
    document.querySelectorAll("#gender button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    CATS = CATS_BY_GENDER[gender];
    selection={tops:null,bottoms:null,dress:null,outer:null};
    activeCat="tops";
    activeSub="all";
    styleFilter="all";
    prodPage=0;
    $("#shopLink").href = gender==="female"
      ? "https://shop.mango.com/de/de/h/damen"
      : "https://shop.mango.com/de/de/h/herren";
    renderCats();renderProducts();renderFigure();renderOutfit();
  };
});
/* ============ LOOKS SPEICHERN / VERWALTEN ============ */
const LOOKS_KEY = "mango_saved_looks";

function loadLooks(){
  try { return JSON.parse(localStorage.getItem(LOOKS_KEY)) || []; }
  catch(e){ return []; }
}
function persistLooks(looks){
  try { localStorage.setItem(LOOKS_KEY, JSON.stringify(looks)); }
  catch(e){ console.warn("Speichern fehlgeschlagen", e); }
  updateLooksCount();
}
function updateLooksCount(){
  const n = loadLooks().length;
  const el = $("#looksCount");
  if(el) el.textContent = n>0 ? n : "";
}

function currentLookHasItems(){
  return !!(selection.tops||selection.bottoms||selection.dress||selection.outer);
}

function saveCurrentLook(){
  if(!currentLookHasItems()) return false;
  const looks = loadLooks();
  const names = CATS.map(c=>selection[c.id]&&findProduct(selection[c.id]).name).filter(Boolean);
  const defaultName = "Look " + (looks.length+1);
  looks.unshift({
    id: "look_" + Date.now(),
    name: defaultName,
    gender: gender,
    selection: Object.assign({}, selection),
    items: names,
    created: new Date().toLocaleDateString("de-DE", {day:"2-digit",month:"short",year:"numeric"})
  });
  persistLooks(looks);
  return true;
}

function deleteLook(id){
  persistLooks(loadLooks().filter(l=>l.id!==id));
  renderLooksPage();
}
function renameLook(id, newName){
  const looks = loadLooks();
  const l = looks.find(x=>x.id===id);
  if(l){ l.name = newName.trim() || l.name; persistLooks(looks); }
}
function applyLook(look){
  gender = look.gender;
  selection = Object.assign({tops:null,bottoms:null,dress:null,outer:null}, look.selection);
  CATS = CATS_BY_GENDER[gender];
  // Gender-Buttons synchronisieren
  document.querySelectorAll("#gender button").forEach(b=>b.classList.toggle("active", b.dataset.g===gender));
  $("#shopLink").href = gender==="female"
    ? "https://shop.mango.com/de/de/h/damen" : "https://shop.mango.com/de/de/h/herren";
  activeCat="tops"; activeSub="all"; styleFilter="all"; prodPage=0;
  showLooksPage(false);
  renderCats();renderProducts();renderFigure();renderOutfit();
}

// Mini-Figur-Vorschau für eine gespeicherte Auswahl (nutzt buildFigure mit temporärem State)
function lookPreviewHTML(look){
  const savedSel = selection, savedGender = gender;
  selection = look.selection; gender = look.gender;
  const html = (gender==="female"? femaleFigure(): maleFigure());
  selection = savedSel; gender = savedGender;
  return html;
}

function renderLooksPage(){
  const looks = loadLooks();
  const c = $("#looksContent");
  if(looks.length===0){
    c.innerHTML = `<div class="looks-empty">Du hast noch keine Looks gespeichert.<br>
      Stelle im Builder ein Outfit zusammen und klicke auf „Look speichern".</div>`;
    return;
  }
  c.innerHTML = `<div class="looks-grid">` + looks.map(l=>`
    <div class="look-card" data-id="${l.id}">
      <div class="look-preview" data-action="load">${lookPreviewHTML(l)}</div>
      <div class="look-info">
        <div class="look-name-row">
          <input class="look-name" value="${l.name.replace(/"/g,'&quot;')}" data-id="${l.id}" spellcheck="false">
          <button class="look-edit" title="Name bearbeiten">✎</button>
        </div>
        <div class="look-meta">${l.gender==='female'?'Damen':'Herren'} · ${l.items.length} Teile · ${l.created}</div>
        <div class="look-actions">
          <button class="btn btn-primary" data-action="load">Anziehen</button>
          <button class="look-del" data-action="del">Löschen</button>
        </div>
      </div>
    </div>`).join("") + `</div>`;

  // Events
  c.querySelectorAll(".look-card").forEach(card=>{
    const id = card.dataset.id;
    const look = looks.find(x=>x.id===id);
    card.querySelectorAll('[data-action="load"]').forEach(el=>{
      el.onclick=()=>applyLook(look);
    });
    card.querySelector('[data-action="del"]').onclick=()=>deleteLook(id);
    const nameInput = card.querySelector(".look-name");
    const commit=()=>renameLook(id, nameInput.value);
    nameInput.onblur=commit;
    nameInput.onkeydown=(e)=>{ if(e.key==="Enter"){ nameInput.blur(); } };
    card.querySelector(".look-edit").onclick=()=>{ nameInput.focus(); nameInput.select(); };
  });
}

function showLooksPage(show){
  document.body.classList.toggle("viewing-looks", show);
  $("#looksPage").classList.toggle("show", show);
  $("#navLooks").classList.toggle("active", show);
  if(show){ renderLooksPage(); }
}

$("#navLooks").onclick=()=>showLooksPage(true);
$("#looksBack").onclick=()=>showLooksPage(false);

$("#resetBtn").onclick=()=>{
  selection={tops:null,bottoms:null,dress:null,outer:null};
  renderProducts();renderFigure();renderOutfit();
};
$("#saveBtn").onclick=()=>{
  const ok = saveCurrentLook();
  const t=$("#toast");
  t.textContent = ok ? "Look gespeichert" : "Bitte zuerst ein Teil auswählen";
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1800);
};

/* ============ INIT ============ */
// Produktdaten aus JSON laden, dann Oberfläche aufbauen.
fetch("products.json")
  .then(r => r.json())
  .then(data => {
    PRODUCTS = data;
    renderCats(); renderProducts(); renderFigure(); renderOutfit(); updateLooksCount();
  })
  .catch(err => {
    console.error("Produktdaten konnten nicht geladen werden:", err);
    document.getElementById("products").innerHTML =
      "<p style='color:#b00;font-size:13px;padding:20px'>Produktdaten konnten nicht geladen werden. " +
      "Bitte die Seite über einen lokalen Server öffnen (siehe README).</p>";
  });