const C="cmd-sched-v3";
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(["./","./index.html"])));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  if(url.origin!==location.origin){e.respondWith(fetch(e.request));return;}
  const isPage=e.request.mode==="navigate"||url.pathname.endsWith("/")||/\/index\.html$/.test(url.pathname);
  if(isPage){
    e.respondWith(
      fetch(e.request).then(res=>{
        const cp=res.clone();
        caches.open(C).then(c=>c.put(e.request,cp));
        return res;
      }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html")||caches.match("./")))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      const cp=res.clone();
      caches.open(C).then(c=>c.put(e.request,cp));
      return res;
    }).catch(()=>r))
  );
});
