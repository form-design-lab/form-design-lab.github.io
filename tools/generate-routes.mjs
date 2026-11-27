/** Generate 200-response entry pages for clean URLs on GitHub Pages. */
import {cpSync,copyFileSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const dist=join(root,'dist');
const template=readFileSync(join(root,'index.html'),'utf8');
const sandbox={window:{}};
vm.runInNewContext(readFileSync(join(root,'data.js'),'utf8'),sandbox);
const studies=sandbox.window.FORM_STUDIES;

const pages=[
  {path:'/collection',title:'The Collection — FORM',description:'Explore 37 original visual interpretations of one Mumbai Indians story.'},
  {path:'/rankings',title:'The Rankings — FORM',description:'Explore editorial scores and live People’s Choice votes across 37 design studies.'},
  {path:'/saved',title:'Saved Designs — FORM',description:'Your locally saved FORM design studies.',noindex:true},
  {path:'/compare',title:'Compare Designs — FORM',description:'Compare two FORM design studies side by side.',noindex:true},
  ...studies.map(d=>({
    path:`/design/${d.slug}`,
    title:`${d.name} Design Study — FORM`,
    description:`Explore an independent ${d.name}-inspired interpretation of the Mumbai Indians championship story.`
  }))
];

const escapeAttr=value=>String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
function htmlFor(page){
  const title=escapeAttr(page.title);
  const description=escapeAttr(page.description);
  const canonical=`https://form-design.in${page.path}/`;
  let html=template
    .replace(/<title>[^<]*<\/title>/,`<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/,`<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/,`<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/,`<meta property="og:description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/,`<link rel="canonical" href="${canonical}" />`);
  if(page.noindex)html=html.replace('  </head>','    <meta name="robots" content="noindex,follow" />\n  </head>');
  return html;
}

mkdirSync(dist,{recursive:true});
for(const file of ['index.html','styles.css','app.js','data.js','config.js','voting.js']){
  copyFileSync(join(root,file),join(dist,file));
}
cpSync(join(root,'assets'),join(dist,'assets'),{recursive:true});

for(const base of [root,dist]){
  for(const page of pages){
    const output=join(base,page.path.slice(1),'index.html');
    mkdirSync(dirname(output),{recursive:true});
    writeFileSync(output,htmlFor(page));
  }
  // Unknown URLs still show the app's intentional not-found page.
  const notFound=template
    .replace(/<title>[^<]*<\/title>/,'<title>Page not found — FORM</title>')
    .replace(/<link rel="canonical" href="[^"]*" \/>/,'')
    .replace('  </head>','    <meta name="robots" content="noindex" />\n  </head>');
  writeFileSync(join(base,'404.html'),notFound);
}

console.log(`Generated ${pages.length} clean routes in the source and preview directories.`);
