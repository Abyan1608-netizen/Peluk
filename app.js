/* ===================== UTIL ===================== */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,8);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp=n=>'Rp'+Math.round(n||0).toLocaleString('id-ID');
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const okDT=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)&&!isNaN(new Date(s));
const D=s=>new Date(s);
const HARI=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const fmtDT=s=>{if(!s)return'';const d=D(s);return `${HARI[d.getDay()]} ${d.getDate()} ${BLN[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`};
const sameDay=(a,b)=>a.toDateString()===b.toDateString();
const CAT={'Kuliah':1,'UQ':1,'521 Marketing':1,'Mubi':1,'Divisi Grafika':1,'Dakwah':1,'Freelance':1,'Pribadi':1,'Keuangan':1};
const MONEY=['pengeluaran','pemasukan'];
const TYPES=['tugas','ujian','deadline','pengingat','belajar','catatan','pengeluaran','pemasukan'];
function cleanItem(i){
  if(!i||typeof i!=='object')return null;
  const amt=i.amount==null?null:Math.round(Number(i.amount));
  return{id:/^[a-z0-9]{1,12}$/i.test(String(i.id))?String(i.id):uid(),type:TYPES.includes(i.type)?i.type:'catatan',
    title:String(i.title||'').slice(0,160),category:CAT[i.category]?i.category:'Pribadi',due:okDT(i.due)?i.due:null,
    remind:(Array.isArray(i.remind)?i.remind:[]).filter(okDT),fired:(Array.isArray(i.fired)?i.fired:[]).filter(okDT),
    amount:Number.isFinite(amt)?amt:null,priority:[1,2,3].includes(+i.priority)?+i.priority:2,
    note:String(i.note||'').slice(0,300),done:!!i.done,created:+i.created||Date.now()};
}
function cleanChat(c){
  return(Array.isArray(c)?c:[]).filter(m=>m&&['user','assistant'].includes(m.role)).slice(-60).map(m=>({
    id:/^[a-z0-9]{1,12}$/i.test(String(m.id))?String(m.id):uid(),role:m.role,text:String(m.text||'').slice(0,2000),
    voice:!!m.voice,acts:(Array.isArray(m.acts)?m.acts:[]).slice(0,10).map(x=>String(x).slice(0,200)),
    made:(Array.isArray(m.made)?m.made:[]).filter(x=>/^[a-z0-9]{1,12}$/i.test(String(x))).map(String),undo:false}));
}
const isMoney=i=>MONEY.includes(i.type);

/* ===================== DATA ===================== */
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=()=>{localStorage.setItem('sl_data',JSON.stringify({items:items,chat:chat}));};
let {items=[],chat=[]}=load('sl_data',{});
let st=Object.assign({provider:'anthropic',key:'',model:'claude-haiku-5-5',target:10000000,tts:false},load('sl_set',{}));
const saveSet=()=>localStorage.setItem('sl_set',JSON.stringify(st));
let undoSnap=null,lastMade=[],chatAll=false;
items=(Array.isArray(items)?items:[]).map(cleanItem).filter(Boolean);chat=cleanChat(chat);


/* ===================== ORB: SPIRAL TITIK ===================== */
function orbSVG(){
  const arms=6,per=24,c=150,R=140,out=['<circle cx="150" cy="150" r="1.8"/>'];
  for(let a=0;a<arms;a++){
    for(let n=1;n<=per;n++){
      const t=n/per,r=R*Math.pow(t,.85),th=(a*360/arms+t*330)*Math.PI/180,sz=.7+4.7*Math.pow(t,1.15);
      out.push(`<circle cx="${(c+Math.cos(th)*r).toFixed(1)}" cy="${(c+Math.sin(th)*r).toFixed(1)}" r="${sz.toFixed(2)}"/>`);
    }
  }
  return `<svg viewBox="0 0 300 300" aria-hidden="true" fill="#176B87">${out.join('')}</svg>`;
}
$$('.orb').forEach(o=>o.innerHTML=orbSVG());

