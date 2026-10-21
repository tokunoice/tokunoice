const CLOCK_ICON='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2222%22%20fill%3D%22%23111113%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2239%22%20fill%3D%22%23fff%22%2F%3E%3Cg%20stroke%3D%22%23141414%22%20stroke-width%3D%222.2%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M50%2015v7%20M50%2078v7%20M15%2050h7%20M78%2050h7%20M25.25%2025.25l5%205%20M69.75%2069.75l5%205%20M74.75%2025.25l-5%205%20M30.25%2069.75l-5%205%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M50%2050V29%22%20stroke%3D%22%23171719%22%20stroke-width%3D%224.5%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M50%2050L65%2063%22%20stroke%3D%22%23171719%22%20stroke-width%3D%223.8%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M50%2050L77%2042%22%20stroke%3D%22%23f9a21c%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%223%22%20fill%3D%22%23f9a21c%22%2F%3E%3C%2Fsvg%3E';
/* All characters, conversations and history are fictional. */
const $=s=>document.querySelector(s),screen=$('#screen');let state='lock',pass='',activeApp='',activeChat='',activeService='',page=0,playing=false,track=0,historyBack=null;
const pad=n=>String(n).padStart(2,'0');function clock(){$('#statusTime').textContent='16:00';let t=$('#lockClock');if(t)t.textContent=$('#statusTime').textContent;}setInterval(clock,10000);
const apps=[['line','LINE','#06c755','LINE'],['kkt','KakaoTalk','#fee500','TALK'],['music','ミュージック','#fa335b','♫'],['photos','写真','#fff','🌼'],['camera','カメラ','#e8e8eb','📷'],['calendar','カレンダー','#fff','📅'],['clock','時計','#202026','◷'],['weather','天気','#399cf7','☀'],['maps','マップ','#e8f5ed','🗺'],['notes','メモ','#ffdb58','▤'],['safari','Safari','#1785f9','◉'],['messages','メッセージ','#35c759','●'],['phone','電話','#38c85c','☎'],['files','ファイル','#f6f7fa','📁'],['voice','ボイスメモ','#141417','〰'],['calculator','計算機','#202124','＋'],['reminders','リマインダー','#fff','☑'],['contacts','連絡先','#b1b2b7','👤'],['facetime','FaceTime','#38ca62','▣'],['translate','翻訳','#22242c','文'],['youtube','YouTube','#ff1737','▶']];const dock=['phone','safari','messages','music'];const lookup=Object.fromEntries(apps.map(a=>[a[0],a]));
const brand={line:'https://cdn.simpleicons.org/line/FFFFFF',kkt:'https://cdn.simpleicons.org/kakaotalk/3C1E1E',youtube:'https://cdn.simpleicons.org/youtube/FFFFFF'};
// 官方 App Store 商品目录提供的真实 App 封面；在线加载，离线使用已缓存素材。
// Apple 内建应用若未在目录找到，保留本地后备图标，不冒充官方原图。
const officialArtwork = (()=>{try{return JSON.parse(localStorage.getItem('tokunoyushi_artwork_v3')||'{}')}catch{return {}}})();
const artworkSearches = {
 line:['LINE','LINE Corporation'], kkt:['KakaoTalk','Kakao Corp.'], music:['Apple Music','Apple'],
 youtube:['YouTube','Google'], maps:['Apple Maps','Apple'], weather:['Weather','Apple'],
 calendar:['Calendar','Apple'], notes:['Notes','Apple'], reminders:['Reminders','Apple'],
 files:['Files','Apple'], facetime:['FaceTime','Apple'], appstore:['App Store','Apple'],
 safari:['Safari','Apple'], photos:['Photos','Apple'], camera:['Camera','Apple'],
 settings:['Settings','Apple'], phone:['Phone','Apple'], messages:['Messages','Apple'],
 calculator:['Calculator','Apple'], contacts:['Contacts','Apple'], translate:['Translate','Apple'],
 voice:['Voice Memos','Apple'], health:['Health','Apple']
};
function loadOfficialArtwork(){
  Object.entries(artworkSearches).forEach(([id,[term,developer]])=>{
    if(id==='clock'||officialArtwork[id])return;
    const callback='iconResult_'+id;
    window[callback]=payload=>{
      const entries=payload?.results||[];
      const match=entries.find(x=>{
        const title=(x.trackName||'').toLowerCase();
        const requested=term.toLowerCase();
        const maker=(x.artistName||'').toLowerCase();
        const developerOk=developer==='Apple' ? maker==='apple' :
          (id==='line'? maker.includes('line') : id==='kkt'? maker.includes('kakao') : maker.includes('google'));
        return developerOk && (title===requested || title.startsWith(requested+':') || title.startsWith(requested+' '));
      });
      const url=match?.artworkUrl512||match?.artworkUrl100;
      if(url){
        officialArtwork[id]=url.replace(/\d+x\d+bb/g,'512x512bb');
        try{localStorage.setItem('tokunoyushi_artwork_v3',JSON.stringify(officialArtwork))}catch{}
        document.querySelectorAll('img[data-appid="'+id+'"]').forEach(img=>{img.dataset.fallback='';img.src=officialArtwork[id]});
      }
      delete window[callback];
      tag.remove();
    };
    const tag=document.createElement('script');
    tag.src='https://itunes.apple.com/search?'+new URLSearchParams({term,entity:'software',country:'us',limit:'30',callback});
    tag.onerror=()=>{delete window[callback];tag.remove()};
    document.head.appendChild(tag);
  });
}
window.addEventListener('load',loadOfficialArtwork);
function icon(a){
  const el=document.createElement('div'); el.className='app';
  const c=document.createElement('div'); c.className='app-icon';
  c.style.setProperty('--c',a[2]);
  const img=document.createElement('img'); img.src=a[0]==='clock'?CLOCK_ICON:(officialArtwork[a[0]]||'icons/'+a[0]+'.svg'); img.alt=a[1]; img.dataset.appid=a[0];
  img.style.cssText='width:100%;height:100%;object-fit:cover';
  img.onerror=()=>{if(img.dataset.fallback)return;img.dataset.fallback='1';img.src=a[0]==='clock'?CLOCK_ICON:'icons/'+a[0]+'.svg'}; c.append(img);
  const label=document.createElement('span');label.className='app-label';label.textContent=a[1];
  el.append(c,label);el.onclick=()=>openApp(a[0]);return el;
}

function show(html,mode){screen.innerHTML=html;state=mode;$('#gesture').style.background=['lock','pass','home'].includes(mode)?'#fff':'#202027';clock()}
function lock(){pass='';show(`<div class="lock" id="lockArea"><div class="lock-date" id="lockDate">10月17日 日曜日</div><div class="lock-clock" id="lockClock">16:00</div><div class="lock-notify"><strong>＊位置情報への<br>　アクセスが必要です</strong><div style="display:flex;gap:30px;margin-top:9px;font-size:12px;opacity:.8"><span>☀︎<br>--</span><span>◌<br>--</span></div></div><div class="lock-foot"><div class="hint">上にスワイプしてロック解除　⌃</div></div></div>`,'lock');$('#lockArea').onclick=()=>password()}

