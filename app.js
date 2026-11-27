/* FORM — The Design Index. No build step, dependencies, cookies or analytics. */
(() => {
  'use strict';
  const studies = window.FORM_STUDIES;
  const facts = window.FORM_FACTS;
  const app = document.getElementById('app');
  const categories = ['All','Minimal','Digital','Luxury','Editorial','Creative','Lifestyle','Experimental'];
  const icon = (name) => ({
    search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    bookmark:'<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z"/>',
    arrow:'<path d="m5 12 14 0m-6-6 6 6-6 6"/>',
    back:'<path d="m19 12-14 0m6-6-6 6 6 6"/>',
    compare:'<rect x="3" y="4" width="8" height="16" rx="1"/><rect x="13" y="4" width="8" height="16" rx="1"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    rank:'<path d="M5 20V9m7 11V4m7 16v-7"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
    share:'<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5m-8 7 8 5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    check:'<path d="m5 12 5 5L20 7"/>',
    close:'<path d="M5 5l14 14M19 5 5 19"/>'
  }[name] || '');
  const svgIcon = (name) => `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon(name)}</svg>`;
  const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const getStored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const state = {filter:'All',sort:'rank',query:'',rankMode:'editorial',saved:new Set(getStored('form-saved-v1',[])),compare:[],toastTimer:null};
  const voting = window.FORM_VOTING;
  const lookup = slug => studies.find(d => d.slug === slug);
  const route = () => decodeURIComponent(location.hash.slice(1) || '/');
  const saveFavorites = () => { try { localStorage.setItem('form-saved-v1',JSON.stringify([...state.saved])); } catch {} };

  const svgText = (x,y,str,size,fill,weight=500,extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${esc(str)}</text>`;
  const line = (x1,y1,x2,y2,stroke,width=1,opacity=1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}"/>`;
  const rect = (x,y,w,h,fill,r=0,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
  const ring = (cx,cy,r,color,sw=1,extra='') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" ${extra}/>`;

  function composition(d) {
    const a=d.accent, c=d.accent2, f=d.fg;
    const heavy=(x,y,t,n,fill=a,ex='')=>svgText(x,y,t,n,fill,700,ex);
    const serif=(x,y,t,n,fill=f,ex='')=>svgText(x,y,t,n,fill,400,`font-family="Georgia,serif" ${ex}`);
    switch(d.layout){
      case 'precision': return `${Array.from({length:8},(_,i)=>line(27,66+i*23,373,66+i*23,f,.5,.12)).join('')}${Array.from({length:7},(_,i)=>line(27+i*52,56,27+i*52,228,f,.5,.08)).join('')}${heavy(28,173,'05',110,f,'letter-spacing="-8"')}${svgText(220,129,'TITLES',21,c,700,'letter-spacing="3"')}${svgText(220,154,'ONE LEGACY',12,f,500,'letter-spacing="1.5"')}${rect(220,175,126,7,a,3)}`;
      case 'minimal': return `${heavy(28,182,'5',132,f,'letter-spacing="-11"')}${svgText(147,127,'Championships.',25,f,500,'letter-spacing="-1"')}${svgText(148,151,'The leadership story.',13,f,400,'opacity=".58"')}${rect(148,171,91,4,a,2)}`;
      case 'fluid': return `<defs><linearGradient id="f${d.rank}" x1="0" y1="1" x2="1" y2="0"><stop stop-color="${a}"/><stop offset=".56" stop-color="${c}"/><stop offset="1" stop-color="#f2b96f"/></linearGradient></defs><path d="M400 51L400 229 255 229 199 160 281 71Z" fill="url(#f${d.rank})" opacity=".93"/><path d="M400 110L345 218 267 218 316 110Z" fill="${a}" opacity=".46"/>${heavy(24,165,'5',115,f)}${svgText(29,190,'TITLES',15,f,600,'letter-spacing="2.2"')}`;
      case 'dots': return `${Array.from({length:135},(_,i)=>{let xx=230+(i%15)*10,yy=68+Math.floor(i/15)*10,dist=Math.hypot(xx-300,yy-109);return `<circle cx="${xx}" cy="${yy}" r="${dist<58?3:1.3}" fill="${dist<58?a:f}" opacity="${dist<58?'.9':'.13'}"/>`;}).join('')}${heavy(25,174,'05',94,f,'font-family="monospace" letter-spacing="-7"')}${svgText(26,195,'THE LEGACY //',12,f,500,'font-family="monospace"')}`;
      case 'heritage': return `${ring(282,138,78,a,1.6)}${ring(282,138,66,a,.7,'opacity=".66"')}${Array.from({length:36},(_,i)=>line(282,59,282,67,a,(i%3===0?2:1),.8).replace('<line','<line transform="rotate('+i*10+' 282 138)"')).join('')}${serif(282,155,'V',81,a,'text-anchor="middle"')}${serif(23,129,'A legacy',26,f)}${serif(23,157,'for the ages.',25,f)}${line(24,174,154,174,a,1.3)}`;
      case 'shapes': return `${rect(226,64,91,91,a,20,'transform="rotate(-16 271 109)"')}${rect(269,106,102,95,c,21,'opacity=".75"')}${ring(264,151,50,f,4,'opacity=".38"')}${heavy(27,179,'05',115,f,'letter-spacing="-8"')}${svgText(29,203,'MAKE HISTORY.',11,f,700,'letter-spacing="1.5"')}`;
      case 'editorial': return `${serif(26,131,'The story',47,f)}${serif(26,179,'of greatness.',49,a)}${line(25,195,339,195,f,1,.3)}${svgText(26,216,'FIVE TITLES / ELEVEN SEASONS',11,f,500,'letter-spacing="1.8"')}`;
      case 'metal': return `<defs><linearGradient id="metal${d.rank}" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff5dd"/><stop offset=".4" stop-color="${a}"/><stop offset="1" stop-color="#786748"/></linearGradient></defs>${ring(299,141,76,a,1.2,'opacity=".7"')}${ring(299,141,56,c,.7,'opacity=".45"')}${heavy(28,190,'5',151,`url(#metal${d.rank})`,'letter-spacing="-7"')}${svgText(159,117,'EARNED.',18,f,600,'letter-spacing="2"')}${svgText(159,143,'NOT GIVEN.',13,c,500,'letter-spacing="1.3"')}`;
      case 'terminal': return `${rect(24,69,352,155,d.bg,7,`stroke="${f}" stroke-opacity=".18"`)}${rect(24,69,352,29,a,7,'opacity=".13"')}${Array.from({length:3},(_,i)=>`<circle cx="${41+i*14}" cy="83" r="3" fill="${i===0?a:f}" opacity=".6"/>`).join('')}${svgText(42,127,'> mi --history',17,c,600,'font-family="monospace"')}${svgText(42,157,'titles: 5',20,f,600,'font-family="monospace"')}${svgText(42,185,'captain: rohit_sharma',13,f,400,'font-family="monospace" opacity=".73"')}`;
      case 'landscape': return `<path d="M0 226L98 117 156 181 244 75 400 228Z" fill="${c}" opacity=".22"/><path d="M115 226L242 80 400 211V226Z" fill="${a}" opacity=".35"/><path d="M225 131L244 80 269 138" fill="none" stroke="${c}" stroke-width="2"/>${serif(26,139,'Beyond',45,f)}${serif(26,178,'the ordinary.',34,f)}`;
      case 'soft': return `<ellipse cx="307" cy="127" rx="86" ry="74" fill="${c}" opacity=".7"/><ellipse cx="328" cy="150" rx="51" ry="53" fill="${a}" opacity=".18"/>${heavy(29,181,'5',122,a)}${svgText(155,131,'The moments',22,f,600)}${svgText(157,155,'that matter.',22,f,600)}`;
      case 'tiles': return `${rect(26,67,156,154,a,15,'opacity=".9"')}${heavy(42,160,'05',78,'#fff')}${svgText(43,188,'CHAMPIONSHIPS',11,'#fff',700,'letter-spacing="1"')}${rect(195,67,179,70,c,13,'opacity=".55"')}${rect(195,148,179,73,a,13,'opacity=".15"')}${heavy(212,111,'11',35,f)}${svgText(269,111,'SEASONS',12,f)}${svgText(212,189,'2013—2023',20,f,600)}`;
      case 'route': return `${line(30,174,367,174,f,2,.24)}<path d="M30 174H86Q95 174 95 165V96H204Q217 96 217 110V169Q217 180 231 180H364" fill="none" stroke="${a}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>${[30,95,217,364].map((x,i)=>`<circle cx="${x}" cy="${i===1?96:i===2?174:174}" r="${i===2?10:6}" fill="${a}" stroke="${d.bg}" stroke-width="3"/>`).join('')}${heavy(26,85,'THE ROAD',31,f)}${svgText(26,119,'TO GREATNESS',17,f,500,'letter-spacing="1"')}`;
      case 'cinema': return `<defs><linearGradient id="cin${d.rank}" x1="0" x2="1"><stop stop-color="${a}" stop-opacity=".3"/><stop offset="1" stop-color="${d.bg}" stop-opacity="0"/></linearGradient></defs><path d="M205 51L400 53 400 220 140 220Z" fill="url(#cin${d.rank})"/>${rect(26,74,4,121,a)}${heavy(44,140,'THE ERA',35,f,'letter-spacing="-1"')}${heavy(44,182,'OF FIVE.',38,f,'letter-spacing="-1"')}${svgText(46,212,'2013 / 2015 / 2017 / 2019 / 2020',11,c)}`;
      case 'orbit': return `<ellipse cx="284" cy="139" rx="102" ry="49" fill="none" stroke="${a}" stroke-width="1.5" transform="rotate(-34 284 139)"/><ellipse cx="284" cy="139" rx="99" ry="49" fill="none" stroke="${f}" stroke-width=".7" opacity=".36" transform="rotate(35 284 139)"/><circle cx="285" cy="138" r="35" fill="${a}" opacity=".22"/><circle cx="355" cy="97" r="7" fill="${a}"/>${heavy(27,139,'05',81,f)}${svgText(28,164,'MISSIONS WON',12,f,600,'letter-spacing="1.5"')}`;
      case 'google': return `${[['#4285F4',275,108,45],['#EA4335',323,91,22],['#FBBC05',328,157,29],['#34A853',262,169,23]].map(e=>`<circle cx="${e[1]}" cy="${e[2]}" r="${e[3]}" fill="${e[0]}" opacity=".84"/>`).join('')}${heavy(24,159,'5',113,f)}${svgText(24,185,'championships.',17,f,500)}`;
      case 'nordic': return `${rect(224,73,154,145,c,71,'opacity=".55"')}${rect(282,98,96,120,a,48,'opacity=".17"')}${heavy(24,160,'05',100,a)}${svgText(26,187,'A history of leadership',15,f,500)}`;
      case 'playlist': return `${Array.from({length:11},(_,i)=>rect(232+i*12,177-(i*19%84),6,40+(i*19%84),i%3===0?c:a,3)).join('')}${heavy(26,154,'TOP 5',69,f,'letter-spacing="-4"')}${svgText(26,183,'THE CHAMPIONSHIP YEARS',12,a,600,'letter-spacing="1"')}`;
      case 'bubbles': return `${[[-10,80,125,c,.6],[312,128,87,a,.28],[360,72,40,a,.4]].map(([x,y,r,v,o])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${v}" opacity="${o}"/>`).join('')}${heavy(36,165,'5',105,f)}${svgText(138,126,'A LEGACY',18,f,600)}${svgText(138,153,'IN MOTION',19,f,600)}`;
      case 'automotive': return `${Array.from({length:7},(_,i)=>line(162+i*31,76,105+i*31,217,i%2?a:f,i===0?4:1,i===0?.9:.25)).join('')}${heavy(25,173,'05',104,f,'font-style="italic" letter-spacing="-8"')}${svgText(27,202,'PERFORMANCE / LEGACY',11,a,700,'letter-spacing="1.1"')}`;
      case 'network': return `${[[251,84],[327,97],[286,175],[353,190],[219,145]].map(([x,y],i)=>`${line(x,y,300,137,a,1.5,.5)}<circle cx="${x}" cy="${y}" r="${i%2?7:5}" fill="${a}"/>`).join('')}<circle cx="300" cy="137" r="19" fill="${c}" opacity=".4"/>${heavy(25,164,'05',93,f)}${svgText(29,188,'CONNECTED MILESTONES',11,f,600,'letter-spacing=".5"')}`;
      case 'chip': return `${rect(241,83,105,105,a,10,'opacity=".23"')}${rect(256,98,75,75,d.bg,5,`stroke="${a}" stroke-width="2"`)}${Array.from({length:6},(_,i)=>line(255+i*15,71,255+i*15,83,a,2,.8)+line(255+i*15,188,255+i*15,203,a,2,.8)).join('')}${heavy(276,146,'5',46,c)}${heavy(25,171,'05',103,f)}${svgText(27,193,'PEAK PERFORMANCE',11,a,600,'letter-spacing=".8"')}`;
      case 'poster': return `<path d="M285 56L400 81 400 200 280 222 228 150Z" fill="${c}" opacity=".7"/><path d="M319 56L400 75V203L339 192 286 113Z" fill="${a}" opacity=".75"/>${heavy(25,163,'05',114,a)}${heavy(29,192,'LEGENDARY',15,f,'letter-spacing="1.1"')}`;
      default: return heavy(24,175,'05',120,a);
    }
  }

  function art(d, opts={}) {
    const sub=opts.tiny?'':`<desc>An independent ${esc(d.name)}-inspired interpretation of Mumbai Indians' five IPL championships.</desc>`;
    const years=[2013,2015,2017,2019,2020];
    const dark=['#111216','#141414','#06452F','#151515','#0D1117','#153B2B','#101319','#07111F','#111512','#0B0B0C','#1B1422','#132234','#121511','#0E0E10','#17101E'].includes(d.bg);
    const footer=dark?'#FFFFFF':'#1D2924';
    const markers=years.map(y=>{const x=28+((y-2008)/18)*344;return `<circle cx="${x}" cy="253" r="3.5" fill="${d.accent}" stroke="${d.bg}" stroke-width="1.5"/>`}).join('');
    return `<svg class="visual-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${esc(d.name)} inspired Mumbai Indians championship design" preserveAspectRatio="xMidYMid meet"><title>${esc(d.name)} design study</title>${sub}<rect width="400" height="300" fill="${d.bg}"/>${svgText(25,35,d.name.toUpperCase(),14,d.fg,700,'letter-spacing="1.3"')}${svgText(375,35,'FORM / MI',9,d.fg,500,'letter-spacing="1.5" text-anchor="end" opacity=".48"')}${line(25,47,375,47,d.fg,.7,.14)}${composition(d)}${line(27,253,373,253,d.fg,1,.22)}${markers}${svgText(25,282,'2008',10,footer,500,'opacity=".62"')}${svgText(375,282,'2026',10,footer,500,'text-anchor="end" opacity=".62"')}${svgText(200,282,'FIVE CHAMPIONSHIP YEARS',9,footer,600,'text-anchor="middle" letter-spacing="1" opacity=".62"')}</svg>`;
  }

  const navLink=(label,path,active,count='')=>`<a href="#${path}" class="nav-link ${active?'active':''}" ${active?'aria-current="page"':''}>${label}${count?` <span class="tiny-count">${count}</span>`:''}</a>`;
  function chrome(main, current) {
    const explore=current==='/'||current==='/collection'||current.startsWith('/design/');
    const compareCount=state.compare.length;
    return `<header class="site-header"><div class="header-inner"><a href="#/" class="brand" aria-label="FORM home">form<i>.</i></a><nav class="primary-nav" aria-label="Main navigation">${navLink('Explore','/collection',explore)}${navLink('Rankings','/rankings',current==='/rankings')}${navLink('Saved','/saved',current==='/saved',state.saved.size)}${navLink('Compare','/compare',current==='/compare',compareCount)}</nav><div class="header-actions"><button class="icon-btn" data-focus-search aria-label="Search designs" title="Search designs">${svgIcon('search')}</button><button class="icon-btn" data-route="/compare" aria-label="Compare selected designs" title="Compare">${svgIcon('compare')}</button></div></div><div class="top-progress" aria-hidden="true"></div></header><main id="main">${main}</main><footer class="site-footer"><div class="wrap footer-inner"><div><div class="footer-brand">form.</div><div class="footer-copy">An independent design exploration. Brand-inspired interpretations, not official brand products or affiliations. Editorial ratings are subjective.</div></div><div class="footer-end"><div class="footer-kicker">ONE STORY. 37 PERSPECTIVES.</div><div class="footer-credit">A project by <a href="https://www.linkedin.com/in/prakharindoria/" target="_blank" rel="noopener noreferrer" aria-label="Prakhar Indoria on LinkedIn (opens in a new tab)">Prakhar Indoria <span aria-hidden="true">↗</span></a></div><div class="footer-made">Made with <span class="footer-heart" aria-label="love">♥</span> in India</div><div class="footer-copyright">© ${new Date().getFullYear()} FORM</div></div></div></footer><nav class="mobile-nav" aria-label="Mobile navigation"><a href="#/collection" class="${explore?'active':''}">${svgIcon('grid')}Explore</a><a href="#/rankings" class="${current==='/rankings'?'active':''}">${svgIcon('rank')}Rankings</a><a href="#/saved" class="${current==='/saved'?'active':''}">${svgIcon('bookmark')}Saved</a><a href="#/compare" class="${current==='/compare'?'active':''}">${svgIcon('compare')}Compare</a></nav>${dock()}`;
  }

  function dock(){
    if(!state.compare.length)return '';
    const hasTwo=state.compare.length===2;
    return `<div class="compare-dock" aria-live="polite"><div><strong>${state.compare.map(s=>lookup(s)?.name).join(' + ')}</strong><br><span>${state.compare.length} of 2 selected</span></div><div class="compare-dock-actions"><button data-clear-compare>Clear</button><button class="primary" data-route="/compare" ${!hasTwo?'disabled':''}>Compare</button></div></div>`;
  }

  function cards(items) {
    if(!items.length) return `<div class="empty-state"><div class="empty-glyph">○</div><h3>Nothing here. Yet.</h3><p>Try a different search or explore the full collection.</p><button class="outline-btn" data-clear-filters>Show all designs</button></div>`;
    return items.map(d=>`<article class="study-card"><button class="cover-button" data-design="${d.slug}" aria-label="Open ${esc(d.name)} design study">${art(d,{tiny:true})}<span class="card-sheen"></span></button><div class="card-meta"><div><h3>${esc(d.name)}</h3><p>${esc(d.category)} · Study ${String(d.rank).padStart(2,'0')}</p></div><div class="card-trail"><span class="score-pill">${d.score}<span style="color:#a3aaa1;font-weight:400">/100</span></span>${voting.button(d)}<button class="bookmark-btn ${state.saved.has(d.slug)?'saved':''}" data-save="${d.slug}" aria-label="${state.saved.has(d.slug)?'Remove':'Save'} ${esc(d.name)}" aria-pressed="${state.saved.has(d.slug)}">${svgIcon('bookmark')}</button></div></div></article>`).join('');
  }

  function filtered(){
    let result=studies.filter(d=>(state.filter==='All'||d.category===state.filter)&&(!state.query||[d.name,d.category,d.tagline].join(' ').toLowerCase().includes(state.query.toLowerCase())));
    return result.sort((a,b)=>state.sort==='alpha'?a.name.localeCompare(b.name):state.sort==='reverse'?a.score-b.score:b.score-a.score);
  }

  function controls(){
    return `<div class="controls"><label class="search-field">${svgIcon('search')}<input id="design-search" type="search" placeholder="Search the collection" autocomplete="off" value="${esc(state.query)}" aria-label="Search design studies" /></label><div class="filter-scroller" role="group" aria-label="Filter by design category">${categories.map(c=>`<button class="filter-chip ${state.filter===c?'active':''}" data-filter="${c}" aria-pressed="${state.filter===c}">${c}</button>`).join('')}</div><label class="select-wrap"><span class="sr-only">Sort results</span><select class="sort-select" id="sort-select" aria-label="Sort results"><option value="rank" ${state.sort==='rank'?'selected':''}>Top rated</option><option value="alpha" ${state.sort==='alpha'?'selected':''}>A to Z</option><option value="reverse" ${state.sort==='reverse'?'selected':''}>Lowest first</option></select></label></div>`;
  }

  function collectionSection(){return `<section id="collection" class="wrap"><div class="section-head"><div><div class="eyebrow">THE COLLECTION / VOL. 01</div><h2>Explore the index<span style="color:#8e9c87">.</span></h2></div><p>One shared subject, interpreted through 37 distinct visual languages. Browse the work, not the hype.</p></div>${controls()}<div class="collection-summary"><b id="results-count">${filtered().length} design studies</b><span>Subjective editorial ranking</span></div><div class="gallery" id="gallery-results">${cards(filtered())}</div></section>`}

  function featuredChoice(){
    // Use the exact same tie-break as the People's Choice ranking page.
    // With no votes yet, show the editorial favourite without implying a community winner.
    const community=voting.totalVotes>0;
    return {design:community?voting.sortCommunity(studies)[0]:studies[0],community};
  }

  function featuredVotes(design){
    const count=voting.count(design.slug);
    return `${count.toLocaleString('en-US')} ${count===1?'vote':'votes'}`;
  }

  function featuredMarkup(){
    const {design,community}=featuredChoice();
    const key=`${community?'people':'editorial'}:${design.slug}`;
    return `<div class="feature-frame" id="hero-feature" data-feature-key="${key}"><div class="feature-top"><span>${community?"PEOPLE'S CHOICE / 01":"EDITOR'S PICK / 01"}</span><strong>${community?featuredVotes(design):`${design.score} / 100`}</strong></div>${art(design)}<div class="feature-bottom"><strong>${esc(design.name)}</strong><span>${esc(design.tagline)}</span></div><div class="feature-pill">${community?'Community favourite':'Top-rated study'}</div></div>`;
  }

  function updateHeroFeature(){
    const frame=document.getElementById('hero-feature');
    if(!frame)return;
    const {design,community}=featuredChoice();
    const key=`${community?'people':'editorial'}:${design.slug}`;
    if(frame.dataset.featureKey!==key){
      frame.outerHTML=featuredMarkup();
    }else if(community){
      // Keep the artwork stable when only the vote count changes.
      const count=frame.querySelector('.feature-top strong');
      if(count)count.textContent=featuredVotes(design);
    }
  }

  function home(){
    return `<section class="hero wrap"><div class="hero-copy"><div class="eyebrow">A CURATED EXPERIMENT IN DESIGN</div><h1>One story.<br><em>37 perspectives.</em></h1><p class="hero-text">What happens when the same story is told through 37 different design philosophies? A living collection of form, feeling and function.</p><div class="hero-actions"><a href="#/collection" class="solid-btn">Explore the collection ${svgIcon('arrow')}</a><a href="#/rankings" class="outline-btn">See the rankings</a></div></div>${featuredMarkup()}</section><div class="wrap stats-ribbon"><div class="stats-left"><div class="metric"><strong>37</strong><span>design languages</span></div><div class="metric"><strong>01</strong><span>shared narrative</span></div><div class="metric"><strong>∞</strong><span>ways to see</span></div></div><div class="stats-caption">A side-by-side exploration of the decisions that make design feel different.</div></div>${collectionSection()}<section class="interlude"><div class="wrap interlude-inner"><div><div class="eyebrow">WHAT STAYS THE SAME</div><p>Mumbai Indians. Nineteen IPL seasons. Five championships. One story that every design interprets differently.</p></div><h2>Same facts.<br><em>Different feeling.</em></h2></div></section>`;
  }
  function collectionPage(savedOnly=false){
    if(savedOnly){ const saved=studies.filter(d=>state.saved.has(d.slug));return `<div class="subpage wrap"><div class="eyebrow">YOUR PERSONAL SELECTION</div><h1 class="subpage-title">Worth keeping<span style="color:#84917d">.</span></h1><p class="subpage-intro">Designs you have bookmarked, saved locally on this browser. Your collection stays with you when you return.</p><div class="gallery">${saved.length?cards(saved):`<div class="empty-state"><div class="empty-glyph">♡</div><h3>Your collection starts here.</h3><p>Save any design you love and it will appear here.</p><a class="solid-btn" href="#/collection">Explore designs</a></div>`}</div></div>`}
    return `<div class="subpage wrap" style="padding-bottom:0"><div class="eyebrow">THE DESIGN INDEX</div><h1 class="subpage-title">The collection<span style="color:#84917d">.</span></h1><p class="subpage-intro">Thirty-seven perspectives on one shared story. Find a favourite, discover a new visual language, or compare two side by side.</p></div>${collectionSection()}`;
  }

  function detail(d){
    const start=2008,end=2027,span=end-start;
    return `<section class="subpage wrap"><button class="back-button" data-route="/collection">${svgIcon('back')} Back to collection</button><div class="detail-heading"><div><div class="eyebrow">STUDY ${String(d.rank).padStart(2,'0')} / 37 · ${esc(d.category.toUpperCase())}</div><h1>${esc(d.name)}<span style="color:#8c9889">.</span></h1><p>${esc(d.tagline)}</p></div><div class="detail-rank"><strong>${d.score}<span style="font-size:.39em;color:#929990;font-weight:400">/100</span></strong><span>EDITORIAL SCORE</span></div></div><div class="detail-grid"><div class="detail-art">${art(d)}</div><aside class="detail-side"><div><div class="eyebrow">THE VISUAL LANGUAGE</div><h2>One story, seen through ${esc(d.name)}.</h2><p>A conceptual interpretation of the brand's visual character. The same cricket history is expressed through a different palette, typography and composition.</p><div class="eyebrow" style="margin-top:27px">COLOUR NOTES</div><div class="detail-swatches">${[d.bg,d.fg,d.accent,d.accent2].map(c=>`<span class="swatch" style="background:${c}" title="${c}"></span>`).join('')}</div></div><div><div class="detail-vote-row">${voting.button(d,'detail')}<span>${voting.badge()}</span></div><div class="detail-actions"><button class="solid-btn" data-add-compare="${d.slug}">${state.compare.includes(d.slug)?svgIcon('check'):svgIcon('plus')} ${state.compare.includes(d.slug)?'Selected':'Compare design'}</button><button class="outline-btn" data-save="${d.slug}">${svgIcon('bookmark')} ${state.saved.has(d.slug)?'Saved':'Save'}</button><button class="outline-btn" data-download="${d.slug}" title="Download artwork as SVG">${svgIcon('download')} SVG</button><button class="outline-btn" data-share="${d.slug}" title="Copy a link to this study">${svgIcon('share')} Share</button></div></div></aside></div><div class="fact-board"><div><div class="eyebrow">CONSTANT SUBJECT</div><h2>The leadership timeline.</h2><p>Five primary captaincy periods; 2013 includes the transition from Ricky Ponting to Rohit Sharma. Temporary stand-ins are not shown.</p><div class="timeline-legend"><i></i> All five championships under Rohit</div></div><div class="timeline-list">${facts.captaincy.map(c=>`<div class="timeline-row ${c.key?'key':''}"><strong>${esc(c.name)}</strong><div class="track"><span style="left:${((c.from-start)/span*100).toFixed(2)}%;width:${Math.max(1.2,(c.to-c.from)/span*100).toFixed(2)}%;background:${c.key?d.accent:'#8c9c93'}"></span></div><div class="years">${esc(c.years)}</div></div>`).join('')}</div></div></section>`;
  }

  function rankingRows(){
    const community=state.rankMode==='people';
    const ordered=community?voting.sortCommunity(studies):studies;
    const max=Math.max(1,...ordered.map(d=>voting.count(d.slug)));
    return ordered.map((d,i)=>`<button class="ranking-row" data-design="${d.slug}" aria-label="Open ${d.name}, rank ${i+1}"><span class="rank-no">${String(i+1).padStart(2,'0')}</span><span class="brand-swatch" style="background:${d.accent}"></span><span class="rank-name">${esc(d.name)}</span><span class="rank-cat">${esc(d.category)}</span><span class="rank-bar"><i style="width:${community?(voting.count(d.slug)/max*100):d.score}%"></i></span><span class="rank-score">${community?(voting.isOnline()?`${voting.count(d.slug)}<small style="font-size:11px;font-weight:400;color:#9a9e97"> votes</small>`:'—'):`${d.score}<small style="color:#9a9e97;font-size:11px;font-weight:400"> /100</small>`}</span></button>`).join('');
  }

  function rankings(){return `<section class="subpage wrap"><div class="eyebrow">TWO WAYS TO SEE GREAT DESIGN</div><h1 class="subpage-title">The rankings<span style="color:#8a9684">.</span></h1><p class="subpage-intro">The editorial perspective is fixed. The community perspective belongs to the people who vote.</p><div class="ranking-top"><div class="ranking-switch" role="group" aria-label="Choose ranking"><button data-rank-mode="editorial" class="${state.rankMode==='editorial'?'active':''}" aria-pressed="${state.rankMode==='editorial'}">Editorial</button><button data-rank-mode="people" class="${state.rankMode==='people'?'active':''}" aria-pressed="${state.rankMode==='people'}">People's choice</button></div><div class="ranking-connection">${state.rankMode==='people'?voting.badge():'Independent, subjective design scores'}</div></div><div class="ranking-table" id="ranking-table">${rankingRows()}</div><p class="ranking-note" id="ranking-note">${state.rankMode==='people'?'Each browser can hold one active favourite across the 37 designs. Anonymous voting is best-effort and is not identity verification.':'Scores reflect our original editorial assessment, not an official global ranking.'}</p></section>`}

  function compare(){
    const selected=state.compare.map(lookup).filter(Boolean);
    return `<section class="subpage wrap"><div class="eyebrow">YOUR DESIGN WORKSPACE</div><h1 class="subpage-title">Side by side<span style="color:#8c9889">.</span></h1><p class="subpage-intro">The same facts, two different philosophies. Put them next to each other to see what changes — and what doesn't.</p><div class="compare-picks">${[0,1].map(i=>selected[i]?`<article class="compare-card"><div class="compare-caption"><h2>${esc(selected[i].name)}</h2><span>${selected[i].score} / 100</span></div>${art(selected[i])}<div class="compare-foot">${voting.button(selected[i],'detail')}<button class="outline-btn" data-remove-compare="${selected[i].slug}">${svgIcon('close')} Remove</button></div></article>`:`<div class="compare-select"><div style="font-size:45px;color:#abb4a7">+</div><h3>Choose a design</h3><p>Select a study from the collection to start comparing.</p><a class="solid-btn" href="#/collection">Browse collection</a></div>`).join('')}</div>${selected.length===2?`<div class="comparison-notes"><div><div class="eyebrow">FIRST IMPRESSION</div><p>${esc(selected[0].tagline)}</p></div><div><div class="eyebrow">ALTERNATE EXPRESSION</div><p>${esc(selected[1].tagline)}</p></div><div><div class="eyebrow">THE CONSTANT</div><p>Five titles, the same five championship seasons and the same shared MI history.</p></div></div>`:''}</section>`;
  }

  function render(){
    const path=route();let body='';
    if(path.startsWith('/design/')){const d=lookup(path.split('/')[2]);body=d?detail(d):notFound()}
    else if(path==='/collection')body=collectionPage();
    else if(path==='/saved')body=collectionPage(true);
    else if(path==='/compare')body=compare();
    else if(path==='/rankings')body=rankings();
    else if(path==='/')body=home();
    else body=notFound();
    app.innerHTML=chrome(body,path);
    document.title=path.startsWith('/design/')?`${lookup(path.split('/')[2])?.name||'Study'} — FORM`:path==='/rankings'?'Rankings — FORM':path==='/saved'?'Saved designs — FORM':path==='/compare'?'Compare — FORM':'FORM — The Design Index';
    window.scrollTo({top:0,behavior:'instant'});
    updateScroll();
  }
  function notFound(){return `<section class="subpage wrap"><div class="eyebrow">NOT FOUND</div><h1 class="subpage-title">Not this time.</h1><p class="subpage-intro">The study you're looking for doesn't exist.</p><a href="#/" class="solid-btn">Return home</a></section>`}

  function results(){
    const grid=document.getElementById('gallery-results');
    if(!grid)return;
    const list=filtered();grid.innerHTML=cards(list);
    const count=document.getElementById('results-count'); if(count)count.textContent=`${list.length} design ${list.length===1?'study':'studies'}`;
    document.querySelectorAll('[data-filter]').forEach(el=>{el.classList.toggle('active',el.dataset.filter===state.filter);el.setAttribute('aria-pressed',String(el.dataset.filter===state.filter));});
  }

  function updateRankings(){
    const table=document.getElementById('ranking-table');if(!table)return;
    table.innerHTML=rankingRows();
    document.querySelectorAll('[data-rank-mode]').forEach(el=>{
      const active=el.dataset.rankMode===state.rankMode;
      el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));
    });
    const connection=document.querySelector('.ranking-connection');
    if(connection)connection.innerHTML=state.rankMode==='people'?voting.badge():'Independent, subjective design scores';
    const note=document.getElementById('ranking-note');
    if(note)note.textContent=state.rankMode==='people'?'One active favourite per browser, changeable anytime. Anonymous voting is best-effort, not verified identity.':'Scores reflect our original editorial assessment, not an official global ranking.';
  }

  function toast(message){
    document.querySelector('.toast')?.remove();
    const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=message;document.body.appendChild(el);
    clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>el.remove(),2600);
  }
  function toggleSave(slug){
    state.saved.has(slug)?state.saved.delete(slug):state.saved.add(slug);saveFavorites();
    const position=window.scrollY;render();
    if(route()!== '/saved')window.scrollTo(0,position);
    toast(state.saved.has(slug)?'Saved to your collection':'Removed from saved designs');
  }
  function toggleCompare(slug){
    if(state.compare.includes(slug))state.compare=state.compare.filter(x=>x!==slug);
    else if(state.compare.length<2)state.compare.push(slug);
    else state.compare=[state.compare[1],slug];
    render();toast(state.compare.includes(slug)?'Added to comparison':'Removed from comparison');
  }
  function downloadSvg(slug){
    const d=lookup(slug);if(!d)return;
    const markup=art(d).replace('class="visual-svg"','');
    const blob=new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${markup}`],{type:'image/svg+xml;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`form-${slug}-mi-study.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('SVG artwork downloaded');
  }
  async function share(slug){
    const url=new URL(location.href);url.hash=`/design/${slug}`;
    try {await navigator.clipboard.writeText(url.href);toast('Link copied to clipboard');}
    catch {window.prompt('Copy this study link:',url.href);}
  }
  function updateScroll(){const max=document.documentElement.scrollHeight-window.innerHeight;document.documentElement.style.setProperty('--scroll',`${max>0?Math.min(100,window.scrollY/max*100):0}%`)}

  app.addEventListener('click',event=>{
    const target=event.target.closest('[data-design],[data-save],[data-add-compare],[data-remove-compare],[data-route],[data-filter],[data-rank-mode],[data-clear-compare],[data-clear-filters],[data-focus-search],[data-download],[data-share]');
    if(!target)return;
    const d=target.dataset;
    if(d.design){location.hash=`/design/${d.design}`;return}
    if(d.route){location.hash=d.route;return}
    if(d.save){toggleSave(d.save);return}
    if(d.addCompare){toggleCompare(d.addCompare);return}
    if(d.removeCompare){toggleCompare(d.removeCompare);return}
    if('clearCompare' in d){state.compare=[];render();return}
    if('clearFilters' in d){state.query='';state.filter='All';state.sort='rank';render();return}
    if(d.filter){state.filter=d.filter;results();return}
    if(d.rankMode){state.rankMode=d.rankMode;updateRankings();return}
    if('focusSearch' in d){location.hash='/collection';setTimeout(()=>document.getElementById('design-search')?.focus(),35);return}
    if(d.download){downloadSvg(d.download);return}
    if(d.share){share(d.share)}
  });
  app.addEventListener('input',event=>{
    if(event.target.id==='design-search'){state.query=event.target.value;results();}
  });
  app.addEventListener('change',event=>{
    if(event.target.id==='sort-select'){state.sort=event.target.value;results();}
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();location.hash='/collection';setTimeout(()=>document.getElementById('design-search')?.focus(),30)}
    if(event.key==='Escape'&&document.activeElement?.id==='design-search'){document.activeElement.blur()}
  });
  window.addEventListener('hashchange',render);
  window.addEventListener('scroll',updateScroll,{passive:true});
  document.addEventListener('form:votes-updated',()=>{updateHeroFeature();if(state.rankMode==='people')updateRankings()});
  document.addEventListener('form:vote-feedback',event=>toast(event.detail.message));
  render();
  voting.init();
})();