/* ===================== UI DASAR ===================== */
function toast(t,ms=2600){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',ms)}
function setOrb(s){$$('.orb').forEach(o=>{o.classList.remove('listening','thinking');if(s!=='idle')o.classList.add(s)})}
function openSheet(title,btns){ $('#sheetT').textContent=title;const b=$('#sheetB');b.innerHTML='';
  btns.forEach(([l,fn])=>{const x=document.createElement('button');x.textContent=l;x.onclick=()=>{closeSheet();fn&&fn()};b.appendChild(x)});
  $('#veil').style.display='block';$('#sheet').style.display='block'}
function closeSheet(){$('#veil').style.display='none';$('#sheet').style.display='none'}
$('#veil').onclick=closeSheet;
function tab(n){$$('.screen').forEach(s=>s.classList.toggle('on',s.id==='s-'+n));$$('nav button').forEach(b=>{if(b.dataset.tab===n)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});scrollTo(0,0);renderAll()}
$$('nav button').forEach(b=>b.onclick=()=>tab(b.dataset.tab));

/* ===================== KUNCI (BIOMETRIK) ===================== */
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
const sha=async t=>b64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)));
async function bioOK(){try{return !!(window.PublicKeyCredential&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())}catch{return false}}
async function bioRegister(){
  const c=await navigator.credentials.create({publicKey:{challenge:rnd(32),rp:{name:'Satu Layar'},
    user:{id:rnd(16),name:'pemilik',displayName:'Pemilik'},
    pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],
    authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'preferred'},timeout:60000}});
  localStorage.setItem('sl_cred',b64(c.rawId));
}
async function bioAuth(){
  await navigator.credentials.get({publicKey:{challenge:rnd(32),allowCredentials:[{type:'public-key',id:unb64(localStorage.getItem('sl_cred'))}],userVerification:'required',timeout:60000}});
}
const lmsg=t=>$('#lockmsg').textContent=t||'';
let pinMode='verify';
function showPin(mode){pinMode=mode;$('#pinbox').classList.remove('hide');$('#pin').value='';$('#pin').placeholder=mode==='create'?'Buat PIN':'PIN';$('#pinok').textContent=mode==='create'?'Simpan PIN':'Masuk';$('#bioBtn').classList.add('hide');$('#pin').focus()}
async function lockInit(){
  const has=!!localStorage.getItem('sl_cred'),pin=!!localStorage.getItem('sl_pin'),bio=await bioOK();
  $('#bioLabel').textContent=has?'Buka dengan sidik jari':'Daftarkan sidik jari';
  $('#usePin').classList.toggle('hide',!pin);
  if(!bio&&!has){ if(pin){showPin('verify');lmsg('Perangkat ini tanpa sidik jari. Masukkan PIN.')}else{showPin('create');lmsg('Sidik jari tidak tersedia. Buat PIN 4–6 angka.')}}
}
async function tryBio(){
  lmsg('');
  try{
    if(!localStorage.getItem('sl_cred')){ if(!(await bioOK())){showPin('create');return} await bioRegister(); }
    else await bioAuth();
    unlock();
  }catch(e){lmsg('Verifikasi dibatalkan. Ketuk lagi untuk mencoba.')}
}
$('#bioBtn').onclick=tryBio;$('#lockorb').onclick=tryBio;
$('#usePin').onclick=()=>showPin('verify');
$('#pinok').onclick=async()=>{
  const v=$('#pin').value.trim(); if(!/^\d{4,6}$/.test(v)){lmsg('PIN harus 4–6 angka.');return}
  if(pinMode==='create'){localStorage.setItem('sl_pin',await sha('sl:'+v));unlock();return}
  if(await sha('sl:'+v)===localStorage.getItem('sl_pin'))unlock();else{lmsg('PIN salah.');$('#pin').value=''}
};
$('#pin').addEventListener('keydown',e=>{if(e.key==='Enter')$('#pinok').click()});
function unlock(){document.body.classList.remove('locked');lmsg('');$('#pinbox').classList.add('hide');$('#bioBtn').classList.remove('hide');renderAll();startAlarmLoop()}
function lock(){document.body.classList.add('locked');lockInit()}
let hiddenAt=0;
document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(!document.body.classList.contains('locked')&&hiddenAt&&Date.now()-hiddenAt>90000)lock()});

/* ===================== ITEM ===================== */
function addItem(a){
  const type=TYPES.includes(a.type)?a.type:'catatan';
  const it={id:uid(),type,title:String(a.title||'Tanpa judul').slice(0,160),category:CAT[a.category]?a.category:(type==='pengeluaran'||type==='pemasukan'?'Keuangan':'Pribadi'),
    due:okDT(a.due)?a.due:null,remind:(Array.isArray(a.remind)?a.remind:[]).filter(okDT),fired:[],
    amount:a.amount?Math.round(Number(a.amount)):null,priority:[1,2,3].includes(+a.priority)?+a.priority:2,note:String(a.note||'').slice(0,300),done:false,created:Date.now()};
  if(isMoney(it)){it.due=it.due||iso(new Date());it.remind=[]}
  else if(it.due&&!it.remind.length)it.remind=[iso(new Date(D(it.due).getTime()-3600000))];
  items.push(it);return it;
}
const find=id=>items.find(i=>i.id===id);
function applyActions(acts){
  const out=[];lastMade=[];undoSnap=JSON.stringify(items);
  (acts||[]).forEach(a=>{try{
    if(a.op==='add'){const it=addItem(a);lastMade.push(it.id);out.push(`Ditambah: ${it.type} — ${it.title}${it.amount?' ('+rp(it.amount)+')':''}${!isMoney(it)&&it.due?' · '+fmtDT(it.due):''}`)}
    else if(a.op==='done'){const it=find(a.id);if(it){it.done=true;out.push('Selesai: '+it.title)}}
    else if(a.op==='delete'){const it=find(a.id);if(it){items=items.filter(x=>x!==it);out.push('Dihapus: '+it.title)}}
    else if(a.op==='update'){const it=find(a.id);if(it){['title','category','note','priority','amount'].forEach(k=>{if(a[k]!=null)it[k]=a[k]});if(okDT(a.due)){it.due=a.due;it.fired=[]}if(Array.isArray(a.remind)){it.remind=a.remind.filter(okDT);it.fired=[]}out.push('Diubah: '+it.title)}}
  }catch(e){}});
  if(!out.length)undoSnap=null;
  return out;
}

