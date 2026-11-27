/** Minimal public voting client. Connects to the Cloudflare Worker configured in config.js. */
(() => {
  'use strict';
  const config=window.FORM_CONFIG||{};
  const base=String(config.votesApiBase||'').replace(/\/+$/,'');
  const hasEndpoint=base.startsWith('https://')||base.startsWith('http://localhost:');
  const designs=window.FORM_STUDIES.map(d=>d.slug);
  const counts=Object.fromEntries(designs.map(slug=>[slug,0]));
  const read=(key)=>{try{return localStorage.getItem(key)}catch{return null}};
  const store=(key,value)=>{try{value===null?localStorage.removeItem(key):localStorage.setItem(key,value)}catch{}};

  const voterId=(()=>{
    const saved=read('form-voter-id-v1');
    if(saved&&/^[0-9a-f-]{36}$/i.test(saved))return saved;
    const id=crypto.randomUUID();
    store('form-voter-id-v1',id);
    return id;
  })();
  const vote={current:read('form-my-vote-v1')||null,counts,totalVotes:0,connected:false,busy:false,error:null};
  if(!designs.includes(vote.current))vote.current=null;
  const pretty=n=>n>=10000?(n/1000).toFixed(1).replace(/\.0$/,'')+'k':Number(n).toLocaleString('en-US');
  const esc=(s)=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;');

  const heart=`<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 8.5c0 4.4-8.8 10.4-8.8 10.4S3.2 12.9 3.2 8.5a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2z"/></svg>`;
  function button(d,context='card'){
    const active=vote.current===d.slug;
    const isDetail=context==='detail';
    const disabled=!hasEndpoint||!vote.connected||vote.busy;
    const status=!hasEndpoint?'Voting opens after deployment':vote.error?'Voting temporarily unavailable':!vote.connected?'Connecting voting service':'Vote for your favourite';
    return `<button class="vote-button ${isDetail?'vote-button-detail':''} ${active?'voted':''}" data-vote="${d.slug}" aria-pressed="${active}" aria-label="${active?'Remove vote from':'Vote for'} ${esc(d.name)}" title="${status}" ${disabled?'disabled':''}>${heart}<span data-vote-count="${d.slug}">${vote.connected?pretty(vote.counts[d.slug]||0):'—'}</span>${isDetail?'<span class="vote-verb">'+(active?'Your vote':'Vote for this design')+'</span>':''}</button>`;
  }
  function badge(){
    if(!hasEndpoint)return `<span class="connection-note" data-vote-status>Voting service not connected yet</span>`;
    if(!vote.connected)return `<span class="connection-note" data-vote-status>${vote.error?'Voting temporarily unavailable':'Connecting to live votes'}</span>`;
    return `<span class="live-status" data-vote-status><i aria-hidden="true"></i> Live community votes</span>`;
  }
  function all(){return designs.map(slug=>({slug,votes:vote.counts[slug]||0}));}
  function sortCommunity(studies){return [...studies].sort((a,b)=>(vote.counts[b.slug]||0)-(vote.counts[a.slug]||0)||a.rank-b.rank);}
  function isOnline(){return hasEndpoint&&vote.connected}
  function count(slug){return vote.counts[slug]||0}
  function current(){return vote.current}

  function syncDOM(){
    document.querySelectorAll('[data-vote-count]').forEach(node=>{
      const slug=node.dataset.voteCount;
      node.textContent=vote.connected?pretty(vote.counts[slug]||0):'—';
    });
    document.querySelectorAll('[data-vote]').forEach(node=>{
      const slug=node.dataset.vote,active=vote.current===slug;
      node.disabled=!vote.connected||vote.busy;
      node.classList.toggle('voted',active);
      node.setAttribute('aria-pressed',String(active));
      node.setAttribute('aria-label',`${active?'Remove vote from':'Vote for'} ${window.FORM_STUDIES.find(d=>d.slug===slug)?.name||slug}`);
      const verb=node.querySelector('.vote-verb');if(verb)verb.textContent=active?'Your vote':'Vote for this design';
      node.title=vote.error?'Voting temporarily unavailable':active?'Remove your vote':'Vote for your favourite';
    });
    document.querySelectorAll('[data-vote-status]').forEach(node=>{
      node.className=vote.connected?'live-status':'connection-note';
      node.innerHTML=vote.connected?'<i aria-hidden="true"></i> Live community votes':vote.error?'Voting temporarily unavailable':hasEndpoint?'Connecting to live votes':'Voting service not connected yet';
    });
    document.dispatchEvent(new CustomEvent('form:votes-updated',{detail:{connected:vote.connected}}));
  }

  async function refresh(){
    if(!hasEndpoint||vote.busy)return;
    try{
      const res=await fetch(`${base}/api/votes`,{headers:{Accept:'application/json'},cache:'no-store'});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      if(!data||typeof data.counts!=='object')throw new Error('Invalid response');
      for(const slug of designs)vote.counts[slug]=Math.max(0,Number(data.counts[slug])||0);
      vote.totalVotes=Math.max(0,Number(data.totalVotes)||0);
      vote.connected=true;vote.error=null;
    }catch(error){vote.error=error.message;vote.connected=false;}
    syncDOM();
  }

  async function change(slug){
    if(!isOnline()||vote.busy)return;
    const design=vote.current===slug?null:slug;
    vote.busy=true;syncDOM();
    try{
      const res=await fetch(`${base}/api/vote`,{method:'PUT',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({design,voterId}),cache:'no-store'});
      const result=await res.json();
      if(!res.ok)throw new Error(result.error||'Unable to save vote');
      for(const s of designs)vote.counts[s]=Math.max(0,Number(result.counts[s])||0);
      vote.totalVotes=Math.max(0,Number(result.totalVotes)||0);
      vote.current=result.myVote||null;
      store('form-my-vote-v1',vote.current);
      vote.error=null;vote.connected=true;
      document.dispatchEvent(new CustomEvent('form:vote-feedback',{detail:{message:vote.current?'Vote counted. Thank you.':'Your vote was removed.'}}));
    }catch(error){
      document.dispatchEvent(new CustomEvent('form:vote-feedback',{detail:{message:error.message||'Unable to vote. Please try again.'}}));
    }finally{vote.busy=false;syncDOM()}
  }

  function init(){
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-vote]');
      if(button&&!button.disabled)change(button.dataset.vote);
    });
    if(hasEndpoint){
      refresh();
      window.setInterval(()=>{if(document.visibilityState==='visible')refresh()},30000);
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
    }
  }
  window.FORM_VOTING={button,badge,sortCommunity,count,current,isOnline,init,refresh,syncDOM,all,get totalVotes(){return vote.totalVotes}};
})();