function password(){pass='';show(`<div class="pass"><div class="pass-title">パスコードを入力</div><div class="dots">${Array.from({length:6},()=>'<div class="dot"></div>').join('')}</div><div class="keypad">${['1','2','3','4','5','6','7','8','9','','0','⌫'].map((n,i)=>n?`<button class="key" data-key="${n}">${n}${i>=1&&i<=8?`<small>${['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'][i]}</small>`:''}</button>`:'<div class="key blank"></div>').join('')}</div><button class="pass-cancel" id="cancel">キャンセル</button></div>`,'pass');screen.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>digit(b.dataset.key));$('#cancel').onclick=lock}
function digit(n){if(n==='⌫')pass=pass.slice(0,-1);else if(pass.length<6)pass+=n;screen.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i<pass.length));if(pass.length===6)setTimeout(()=>{if(pass==='040405')home();else{pass='';screen.querySelectorAll('.dot').forEach(d=>d.classList.remove('on'));screen.querySelector('.pass-title').textContent='パスコードが違います'}},200)}
function home(){show('<div class="home"><div class="pages" id="pages"></div><div class="pager" id="pager"></div><div class="dock" id="dock"></div></div>','home');let list=apps.filter(a=>!dock.includes(a[0]));let count=Math.ceil(list.length/16);for(let i=0;i<count;i++){let p=document.createElement('div');p.className='page';list.slice(i*16,(i+1)*16).forEach(a=>p.append(icon(a)));$('#pages').append(p)}dock.forEach(id=>$('#dock').append(icon(lookup[id])));function dots(){let w=$('#pages').clientWidth;page=Math.round($('#pages').scrollLeft/w);$('#pager').textContent=Array.from({length:count},(_,i)=>i===page?'●':'○').join(' ')}$('#pages').addEventListener('scroll',dots,{passive:true});$('#pages').scrollLeft=page*$('#pages').clientWidth;dots()}
function shell(title,content,options={}){show(`<div class="appview ${options.dark?'dark':''}"><div class="appbar"><button class="back" id="back">‹ ${options.back||'ホーム画面'}</button><strong>${title}</strong><button class="bar-action" id="lockBtn">⌑</button></div><div class="content" id="appContent">${content}</div></div>`,'app');$('#back').onclick=options.onBack||home;$('#lockBtn').onclick=lock}
const seed={line:{'妈妈':[['them','最近有好好吃饭吗？'],['me','嗯，今日练习结束以后吃了。'],['them','别太勉强自己，注意身体。'],['me','谢谢妈妈，晚安。']],'弟弟':[['them','哥！最近怎么样？'],['me','挺好的，毎日都在练习。'],['them','哥，下次回来一起打游戏吧。'],['me','当然，约好了。']]},kkt:{'练习管理部长':[['them','明天午前十点前到 B 練習室集合。'],['them','还会确认大家的月末評価準備情况。'],['me','好的，收到，谢谢部长。']],'舞蹈老师':[['them','今日再看一遍编舞录像。'],['them','尤其注意第二段的转场动作和手臂角度。'],['me','好的老师，我明天之前调整好。']],'声乐老师':[['them','练习时注意不要太快用完气息。'],['them','副歌部分录一段发给我。'],['me','好的！练习好以后发给您。']],'同期练习生':[['them','今日练完去便利店吗？'],['me','好啊，九点左右？'],['them','行，结束后联系。']],'同期练习生':[['them','明天评价用的歌定了吗？'],['me','还在纠结。'],['them','我也是，一起练吧。']],'同期练习生':[['them','今日练完去便利店吗？'],['me','好啊，九点左右？'],['them','明天评价用的歌定了吗？'],['me','还在纠结，一起练吧。'],['them','对了，你把水杯落在練習室了。'],['me','啊谢谢！明天拿。']]} ,messages:{'練習室通知':[['them','練習室 B 的预约时间已更新。']]}};
function loadChats(){try{let v=JSON.parse(localStorage.getItem('tokunoyushi_chat_v1'));return v&&typeof v==='object'?v:structuredClone(seed)}catch{return JSON.parse(JSON.stringify(seed))}}let chats=loadChats();
// V6: 合并旧版本中有名字的同期练习生，避免旧浏览器缓存继续显示姓名。
if(chats.kkt){
  const oldNames=Object.keys(chats.kkt).filter(n=>n.startsWith('同期练习生')&&n!=='同期练习生');
  for(const n of oldNames){
    if(!chats.kkt['同期练习生'])chats.kkt['同期练习生']=[];
    chats.kkt['同期练习生'].push(...(chats.kkt[n]||[]));
    delete chats.kkt[n];
  }
}
function persist(){localStorage.setItem('tokunoyushi_chat_v1',JSON.stringify(chats))}const avatar={妈妈:'母',弟弟:'弟','练习管理部长':'部','舞蹈老师':'舞','声乐老师':'声','同期练习生':'민','同期练习生':'春','同期练习生':'同'};
function chatList(service){activeService=service;let title=lookup[service][1];shell(title,`<h1 class="section-title">${service==='line'?'聊天':service==='kkt'?'聊天':'メッセージ'}</h1><input class="search" id="chatSearch" placeholder="検索聊天"><div id="chatRows"></div>`);let render=(filter='')=>{let box=$('#chatRows');box.innerHTML='';Object.entries(chats[service]||{}).filter(([n])=>n.toLowerCase().includes(filter.toLowerCase())).forEach(([name,msgs])=>{let row=document.createElement('div');row.className='row';let av=document.createElement('div');av.className='avatar';av.textContent=avatar[name]||name[0];let main=document.createElement('div');main.className='row-main';let b=document.createElement('b');b.textContent=name;let p=document.createElement('p');p.textContent=msgs.at(-1)?.[1]||'';main.append(b,p);let tm=document.createElement('span');tm.className='row-time';tm.textContent='今日';row.append(av,main,tm);row.onclick=()=>chatRoom(service,name);box.append(row)})};render();$('#chatSearch').oninput=e=>render(e.target.value)}
function chatRoom(service,name){activeService=service;activeChat=name;shell(name,`<div class="chatview ${service}"><div class="chatlog" id="chatlog"><div class="msg-date">今日</div></div><form class="compose" id="compose"><input id="messageText" placeholder="输入消息" autocomplete="off"><button>送信</button></form></div>`,{back:lookup[service][1],onBack:()=>chatList(service)});let log=$('#chatlog');chats[service][name].forEach(([from,t])=>{let m=document.createElement('div');m.className='msg '+(from==='me'?'me':'them');m.textContent=t;log.append(m)});log.scrollTop=log.scrollHeight;$('#compose').onsubmit=e=>{e.preventDefault();let t=$('#messageText').value.trim();if(!t)return;chats[service][name].push(['me',t]);persist();chatRoom(service,name)}}
const searches=[['舞蹈 isolation 基础怎么练','舞蹈 isolation 基础练习'],['舞蹈动作怎样做得干净','编舞动作干净利落技巧'],['声乐气息训练方法','声乐呼吸训练方法'],['颈部 isolation 动作教学','颈部 isolation 怎么练'],['韩语收音发音练习','韩语收音发音练习'],['月末評価紧张怎么办','月末評価如何缓解紧张'],['弘大練習室の近く吃什么','弘大練習室の近く餐厅'],['120 拍节拍器练习','120 BPM 节拍器训练'],['上半身 wave 动作教学','上半身 wave 动作练习'],['韓国便利店有什么好吃的','韓国便利店推荐']];
function safari(){shell('Safari',`<div class="safari-bar">🔒　検索或输入网站名称</div><h1 class="section-title">最近検索</h1><div id="history"></div><div class="card" style="margin-top:18px"><b>个人よく使う項目</b><p class="muted">练习動画 · 韩语词典 · 节拍器</p></div>`);let h=$('#history');searches.forEach(([j,c])=>{let r=document.createElement('div');r.className='history';r.innerHTML='<b></b><small></small>';r.querySelector('b').textContent=j;r.querySelector('small').textContent=c;r.onclick=()=>{shell('検索',`<div class="safari-bar">🔍 ${escapeHtml(j)}</div><div class="card"><h3>${escapeHtml(c)}</h3><p class="muted">这是虚构手机里的浏览记录演示，不会进行真实网络検索。</p><button class="pill" id="safariBack">戻る历史记录</button></div>`,{back:'Safari',onBack:safari});$('#safariBack').onclick=safari};h.append(r)})}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
const alarmTimes=['08:00','08:01','08:02','08:03'];function alarms(){let data=JSON.parse(localStorage.getItem('tokunoyushi_alarms')||'[true,true,true,true]');shell('時計',`<h1 class="section-title">闹钟</h1><p class="muted">毎日 · 起床提醒</p><div id="alarms"></div><p class="muted" style="margin-top:18px">模拟闹钟：开关会保存，但网页关闭后不会在后台响铃。</p>`);alarmTimes.forEach((time,i)=>{let row=document.createElement('div');row.className='card';row.style.cssText='display:flex;justify-content:space-between;align-items:center';row.innerHTML=`<div><div class="alarm-time">${time}</div><span class="muted">毎日 · ${i===0?'起床':`再次提醒 ${i}`}</span></div>`;let toggle=document.createElement('input');toggle.type='checkbox';toggle.className='toggle';toggle.checked=data[i];toggle.onchange=()=>{data[i]=toggle.checked;localStorage.setItem('tokunoyushi_alarms',JSON.stringify(data))};row.append(toggle);$('#alarms').append(row)})}
const tracks=[['练习歌单','月末評価练习曲'],['深夜散步','练习结束后听的歌'],['声乐热身','发声练习']];function music(){let [name,desc]=tracks[track];shell('ミュージック',`<div class="music-cover">♫</div><div style="padding:0 14px"><h2 style="margin:0">${name}</h2><p style="opacity:.7;margin:6px 0 24px">${desc}</p><input class="music-progress" type="range" value="25"><div class="music-controls"><button id="prev">⏮</button><button id="play">${playing?'⏸':'▶'}</button><button id="next">⏭</button></div><p style="text-align:center;opacity:.7;font-size:13px">${playing?'模拟播放中（无音频）':'已暂停 · 模拟播放器'}</p><div style="margin-top:38px"><h3>资料库</h3><p>♡ 喜爱的歌曲</p><p>▤ 练习歌单</p><p>♫ 最近播放</p></div></div>`,{dark:true});$('#play').onclick=()=>{playing=!playing;music()};$('#prev').onclick=()=>{track=(track+tracks.length-1)%tracks.length;music()};$('#next').onclick=()=>{track=(track+1)%tracks.length;music()}}
function maps(){shell('マップ',`<input class="search" placeholder="場所を検索" id="mapSearch"><div class="map"><div class="map-pin" style="left:28%;top:28%">ソウル・江南</div><div class="map-pin" style="left:49%;top:62%">練習室の近く</div><div class="map-pin" style="left:9%;top:76%">地下鉄駅</div></div><h2>最近の場所</h2><div id="places"></div><p class="muted"></p>`);let places=['ソウル江南区・練習室周辺','合井駅・地下鉄2号線','弘大入口駅・カフェ','コンビニ・練習後','ソウルの森・週末の散歩'];function render(f=''){let box=$('#places');box.innerHTML='';places.filter(x=>x.includes(f)).forEach(x=>{let d=document.createElement('div');d.className='card';d.textContent='📍 '+x;box.append(d)})}render();$('#mapSearch').oninput=e=>render(e.target.value)}
function notes(){let value=localStorage.getItem('tokunoyushi_notes')||'月末評価準備\n\n✓ 整理第二段舞蹈动作\n✓ 发声练习 30분\n□ 復習韩语发音\n□ 拉伸\n\n忘记的动作：转身后重心放左脚。\n明天记得带水和练习鞋。';shell('メモ',`<h1 class="section-title">练习笔记</h1><textarea class="note-area" id="note"></textarea><p class="muted">自动保存到当前浏览器</p>`);$('#note').value=value;$('#note').oninput=e=>localStorage.setItem('tokunoyushi_notes',e.target.value)}
function calendar(){let d=new Date();shell('カレンダー',`<h1 class="section-title">${d.getMonth()+1}月${d.getDate()}日</h1><div class="card"><h3>今日</h3><div class="listline"><b>08:00</b><span>起床 · 朝食</span></div><div class="listline"><b>10:00</b><span>グループダンス練習</span></div><div class="listline"><b>13:00</b><span>昼食 / 休憩</span></div><div class="listline"><b>14:00</b><span>ボーカルレッスン</span></div><div class="listline"><b>16:30</b><span>自主練習 / 韩语</span></div><div class="listline"><b>19:00</b><span>编舞復習</span></div><div class="listline"><b>21:00</b><span>整理练习動画</span></div></div><div class="card"><b>今週目标</b><p>舞蹈动作细节 · 声乐气息 · 月末評価準備</p></div>`)}
function photos(){shell('写真',`<h1 class="section-title">最近项目</h1><p class="muted">練習室 · 食物 · ソウル日常（示意相册）</p><div class="photos-grid">${['🎧','🌃','🍙','👟','🎤','☕','🌆','🎼','🥤','🎹','🧢','🌙'].map((x,i)=>`<div class="photo" data-photo="${i}">${x}</div>`).join('')}</div>`);screen.querySelectorAll('[data-photo]').forEach(el=>el.onclick=()=>shell('写真',`<div style="display:grid;place-items:center;height:65vh;font-size:130px">${el.textContent}</div><p class="muted" style="text-align:center">示意图片 · 可在下一版替换为真实照片</p>`,{back:'写真',onBack:photos}))}
function camera(){shell('カメラ',`<div class="camera-ui"><div class="camera-frame">取景器演示 · 未连接摄像头</div><div style="display:flex;align-items:center;gap:35px"><span>照片</span><button class="shutter" id="shutter"></button><span>動画</span></div></div>`,{dark:true});$('#shutter').onclick=()=>alert('这是模拟相机界面。')}
function settings(){shell('设置',`<div class="card"><div style="display:flex;gap:13px;align-items:center"><div class="avatar">Y</div><div><b>tokunoyushi 的 iPhone</b><p class="muted" style="margin:4px 0">Apple 账户 · 模拟设备</p></div></div></div><div class="settings-group">${['✈️ 飞行模式','📶 Wi-Fi','ᛒ 蓝牙','📱 蜂窝网络'].map(x=>`<div class="setting">${x}<span>›</span></div>`).join('')}</div><div class="settings-group">${['🔔 通知','🔊 声音与触感','🌙 专注模式','⏳ 屏幕使用时间','⚙️ 通用','🎨 墙纸','🔒 面容 ID 与密码'].map(x=>`<div class="setting">${x}<span>›</span></div>`).join('')}</div><button class="pill" id="relock">锁定手机</button>`);$('#relock').onclick=lock;screen.querySelectorAll('.setting').forEach(el=>el.onclick=()=>alert('模拟设置项目：'+el.textContent.replace('›','')))}
const weatherCities={seoul:{label:'ソウル',subtitle:'韓国 · Seoul',lat:37.5665,lon:126.9780,tz:'Asia/Seoul'},tokyo:{label:'東京',subtitle:'日本 · Tokyo',lat:35.6762,lon:139.6503,tz:'Asia/Tokyo'}};
let weatherSelected='seoul';
const weatherCodes={0:['晴朗','☀️'],1:['大致晴朗','🌤️'],2:['局部多云','⛅'],3:['阴天','☁️'],45:['有雾','🌫️'],48:['有雾','🌫️'],51:['小毛毛雨','🌦️'],53:['毛毛雨','🌦️'],55:['较强毛毛雨','🌧️'],61:['小雨','🌦️'],63:['中雨','🌧️'],65:['大雨','🌧️'],71:['小雪','🌨️'],73:['中雪','🌨️'],75:['大雪','❄️'],80:['阵雨','🌦️'],81:['阵雨','🌧️'],82:['强阵雨','⛈️'],95:['雷暴','⛈️']};
function weather(){
  shell('天気',`<div class="wx-app"><div class="wx-city-switch" role="group" aria-label="切换城市"><button data-wx="seoul" class="wx-city-btn">ソウル</button><button data-wx="tokyo" class="wx-city-btn">東京</button></div><section class="wx-hero"><div class="wx-place" id="wxPlace">ソウル</div><div class="wx-subtitle" id="wxSubtitle">韓国 · Seoul</div><div class="wx-temp" id="wxTemp">--°</div><div class="wx-desc" id="wxDesc">正在获取天气…</div><div class="wx-hilo" id="wxHiLo"></div></section><div class="wx-panel"><div class="wx-panel-title">未来天气</div><div id="wxForecast" class="wx-forecast">正在加载预报…</div></div><div class="wx-panel wx-info" id="wxExtra">天气来自 Open-Meteo · 需要联网</div><div class="wx-footer">ソウル和東京均可切换 · 温度不会使用虚构数据</div></div>`);
  document.querySelectorAll('[data-wx]').forEach(b=>b.onclick=()=>loadWeather(b.dataset.wx));
  loadWeather(weatherSelected);
}
async function loadWeather(city){
  if(!weatherCities[city]||!document.querySelector('.wx-app'))return;
  weatherSelected=city;
  const c=weatherCities[city];
  document.querySelectorAll('[data-wx]').forEach(b=>{b.classList.toggle('selected',b.dataset.wx===city);b.setAttribute('aria-pressed',String(b.dataset.wx===city))});
  const place=document.getElementById('wxPlace'),subtitle=document.getElementById('wxSubtitle'),temp=document.getElementById('wxTemp'),desc=document.getElementById('wxDesc'),hilo=document.getElementById('wxHiLo'),forecast=document.getElementById('wxForecast'),extra=document.getElementById('wxExtra');
  place.textContent=c.label;subtitle.textContent=c.subtitle;temp.textContent='--°';desc.textContent='正在获取天气…';hilo.textContent='';forecast.textContent='正在加载预报…';extra.textContent='天气来自 Open-Meteo · 需要联网';
  try{
    const params=new URLSearchParams({latitude:c.lat,longitude:c.lon,current:'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',daily:'weather_code,temperature_2m_max,temperature_2m_min',timezone:c.tz,forecast_days:5});
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),9000);
    let res;
    try{res=await fetch('https://api.open-meteo.com/v1/forecast?'+params,{signal:controller.signal})}finally{clearTimeout(timeout)}
    if(!res.ok)throw Error('网络请求失败');
    const data=await res.json();
    if(weatherSelected!==city||!document.querySelector('.wx-app'))return;
    if(typeof data.current?.temperature_2m!=='number')throw Error('天气数据缺失');
    const w=weatherCodes[data.current.weather_code]||['天气变化','🌤️'];
    temp.textContent=Math.round(data.current.temperature_2m)+'°';desc.textContent=w[1]+' '+w[0];
    hilo.textContent='最高 '+Math.round(data.daily.temperature_2m_max[0])+'°　最低 '+Math.round(data.daily.temperature_2m_min[0])+'°';
    forecast.innerHTML='';
    const dayFmt=new Intl.DateTimeFormat('zh-CN',{weekday:'short',timeZone:'UTC'});
    for(let i=0;i<data.daily.time.length;i++){
      const d=data.daily.time[i],wc=weatherCodes[data.daily.weather_code[i]]||['天气变化','🌤️'];
      const row=document.createElement('div');row.className='wx-day';
      const day=document.createElement('span');day.textContent=i===0?'今日':dayFmt.format(new Date(d+'T12:00:00Z'));
      const icon=document.createElement('span');icon.textContent=wc[1];
      const range=document.createElement('strong');range.textContent=Math.round(data.daily.temperature_2m_min[i])+'°　'+Math.round(data.daily.temperature_2m_max[i])+'°';
      row.append(day,icon,range);forecast.append(row);
    }
    extra.textContent='体感 '+Math.round(data.current.apparent_temperature)+'°　·　湿度 '+data.current.relative_humidity_2m+'%　·　风速 '+Math.round(data.current.wind_speed_10m)+' km/h';
  }catch(e){
    if(weatherSelected!==city||!document.querySelector('.wx-app'))return;
    desc.textContent='暂时无法获取实时天气';forecast.innerHTML='<p>请连接网络后重新尝试。</p>';
    extra.innerHTML='<button type="button" class="wx-retry" id="wxRetry">重新加载</button>';
    document.getElementById('wxRetry').onclick=()=>loadWeather(city);
  }
}
function generic(id){let names={messages:'メッセージ',phone:'電話',appstore:'App Store',files:'ファイル',health:'健康',voice:'ボイスメモ',calculator:'計算機',reminders:'リマインダー',contacts:'連絡先',facetime:'FaceTime',translate:'翻訳',youtube:'YouTube'};let title=names[id]||id;let detail={files:'排练動画 / 月末評価 / 录音',health:'步数与睡眠概览',voice:'声乐练习录音 · 片段 01',reminders:'带练习鞋 / 復習韩语 / 拉伸',contacts:'妈妈 / 弟弟 / 练习生同期',phone:'履歴 · 妈妈',appstore:'已安装的 App',youtube:'ダンス練習動画 · 声乐技巧'}[id]||'应用' ;shell(title,`<h1 class="section-title">${title}</h1><div class="card"><h3>${detail}</h3><p class="muted"></p></div>`)}
function openApp(id){activeApp=id;if(['line','kkt','messages'].includes(id))chatList(id);else if(id==='safari')safari();else if(id==='clock')alarms();else if(id==='music')music();else if(id==='maps')maps();else if(id==='notes')notes();else if(id==='calendar')calendar();else if(id==='photos')photos();else if(id==='camera')camera();else if(id==='settings')settings();else if(id==='weather')weather();else generic(id)}