/* ===================== AI ===================== */
function nowStr(){const d=new Date();return `${HARI[d.getDay()]}, ${iso(d).replace('T',' ')} (WIB)`}
function sysPrompt(){
  const open=items.filter(i=>!i.done).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')).slice(0,40).map(i=>`[${i.id}] ${i.type} | ${i.title} | ${i.category} | ${i.due||'-'}${i.amount?' | '+i.amount:''}`).join('\n')||'(kosong)';
  return `Kamu "Satu Layar": asisten pribadi sekaligus teman dekat Raihan. Raihan mahasiswa kelas karyawan (kuliah malam Selasa–Kamis sekitar 17:30–21:30), kerja Sabtu–Senin sekitar 08:00–16:00 di beberapa tempat, plus freelance. Targetnya: IPK 4 dan pemasukan 2 digit juta per bulan dalam 5 tahun. Bicara bahasa Indonesia santai, hangat, singkat (maks 3 kalimat), tanpa ceramah.
Sekarang: ${nowStr()}.
Tugasmu: ubah tulisan/ucapan Raihan menjadi tindakan terstruktur. Balas HANYA satu objek JSON, tanpa teks lain:
{"reply":"balasan singkat","actions":[ ... ]}
Aksi yang boleh:
{"op":"add","type":"tugas|ujian|deadline|pengingat|belajar|catatan|pengeluaran|pemasukan","title":"...","category":"Kuliah|UQ|521 Marketing|Mubi|Divisi Grafika|Dakwah|Freelance|Pribadi|Keuangan","due":"YYYY-MM-DDTHH:mm" atau null,"remind":["YYYY-MM-DDTHH:mm"],"amount":angka rupiah atau null,"priority":1|2|3,"note":""}
{"op":"done","id":"..."} {"op":"delete","id":"..."} {"op":"update","id":"...", field yang berubah}
Aturan:
- Tanggal relatif (besok, Kamis depan, minggu depan) hitung dari "Sekarang". Waktu lokal, format persis YYYY-MM-DDTHH:mm. Jam tidak disebut: 09:00.
- remind berisi 1–3 waktu pengingat. Deadline/ujian: H-2 19:00, H-1 19:00, dan 1 jam sebelum waktunya. Jika remind kosong, aplikasi menambah 1 jam sebelum due.
- Ujian atau tugas besar yang "belum siap": buat 1 item ujian/deadline, lalu 3–5 item "belajar" terbagi di hari-hari sebelumnya, maksimal 1 sesi per hari, durasi di judul (mis. "SQL: latihan JOIN 45 menit"). Hindari jam kuliah malam dan jam kerja. Sesi kecil dan realistis lebih baik daripada padat.
- Uang: pengeluaran/pemasukan dengan amount rupiah penuh (25rb=25000, 1,5jt=1500000), due=waktu transaksi (kosong = sekarang), remind [].
- Mengubah item yang sudah ada: pakai id dari daftar di bawah. "selesai" → op done.
- Jika Raihan curhat, capek, atau tertekan: empati dulu, jangan menambah tugas kecuali diminta, tawarkan satu langkah kecil. Jika terdengar sangat berat atau menyakiti diri, sarankan bicara dengan orang tepercaya atau tenaga profesional, dan tetap temani.
- Jika ambigu, buat dugaan terbaik dan sebut asumsimu di reply. Jika hanya ngobrol, actions [].
Daftar item terbuka:
${open}`;
}
async function callAI(text){
  const hist=chat.slice(-7,-1).map(m=>({role:m.role==='user'?'user':'assistant',text:m.text}));
  while(hist.length&&hist[0].role!=='user')hist.shift();
  let raw;
  if(st.provider==='anthropic'){
    const msgs=hist.map(h=>({role:h.role,content:h.text}));msgs.push({role:'user',content:text});
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':st.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:st.model,max_tokens:1500,system:sysPrompt(),messages:msgs})});
    const j=await r.json(); if(!r.ok)throw new Error(j.error?.message||r.status);
    raw=j.content.map(c=>c.text||'').join('');
  }else{
    const contents=hist.map(h=>({role:h.role==='user'?'user':'model',parts:[{text:h.text}]}));contents.push({role:'user',parts:[{text}]});
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(st.model)}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':st.key},body:JSON.stringify({systemInstruction:{parts:[{text:sysPrompt()}]},contents,generationConfig:{responseMimeType:'application/json',maxOutputTokens:1500}})});
    const j=await r.json(); if(!r.ok)throw new Error(j.error?.message||r.status);
    raw=(j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('');
  }
  const m=raw.match(/\{[\s\S]*\}/);
  try{const o=JSON.parse(m[0]);return{reply:String(o.reply||'Siap.'),actions:Array.isArray(o.actions)?o.actions:[]}}
  catch{return{reply:raw.slice(0,400),actions:[]}}
}
/* mode tanpa AI */
function localParse(t){
  const l=t.toLowerCase();let amt=null;
  const m=l.match(/(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)\s*(rb|ribu|k|jt|juta)?(?![a-z])/);
  if(m){let raw=m[1];let n=/^\d{1,3}(\.\d{3})+$/.test(raw)?parseFloat(raw.replace(/\./g,'')):parseFloat(raw.replace(',','.'));const u=m[2];if(u==='jt'||u==='juta')n*=1e6;else if(u)n*=1e3;else if(n<1000)n=null;amt=n?Math.round(n):null}
  const now=new Date();let due=null;const day=k=>{const d=new Date(now);d.setDate(d.getDate()+k);d.setHours(9,0,0,0);return iso(d)};
  if(/\blusa\b/.test(l))due=day(2);else if(/\bbesok\b/.test(l))due=day(1);else if(/hari ini/.test(l)){const d=new Date(now.getTime()+3600000*2);due=iso(d)}
  let type='catatan';
  if(amt&&/gaji|terima|dapat|masuk|honor|bayaran|untung/.test(l))type='pemasukan';
  else if(amt&&/beli|bayar|makan|jajan|keluar|ongkos|bensin|isi|belanja|tagihan/.test(l))type='pengeluaran';
  else if(/ujian|uts|uas|kuis/.test(l))type='ujian';
  else if(/deadline|dedlen|tenggat/.test(l))type='deadline';
  else if(/tugas|kerjakan|kirim|presentasi|video/.test(l)||due)type='tugas';
  if(type==='catatan'&&amt)type='pengeluaran';
  return{reply:'Tersimpan (mode sederhana, tanpa AI). Pasang API key di Atur supaya saya bisa menyusun jadwal otomatis.',actions:[{op:'add',type,title:t,due:isMoney({type})?null:due,amount:amt}]};
}

