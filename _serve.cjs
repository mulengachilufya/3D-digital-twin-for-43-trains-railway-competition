// Tiny static file server for local preview of the digital twin (dev only).
const http=require('http'), fs=require('fs'), path=require('path');
const root=__dirname;
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]);
  if(p==='/') p='/index.html';
  const fp=path.join(root,p);
  fs.readFile(fp,(e,d)=>{
    if(e){res.statusCode=404;res.end('not found');return;}
    const ext=path.extname(fp);
    res.setHeader('Content-Type', ext==='.html'?'text/html':ext==='.csv'?'text/csv':'application/octet-stream');
    res.end(d);
  });
}).listen(5599,()=>console.log('serving on 5599'));