// V4 — 交互式系统应用（すべて人物、通话和照片均为虚构示例）
const scheduleItems=[['08:00','起床 · 朝食'],['10:00','グループダンス練習'],['13:00','昼食与休憩'],['14:00','ボーカルレッスン'],['16:30','韓国語の勉強'],['19:00','编舞復習'],['21:00','整理练习動画']];
let calendarMonth=new Date().getMonth(),calendarYear=new Date().getFullYear(),calendarDay=new Date().getDate();
calendar=function(){
 const today=new Date(),first=new Date(calendarYear,calendarMonth,1),count=new Date(calendarYear,calendarMonth+1,0).getDate();
 const offset=first.getDay(),week=['日','一','二','三','四','五','六'];
 let cells=Array.from({length:offset},()=>'<div class="cal-cell empty"></div>').join('');
 for(let n=1;n<=count;n++)cells+=`<button class="cal-cell ${n===calendarDay?'selected':''} ${n===today.getDate()&&calendarMonth===today.getMonth()&&calendarYear===today.getFullYear()?'today':''}" data-day="${n}"><span>${n}</span>${[1,3,5,8,10,12,15,17,20,22,25,28].includes(n)?'<i></i>':''}</button>`;
 shell('カレンダー',`<div class="cal-top"><button id="calToday">‹ ${today.getFullYear()}年</button><div><button id="calPrev">‹</button><button id="calNext">›</button></div></div><h1 class="ios-title">${calendarMonth+1}月</h1><div class="cal-week">${week.map(w=>`<b>${w}</b>`).join('')}</div><div class="cal-grid">${cells}</div><div class="cal-agenda"><h3>${calendarMonth+1}月${calendarDay}日 · ${week[new Date(calendarYear,calendarMonth,calendarDay).getDay()]}</h3>${scheduleItems.map(([t,n],i)=>`<div class="agenda-event"><span style="background:${['#f15b56','#b77ae4','#6e9be9'][i%3]}"></span><div><b>${n}</b><small>${t} · ${i===1?'練習室 B':i===3?'声乐教室':'个人安排'}</small></div></div>`).join('')}</div><div class="ios-bottom"><span>今日</span><span>カレンダー</span><span>收件箱</span></div>`);
 $('#calPrev').onclick=()=>{calendarMonth--;if(calendarMonth<0){calendarMonth=11;calendarYear--}calendarDay=1;calendar()};$('#calNext').onclick=()=>{calendarMonth++;if(calendarMonth>11){calendarMonth=0;calendarYear++}calendarDay=1;calendar()};$('#calToday').onclick=()=>{calendarYear=today.getFullYear();calendarMonth=today.getMonth();calendarDay=today.getDate();calendar()};screen.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{calendarDay=+b.dataset.day;calendar()});
};
const photoSubjectsOld=['秋天的街道','ソウル街景','练习后的晚霞','咖啡与笔记','公园步道','练习鞋','便利店夜景','耳机与唱片','練習室走廊','韩式料理','城市夜色','早晨的天空','雨后街道','日落时分','音乐工作台','深夜咖啡'];
const photoUrl=i=>`https://picsum.photos/seed/tokunoyushi_scene_${i+35}/700/700`;
photos=function(){shell('写真',`<div class="ios-toplink">‹ ホーム画面 <button id="photoSelect">选择</button></div><h1 class="ios-title">图库</h1><p class="photo-count">${photoSubjects.length} 张照片 · 虚构生活示意照片</p><h2 class="photo-month">${new Date().getFullYear()}年${new Date().getMonth()+1}月</h2><div class="photos-grid realistic-grid">${photoSubjects.map((n,i)=>`<button class="photo-real" data-photo="${i}" aria-label="查看${n}"><img src="${photoUrl(i)}" alt="${n}" loading="lazy"></button>`).join('')}</div><div class="photo-bottom"><span>年</span><span>月</span><strong>すべて照片</strong></div>`);screen.querySelectorAll('[data-photo]').forEach(el=>el.onclick=()=>photoDetail(+el.dataset.photo));$('#photoSelect').onclick=()=>alert('可以点击任意照片查看大图。')};
function photoDetail(i){shell('写真',`<div class="photo-detail"><div class="photo-detail-top">${i+1} / ${photoSubjects.length} · ${photoSubjects[i]}</div><img id="largePhoto" src="${photoUrl(i)}" alt="${photoSubjects[i]}"><div class="photo-nav"><button id="photoPrev">‹ 上一张</button><button id="photoNext">下一张 ›</button></div><p>照片均为公开示意素材，不代表任何真实人物的私人相册。</p></div>`,{back:'图库',onBack:photos});$('#photoPrev').onclick=()=>photoDetail((i+photoSubjects.length-1)%photoSubjects.length);$('#photoNext').onclick=()=>photoDetail((i+1)%photoSubjects.length)}
const phoneLogs=[['妈妈','昨日','呼入'],['舞蹈课联络','昨日','呼出'],['同期练习生','星期一','呼入'],['ボーカルレッスン联络','星期一','呼出'],['弟弟','星期日','呼入'],['未知号码','星期六','不在着信'],['妈妈','星期五','呼出']];
function phoneApp(tab='履歴'){
 const tabs=['个人よく使う項目','履歴','連絡先','キーパッド','语音留言'];
 let body='';
 if(tab==='履歴')body=`<h1 class="ios-title">履歴</h1><div class="segmented"><button class="chosen">全部</button><button id="missedOnly">不在着信</button></div><div id="callRows">${phoneLogs.map(([name,date,type],i)=>`<button class="call-row" data-call="${i}"><span class="call-symbol">${type==='呼出'?'↗':type==='不在着信'?'↙':'↘'}</span><span><b class="${type==='不在着信'?'missed':''}">${name}</b><small>手机 · ${type}</small></span><time>${date}　<span>ⓘ</span></time></button>`).join('')}</div>`;
 else if(tab==='キーパッド')body=`<div class="dial-number" id="dialNumber"></div><div class="dial-grid">${['1','2','3','4','5','6','7','8','9','*','0','#'].map(n=>`<button data-digit="${n}">${n}</button>`).join('')}</div><div class="dial-actions"><button id="dialDelete">⌫</button><button class="dial-call" id="dialCall">☎</button><span></span></div>`;
 else if(tab==='連絡先')body=`<h1 class="ios-title">通讯录</h1><input class="search" placeholder="検索連絡先" id="contactSearch"><div id="contactsRows">${['妈妈','弟弟','练习管理部长','舞蹈老师','声乐老师','同期练习生','同期练习生','同期练习生'].map(n=>`<div class="contact-row">${n}</div>`).join('')}</div>`;
 else body=`<h1 class="ios-title">${tab}</h1><div class="card">${tab==='语音留言'?'暂无语音留言':'妈妈 · 弟弟 · 舞蹈老师'}</div>`;
 shell('電話',`<div class="phone-layout">${body}</div><nav class="ios-tabs">${tabs.map((t,i)=>`<button data-tab="${t}" class="${tab===t?'active':''}"><span>${['☆','◷','♙','⠿','☏'][i]}</span>${t}</button>`).join('')}</nav>`);
 screen.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>phoneApp(b.dataset.tab));
 if($('#missedOnly'))$('#missedOnly').onclick=()=>{screen.querySelectorAll('.call-row').forEach((b,i)=>b.style.display=phoneLogs[i][2]==='不在着信'?'flex':'none');$('#missedOnly').classList.add('chosen')};
 screen.querySelectorAll('[data-call]').forEach(b=>b.onclick=()=>{let row=phoneLogs[+b.dataset.call];alert(`${row[0]}\n${row[2]} · ${row[1]}\n`)});
 if($('#contactSearch'))$('#contactSearch').oninput=e=>screen.querySelectorAll('.contact-row').forEach(x=>x.style.display=x.textContent.includes(e.target.value)?'':'none');
 if($('#dialNumber')){screen.querySelectorAll('[data-digit]').forEach(b=>b.onclick=()=>$('#dialNumber').textContent+=b.dataset.digit);$('#dialDelete').onclick=()=>$('#dialNumber').textContent=$('#dialNumber').textContent.slice(0,-1);$('#dialCall').onclick=()=>alert('此页面无法拨打电话。')}
}
const v4Searches=['ダンス アイソレーション 首 コツ','振り付け 覚えるのが遅い 改善','댄스 디테일 살리는 법','ボーカル 高音 力まない 方法','한국어 발음 받침 연습','月末評価 ダンス 緊張 対策','연습 끝나고 먹을 것 강남','ダンス 動画 自分でチェック 方法'];
safari=function(){shell('Safari',`<div class="safari-start"><div class="safari-header"><h1 class="ios-title">起始页</h1><span>編集</span></div><h3>个人よく使う項目</h3><div class="favorites">${[['舞','舞蹈教程'],['韓','韩语词典'],['拍','节拍器'],['路','地铁路线'],['歌','声乐练习'],['食','附近餐厅'],['视','练习動画'],['天','天気']].map(([icon,name])=>`<button class="fav" data-search="${name}"><span>${icon}</span>${name}</button>`).join('')}</div><h3>最近検索</h3><div class="safari-history">${v4Searches.map(t=>`<button data-search="${escapeHtml(t)}">◷　${escapeHtml(t)}<span>›</span></button>`).join('')}</div><h3>隐私报告</h3><div class="card">🛡️　Safari 隐私保护已开启</div></div><div class="safari-bottom"><button id="safariBackBtn">‹</button><input id="safariInput" placeholder="検索或输入网站名称"><button id="safariGo">前往</button></div>`);screen.querySelectorAll('[data-search]').forEach(b=>b.onclick=()=>safariResults(b.dataset.search));$('#safariGo').onclick=()=>safariResults($('#safariInput').value.trim());$('#safariInput').onkeydown=e=>{if(e.key==='Enter')safariResults(e.target.value.trim())};$('#safariBackBtn').onclick=home};
function safariResults(query){if(!query)return;shell('Safari',`<div class="safari-results"><h1>検索结果</h1><div class="safari-bar">🔍　${escapeHtml(query)}</div><div class="card"><h3>${escapeHtml(query)}</h3><p>最近検索</p><p class="muted">在 Safari 中查看検索内容。</p></div><button class="pill" id="goHistory">戻る起始页</button></div>`,{back:'起始页',onBack:safari});$('#goHistory').onclick=safari}
const oldGeneric=generic;
generic=function(id){if(id==='phone')return phoneApp();if(id==='contacts')return phoneApp('連絡先');return oldGeneric(id)};