/* ===================== KIRIM ===================== */
async function send(text,voice){
  text=text.trim();if(!text)return;
  chat.push({id:uid(),role:'user',text,voice:!!voice,acts:[],made:[]});setOrb('thinking');renderChat();askNotif();
  let out;
  try{out=st.key?await callAI(text):localParse(text)}
  catch(e){out={reply:'AI gagal dihubungi ('+String(e.message).slice(0,120)+'). Saya simpan sebagai catatan dulu.',actions:[{op:'add',type:'catatan',title:text}]}}
  const acts=applyActions(out.actions);
  chat.push({id:uid(),role:'assistant',text:out.reply,acts,undo:!!undoSnap,made:lastMade.slice(),voice:false});
  if(chat.length>60)chat=chat.slice(-60);
  save();setOrb('idle');renderAll();speak(out.reply);
}
function speak(t){if(!st.tts||!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='id-ID';speechSynthesis.speak(u)}
$('#f').onsubmit=e=>{e.preventDefault();const t=$('#txt').value;$('#txt').value='';if(t.trim()){tab('home');send(t)}};

/* suara */
let rec=null,listening=false,cancelled=false,heard='';
function openListen(src){
  const L=$('#listen'),w=$('#lwrap');L.classList.add('on');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(!reduce&&src){
    const a=src.getBoundingClientRect(),b=w.getBoundingClientRect();
    if(a.width&&b.width){
      w.style.transition='none';
      w.style.transform=`translate(${a.left+a.width/2-(b.left+b.width/2)}px,${a.top+a.height/2-(b.top+b.height/2)}px) scale(${a.width/b.width})`;
      w.getBoundingClientRect();
      w.style.transition='transform .75s cubic-bezier(.22,1,.36,1)';w.style.transform='none';
    }
  }
  $('#homeorb').style.visibility='hidden';
  setTimeout(()=>$('#listenDone').focus({preventScroll:true}),50);
}
function closeListen(){$('#listen').classList.remove('on');$('#homeorb').style.visibility='';$('#lwrap').style.transform='none'}
function toggleMic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast('Browser ini belum mendukung suara. Gunakan Chrome atau Safari terbaru, atau ketik.',4000);return}
  if(listening){rec.stop();return}
  tab('home');
  const ho=$('#homeorb'),src=ho.getBoundingClientRect().width?ho:$('#mic');
  heard='';cancelled=false;$('#listenTx').textContent='Silakan bicara';
  rec=new SR();rec.lang='id-ID';rec.interimResults=true;rec.continuous=false;
  rec.onstart=()=>{listening=true;setOrb('listening');$('#mic').classList.add('on')};
  rec.onresult=e=>{let t='';for(const r of e.results)t+=r[0].transcript;heard=t;$('#listenTx').textContent=t};
  rec.onerror=e=>{cancelled=true;toast(e.error==='not-allowed'?'Izin mikrofon ditolak. Aktifkan di pengaturan browser.':'Suara tidak terbaca. Coba lagi atau ketik.',3500)};
  rec.onend=()=>{listening=false;$('#mic').classList.remove('on');setOrb('idle');closeListen();const t=heard.trim();heard='';if(!cancelled&&t)send(t,true);cancelled=false};
  openListen(src);
  try{rec.start()}catch{closeListen()}
}
$('#listenDone').onclick=()=>{if(rec&&listening)rec.stop();else closeListen()};
$('#listenCancel').onclick=()=>{cancelled=true;if(rec&&listening)rec.abort();else closeListen()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#listen').classList.contains('on'))$('#listenCancel').click()});
$('#mic').onclick=toggleMic;$('#homeorb').onclick=toggleMic;

/* ===================== RENDER ===================== */
function greetWord(){const h=new Date().getHours();return h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam'}
function greetSub(){const n=items.filter(i=>!i.done&&!isMoney(i)&&i.due&&sameDay(D(i.due),new Date())).length;return n?`${n} hal menunggu hari ini.`:'Ketuk lingkaran, lalu bicara.'}
const EX=['Ujian SQL Sabtu depan, saya belum siap','Deadline desain 521 besok jam 3 sore','Dapat gaji 1 juta dari UQ','Beli makan 25 ribu','Besok presentasi Bahasa Indonesia, ingatkan malam ini','Saya capek banget hari ini'];
function renderChat(){
  const el=$('#chat');const list=chatAll?chat:chat.slice(-2),lastMsg=chat[chat.length-1];
  const dots='<svg class="i" viewBox="0 0 24 24"><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>';
  let h=list.map(m=>`<div class="msg ${m.role}">${m.voice?'<div class="vtag">Pesan suara</div>':''}<div>${esc(m.text)}</div>${m.acts&&m.acts.length?`<div class="acts">${m.acts.map(a=>`<div>${esc(a)}</div>`).join('')}</div>`:''}${m===lastMsg&&m.role==='assistant'&&m.undo&&undoSnap?'<button class="undo" id="undo">Urungkan</button>':''}<button class="msgmore" aria-label="Menu pesan" data-mm="${esc(m.id)}">${dots}</button></div>`).join('');
  if(chat.length)h+=`<div class="chatbar">${chat.length>2?`<button id="allchat">${chatAll?'Sembunyikan riwayat':'Lihat semua ('+chat.length+')'}</button>`:''}<button id="clrchat">Hapus semua chat</button></div>`;
  el.innerHTML=h;
  const u=$('#undo');if(u)u.onclick=()=>{items=JSON.parse(undoSnap);undoSnap=null;lastMsg.undo=false;lastMsg.acts=['Dibatalkan'];save();renderAll()};
  el.querySelectorAll('[data-mm]').forEach(b=>b.onclick=()=>msgMenu(chat.find(m=>m.id===b.dataset.mm)));
  const ac=$('#allchat');if(ac)ac.onclick=()=>{chatAll=!chatAll;renderChat()};
  const cc=$('#clrchat');if(cc)cc.onclick=clearChat;
}
function clearChat(){if(!chat.length)return;if(confirm('Hapus semua chat? Jadwal dan catatan uang tidak ikut terhapus.')){chat=[];undoSnap=null;chatAll=false;save();renderAll();toast('Chat dihapus')}}
function msgMenu(m){
  if(!m)return;
  const made=(m.made||[]).filter(id=>find(id));
  const opts=[['Hapus pesan ini',()=>{chat=chat.filter(x=>x!==m);save();renderAll()}]];
  if(made.length)opts.push([`Hapus pesan dan ${made.length} item yang dibuatnya`,()=>{items=items.filter(i=>!made.includes(i.id));chat=chat.filter(x=>x!==m);save();renderAll();toast('Pesan dan item dihapus')}]);
  opts.push(['Batal',null]);
  openSheet(m.voice?'Pesan suara':'Pesan',opts);
}
function itemHTML(it,showMeta=true){
  return `<div class="item ${it.done?'done':''}" data-id="${esc(it.id)}">
    <div class="chkwrap"><button class="chk" aria-pressed="${it.done}" aria-label="Tandai selesai" data-chk="${esc(it.id)}">${it.done?'<svg class="i" viewBox="0 0 24 24" style="width:18px;fill:#EEF5FF"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>':''}</button></div>
    <div class="sp"><div class="t">${esc(it.title)}</div>
    <div class="m"><span class="tag">${esc(it.category)}</span><span>${esc(it.type)}</span>${it.due?`<span>${fmtDT(it.due)}</span>`:''}<span class="pdot p${it.priority}" title="prioritas"></span></div></div>
    <button class="more" aria-label="Menu" data-more="${esc(it.id)}"><svg class="i" viewBox="0 0 24 24"><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg></button></div>`;
}
function bindItems(root){
  root.querySelectorAll('[data-chk]').forEach(b=>b.onclick=()=>{const it=find(b.dataset.chk);it.done=!it.done;save();renderAll()});
  root.querySelectorAll('[data-more]').forEach(b=>b.onclick=()=>itemMenu(find(b.dataset.more)));
}
function itemMenu(it){
  const money=isMoney(it);
  const opts=[[it.done?'Tandai belum selesai':'Selesai',()=>{it.done=!it.done;save();renderAll()}],
    ['Ubah judul',()=>{const v=prompt('Judul baru:',it.title);if(v&&v.trim()){it.title=v.trim().slice(0,160);save();renderAll()}}]];
  if(money)opts.push(['Ubah jumlah',()=>{const n=parseInt(String(prompt('Jumlah baru (rupiah):',it.amount||'')||'').replace(/\D/g,''));if(n){it.amount=n;save();renderAll()}}]);
  else opts.push(
    ['Ubah waktu',()=>{const v=prompt('Waktu baru, format TTTT-BB-HH JJ:MM\nContoh: 2026-11-21 18:30',(it.due||iso(new Date())).replace('T',' '));if(v===null)return;const t=v.trim().replace(' ','T');if(!okDT(t)){toast('Format waktu salah');return}it.due=t;it.remind=[iso(new Date(D(t).getTime()-3600000))];it.fired=[];save();renderAll();toast('Waktu diubah')}],
    ['Tunda ke besok pagi',()=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);it.due=iso(d);it.remind=[iso(new Date(d.getTime()-3600000))];it.fired=[];save();renderAll();toast('Ditunda ke besok 09:00')}],
    ['Tambah ke Kalender (.ics)',()=>downloadICS([it])]);
  opts.push(['Hapus',()=>{items=items.filter(x=>x!==it);save();renderAll()}],['Batal',null]);
  openSheet(it.title,opts);
}
function renderFocus(){
  const end=new Date();end.setHours(23,59,59,999);
  const list=items.filter(i=>!i.done&&!isMoney(i)&&i.due&&D(i.due)<=end).sort((a,b)=>b.priority-a.priority||a.due.localeCompare(b.due)).slice(0,3);
  const el=$('#focus');
  el.innerHTML=list.length?list.map(i=>itemHTML(i)).join(''):'<div class="empty">Belum ada fokus hari ini. Tulis atau ucapkan satu hal, saya yang menyusun.</div>';
  bindItems(el);
}
function renderJadwal(){
  const now=new Date(),t0=new Date(now);t0.setHours(0,0,0,0);
  const g={'Terlambat':[],'Hari ini':[],'Besok':[],'Minggu ini':[],'Nanti':[],'Tanpa tanggal':[],'Selesai':[]};
  const all=items.filter(i=>!isMoney(i)).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9'));
  all.forEach(i=>{
    if(i.done){g['Selesai'].push(i);return}
    if(!i.due){g['Tanpa tanggal'].push(i);return}
    const d=D(i.due),diff=Math.floor((new Date(d).setHours(0,0,0,0)-t0)/864e5);
    if(d<now&&diff<=0&&!sameDay(d,now))g['Terlambat'].push(i);
    else if(diff<=0)g['Hari ini'].push(i);else if(diff===1)g['Besok'].push(i);else if(diff<=7)g['Minggu ini'].push(i);else g['Nanti'].push(i);
  });
  const el=$('#jadwal');let h='';
  for(const k in g){if(!g[k].length)continue;h+=`<h3>${k} <span style="color:var(--tx2);font-weight:700">(${g[k].length})</span></h3>`+g[k].slice(0,k==='Selesai'?10:99).map(i=>itemHTML(i)).join('')}
  el.innerHTML=h||'<div class="empty">Jadwal kosong. Ucapkan sesuatu seperti "ujian minggu depan belum siap" dan saya susun.</div>';
  bindItems(el);
}
function renderUang(){
  const now=new Date(),ym=`${now.getFullYear()}-${pad(now.getMonth()+1)}`;
  const tr=items.filter(isMoney);
  const sum=(arr,t)=>arr.filter(i=>i.type===t).reduce((s,i)=>s+(i.amount||0),0);
  const mon=tr.filter(i=>(i.due||'').startsWith(ym));
  const inc=sum(mon,'pemasukan'),out=sum(mon,'pengeluaran');
  $('#uangsub').textContent=`${BLN[now.getMonth()]} ${now.getFullYear()}`;
  $('#uangstat').innerHTML=`<div class="stat"><small>Pemasukan</small><b class="plus">${rp(inc)}</b></div><div class="stat"><small>Pengeluaran</small><b class="minus">${rp(out)}</b></div><div class="stat wide"><small>Sisa bulan ini</small><b>${rp(inc-out)}</b></div>`;
  const pct=Math.min(100,Math.round(inc/(st.target||1)*100));
  let cols='';
  for(let k=5;k>=0;k--){const d=new Date(now.getFullYear(),now.getMonth()-k,1),key=`${d.getFullYear()}-${pad(d.getMonth()+1)}`;const v=sum(tr.filter(i=>(i.due||'').startsWith(key)),'pemasukan');cols+=`<div data-v="${v}"><i style="height:0%"></i><span>${BLN[d.getMonth()]}</span></div>`}
  $('#jalur').innerHTML=`<div class="row"><div class="sp"><b>${rp(inc)}</b> dari target <b>${rp(st.target)}</b></div><b>${pct}%</b></div><div class="bar"><i style="width:${pct}%"></i></div><div class="cols">${cols}</div>`;
  const mx=Math.max(1,...$$('#jalur .cols div').map(d=>+d.dataset.v));
  $$('#jalur .cols div').forEach(d=>d.querySelector('i').style.height=Math.max(3,Math.round(+d.dataset.v/mx*80))+'%');
  const list=tr.sort((a,b)=>(b.due||'').localeCompare(a.due||'')).slice(0,30);
  $('#trx').innerHTML=list.length?list.map(i=>`<div class="item" data-id="${esc(i.id)}"><div class="sp"><div class="t">${esc(i.title)}</div><div class="m"><span>${fmtDT(i.due)}</span></div></div><b>${i.type==='pemasukan'?'+':'−'}${rp(i.amount)}</b><button class="more" aria-label="Menu" data-more="${esc(i.id)}"><svg class="i" viewBox="0 0 24 24"><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg></button></div>`).join(''):'<div class="empty">Belum ada catatan. Ucapkan "beli makan 25 ribu" atau "dapat gaji 1 juta".</div>';
  bindItems($('#trx'));
}
function renderAtur(){$('#prov').value=st.provider;$('#key').value=st.key;$('#model').value=st.model;$('#target').value=st.target;$('#tts').checked=!!st.tts}
function renderAll(){
  $('#greet').textContent=`${greetWord()}, Raihan`;if(!listening)$('#greetsub').textContent=greetSub();
  renderChat();renderFocus();
  const on=document.querySelector('.screen.on').id;
  if(on==='s-jadwal')renderJadwal();if(on==='s-uang')renderUang();if(on==='s-atur')renderAtur();
}

/* ===================== PENGATURAN ===================== */
$('#prov').onchange=e=>{st.provider=e.target.value;st.model=st.provider==='anthropic'?'claude-haiku-5-5':'gemini-2.5-flash';saveSet();renderAtur()};
$('#key').onchange=e=>{st.key=e.target.value.trim();saveSet();toast('API key tersimpan')};
$('#model').onchange=e=>{st.model=e.target.value.trim();saveSet()};
$('#target').onchange=e=>{st.target=parseInt(e.target.value.replace(/\D/g,''))||10000000;saveSet();renderAtur()};
$('#tts').onchange=e=>{st.tts=e.target.checked;saveSet()};
$('#btnLock').onclick=lock;
$('#btnPin').onclick=async()=>{const v=prompt('PIN cadangan baru (4–6 angka):');if(v===null)return;if(!/^\d{4,6}$/.test(v)){toast('PIN harus 4–6 angka');return}localStorage.setItem('sl_pin',await sha('sl:'+v));toast('PIN cadangan tersimpan')};
function dl(name,mime,data){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:mime}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
$('#btnExport').onclick=()=>dl('satu-layar-cadangan.json','application/json',JSON.stringify({items,chat,st:{...st,key:''}},null,1));
$('#btnImport').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());items=(Array.isArray(j.items)?j.items:[]).slice(0,5000).map(cleanItem).filter(Boolean);chat=cleanChat(j.chat);save();renderAll();toast('Data dipulihkan')}catch{toast('File tidak valid')}e.target.value=''};
$('#btnClrChat').onclick=clearChat;
$('#btnClrKey').onclick=()=>{if(confirm('Hapus API key dari perangkat ini?')){st.key='';saveSet();renderAtur();toast('API key dihapus')}};
$('#btnReset').onclick=()=>{if(confirm('Hapus semua tugas, catatan uang, dan chat di perangkat ini?')){items=[];chat=[];save();renderAll();toast('Semua data dihapus')}};