let sy=0,sx=0;const device=$('#device');device.addEventListener('touchstart',e=>{sy=e.touches[0].clientY;sx=e.touches[0].clientX},{passive:true});device.addEventListener('touchend',e=>{let dy=sy-e.changedTouches[0].clientY;if(state==='lock'&&dy>55)password();else if(state==='app'&&dy>110&&e.changedTouches[0].clientY>device.getBoundingClientRect().bottom-130)home()},{passive:true});device.addEventListener('mousedown',e=>{sy=e.clientY;sx=e.clientX});device.addEventListener('mouseup',e=>{if(state==='lock'&&sy-e.clientY>55)password();else if(state==='app'&&sy-e.clientY>120)home()});device.addEventListener('wheel',e=>{if(state==='lock'&&e.deltaY>22)password()},{passive:true});$('#gesture').onclick=()=>{if(state==='lock')password();else if(state==='pass')lock();else if(state==='app')home();else lock()};document.addEventListener('keydown',e=>{if(state==='pass'){if(/^\d$/.test(e.key))digit(e.key);else if(e.key==='Backspace')digit('⌫')}if(e.key==='Escape'){if(state==='app')home();else if(state==='pass')lock()}});lock();


// V5: 详细的每日虚构练习安排；不显示「设置」App。
const weeklyPlans = [
 [ ['身体恢复','做全身拉伸，特别是肩颈、髋关节和脚踝；检查前一周累积的疲劳。'],['基础舞蹈','对镜练习肩、胸、髋 isolation，慢速做三组，记录左右侧不协调的动作。'],['韩语復習','復習練習室常用指令，跟读并录音，核对收音和尾音。'],['整理资料','备份上周排练動画，把需要重练的片段按歌曲分类。'] ],
 [ ['グループ舞蹈排练','先復習队形移动，再合音乐完了整支舞；重点确认副歌第二次换位。'],['个人动作修正','对照前一天動画检查手臂角度、重心与转身落点，分别录制慢速和原速版本。'],['声乐基础','练习气息支持和换声区连接，避免用嗓过度；记录老师指出的问题。'],['韩语听力','听一段韩语采访，摘录没听懂的句子并模仿语调。'] ],
 [ ['节奏训练','使用节拍器练习八拍重音，尝试不同速度的动作控制。'],['ボーカルレッスン程','练习音准和咬字，重点处理长音结尾气息不稳的问题。'],['歌词发音','逐句标注韩语歌词中的连音和收音，慢速跟读。'],['晚间复盘','写下今日最不稳定的三个动作，列出明天的修正方法。'] ],
 [ ['编舞细节','逐段检查动作延伸、头部角度和眼神方向；重点修正副歌前的停顿。'],['体能训练','进行适量核心稳定性训练和拉伸，训练中注意补水与休憩。'],['声乐录音','录制一遍练习曲，回听音准、呼吸声与情绪表达。'],['練習室整理','整理服装、运动鞋、毛巾和水杯，确认第二天所需物品。'] ],
 [ ['グループ合练','与同期练习生完了走位和队形检查，确认进出场顺序。'],['个人镜头练习','对着镜头完了表情和视线训练，回看是否自然。'],['韩语交流','和同期练习生用韩语讨论排练问题，记录不会说的表达。'],['周度记录','汇总今週老师反馈，整理尚未解决的动作和发声问题。'] ],
 [ ['整曲排练','完整跳两遍练习曲，第一遍检查动作准确性，第二遍检查表现力。'],['录像分析','暂停观看排练录像，标注队形偏差、节奏抢拍和手部细节。'],['自主声乐','復習今週ボーカルレッスン内容，轻声练习并避免疲劳时强行唱高音。'],['生活采购','补充洗漱用品和训练时需要的日用品，洗好练习服。'] ],
 [ ['轻量復習','回顾今週舞蹈难点，保持动作熟悉度，不安排高强度训练。'],['房间整理','洗衣服、清理背包和书桌，给电子设备充电。'],['家人联系','给妈妈和弟弟发消息，聊聊最近的生活。'],['下周準備','查看下周排练安排，列出要提前练习的歌曲和动作。'] ]
];
const extraPlans = [
 ['月末評価準備','整理目前的练习曲、舞蹈動画和老师反馈，确认需要重点展示的段落。'],
 ['练习服检查','检查鞋底磨损、备用衣物、毛巾和水杯，避免训练中遗漏。'],
 ['发音专项','集中练习韩语 받침 和连音，用录音比较自己与范读的差别。'],
 ['表情管理','回看舞蹈動画，标记视线游移和表情僵硬的时刻。'],
 ['个人目标回顾','写下今週最明显的进步和下周最需要解决的问题。']
];
function planForDate(y,m,d){
 const dt=new Date(y,m,d), weekday=dt.getDay();
 const plan=weeklyPlans[weekday].map(x=>[...x]);
 const extra=extraPlans[(d+weekday)%extraPlans.length];
 if(d%3===0)plan.splice(2,0,[...extra]);
 if(d%7===0)plan.push(['练习動画备份','将手机里的排练录像分类保存，删掉重复文件，并写下值得保留的片段。']);
 return plan;
}
const escV5=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function reminders(){
 const tasks=[
 ['ダンス練習','把副歌第二次换位练到不需要看别人也能准确找到位置。','检查起步方向和落点，慢速与原速各录一遍；回看是否抢拍。'],
 ['声乐练习','復習声乐老师提到的气息支持和长音结尾问题。','先做轻声热身，再唱练习段落；录音并记下不稳定的音。'],
 ['韩语发音','把今日听不清的韩语句子整理到笔记里。','重点復習收音、连音和老师常说的排练指令；跟读后自己录音。'],
 ['整理排练動画','把今週排练录像按日期和曲目归档。','挑出最需要修改的三个片段，并写明动作错误和下次调整方法。'],
 ['训练用品','出门前检查练习鞋、换洗衣服、毛巾和水杯。','把备用袜子放进包里；结束训练后记得带回充电线。'],
 ['给家里发消息','联系妈妈和弟弟，回复最近还没回的消息。','可以分享生活近况，不必详细解释毎日的练习安排。'],
 ['月末評価準備','整理老师的反馈和个人展示曲目。','把舞蹈、声乐各自最不稳定的部分列出来，逐项练习并复查。']
 ];
 let checked={};try{checked=JSON.parse(localStorage.getItem('tokunoyushi_reminders_v5')||'{}')}catch(e){}
 function render(){
 shell('リマインダー',`<div class="v5-reminder-head"><div class="v5-search">⌕　検索</div><h1 class="ios-title">リマインダー</h1><div class="v5-reminder-summary"><span>全部</span><strong>${tasks.length-Object.values(checked).filter(Boolean).length}</strong><small>项待完了</small></div><h2 class="v5-section">练习与生活</h2>${tasks.map(([title,desc,detail],i)=>`<div class="v5-task"><button class="v5-check ${checked[i]?'done':''}" data-check="${i}" aria-label="${checked[i]?'キャンセル完了':'标记完了'} ${escV5(title)}">${checked[i]?'✓':''}</button><div class="v5-task-content"><strong class="${checked[i]?'crossed':''}">${escV5(title)}</strong><p>${escV5(desc)}</p><small>${escV5(detail)}</small></div></div>`).join('')}<p class="v5-footnote">点击圆圈可标记完了</p>`);
 screen.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{checked[b.dataset.check]=!checked[b.dataset.check];localStorage.setItem('tokunoyushi_reminders_v5',JSON.stringify(checked));render()});
 }render();
}
const noteDocs=[
 ['舞蹈｜副歌动作修正',`今日回看了グループ练习的動画，发现自己在副歌第二次换位时容易提前半拍起步。\n\n需要修改：\n1. 先听清鼓点再移动，不要盯着旁边的人。\n2. 转身后重心放稳，脚落地再做上半身动作。\n3. 手臂延伸时肩膀不要耸起来。\n4. 最后一拍的视线要看向正前方。\n\n下次练习：慢速走位三遍，再跟原速音乐完整跳两遍。每次都录動画检查。`],
 ['声乐｜老师的反馈',`ボーカルレッスン笔记\n\n今日主要练习气息支持和长音收尾。老师提醒：不要一到高音就抬下巴，也不要靠喉咙硬顶。\n\n练习方法：\n• 先轻声哼鸣，确认声音不紧。\n• 一句一句练习歌词，标出需要换气的位置。\n• 长音结尾保持稳定，不要突然把气全部放掉。\n• 录音回听，特别注意音准偏低的地方。\n\n嗓子疲劳时停止练习，明天再继续。`],
 ['韩语｜練習室常用表达',`需要记住的韩语表达\n\n다시 한번 해 볼게요. —— 我再试一次。\n여기부터 다시 할까요? —— 要从这里重新开始吗？\n박자를 놓쳤어요. —— 我没跟上节拍。\n동선을 확인할게요. —— 我确认一下走位。\n조금만 천천히 해 주세요. —— 请稍微慢一点。\n\n復習重点：收音、连音和敬语结尾。明天把这五句完整说出来，不看笔记。`],
 ['月末評価｜準備清单',`月末評価前要确认的事情\n\n舞蹈：\n• 展示曲目已经能完整跳下来。\n• 队形转换和重拍动作不能抢拍。\n• 回看正面录像，检查视线和表情。\n\n声乐：\n• 熟悉歌词，标出换气位置。\n• 检查音准、发音和结尾处理。\n\n其他：\n• 整理老师的反馈。\n• 备份排练動画。\n• 提前检查练习鞋和训练服。\n\n最重要的是把平时练过的东西稳定地做出来。`],
 ['日常｜随手记录',`今日训练后需要处理的事情\n\n练习服洗好晾起来。\n充电线不要忘在練習室。\n耳机电量不够，出门前记得充电。\n有空给妈妈回消息，也问问弟弟最近在学校怎么样。\n\n最近想改善的习惯：训练结束就把当天的動画分类，不要拖到週末才整理。`]
];
function notes(index=null){
 let docs;try{docs=JSON.parse(localStorage.getItem('tokunoyushi_note_docs_v5')||'null')}catch(e){}if(!Array.isArray(docs)||!docs.length)docs=noteDocs.map(x=>[...x]);
 const save=()=>localStorage.setItem('tokunoyushi_note_docs_v5',JSON.stringify(docs));
 if(index===null){shell('メモ',`<div class="v5-notes-head">‹ 文件夹 <span>•••</span></div><h1 class="ios-title">メモ</h1><div class="v5-search">⌕　検索</div><div class="v5-notes-list">${docs.map(([title,body],i)=>`<button class="v5-note-row" data-note="${i}"><b>${escV5(title)}</b><span>${escV5(body.replace(/\n/g,' ').slice(0,60))}…</span></button>`).join('')}</div><button id="v5AddNote" class="v5-addnote">✎　新規メモ</button>`);screen.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>notes(+b.dataset.note));$('#v5AddNote').onclick=()=>{docs.unshift(['新メモ','']);save();notes(0)};return;}
 shell('メモ',`<button id="v5NoteBack" class="v5-note-back">‹ メモ</button><input class="v5-note-title" id="v5NoteTitle" aria-label="メモ标题"><textarea class="v5-note-editor" id="v5NoteBody" aria-label="メモ正文"></textarea><div class="v5-note-save">自动保存到此浏览器</div>`);
 $('#v5NoteTitle').value=docs[index][0];$('#v5NoteBody').value=docs[index][1];$('#v5NoteBack').onclick=()=>notes();const update=()=>{docs[index]=[$('#v5NoteTitle').value,$('#v5NoteBody').value];save()};$('#v5NoteTitle').oninput=update;$('#v5NoteBody').oninput=update;
}
calendar=function(){
 const today=new Date(),first=new Date(calendarYear,calendarMonth,1),count=new Date(calendarYear,calendarMonth+1,0).getDate(),week=['日','一','二','三','四','五','六'];
 let cells=Array.from({length:first.getDay()},()=>'<div class="cal-cell empty"></div>').join('');
 for(let n=1;n<=count;n++)cells+=`<button class="cal-cell ${n===calendarDay?'selected':''} ${n===today.getDate()&&calendarMonth===today.getMonth()&&calendarYear===today.getFullYear()?'today':''}" data-day="${n}"><span>${n}</span><i></i></button>`;
 const plans=planForDate(calendarYear,calendarMonth,calendarDay);
 shell('カレンダー',`<div class="cal-top"><button id="calToday">‹ ${today.getFullYear()}年</button><div><button id="calPrev">‹</button><button id="calNext">›</button></div></div><h1 class="ios-title">${calendarMonth+1}月</h1><div class="cal-week">${week.map(w=>`<b>${w}</b>`).join('')}</div><div class="cal-grid">${cells}</div><div class="cal-agenda"><h3>${calendarYear}年${calendarMonth+1}月${calendarDay}日 · 星期${week[new Date(calendarYear,calendarMonth,calendarDay).getDay()]} · ${plans.length}项安排</h3>${plans.map(([title,desc],i)=>`<div class="agenda-event v5-event"><span style="background:${['#f15b56','#b77ae4','#6e9be9','#51b3a4','#e6a653'][i%5]}"></span><div><b>${escV5(title)}</b><p>${escV5(desc)}</p></div></div>`).join('')}</div><p class="v5-footnote">カレンダー毎日都有安排，点击任意日期查看详细内容。内容为虚构练习计划。</p>`);
 $('#calPrev').onclick=()=>{calendarMonth--;if(calendarMonth<0){calendarMonth=11;calendarYear--}calendarDay=1;calendar()};$('#calNext').onclick=()=>{calendarMonth++;if(calendarMonth>11){calendarMonth=0;calendarYear++}calendarDay=1;calendar()};$('#calToday').onclick=()=>{calendarYear=today.getFullYear();calendarMonth=today.getMonth();calendarDay=today.getDate();calendar()};screen.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{calendarDay=+b.dataset.day;calendar()});
};
const originalOpenAppV5=openApp;
openApp=function(id){if(id==='reminders'){activeApp=id;reminders()}else if(id==='settings'){home()}else originalOpenAppV5(id)};