/* ===================== KALENDER .ics ===================== */
const icsEsc=s=>String(s).replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');
const icsDT=s=>s.replace(/[-:]/g,'')+'00';
function downloadICS(list){
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Satu Layar//ID','CALSCALE:GREGORIAN'];let n=0;
  list.filter(i=>!isMoney(i)&&!i.done).forEach(i=>{
    const start=i.due||i.remind[0];if(!start)return;n++;
    const end=iso(new Date(D(start).getTime()+1800000));
    L.push('BEGIN:VEVENT','UID:'+i.id+'@satulayar','DTSTAMP:'+icsDT(iso(new Date()))+'','DTSTART:'+icsDT(start),'DTEND:'+icsDT(end),'SUMMARY:'+icsEsc(i.title),'DESCRIPTION:'+icsEsc(i.category+' · '+i.type));
    const rs=i.remind.length?i.remind:[start];
    rs.forEach(r=>{const m=Math.round((D(start)-D(r))/60000);L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(i.title),'TRIGGER:'+(m>=0?'-':'')+'PT'+Math.abs(m)+'M','END:VALARM')});
    L.push('END:VEVENT');
  });
  L.push('END:VCALENDAR');
  if(!n){toast('Belum ada jadwal untuk diekspor');return}
  dl('satu-layar.ics','text/calendar',L.join('\r\n'));toast(n+' jadwal diekspor. Buka file untuk menambah ke Kalender.',4000);
}
$('#btnIcs').onclick=()=>downloadICS(items);