// Final Japanese-language native apps and empty photo library.
const jaWeek=['日','月','火','水','木','金','土'];
const jaDate=d=>`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
photos=function(){shell('写真',`<div class="final-photo-head"><span>アルバム</span><h1>写真</h1><div class="final-photo-empty"><span>▧</span><strong>写真またはビデオがありません</strong><p>写真を追加すると、ここに表示されます。</p></div></div><div class="photo-bottom"><span>ライブラリ</span><span>アルバム</span><span>検索</span></div>`)};
camera=function(){shell('カメラ',`<div class="final-camera"><div class="final-camera-view"><div class="final-camera-focus"></div></div><div class="final-camera-tools">⚡　　⌄　　LIVE　　☷</div><div class="final-camera-modes">シネマティック　　ビデオ　　<b>写真</b>　　ポートレート</div><div class="final-camera-actions"><span class="camera-thumb"></span><button id="finalShutter" aria-label="シャッター" class="shutter"></button><button id="finalFlip" aria-label="カメラ切替">⟳</button></div><p id="finalCameraMsg" class="final-camera-msg"></p></div>`,{dark:true});$('#finalShutter').onclick=()=>{$('#finalCameraMsg').textContent='ブラウザのプレビューでは撮影できません'};$('#finalFlip').onclick=()=>{$('#finalCameraMsg').textContent='カメラへのアクセスはありません'}};
alarms=function(){let data=JSON.parse(localStorage.getItem('tokunoyushi_alarms')||'[true,true,true,true]');shell('時計',`<div class="final-clock"><div class="final-clock-tabs">世界時計　　<strong>アラーム</strong>　　ストップウォッチ　　タイマー</div><h1>アラーム</h1><div id="alarms"></div></div>`);alarmTimes.forEach((time,i)=>{let row=document.createElement('div');row.className='final-alarm';row.innerHTML=`<div><div class="alarm-time">${time}</div><span>毎日 · ${i===0?'起床':'スヌーズ'}</span></div>`;let toggle=document.createElement('input');toggle.type='checkbox';toggle.className='toggle';toggle.checked=data[i];toggle.onchange=()=>{data[i]=toggle.checked;localStorage.setItem('tokunoyushi_alarms',JSON.stringify(data))};row.append(toggle);$('#alarms').append(row)})};
const finalTracks=[['練習プレイリスト','お気に入りの曲'],['夜の散歩','最近再生した項目'],['ボーカル練習','プレイリスト']];
music=function(){const [name,desc]=finalTracks[track%finalTracks.length];shell('ミュージック',`<div class="final-music"><div class="final-music-top">‹　ライブラリ <span>•••</span></div><div class="final-music-art">♫</div><h2>${name}</h2><p>${desc}</p><input class="music-progress" type="range" min="0" max="100" value="0" aria-label="再生位置"><div class="music-controls"><button id="prev">⏮</button><button id="play">${playing?'⏸':'▶'}</button><button id="next">⏭</button></div><div class="final-music-foot">ライブラリ　　今すぐ聴く　　検索</div><p class="final-music-note">オーディオファイルが追加されていません</p></div>`,{dark:true});$('#play').onclick=()=>{playing=false;$('#play').textContent='▶'};$('#prev').onclick=()=>{track=(track+finalTracks.length-1)%finalTracks.length;music()};$('#next').onclick=()=>{track=(track+1)%finalTracks.length;music()}};
calendar=function(){const today=new Date(),first=new Date(calendarYear,calendarMonth,1),count=new Date(calendarYear,calendarMonth+1,0).getDate();let cells=Array.from({length:first.getDay()},()=>'<div class="cal-cell empty"></div>').join('');for(let n=1;n<=count;n++)cells+=`<button class="cal-cell ${n===calendarDay?'selected':''} ${n===today.getDate()&&calendarMonth===today.getMonth()&&calendarYear===today.getFullYear()?'today':''}" data-day="${n}"><span>${n}</span><i></i></button>`;const plans=planForDate(calendarYear,calendarMonth,calendarDay);shell('カレンダー',`<div class="cal-top"><button id="calToday">‹ ${today.getFullYear()}年</button><div><button id="calPrev">‹</button><button id="calNext">›</button></div></div><h1 class="ios-title">${calendarMonth+1}月</h1><div class="cal-grid">${jaWeek.map(d=>`<span class="cal-week">${d}</span>`).join('')}${cells}</div><div class="final-calendar-day"><h2>${calendarMonth+1}月${calendarDay}日（${jaWeek[new Date(calendarYear,calendarMonth,calendarDay).getDay()]}）</h2>${plans.map(([title,detail])=>`<div class="final-calendar-event"><strong>${escV5(title)}</strong><p>${escV5(detail)}</p></div>`).join('')}</div>`);$('#calPrev').onclick=()=>{calendarMonth--;if(calendarMonth<0){calendarMonth=11;calendarYear--}calendarDay=1;calendar()};$('#calNext').onclick=()=>{calendarMonth++;if(calendarMonth>11){calendarMonth=0;calendarYear++}calendarDay=1;calendar()};$('#calToday').onclick=()=>{calendarYear=today.getFullYear();calendarMonth=today.getMonth();calendarDay=today.getDate();calendar()};screen.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{calendarDay=+b.dataset.day;calendar()})};
const originalWeatherFinal=weather;
weather=function(){originalWeatherFinal();let x=document.querySelector('.wx-app');if(!x)return;const translate=()=>{const pairs={'ソウル':'ソウル','東京':'東京','韓国 · Seoul':'韓国 · Seoul','日本 · Tokyo':'日本 · Tokyo','未来天气':'週間天気予報','正在获取天气…':'天気を取得中…','正在加载预报…':'予報を読み込み中…','天气来自 Open-Meteo · 需要联网':'天気データ: Open-Meteo · インターネット接続が必要','ソウル和東京均可切换 · 温度不会使用虚构数据':'ソウル・東京'};x.querySelectorAll('*').forEach(e=>{if(e.children.length===0){const v=e.textContent.trim();if(pairs[v])e.textContent=pairs[v]}})};translate();const obs=new MutationObserver(()=>{obs.disconnect();translate();obs.observe(x,{subtree:true,childList:true,characterData:true})});obs.observe(x,{subtree:true,childList:true,characterData:true});};
const originalChatListFinal=chatList;
chatList=function(service){originalChatListFinal(service);if(service==='messages'){let heading=screen.querySelector('.section-title');if(heading)heading.textContent='メッセージ';}};
const originalOpenAppFinal=openApp;
openApp=function(id){if(id==='appstore'||id==='health'||id==='settings')return home();if(['photos','camera','music','calendar','clock','weather'].includes(id)){activeApp=id;return ({photos,camera,music,calendar,clock:alarms,weather})[id]()}return originalOpenAppFinal(id)};

// Japanese interface: maps and event descriptions.
const jpMapPlaces=['ソウル・江南区','合井駅（地下鉄2号線）','弘大入口駅','ソウルの森','コンビニ'];
maps=function(){shell('マップ',`<input class="search" placeholder="場所を検索" id="mapSearch"><div class="map"><div class="map-pin" style="left:28%;top:28%">ソウル・江南</div><div class="map-pin" style="left:49%;top:62%">練習室の近く</div><div class="map-pin" style="left:9%;top:76%">地下鉄駅</div></div><h2>最近の場所</h2><div id="places"></div>`);const render=(q='')=>{$('#places').innerHTML=jpMapPlaces.filter(x=>x.toLowerCase().includes(q.toLowerCase())).map(x=>`<div class="card">📍 ${x}</div>`).join('')};render();$('#mapSearch').oninput=e=>render(e.target.value)};
const previousOpenJa=openApp;
openApp=function(id){if(id==='maps'){activeApp=id;return maps()}return previousOpenJa(id)};

// Home widgets: calendar and Seoul weather, iOS-style.
const previousHomeWidgets=home;
home=function(){
 show('<div class="home widget-home"><div class="pages" id="pages"></div><div class="pager" id="pager"></div><div class="dock" id="dock"></div></div>','home');
 const list=apps.filter(a=>!dock.includes(a[0]));const first=list.slice(0,8),rest=list.slice(8);
 const p=document.createElement('div');p.className='page widget-page';
 const widgets=document.createElement('div');widgets.className='widget-pair';
 const today=new Date();const day=pad(today.getDate());const dayName=['日','月','火','水','木','金','土'][today.getDay()];
 widgets.innerHTML=`<button class="ios-widget calendar-widget" id="calendarWidget"><span class="widget-week">${['日','月','火','水','木','金','土'][today.getDay()]}曜日</span><span class="widget-day">${Number(day)}</span><div class="widget-events"><div><b>ダンス練習</b><small>終日</small></div><div><b>ボーカル練習</b><small>終日</small></div></div></button><button class="ios-widget weather-widget" id="weatherWidget"><span class="widget-sun">☀</span><span class="widget-place">ソウル ↗</span><span class="widget-temp" id="homeWxTemp">--°</span><span class="widget-condition" id="homeWxDesc">天気を取得中</span><span class="widget-range" id="homeWxRange">最高 --° 最低 --°</span></button>`;
 p.append(widgets);const grid=document.createElement('div');grid.className='widget-icons';first.forEach(a=>grid.append(icon(a)));p.append(grid);$('#pages').append(p);
 let count=1;for(let i=0;i<rest.length;i+=16){const pp=document.createElement('div');pp.className='page';rest.slice(i,i+16).forEach(a=>pp.append(icon(a)));$('#pages').append(pp);count++}
 dock.forEach(id=>$('#dock').append(icon(lookup[id])));
 const dots=()=>{const width=$('#pages').clientWidth;page=Math.round($('#pages').scrollLeft/width);$('#pager').textContent=Array.from({length:count},(_,i)=>i===page?'●':'○').join(' ')};
 $('#pages').addEventListener('scroll',dots,{passive:true});$('#pages').scrollLeft=page*$('#pages').clientWidth;dots();
 $('#calendarWidget').onclick=()=>openApp('calendar');$('#weatherWidget').onclick=()=>{weatherSelected='seoul';openApp('weather')};
 fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=1').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
  if(!document.querySelector('#homeWxTemp'))return;
  const v=data.current.temperature_2m,code=data.current.weather_code;
  const label=code===0?'快晴':code<=2?'晴れ時々曇り':code===3?'曇り':code>=71&&code<=77?'雪':code>=51&&code<=82?'雨':'晴れ';
  $('#homeWxTemp').textContent=Math.round(v)+'°';$('#homeWxDesc').textContent=label;
  $('#homeWxRange').textContent='最高 '+Math.round(data.daily.temperature_2m_max[0])+'° 最低 '+Math.round(data.daily.temperature_2m_min[0])+'°';
 }).catch(()=>{if($('#homeWxDesc'))$('#homeWxDesc').textContent='オフライン'});
};


// July 2021 edition: single daily alarm, connected journal and family conversations.
const julyLine={
 'お母さん':[['them','最近ちゃんとご飯食べてる？'],['me','うん、練習のあとに食べてるよ。'],['them','無理しすぎないでね。洗濯も忘れずに。'],['me','わかった！ありがとう。']],
 'お父さん':[['them','最近の練習はどう？元気にしてる？'],['me','元気だよ。最近はダンスと韓国語で忙しい。'],['them','ちゃんと食べて、体を休める時間も作りなさい。'],['me','うん、心配しないで。']],
 '弟':[['them','兄ちゃん、最近どう？'],['me','元気！毎日練習してるよ。'],['them','日本に帰ってきたら一緒にゲームしようね。'],['me','もちろん！約束。']],
 '友達':[['them','久しぶり！最近どうしてる？'],['me','毎日レッスンばっかり（笑）'],['them','いつ日本に帰ってくるの？'],['me','まだわからないけど、休みが取れたら帰りたい。'],['them','帰ってきたら絶対遊ぼう！'],['me','うん、連絡する！']]
};
const julyKkt={
 '同期練習生':[['them','今日の練習が終わったら、牛丼定食食べに行かない？'],['me','いいね！何時ごろ？'],['them','19時くらいかな。いつもの店で！'],['me','了解！練習終わったら連絡するね。'],['them','そういえば、明日のダンスの振り付け覚えた？'],['me','まだ途中（笑）あとで一緒に確認しよう。']],
 '練習生担当':[['them','明日はダンスと韓国語のレッスンがあります。遅れないようにしてください。'],['me','承知しました。よろしくお願いします。']],
 'ダンスの先生':[['them','今日の動画をもう一度確認してください。特に移動のタイミングと腕の角度。'],['me','はい。修正して次の練習で見せます。']],
 'ボーカルの先生':[['them','高音で力みすぎないように。呼吸を意識して練習してください。'],['me','わかりました。録音して確認します。']]
};
// Keep messages sent by the visitor, but replace obsolete demo seed and labels.
function updateJulyChats(){
 let marker='tokunoyushi_july_2021_seed_v9';
 if(localStorage.getItem(marker)==='yes')return;
 chats.line=Object.fromEntries(Object.entries(julyLine).map(([k,v])=>[k,v.map(x=>[...x])]));
 chats.kkt=Object.fromEntries(Object.entries(julyKkt).map(([k,v])=>[k,v.map(x=>[...x])]));
 persist();localStorage.setItem(marker,'yes');
}
updateJulyChats();
Object.assign(avatar,{'お母さん':'母','お父さん':'父','弟':'弟','友達':'友','同期練習生':'同','練習生担当':'担','ダンスの先生':'踊','ボーカルの先生':'声'});
const julyPlans={
 5:[['ダンスレッスン','基礎の動きを確認。グループ練習では立ち位置と移動のタイミングを合わせる。'],['韓国語','発音と会話の復習。レッスンで使う表現をノートにまとめる。'],['ボーカル・ラップ','発声練習とリズム確認。短いパートを録音して聴き直す。'],['個人練習','苦手な振り付けを繰り返し練習。']],
 6:[['ダンスレッスン','ウォームアップのあと、グループの振り付けを通して練習。'],['韓国語','先生から教わった言い回しを復習する。'],['グループ練習','隊形移動とタイミングを確認。'],['夜の復習','撮影した練習動画を見て改善点をメモ。']],
 7:[['ダンスレッスン','基礎と振り付けの細かい部分を確認。'],['韓国語','発音練習と短い会話。'],['ラップ','リズムに合わせて歌詞を練習。'],['ソロ練習','表情と視線、ターンの重心を確認。']],
 8:[['撮影','練習用の動画を撮影して動きを確認。'],['ダンスレッスン','グループとソロの振り付けを復習。'],['自主練習','録画を見直して気になった部分を修正。']]
};
const julyWeekly=[
 [['ダンス基礎','アイソレーションと体重移動を確認する。'],['韓国語','新しい単語を復習する。'],['ストレッチ','肩と脚を中心に体をほぐす。']],
 [['グループダンス','振り付けと隊形移動を合わせる。'],['ボーカル','発声と音程を確認する。'],['動画チェック','今日の練習を見直す。']],
 [['韓国語','発音と会話を練習する。'],['ダンス','サビの動きを繰り返す。'],['自主練習','苦手な部分を整理する。']],
 [['ダンス','基礎とリズム練習をする。'],['ラップ','歌詞の発音と拍を確認する。'],['個人練習','ソロパートを仕上げる。']],
 [['ボーカル','呼吸と高音の発声を練習する。'],['グループ練習','動線とタイミングを合わせる。'],['復習','先生からの指摘を整理する。']],
 [['ダンス','振り付けを通して練習する。'],['韓国語','一週間の表現を復習する。'],['洗濯','練習着を洗って片付ける。']],
 [['休息','体を休めて軽くストレッチする。'],['部屋の片付け','洗濯物と練習道具を整理する。'],['家族に連絡','日本の家族に近況を伝える。']]
];
function planJuly(year,month,day){if(year===2021&&month===6&&julyPlans[day])return julyPlans[day];return julyWeekly[new Date(year,month,day).getDay()]}
calendarYear=2021;calendarMonth=6;calendarDay=5;
calendar=function(){
 const first=new Date(calendarYear,calendarMonth,1),count=new Date(calendarYear,calendarMonth+1,0).getDate();
 let cells=Array.from({length:first.getDay()},()=>'<div class="cal-cell empty"></div>').join('');
 for(let n=1;n<=count;n++)cells+=`<button class="cal-cell ${n===calendarDay?'selected':''}" data-day="${n}"><span>${n}</span><i></i></button>`;
 const plans=planJuly(calendarYear,calendarMonth,calendarDay);
 shell('カレンダー',`<div class="cal-top"><button id="calToday">‹ 2021年</button><div><button id="calPrev">‹</button><button id="calNext">›</button></div></div><h1 class="ios-title">${calendarMonth+1}月</h1><div class="cal-grid">${jaWeek.map(d=>`<span class="cal-week">${d}</span>`).join('')}${cells}</div><div class="final-calendar-day"><h2>${calendarYear}年${calendarMonth+1}月${calendarDay}日（${jaWeek[new Date(calendarYear,calendarMonth,calendarDay).getDay()]}）</h2>${plans.map(([title,detail])=>`<div class="final-calendar-event"><strong>${escV5(title)}</strong><p>${escV5(detail)}</p></div>`).join('')}</div>`);
 $('#calPrev').onclick=()=>{calendarMonth--;if(calendarMonth<0){calendarMonth=11;calendarYear--}calendarDay=1;calendar()};
 $('#calNext').onclick=()=>{calendarMonth++;if(calendarMonth>11){calendarMonth=0;calendarYear++}calendarDay=1;calendar()};
 $('#calToday').onclick=()=>{calendarYear=2021;calendarMonth=6;calendarDay=5;calendar()};
 screen.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{calendarDay=+b.dataset.day;calendar()});
};
alarms=function(){let enabled=localStorage.getItem('tokunoyushi_alarm_0800')!=='false';shell('時計',`<div class="final-clock"><div class="final-clock-tabs">世界時計　　<strong>アラーム</strong>　　ストップウォッチ　　タイマー</div><h1>アラーム</h1><div id="alarms"></div></div>`);let row=document.createElement('div');row.className='final-alarm';row.innerHTML='<div><div class="alarm-time">08:00</div><span>毎日 · 起床</span></div>';let toggle=document.createElement('input');toggle.type='checkbox';toggle.className='toggle';toggle.checked=enabled;toggle.onchange=()=>localStorage.setItem('tokunoyushi_alarm_0800',String(toggle.checked));row.append(toggle);$('#alarms').append(row)};
// Keep the 2021 date visible on the home calendar widget.
const julyHomeBase=home;
home=function(){julyHomeBase();let w=document.querySelector('#calendarWidget');if(w){w.querySelector('.widget-week').textContent='月曜日';w.querySelector('.widget-day').textContent='5';w.querySelector('.widget-events').innerHTML='<div><b>ダンスレッスン</b><small>終日</small></div><div><b>韓国語・ボーカル</b><small>終日</small></div>'}};
// Show Japanese conversation headings while retaining the interactive chat UI.
const julyChatListBase=chatList;
chatList=function(service){julyChatListBase(service);const heading=screen.querySelector('.section-title');if(heading)heading.textContent=service==='messages'?'メッセージ':'トーク';const search=screen.querySelector('#chatSearch');if(search)search.placeholder='検索';};

// Desktop-friendly home page navigation: click page dots, arrows, or drag.
const previousHomePaging=home;
home=function(){
 previousHomePaging();
 const strip=document.getElementById('pages'), pager=document.getElementById('pager');
 if(!strip||!pager)return;
 const total=strip.querySelectorAll('.page').length;
 function go(index){page=Math.max(0,Math.min(total-1,index));strip.scrollTo({left:page*strip.clientWidth,behavior:'smooth'});refresh()}
 function refresh(){pager.innerHTML='';for(let i=0;i<total;i++){
  const dot=document.createElement('button');dot.type='button';dot.className='page-dot'+(i===page?' current':'');dot.setAttribute('aria-label',`ホーム画面 ${i+1}`);dot.title=`第 ${i+1} 页`;dot.textContent=i===page?'●':'○';dot.onclick=()=>go(i);pager.append(dot);
 }}
 strip.addEventListener('scroll',()=>{const current=Math.round(strip.scrollLeft/Math.max(1,strip.clientWidth));if(current!==page){page=current;refresh()}},{passive:true});
 let startX=0,startLeft=0,drag=false,moved=false;
 strip.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;startX=e.clientX;startLeft=strip.scrollLeft;drag=true;moved=false;});
 strip.addEventListener('pointermove',e=>{if(!drag)return;const delta=e.clientX-startX;if(Math.abs(delta)>9){moved=true;strip.style.scrollSnapType='none';strip.scrollLeft=startLeft-delta;}});
 const end=e=>{if(!drag)return;drag=false;strip.style.scrollSnapType='x mandatory';if(moved){const delta=e.clientX-startX;go(Math.abs(delta)>35?Math.round(startLeft/strip.clientWidth)+(delta<0?1:-1):Math.round(strip.scrollLeft/strip.clientWidth));}};
 strip.addEventListener('pointerup',end);strip.addEventListener('pointercancel',end);strip.addEventListener('pointerleave',e=>{if(drag&&e.buttons===0)end(e)});
 strip.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
 pager.style.pointerEvents='auto';refresh();
};