/* ===================== ALARM ===================== */
function askNotif(){if('Notification' in window&&Notification.permission==='default')Notification.requestPermission().catch(()=>{})}
$('#btnNotif').onclick=async()=>{if(!('Notification' in window)){toast('Browser ini tidak mendukung notifikasi');return}const p=await Notification.requestPermission();toast(p==='granted'?'Notifikasi aktif':'Notifikasi ditolak')};
let actx=null,beepT=null,alarmItem=null;
function beep(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(.0001,actx.currentTime);g.gain.exponentialRampToValueAtTime(.4,actx.currentTime+.05);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+.5);o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+.55)}catch{}}
function ring(it,title,msg){
  alarmItem=it;$('#alarmT').textContent=title;$('#alarmM').textContent=msg;$('#alarm').style.display='flex';
  $('#alarmDone').style.display=it?'':'none';$('#alarmSnooze').style.display=it?'':'none';
  clearInterval(beepT);let n=0;beep();beepT=setInterval(()=>{beep();if(++n>25)clearInterval(beepT)},1200);
  if(navigator.vibrate)navigator.vibrate([300,150,300,150,300]);
  if('Notification' in window&&Notification.permission==='granted'&&navigator.serviceWorker){navigator.serviceWorker.ready.then(r=>r.showNotification(title,{body:msg,icon:'icon-192.png',tag:'sl-'+(it?it.id:'t'),requireInteraction:true})).catch(()=>{})}
}
function stopRing(){clearInterval(beepT);$('#alarm').style.display='none';alarmItem=null}
$('#alarmClose').onclick=stopRing;
$('#alarmDone').onclick=()=>{if(alarmItem){alarmItem.done=true;save();renderAll()}stopRing()};
$('#alarmSnooze').onclick=()=>{if(alarmItem){const t=iso(new Date(Date.now()+600000));alarmItem.remind.push(t);save()}stopRing();toast('Ditunda 10 menit')};
$('#btnTest').onclick=()=>{askNotif();ring(null,'Tes alarm','Kalau Anda mendengar bunyi ini, alarm dalam aplikasi berfungsi.')};
let alarmLoop=null;
function checkAlarms(){
  if(document.body.classList.contains('locked'))return;
  const now=Date.now();
  for(const it of items){ if(it.done||isMoney(it))continue;
    for(const r of it.remind){ if(it.fired.includes(r))continue; const t=D(r).getTime();
      if(t<=now){ it.fired.push(r); if(now-t<86400000&&$('#alarm').style.display!=='flex'){save();ring(it,it.title,(it.due?'Waktu: '+fmtDT(it.due):'Pengingat')+' · '+it.category);return} }
    }}
  save();
}
function startAlarmLoop(){if(alarmLoop)return;checkAlarms();alarmLoop=setInterval(checkAlarms,15000)}

/* ===================== MULAI ===================== */
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
setOrb('idle');lockInit();
