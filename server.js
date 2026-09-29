
const express=require("express"),http=require("http"),{Server}=require("socket.io");
const app=express(),server=http.createServer(app),io=new Server(server);
const path=require("path"),PORT=process.env.PORT||3000;
app.use(express.static(path.join(__dirname,"public")));
app.get("/health",(q,r)=>r.json({ok:true,version:"19.0"}));
app.get("*",(q,r)=>r.sendFile(path.join(__dirname,"public/index.html")));

const A={
estate:{n:"오래된 저택",links:["market","pier"],spots:["온실","서재","현관"],kind:"home",desc:"도시의 가장자리. 두 아이와 변이동물이 사는 오래된 집."},
market:{n:"운하 시장",links:["estate","pier","district","salon"],spots:["파이 가게","골동품상","수로 계단"],kind:"social",desc:"사람과 소문이 가장 많이 모이는 곳."},
pier:{n:"낡은 선착장",links:["estate","market","canal","salon"],spots:["계류 밧줄","발자국","수면"],kind:"explore",desc:"수면 아래 도시로 내려가는 오래된 부두."},
canal:{n:"수중 운하",links:["pier","archive","district"],spots:["우체통","유리창","잠긴 문"],kind:"explore",desc:"도시의 아래쪽을 잇는 물길."},
archive:{n:"기록보관소",links:["canal","station"],spots:["열람실","금고","금지서고"],kind:"lore",desc:"도시의 오래된 생활 기록을 보관한다."},
station:{n:"폐역",links:["archive","district"],spots:["승강장","역무실","13분 늦은 시계"],kind:"mystery",desc:"폐쇄된 지 오래됐지만 밤마다 불이 켜진다."},
district:{n:"구주거구",links:["station","hospital","market"],spots:["빈 집","세탁소","옥상"],kind:"life",desc:"도시의 평범한 생활과 이상현상이 겹치는 곳."},
hospital:{n:"수중 병원",links:["district","theater"],spots:["접수실","수중 병실","기록실"],kind:"lore",desc:"수면 위와 아래의 주민들이 이용하는 수중 병원."},
theater:{n:"침수 극장",links:["hospital","deep"],spots:["매표소","무대","영사실"],kind:"mystery",desc:"상영되지 않은 영화가 남아 있다."},
deep:{n:"심층 진입구",links:["theater"],spots:["잠수엘리베이터","수문","검은 계단"],kind:"danger",desc:"도시 아래의 진짜 구조로 이어지는 곳."},
salon:{n:"운하 살롱",links:["market","pier"],spots:["카드 테이블","창가 좌석","낡은 주크박스"],kind:"social",desc:"물길을 오가는 사람들이 쉬어 가는 작은 카드 살롱. 여기서 게임을 즐길 수 있다."}
};

const NPC={
childA:{n:"아이 A",area:"estate",max:8,desc:"저택에서 함께 사는 아이."},
childB:{n:"아이 B",area:"estate",max:8,desc:"저택에서 함께 사는 아이."},
pie:{n:"파이 장인",area:"market",max:6},
antique:{n:"골동품상",area:"market",max:7},
keeper:{n:"역무원",area:"station",max:8},
archivist:{n:"기록관 세라",area:"archive",max:8},
doctor:{n:"의사 로웬",area:"hospital",max:8},
actor:{n:"극장 관리인 이오",area:"theater",max:8},
washer:{n:"세탁소 주인",area:"district",max:6}
};

const MAIN=[
{id:"M1",ch:1,title:"저택의 하루",need:0,area:"estate",text:"새로운 하루가 시작되었다. 집 안을 살피고 오늘 필요한 일을 정해 보자.",goal:"저택을 둘러보고 오늘 할 일을 하나 정하라."},
{id:"M2",ch:1,title:"도시로 나가기",need:3,area:"estate",text:"집 밖에는 수면 위와 아래로 이어지는 도시가 있다.",goal:"운하 시장이나 선착장을 한 번 방문하라."},
{id:"M3",ch:1,title:"도시의 생활",need:6,area:"market",text:"시장과 선착장은 사람과 변이동물이 오가는 생활 공간이다.",goal:"도시의 물건 세 가지를 조사하라."},
{id:"M4",ch:2,title:"집으로 돌아오기",need:10,area:"estate",text:"도시에서 가져온 물건과 이야기는 저택의 생활에도 영향을 준다.",goal:"저택으로 돌아와 물건을 정리하거나 수리하라."},
{id:"M5",ch:2,title:"새로운 길",need:14,area:"canal",text:"수로를 따라가면 아직 가보지 않은 생활권이 열린다.",goal:"새로운 도시 지역 하나를 발견하라."},
{id:"M6",ch:2,title:"도시의 사람들",need:19,area:"district",text:"주민들은 각자의 일과 생활을 이어가고 있다.",goal:"도시 주민과 이야기를 나눠 보라."},
{id:"M7",ch:3,title:"저택을 돌보기",need:25,area:"estate",text:"큰 집을 유지하려면 물과 식량, 수리와 청소가 필요하다.",goal:"저택의 상태를 한 가지 개선하라."},
{id:"M8",ch:3,title:"함께하는 시간",need:31,area:"estate",text:"아이들과 변이동물도 저택의 하루를 함께 만든다.",goal:"저택에서 가족과 시간을 보내라."},
{id:"M9",ch:4,title:"도시의 작은 사건",need:38,area:"market",text:"평범한 하루에도 작은 사건이 생긴다. 직접 보고 선택해 보자.",goal:"도시에서 발생한 사건 하나를 해결하라."},
{id:"M10",ch:4,title:"나만의 생활 방식",need:46,area:"estate",text:"탐험, 생활, 수집, 미니게임 중 원하는 활동을 반복할 수 있다.",goal:"원하는 활동을 세 번 반복하라."},
{id:"M11",ch:5,title:"더 깊은 생활권",need:55,area:"canal",text:"도시의 수로와 연결된 장소를 하나씩 탐험한다.",goal:"새로운 생활권을 하나 해금하라."},
{id:"M12",ch:5,title:"계속되는 하루",need:66,area:"estate",text:"하루가 지나도 도시는 계속되고, 저택에도 새로운 일이 생긴다.",goal:"하루를 마치고 다음 날을 맞이하라."}
];

const SIDE=[
{id:"S1",area:"market",title:"사라진 파이",steps:4,text:["파이 장인의 파이 하나가 사라졌다.","발자국은 시장 안쪽으로 이어진다.","주변 사람들에게 물어보니 아이가 들고 간 것 같다.","결국 배고픈 아이에게 나눠 준 것으로 밝혀졌다."]},
{id:"S2",area:"district",title:"빈집의 따뜻한 컵",steps:5,text:["사람이 없는 집에 따뜻한 컵이 놓여 있다.","주민에게 물어보니 집주인은 가끔 들른다고 한다.","창문에는 최근 닦은 흔적이 있다.","집 안의 물건을 정리해 주기로 한다.","다음 방문 때는 깨끗한 집이 되어 있다."]},
{id:"S3",area:"station",title:"역무실의 부탁",steps:6,text:["역무원이 오래된 물품을 찾아 달라고 부탁한다.","승강장 근처에서 상자를 발견한다.","상자 안에는 사용 가능한 부품이 있다.","역무실 장부와 물품 번호를 대조한다.","필요한 물건을 역무원에게 건넨다.","다음 방문부터 작은 할인 혜택을 받는다."]},
{id:"S4",area:"hospital",title:"병원의 물품 정리",steps:5,text:["수중 병원에 새 물품이 들어왔다.","직원은 보관실 정리를 부탁한다.","오래된 상자와 새 상자를 구분한다.","필요한 물건을 찾는다.","정리가 끝나고 병원에서 작은 보상을 준다."]},
{id:"S5",area:"theater",title:"극장 정리",steps:7,text:["극장 관리인이 오래된 상영관을 정리하고 있다.","좌석 사이에서 표 한 장을 찾는다.","무대 뒤의 상자도 확인한다.","사용 가능한 장식품을 골라낸다.","영사실의 먼지를 닦는다.","관리인이 다음 상영 준비를 시작한다.","극장은 다시 사람을 맞을 준비를 한다."]},
{id:"S6",area:"canal",title:"빨간 우체통",steps:5,text:["수중 우체통에 이름 없는 편지가 들어 있다.","우편물을 확인한다.","주소가 번져 있어 주변을 살핀다.","배달할 곳을 찾아낸다.","편지를 전달하고 하루를 마친다."]}
];

const RANDOM=[
["시장 소동","상인 둘이 같은 물건을 서로 자기 것이라 주장한다.","market"],
["수위 상승","운하 수위가 올라 평소 못 가던 계단이 드러난다.","canal"],
["정전","도시 일부의 불이 꺼지고 주민들이 촛불을 켠다.","district"],
["낯선 파이","시장에 누구도 주문하지 않은 파이가 하나 놓였다.","market"],
["젖은 편지","선착장 우편함에 이름 없는 편지가 들어왔다.","pier"],
["옥상의 노래","구주거구 옥상에서 누군가 악기를 연주한다.","district"],
["온실의 발자국","온실에 누군가 다녀간 흔적이 생겼다.","greenhouse"],
["관측소 경보","수위 관측소에서 점검 경보가 울린다.","observatory"],
["저택의 손님","현관에 도시 주민이 잠시 들렀다.","estate"],
["변이동물의 장난","집에 돌아오니 변이동물이 물건 하나를 물고 있다.","estate"]
];

function mk(code){return{
code,day:1,min:510,chapter:1,score:0,progress:0,objective:MAIN[0].goal,players:new Map(),
side:Object.fromEntries(SIDE.map(x=>[x.id,{step:0,done:false}])),
flags:{},event:null,log:[],stats:{discoveries:0,talks:0,events:0,quests:0,days:1},choiceState:{current:null,history:[]},mansionState:{room:'hall',day:1,time:8,home_clean:5,house_condition:5,water:5,food:5,fuel:5,materials:3,parts:0,knowledge:0,relationship:0,energy:6,hunger:6,prepared:0,unlocks:[]},inventory:[],saveVersion:22,
world:{marketTrust:0,stationPower:0,hospitalTrust:0,theaterPower:0,waterLevel:0,doorProgress:0,
history:[],ending:null,opened:{estate:true,market:true,pier:true,canal:true,district:true,archive:false,station:false,hospital:false,theater:false,deep:false,oldtown:false,greenhouse:false,observatory:false,archive2:false,salon:true}},
choices:{},combos:[],achievements:[],dailySeed:0,scene:null,sceneHistory:[],spotVisits:{}}}
function player(id,name,role){return{id,name:(name||"플레이어").slice(0,12),role,loc:"estate",energy:100,hunger:10,warmth:100,actions:10,money:30,items:role==="A"?["낡은 열쇠","방수노트"]:["작은 손전등"],clues:[],shared:[],rel:{},completed:[]}}
const rooms=new Map();
function me(r,id){return r?.players.get(id)}
function log(r,t,k="normal"){r.log.push({t,k});if(r.log.length>100)r.log.shift()}
function hour(r){return`${String(Math.floor(r.min/60)).padStart(2,"0")}:${String(r.min%60).padStart(2,"0")}`}
function advance(r,n=20){r.min+=n;if(r.min>=1440){r.min-=1440;r.day++;r.flags.freeplay=true;for(const p of r.players.values()){p.actions=10;p.energy=Math.min(100,p.energy+35);p.hunger=Math.max(0,p.hunger-12);p.warmth=100}newEvent(r);log(r,`DAY ${r.day}. 도시가 새로운 하루를 시작했다.`,"day")}if(r.min>=1320&&!r.flags.night){r.flags.night=true;log(r,"밤이 되었다. 폐역과 극장에서 특별한 사건이 발생할 수 있다.","night")}if(r.min<1320)r.flags.night=false}
function newEvent(r){let x=RANDOM[Math.floor(Math.random()*RANDOM.length)];r.event={title:x[0],text:x[1],area:x[2],day:r.day,used:false};r.stats.events++}
function pub(r){return{code:r.code,day:r.day,time:hour(r),chapter:r.chapter,objective:r.objective,night:!!r.flags.night,event:r.event,scene:r.scene,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,role:p.role,loc:p.loc,energy:p.energy,hunger:p.hunger,warmth:p.warmth,actions:p.actions,money:p.money,items:p.items,clues:p.clues,shared:p.shared,rel:p.rel,completed:p.completed,minigame:p.minigame||null})),side:r.side,stats:r.stats,log:r.log.slice(-70),flags:r.flags,world:r.world,choices:r.choices,achievements:r.achievements,mansionState:r.mansionState,currentSpace:r.currentSpace||null,spaceStates:r.spaceStates||{},life:r.life||null}}
function maybeMain(r){let current=MAIN[r.progress];if(!current)return;if(r.score>=current.need&&r.progress<MAIN.length){r.objective=current.goal;if(r.chapter<current.ch)r.chapter=current.ch;}}
function clue(r,p,text,area,kind="clue"){p.clues.push({text,area,day:r.day,kind});r.score++;r.stats.discoveries++;maybeMain(r)}
function randomLine(p,loc,spot){const m={
"estate:온실":"온실의 식물이 오늘은 유난히 싱싱하다.","estate:서재":"도시 지도를 펼치니 새로운 골목 하나가 눈에 들어온다.","estate:현관":"현관에 물기가 남아 있다. 누군가 방금 돌아온 모양이다.",
"market:파이 가게":"갓 구운 파이 냄새가 골목까지 퍼진다.","market:골동품상":"상인이 오래된 생활용품을 정리하고 있다.","market:수로 계단":"사람들이 계단을 오르내리며 수로를 건넌다.",
"pier:계류 밧줄":"배 한 척이 새로 묶여 있다.","pier:발자국":"젖은 발자국이 선착장 끝까지 이어진다.","pier:수면":"잔물결 사이로 작은 물고기가 지나간다.",
"canal:우체통":"오늘 배달할 우편물이 몇 통 들어 있다.","canal:유리창":"수중 생활권의 불빛이 유리 너머로 보인다.","canal:잠긴 문":"문은 잠겨 있지만 관리용 표지가 붙어 있다.",
"archive:열람실":"도시의 오래된 생활 기록이 정리되어 있다.","archive:금고":"보관 물품 목록이 가지런히 적혀 있다.","archive:금지서고":"오래된 지도와 생활 문서가 쌓여 있다.",
"station:승강장":"오늘도 승강장에는 오래된 안내판이 서 있다.","station:역무실":"역무원이 시간을 확인하고 있다.","station:13분 늦은 시계":"시계가 조금 늦지만 아직 작동한다.",
"district:빈 집":"사람이 드나든 흔적이 남아 있다.","district:세탁소":"세탁소 주인이 젖은 옷을 정리한다.","district:옥상":"옥상에서 수면 위와 아래의 생활권이 한눈에 보인다.",
"hospital:접수실":"오늘도 수중 생활권의 주민들이 오간다.","hospital:수중 병실":"병실 창문 너머로 물고기 떼가 지나간다.","hospital:기록실":"환자와 시설 기록이 날짜순으로 정리되어 있다.",
"theater:매표소":"다음 상영을 준비하는 안내지가 붙어 있다.","theater:무대":"무대 위 장식이 조금 기울어 있다.","theater:영사실":"관리인이 영사기를 점검하고 있다.",
"deep:잠수엘리베이터":"수중 통로로 내려가는 오래된 승강기가 있다.","deep:수문":"수문 관리 장치가 작동 중이다.","deep:검은 계단":"계단 아래에서 물 흐르는 소리가 난다."};return m[`${loc}:${spot}`]||`${spot} 주변을 살펴보았다.`}
function sideAdvance(r,p){for(const q of SIDE){let st=r.side[q.id];if(st.done||p.loc!==q.area)continue;if(st.step<q.steps&&p.actions>0){st.step++;p.actions--;advance(r);let t=q.text[st.step-1];clue(r,p,`${q.title} · ${t}`,q.area,"side");log(r,`${q.title} ${st.step}/${q.steps} · ${t}`,"quest");if(st.step===q.steps){st.done=true;r.stats.quests++;p.money+=15;log(r,`${q.title} 사건이 해결되었다. 보상 15c.`,"reward")}}}}

function canEnter(r,to){
  if(r.world.opened[to]) return true;
  if(to==="archive") return r.score>=8;
  if(to==="station") return r.score>=14 || r.world.stationPower>=1;
  if(to==="hospital") return r.score>=22 || r.world.hospitalTrust>=2;
  if(to==="theater") return r.score>=32 || r.world.theaterPower>=1;
  if(to==="deep") return r.world.doorProgress>=2 || (r.players.size>=2 && r.score>=40);
  if(to==="oldtown") return r.score>=10;
  if(to==="greenhouse") return r.world.waterLevel<=1 || r.score>=24;
  if(to==="observatory") return r.score>=18 || r.world.stationPower>=1;
  if(to==="archive2") return r.score>=28 && r.world.doorProgress>=1;
  return false;
}
function achievement(r,id,label){if(!r.achievements.includes(id)){r.achievements.push(id);log(r,`ACHIEVEMENT · ${label}`,"achievement")}}
function choiceWorld(r,id,val){
  r.choices[id]=val;r.world.history.push({day:r.day,id,val});
  if(id==="market_fire") r.world.marketTrust += val==="help"?2:val==="ignore"?-1:0;
  if(id==="station_clock") r.world.stationPower += val==="repair"?2:val==="break"?-1:0;
  if(id==="hospital_patient") r.world.hospitalTrust += val==="believe"?2:val==="report"?1:-1;
  if(id==="theater_film") r.world.theaterPower += val==="watch"?2:val==="burn"?-2:0;
  if(id==="water_gate") r.world.doorProgress += val==="turn"?1:val==="wait"?0:0;
  if(r.world.marketTrust>=2) r.world.opened.district=true;
  if(r.world.stationPower>=2) r.world.opened.station=true;
  if(r.world.hospitalTrust>=2) r.world.opened.hospital=true;
  if(r.world.theaterPower>=2) r.world.opened.theater=true;
  if(r.world.doorProgress>=2) r.world.opened.deep=true;
}
function combine(r,p){
  const all=r.players.size?Array.from(r.players.values()).flatMap(x=>x.clues):p.clues;
  const texts=all.map(x=>x.text);
  const has=(s)=>texts.some(t=>t.includes(s));
  if(has("생활번호")&&has("두 개의 손바닥")){r.world.doorProgress=Math.max(r.world.doorProgress,1);achievement(r,"combo생활번호","생활번호 + 손바닥 자국")}
  if(has("13분")&&has("없는 사람")){r.world.stationPower=Math.max(r.world.stationPower,1);achievement(r,"combo13","13분 + 없는 사람")}
  if(has("수중 병실")&&has("필름")){r.world.hospitalTrust=Math.max(r.world.hospitalTrust,1);achievement(r,"combo17","수중 병실 + 필름")}
  if(has("종소리")&&has("수문")){r.world.doorProgress=Math.max(r.world.doorProgress,1);achievement(r,"comboBell","종소리 + 수문")}
  if(r.world.doorProgress>=2) r.world.opened.deep=true;
}


const REGIONS_EXTRA={
 oldtown:{name:"구시가지",desc:"오래된 상점과 골목이 겹쳐진 생활권",spots:["시계 수리점","빈 극장표 가게","벽화 골목"],npcs:["MARA"]},
 greenhouse:{name:"유리온실",desc:"도시의 수위가 낮을 때만 입구가 드러나는 온실",spots:["말라붙은 연못","유리 천장","씨앗 보관함"],npcs:["LUNE"]},
 observatory:{name:"수문 관측소",desc:"도시 전체의 수위와 종소리를 기록하는 곳",spots:["수위계","낡은 망원경","기록실"],npcs:["ORIN"]},
 archive2:{name:"생활 기록 서고",desc:"오래된 생활 기록과 지도 사본이 쌓이는 서고",spots:["봉인 서랍","오래된 기록","열람대"],npcs:["VEIL"]}
};
function extendedMap(){
 A.oldtown={name:"구시가지",links:["market","district","greenhouse"],spots:REGIONS_EXTRA.oldtown.spots};
 A.greenhouse={name:"유리온실",links:["oldtown","observatory"],spots:REGIONS_EXTRA.greenhouse.spots};
 A.observatory={name:"수문 관측소",links:["greenhouse","station","archive2"],spots:REGIONS_EXTRA.observatory.spots};
 A.archive2={name:"생활 기록 서고",links:["observatory","archive"],spots:REGIONS_EXTRA.archive2.spots};
}
extendedMap();
const NPC_EXTRA={
 MARA:{name:"마라",area:"oldtown",mood:"까칠하지만 도시 생활에 익숙하다",lines:["어제와 오늘의 골목이 다르다는 걸 눈치챘어?","사라진 사람보다 오래된 기록을 잘 살펴봐야 해.","시계는 시간을 알려주는 게 아니라 틀린 시간을 숨기는 물건이야."],gift:"오래된 회중시계"},
 LUNE:{name:"룬",area:"greenhouse",mood:"조용하고 관찰력이 뛰어나다",lines:["식물은 물과 빛을 먹고 자라.","온실 바닥에 계절마다 자라는 식물이 달라.","씨앗 보관함을 열면 씨앗을 심으면 새로운 잎이 난다는 소문이 있어."],gift:"유리 씨앗"},
 ORIN:{name:"오린",area:"observatory",mood:"숫자와 기록을 믿는다",lines:["수위는 매일 정확히 오르내리지 않아.","13분의 오차는 기계 고장이 아니라 도시의 습관이야.","종이 세 번 울린 날엔 지도에서 한 구역이 사라졌어."],gift:"수위 기록표"},
 VEIL:{name:"베일",area:"archive2",mood:"말을 아끼며 정보를 교환한다",lines:["오래된 기록도 직접 확인하는 게 좋아.","생활 기록은 필요한 사람에게 공개할 수 있어.","찾는 물건이 있으면 목록부터 확인해 봐."],gift:"오래된 기록 조각"}
};
const SIDE_EXTRA=[
{id:"clockwork",title:"멈춘 시계",area:"oldtown",goal:"구시가지 시계 수리점에서 3개의 시계를 비교하라",reward:15},
{id:"glassseed",title:"유리 씨앗",area:"greenhouse",goal:"유리온실의 씨앗 보관함을 조사하라",reward:18},
{id:"waterchart",title:"수위의 거짓말",area:"observatory",goal:"수문 관측소의 기록과 현재 수위를 비교하라",reward:20},
{id:"ownerless",title:"오래된 생활 기록",area:"archive2",goal:"생활 기록 서고에서 소유자가 없는 기록을 찾아라",reward:25}
];
const DAILY_EXTRA=[
["초승달 우편","pier","누군가 수로 우편함에 이름 없는 편지를 넣었다."],
["시장 경매","market","상인이 오래된 열쇠 하나를 경매에 내놓았다."],
["빈 의자","district","어제까지 있던 의자가 사라지고 그 자리에 사진이 놓였다."],
["반복되는 방송","station","폐역 방송이 같은 문장을 13분 간격으로 반복한다."],
["젖은 필름","theater","극장 입구에 비에 젖은 필름 조각이 떨어져 있다."],
["온실의 발자국","greenhouse","아무도 들어갈 수 없었던 온실에 발자국이 생겼다."],
["시계가 늦은 날","oldtown","구시가지의 모든 시계가 서로 다른 시간을 가리킨다."],
["관측소 경보","observatory","수위 관측소에서 존재하지 않는 홍수 경보가 울린다."]
];


const CHOICE_TREE = {
  pier_letter:{title:"이름 없는 편지",text:"선착장 우편함 안에 젖은 편지가 있다.",choices:[
    {id:"read",text:"편지를 읽는다",effects:{flags:{letter_read:true},score:2},next:"pier_letter_read"},
    {id:"deliver",text:"주소를 찾아 배달한다",effects:{flags:{letter_delivered:true},money:4},next:null},
    {id:"keep",text:"편지를 보관한다",effects:{flags:{letter_kept:true},items:["젖은 편지"]},next:null}
  ]},
  pier_letter_read:{title:"편지 속 부탁",text:"편지는 수로 건너편 가게에 작은 물건을 전해 달라는 부탁이다.",choices:[
    {id:"accept",text:"부탁을 받아들인다",effects:{flags:{delivery_accept:true},score:3},next:"delivery_done"},
    {id:"decline",text:"정중히 거절한다",effects:{flags:{delivery_decline:true},score:1},next:null}
  ]},
  delivery_done:{title:"작은 심부름",text:"가게에 물건을 전달했다. 주인은 고맙다며 간식을 건넨다.",choices:[
    {id:"take",text:"간식을 받는다",effects:{items:["작은 간식"],score:2},next:null},
    {id:"decline",text:"사양한다",effects:{flags:{gift_declined:true},score:1},next:null}
  ]}
};

const SIDE_CHOICE_TREES = {
  greenhouse_seed:{title:"온실의 씨앗",text:"온실의 씨앗 보관함에서 새 씨앗을 발견했다.",choices:[
    {id:"plant",text:"온실에 심는다",effects:{flags:{seed_planted:true},score:4},next:null},
    {id:"save",text:"보관한다",effects:{items:["새 씨앗"],score:2},next:null},
    {id:"give",text:"아이들에게 보여준다",effects:{flags:{seed_shared:true},relationship:1},next:null}
  ]},
  observatory_water:{title:"수위 기록",text:"관측소 기록과 실제 수위가 조금 다르다.",choices:[
    {id:"correct",text:"기록을 바로잡는다",effects:{flags:{water_corrected:true},score:4},next:null},
    {id:"note",text:"차이를 메모한다",effects:{items:["수위 기록표"],score:2},next:null},
    {id:"leave",text:"そのまま 두고 나온다",effects:{flags:{water_left:true},score:1},next:null}
  ]},
  archive_ownerless:{title:"오래된 기록",text:"기록보관소의 봉인 서랍에서 낡은 생활 기록을 발견했다.",choices:[
    {id:"open",text:"기록을 읽는다",effects:{flags:{archive_opened:true},score:5},next:"archive_after"},
    {id:"report",text:"관리자에게 알린다",effects:{flags:{archive_reported:true},score:3},next:null},
    {id:"seal",text:"다시 봉인한다",effects:{flags:{archive_resealed:true},score:2},next:null}
  ]},
  archive_after:{title:"오래된 생활 기록",text:"기록에는 수몰 도시에서 살아가던 사람들의 평범한 하루가 남아 있다.",choices:[
    {id:"copy",text:"필요한 부분을 옮겨 적는다",effects:{items:["생활 기록 사본"],score:4},next:null},
    {id:"close",text:"책을 닫는다",effects:{flags:{archive_closed:true}},next:null}
  ]}
};

const CROSS_WORLD_TREES = {};

const MANSION_ROOMS = {
hall:{name:"현관 홀",floor:"1F",desc:"낡은 석조 현관. 도시에서 돌아오면 가장 먼저 지나게 되는 곳.",actions:["clean","inspect"]},
kitchen:{name:"주방",floor:"1F",desc:"큰 조리대와 오래된 저장고가 있다.",actions:["cook","clean","repair"]},
dining:{name:"식당",floor:"1F",desc:"긴 식탁이 놓인 방. 창밖으로 수면 위 도시가 보인다.",actions:["eat","talk"]},
living:{name:"거실",floor:"1F",desc:"가족이 가장 오래 머무는 공간.",actions:["talk","rest","clean"]},
laundry:{name:"세탁실",floor:"1F",desc:"빗물과 지하수를 이용하는 오래된 세탁 설비.",actions:["wash","repair"]},
storage:{name:"창고",floor:"1F",desc:"도시에서 가져온 물건과 생활 자원을 보관한다.",actions:["sort","inspect"]},
greenhouse:{name:"온실",floor:"1F",desc:"깨진 유리 사이로 물가 식물이 자라는 온실.",actions:["plant","water","inspect"]},
dock:{name:"실내 선착장",floor:"1F",desc:"저택 뒤쪽 수로와 직접 연결된 작은 선착장.",actions:["prepare_trip","fish"]},
kids_a:{name:"아이 A의 방",floor:"2F",desc:"아이가 모아온 작은 물건들로 가득하다.",actions:["talk","clean","inspect"]},
kids_b:{name:"아이 B의 방",floor:"2F",desc:"책과 지도, 오래된 장난감이 놓여 있다.",actions:["talk","clean","inspect"]},
study:{name:"공동 서재",floor:"2F",desc:"도시의 지도와 저택의 오래된 기록을 함께 보관한다.",actions:["read","sort","inspect"]},
bedroom:{name:"옛 주인 침실",floor:"2F",desc:"아직 사용하지 않는 방. 오래된 가구가 그대로 남아 있다.",actions:["inspect"]},
guest:{name:"손님방",floor:"2F",desc:"필요할 때 잠시 쉴 수 있는 방.",actions:["rest","clean"]},
attic:{name:"다락",floor:"3F",desc:"아직 정리되지 않은 상자와 가구가 쌓여 있다.",actions:["inspect","sort"]},
archive:{name:"옛 주인 서재",floor:"3F",desc:"도시와 저택에 관한 문서가 남아 있다.",actions:["read","inspect"]},
music:{name:"음악실",floor:"3F",desc:"물에 젖지 않은 악기들이 이상할 정도로 잘 보존되어 있다.",actions:["play","inspect"]},
boiler:{name:"보일러실",floor:"B1",desc:"난방과 온수의 핵심.",actions:["repair","fuel"]},
water:{name:"물 저장고",floor:"B1",desc:"수면 아래에서 들어오는 물을 저장하고 정화한다.",actions:["purify","inspect"]},
workshop:{name:"수리실",floor:"B1",desc:"도시에서 가져온 부품을 수리할 수 있는 작업장.",actions:["repair","craft"]},
basement:{name:"지하 저장고",floor:"B2",desc:"절반이 물에 잠겨 있다. 방수 구조 덕분에 내부는 놀라울 정도로 보존되어 있다.",actions:["inspect","dive"]},
underwater:{name:"수중 복도",floor:"B2",desc:"저택 아래를 가로지르는 오래된 복도.",actions:["dive","inspect"]},
garden_b:{name:"지하 정원",floor:"B2",desc:"수면 아래에서도 살아가는 식물이 자라는 공간.",actions:["plant","inspect"]}
};
const MANSION_ACTIONS = {
clean:{label:"청소하기",effects:{home_clean:2,time:1},text:"먼지를 걷어냈다."},
cook:{label:"요리하기",effects:{food:2,time:1},text:"간단한 식사를 준비했다."},
eat:{label:"함께 식사하기",effects:{hunger:3,relationship:1,time:1},text:"식탁에 둘러앉아 식사를 했다."},
talk:{label:"이야기하기",effects:{relationship:2,time:1},text:"별것 아닌 이야기를 오래 나눴다."},
rest:{label:"쉬기",effects:{energy:3,time:2},text:"잠깐 몸을 쉬게 했다."},
repair:{label:"수리하기",effects:{house_condition:2,time:2},text:"망가진 설비를 손봤다."},
wash:{label:"빨래하기",effects:{home_clean:1,time:1},text:"빨래를 널었다."},
sort:{label:"정리하기",effects:{home_clean:1,time:1},text:"물건들을 정리했다."},
inspect:{label:"둘러보기",effects:{discover:1,time:1},text:"공간을 천천히 살펴봤다."},
plant:{label:"식물 돌보기",effects:{home_clean:1,time:1},text:"식물을 돌봤다."},
water:{label:"물 주기",effects:{home_clean:1,time:1},text:"온실에 물을 줬다."},
prepare_trip:{label:"원정 준비",effects:{prepared:1,time:1},text:"가방과 동물용 장비를 점검했다."},
fish:{label:"낚시하기",effects:{food:2,time:2},text:"수로에서 먹을 것을 건졌다."},
read:{label:"기록 읽기",effects:{knowledge:2,time:1},text:"오래된 기록을 읽었다."},
play:{label:"악기 연주하기",effects:{relationship:1,energy:1,time:1},text:"낡은 악기의 음을 맞춰 보았다."},
fuel:{label:"연료 보충",effects:{fuel:2,time:1},text:"보일러에 연료를 넣었다."},
purify:{label:"물 정화",effects:{water:3,time:1},text:"저장된 물을 정화했다."},
craft:{label:"부품 만들기",effects:{materials:-1,parts:1,time:2},text:"남은 재료로 부품을 만들었다."},
dive:{label:"잠수해서 조사",effects:{knowledge:2,time:2},text:"물속 복도를 조사했다."}
};


const MANSION_EVENT_COUNT = 6;
const MANSION_EVENTS = {
  kitchen_morning:{
    room:"kitchen",title:"아침의 부엌",
    text:"아침이 되자 주방 창문에 물방울이 잔뜩 맺혀 있다. 아이 A가 창밖을 보다가 작은 배 한 척을 가리킨다.",
    choices:[
      {id:"look",text:"같이 창밖을 본다",effects:{relationship:1,knowledge:1}},
      {id:"cook",text:"아침부터 배부터 챙긴다",effects:{food:1,relationship:1}},
      {id:"ask",text:"무슨 배인지 물어본다",effects:{knowledge:2}}
    ]
  },
  greenhouse_sprout:{
    room:"greenhouse",title:"유리 너머의 싹",
    text:"며칠 전에는 없었던 투명한 싹이 화분 가장자리에서 자라고 있다. 물속에 있을 때보다 수면 위에서 더 빠르게 움직이는 것 같다.",
    choices:[
      {id:"water",text:"물을 준다",effects:{home_clean:1,knowledge:1,flags:{sprout_watered:true}}},
      {id:"observe",text:"건드리지 않고 관찰한다",effects:{knowledge:2,flags:{sprout_observed:true}}},
      {id:"move",text:"창가로 옮긴다",effects:{knowledge:1,house_condition:-1,flags:{sprout_moved:true}}}
    ]
  },
  basement_echo:{
    room:"basement",title:"지하의 두드리는 소리",
    text:"물에 잠긴 저장고에서 세 번, 잠시 뒤 두 번. 일정한 간격으로 벽을 두드리는 소리가 들린다.",
    choices:[
      {id:"answer",text:"벽을 두드려 답한다",effects:{knowledge:3,flags:{basement_answered:true}}},
      {id:"wait",text:"조용히 기다린다",effects:{knowledge:1,flags:{basement_waited:true}}},
      {id:"leave",text:"오늘은 돌아간다",effects:{energy:1}}
    ]
  },
  kids_rain:{
    room:"kids_a",title:"비 오는 날",
    text:"비가 오래 내린다. 아이 A가 오늘은 도시로 나가지 말고 집 안에서 놀자고 한다.",
    choices:[
      {id:"game",text:"같이 놀아준다",effects:{relationship:3,energy:-1}},
      {id:"story",text:"옛 저택 이야기를 들려준다",effects:{relationship:2,knowledge:1}},
      {id:"work",text:"할 일을 끝내고 놀자고 한다",effects:{house_condition:1,relationship:1}}
    ]
  },
  attic_box:{
    room:"attic",title:"다락의 상자",
    text:"정리하지 않은 상자 하나가 스스로 조금 열려 있다. 안에는 오래된 학교 표찰과 작은 나무 호루라기가 있다.",
    choices:[
      {id:"open",text:"상자를 전부 연다",effects:{knowledge:2,flags:{old_box_opened:true}}},
      {id:"whistle",text:"호루라기를 불어본다",effects:{relationship:1,flags:{whistle_blown:true}}},
      {id:"close",text:"다시 닫아둔다",effects:{house_condition:1}}
    ]
  },
  study_map:{
    room:"study",title:"지도 위의 빈칸",
    text:"공동 서재의 지도에서 저택 뒤쪽 수로 한 구간만 잉크가 번져 있다. 도시 지도와 맞춰보면 이상하게도 비어 있는 장소다.",
    choices:[
      {id:"mark",text:"그 위치를 표시한다",effects:{knowledge:2,flags:{map_marked:true}}},
      {id:"compare",text:"도시에서 가져온 지도와 비교한다",effects:{knowledge:3,flags:{map_compared:true}}},
      {id:"ignore",text:"지금은 덮어둔다",effects:{energy:1}}
    ]
  }
};

const SCENE_SPOTS={
"estate:온실":["유리 온실의 숨","물방울이 유리 안쪽에서 위로 흐른다. 작은 잎 하나가 움직임을 따라 기울어진다."],"estate:서재":["두 개의 이름","같은 날짜에 서로 다른 필체로 같은 방 번호가 두 번 적혀 있다."],"estate:현관":["젖지 않은 발자국","현관은 젖어 있는데 발자국 하나만 마른 채 남아 있다."],"market:파이 가게":["오늘의 파이","파이 안쪽에서 종이 같은 것이 비친다."],"market:골동품상":["유리병 생활번호","선반 가장 안쪽의 병 하나에 생활번호이 적혀 있다."],"market:수로 계단":["수로 아래의 흔적","물이 빠진 순간 커다란 발자국과 작은 발자국이 함께 드러난다."],"pier:계류 밧줄":["새 매듭","세 개의 밧줄 중 붉은 매듭만 최근에 묶인 흔적이 있다."],"pier:발자국":["물가의 발자국","젖은 발자국이 선착장 끝에서 물속으로 이어진다."],"canal:우체통":["둘이서 읽는 편지","봉투에는 '혼자 읽지 말 것'이라고 적혀 있다."],"canal:유리창":["유리 너머의 방","비어 있어야 할 수로 벽 안쪽에 누군가 책상에 앉아 있다."],"canal:잠긴 문":["두 개의 손바닥","잠긴 문에는 손바닥 두 개를 동시에 댄 흔적이 있다."],"archive:열람실":["지워진 17번","옛 지도에는 17번 수로가 존재하지만 현재 지도에서는 지워져 있다."],"archive:금고":["두 개의 손","금고에는 두 개의 손바닥 자국이 있다."],"archive:금지서고":["없는 사람","삭제된 이름들이 모인 서고 한가운데 깨끗한 책 한 권이 놓여 있다."],"station:승강장":["도착하지 않은 열차","선로 끝에서 빛이 보이는데 열차 소리는 없다."],"station:역무실":["13분 늦은 시계","시계 뒤에는 누군가 매일 시간을 고쳐 적은 흔적이 있다."],"station:13분 늦은 시계":["시계 안의 하루","시계판 안쪽에서 아주 작은 종이 한 장이 발견된다."],"district:빈 집":["따뜻한 컵","아무도 살지 않는 집인데 컵 하나가 아직 따뜻하다."],"district:세탁소":["돌아온 옷","세탁소 주인이 이미 죽은 사람의 젖은 외투를 보여준다."],"district:옥상":["도시가 한 줄로 보이는 곳","옥상에서는 수면 위와 아래의 수로가 하나의 선처럼 이어져 보인다."],"hospital:수중 병실":["내 것이 아닌 하루","환자가 지난 하루의 날씨를 이야기한다."],"theater:영사실":["아직 오지 않은 영화","필름 속에는 지금과 닮은 도시가 찍혀 있고 사람들의 위치가 어긋나 있다."],"deep:수문":["두 사람의 문","수문에는 두 개의 손바닥 자국이 있다. 하나를 누르면 반대편 불빛이 켜진다."]};
function sceneFor(loc,spot,r,p){
  const key=`${loc}:${spot}`;
  const v=(r.spotVisits[key]||0)+1;
  const custom={
    "estate:온실":()=>{
      if(!r.flags.greenhouse_window){return {title:"유리 온실의 숨",text:"물방울이 유리 안쪽에서 위로 흐른다. 창문 틈에서는 바깥 수로의 냄새가 난다.",choices:[
        {id:"window",label:"창문을 연다",result:"수로에 젖지 않은 발자국 하나가 보인다.",clue:"온실에서 발견한 젖지 않은 발자국",knowledge:2,flag:"greenhouse_window",next:{title:"수로의 발자국",text:"발자국은 물가에서 멈추지 않고 수로 쪽으로 이어진다. 누군가 일부러 물을 피하고 걸은 것 같다.",choices:[
          {id:"follow",label:"발자국을 따라간다",result:"저택 뒤쪽 수로로 이어지는 길을 표시했다.",clue:"온실 뒤 수로로 이어지는 발자국",flag:"greenhouse_trail",knowledge:2},
          {id:"mark",label:"위치만 기록한다",result:"다음 방문 때 비교할 수 있도록 기록했다.",clue:"온실 발자국 위치 기록",knowledge:1},
          {id:"hide",label:"아이들에게는 말하지 않는다",result:"이상한 흔적을 혼자 간직했다.",flag:"greenhouse_secret",knowledge:1}
        ]}},
        {id:"leaf",label:"움직이는 잎을 만진다",result:"잎맥 안에서 작은 청동 조각을 발견했다.",item:"청동 태그 생활번호",clue:"온실에서 발견한 생활번호 태그",knowledge:2,flag:"tag_생활번호"},
        {id:"wait",label:"아무것도 건드리지 않고 기다린다",result:"세 번의 물방울 소리가 들린 뒤 온실이 조용해졌다.",clue:"온실에서 들은 세 번의 물방울",knowledge:1,flag:"greenhouse_wait"}
      ]}}
      if(r.flags.greenhouse_window && !r.flags.greenhouse_trail){return {title:"변한 발자국",text:"어제의 발자국과 오늘의 발자국 위치가 다르다. 누군가 이 길을 계속 사용하고 있다.",choices:[{id:"follow",label:"이번에는 따라간다",result:"수로 계단까지 이어지는 길을 찾아냈다.",clue:"반복해서 이동하는 발자국",knowledge:2,flag:"greenhouse_trail"},{id:"compare",label:"어제 기록과 비교한다",result:"발자국이 매일 몇 걸음씩 저택 쪽으로 이동한다.",clue:"발자국 이동 패턴",knowledge:3},{id:"ignore",label:"그냥 지나친다",result:"오늘은 기록만 남겼다.",knowledge:1}]};}
      return {title:"온실의 변화",text:"처음 보았던 잎들이 방향을 바꿨다. 바깥 수로 쪽을 향하고 있다.",choices:[{id:"water",label:"잎이 향하는 곳으로 물을 흘려본다",result:"작은 배수구가 열리며 지하로 내려가는 소리가 난다.",flag:"greenhouse_drain",knowledge:2},{id:"cut",label:"잎을 잘라 보관한다",result:"잎 안쪽에 같은 청동색 글씨가 나타났다.",item:"기록 잎사귀",knowledge:2},{id:"leave",label:"오늘은 두고 간다",result:"온실은 다시 조용해졌다.",energy:1}]};
    },
    "estate:서재":()=>{
      if(!r.flags.study_names){return {title:"두 개의 이름",text:"같은 날짜, 같은 방 번호에 서로 다른 이름이 적혀 있다. 둘 중 하나는 기록에서 지워졌다.",choices:[{id:"compare",label:"두 이름을 다른 기록과 대조한다",result:"한 이름이 생활번호이라는 번호와 반복해서 연결된다.",clue:"두 이름과 생활번호의 연관",knowledge:3,flag:"study_names"},{id:"ask",label:"아이들에게 묻는다",result:"아이 A는 그 이름을 들어본 적이 없다고 말한다.",clue:"아이 A가 본 적 없는 이름",knowledge:2,relationship:1,flag:"study_asked"},{id:"close",label:"장부를 덮는다",result:"페이지 모서리에 젖은 손자국이 남았다.",clue:"서재 장부의 젖은 손자국",knowledge:1,flag:"study_hand"}]};}
      return {title:"비어 있는 자리",text:"처음에는 없었던 빈 칸에 오늘 날짜가 적혀 있다. 잉크는 아직 마르지 않았다.",choices:[{id:"write",label:"빈 칸에 오늘의 이름을 적는다",result:"글자가 잠시 나타났다가 사라졌다.",flag:"study_written",knowledge:2},{id:"wait",label:"잉크가 마르는 것을 기다린다",result:"사라진 글자 아래에 17이라는 숫자가 남았다.",clue:"서재에서 나타난 17",knowledge:2},{id:"remove",label:"페이지를 떼어낸다",result:"페이지 뒤쪽에서 수로 지도가 떨어졌다.",item:"찢어진 수로 지도",knowledge:3,flag:"study_page"}]};
    },
    "canal:우체통":()=>{
      if(!r.flags.letter_opened){return {title:"둘이서 읽는 편지",text:"봉투에는 '혼자 읽지 말 것'이라고 적혀 있다. 봉투가 이상하게 따뜻하다.",choices:[{id:"open",label:"혼자 열어본다",result:"첫 문장만 읽을 수 있었다. '네가 이것을 읽었다면 아직 늦지 않았다.'",clue:"우체통의 첫 문장",knowledge:2,flag:"letter_opened"},{id:"wait",label:"누군가와 함께 읽는다",result:"봉투 안쪽에 두 개의 손바닥 자국이 나타났다.",clue:"두 사람이 함께 읽어야 하는 편지",knowledge:3,flag:"letter_two"},{id:"take",label:"봉투를 집으로 가져간다",result:"봉투가 저택에 도착하자 글자가 한 줄 늘었다.",item:"이름 없는 편지",knowledge:2,flag:"letter_home"}]};}
      return {title:"두 번째 문장",text:"편지에는 오늘 발견한 단서가 정확히 적혀 있다. 마지막에는 아직 오지 않은 날짜가 쓰여 있다.",choices:[{id:"answer",label:"답장을 쓴다",result:"우체통 안에서 펜 끝이 움직이는 소리가 났다.",flag:"letter_answered",clue:"편지에 답장을 남겼다",knowledge:2},{id:"date",label:"날짜를 확인한다",result:"날짜는 13분 뒤의 시간을 가리킨다.",clue:"편지가 가리키는 13분",knowledge:3,flag:"letter_13"},{id:"burn",label:"편지를 태운다",result:"불은 꺼졌지만 재가 물속에서도 젖지 않았다.",clue:"젖지 않은 편지의 재",knowledge:2,flag:"letter_burned"}]};
    },
    "station:13분 늦은 시계":()=>{
      if(!r.flags.clock_opened){return {title:"시계 안의 하루",text:"시계판 안쪽에 아주 작은 종이가 접혀 있다. 시계는 정확히 13분 늦다.",choices:[{id:"open",label:"시계를 연다",result:"종이에는 '하루를 잃어버린 사람'이라고 적혀 있다.",clue:"시계 안쪽의 지난 하루 기록",knowledge:3,flag:"clock_opened"},{id:"repair",label:"13분을 바로잡는다",result:"도시의 다른 시계가 동시에 한 번 멈췄다.",flag:"clock_fixed",knowledge:2},{id:"listen",label:"시계 소리를 듣는다",result:"종이 대신 세 번의 종소리가 들린다.",clue:"시계 안에서 들린 세 번의 종소리",knowledge:2,flag:"clock_listened"}]};}
      return {title:"바뀐 시각",text:"시계가 이제 12분 늦다. 누군가 계속 시간을 수정하고 있다.",choices:[{id:"follow",label:"수정한 흔적을 따라간다",result:"역무실 뒤쪽의 잠긴 서랍을 찾았다.",flag:"station_drawer",knowledge:2},{id:"ask",label:"역무원에게 묻는다",result:"역무원은 '도착하지 않은 승객'을 이야기한다.",clue:"도착하지 않은 승객",knowledge:2,relationship:1},{id:"leave",label:"기록만 남긴다",result:"시간 변화 자체를 사건 기록에 남겼다.",clue:"12분 늦어진 시계",knowledge:1}]};
    }
  };
  if(custom[key]) return custom[key]();
  const [title,text]=SCENE_SPOTS[key]||[`잠깐 멈춰 선 ${spot}`,`${spot} 주변을 천천히 살핀다. 익숙한 풍경 속에 아직 이름 붙이지 못한 흔적이 있다.`];
  if(v===1)return {title,text,choices:[{id:"observe",label:"천천히 관찰한다",result:"눈에 띄지 않던 작은 흔적을 발견했다.",clue:`${spot}의 첫 관찰 기록`,knowledge:2},{id:"touch",label:"직접 만져본다",result:"손에 작은 감촉이 남았다. 다음 방문 때 비교할 수 있을 것 같다.",clue:`${spot}에서 느낀 이상한 감촉`,knowledge:1},{id:"mark",label:"위치를 표시한다",result:"다시 돌아올 이유를 남겼다.",flag:`marked_${loc}_${spot}`,knowledge:1}]};
  if(v===2)return {title:`다시 온 ${spot}`,text:`처음 왔을 때와 똑같아 보이지만 한 가지가 달라졌다. ${r.flags[`marked_${loc}_${spot}`]?"내가 남긴 표시도 움직여 있다.":"누군가 다녀간 흔적이 있다."}`,choices:[{id:"compare",label:"처음 기록과 비교한다",result:"변화가 실제로 일어났다는 것을 확인했다.",clue:`${spot}의 변화 비교`,knowledge:2,flag:`compared_${loc}_${spot}`},{id:"search",label:"변한 부분만 찾는다",result:"새로운 흔적을 하나 더 찾았다.",clue:`${spot}의 두 번째 흔적`,knowledge:2},{id:"wait",label:"아무것도 하지 않고 기다린다",result:"주변 소리가 달라졌다.",clue:`${spot}에서 들은 변화`,knowledge:1}]};
  return {title:`익숙해진 장소`,text:`여러 번 찾아온 덕분에 이제 ${spot}의 이상한 부분이 눈에 들어온다.`,choices:[{id:"deep",label:"더 깊이 살핀다",result:"숨겨진 연결을 발견했다.",clue:`${spot}의 숨겨진 연결`,knowledge:3,flag:`deep_${loc}_${spot}`},{id:"use",label:"가지고 있는 단서와 맞춰본다",result:"서로 다른 단서가 하나의 패턴을 만든다.",clue:`${spot}과 기존 단서의 연결`,knowledge:3},{id:"leave",label:"다음 방문을 준비한다",result:"다음에 확인할 점을 기록했다.",clue:`${spot} 재방문 메모`,knowledge:1}]};
}


const SPACE_STATES={theater:{label:"극장",stages:{quiet:{text:"문 닫힌 극장. 젖은 포스터 하나가 벽에 붙어 있다.",actions:["peel_poster","leave"]},poster:{text:"포스터 뒤에 공연 날짜가 적혀 있다. 날짜 아래에는 작은 파란 점이 있다.",actions:["remember_date","check_back","leave"]},screen:{text:"전광판에 방금 본 날짜가 떠 있다. 무대 뒤쪽의 작은 문이 열렸다.",actions:["enter_backstage","leave"]},backstage:{text:"무대 뒤에는 도시의 수로와 이어지는 낡은 문이 있다. 안쪽에서 물소리가 난다.",actions:["listen","open_water_door","leave"]}}},greenhouse:{label:"온실",stages:{quiet:{text:"유리 온실. 바닥에는 젖은 흙과 작은 화분들이 있다.",actions:["open_window","touch_plant","leave"]},footprint:{text:"창밖 수로에 젖지 않은 발자국 하나가 보인다.",actions:["follow_print","record_print","leave"]},trail:{text:"발자국은 선착장 쪽에서 끊긴다. 화분 밑에 젖은 단추가 있다.",actions:["take_button","leave"]}}},study:{label:"공동 서재",stages:{quiet:{text:"도시 지도와 저택 기록이 놓여 있다. 수로 하나가 잉크로 지워져 있다.",actions:["compare_maps","leave"]},marked:{text:"지워진 수로의 위치를 지도 위에 표시했다. 선착장과 연결된다.",actions:["visit_dock","leave"]},route:{text:"지도 위에 저택에서 선착장으로 이어지는 경로가 드러났다.",actions:["follow_route","leave"]}}},dock:{label:"실내 선착장",stages:{quiet:{text:"선착장은 조용하다. 수면에 작은 매듭 하나가 떠 있다.",actions:["pick_knot","look_water","leave"]},water:{text:"물결이 이상하게 안쪽으로 흐른다.",actions:["wait","dive","leave"]},trace:{text:"수중 벽에 작은 파란 점이 그려져 있다. 극장에서 본 표시와 같다.",actions:["connect_clue","leave"]}}}};
const SPACE_ACTIONS={peel_poster:["poster","포스터를 떼었다.",1,"theater_poster"],remember_date:["screen","공연 날짜를 기억했다.",1,"theater_date"],check_back:["screen","다시 살피자 전광판이 켜졌다.",0,"theater_screen"],enter_backstage:["backstage","무대 뒤로 들어갔다.",2,"theater_backstage"],listen:["backstage","문 너머의 물소리를 들었다.",1,"water_sound"],open_water_door:["backstage","수로 문을 열었다.",0,"water_door"],open_window:["footprint","창문을 열자 수로 쪽에 발자국이 보였다.",1,"greenhouse_window"],touch_plant:["quiet","식물의 잎을 만졌다. 이상한 물방울이 떨어졌다.",1,"plant_touched"],follow_print:["trail","발자국을 따라 선착장 방향으로 갔다.",2,"footprint_followed"],record_print:["trail","발자국의 방향을 기록했다.",1,"footprint_recorded"],take_button:["trail","젖은 단추를 주웠다. 안쪽에 파란 점이 있다.",2,"blue_button"],compare_maps:["marked","두 지도를 겹치니 지워진 수로가 선착장으로 이어진다.",2,"maps_compared"],visit_dock:["route","지도에 선착장 경로를 표시했다.",0,"route_to_dock"],follow_route:["route","경로를 기억했다.",1,"route_learned"],pick_knot:["water","물 위의 매듭을 건졌다. 파란 점이 찍혀 있다.",2,"blue_knot"],look_water:["water","수면을 살피니 물결이 안쪽으로 흐른다.",1,"water_current"],wait:["trace","기다리자 물 아래에서 문이 닫히는 소리가 났다.",2,"underwater_door"],dive:["trace","잠수하자 벽에 작은 파란 점이 보였다.",2,"blue_mark"],connect_clue:["trace","극장과 선착장의 파란 점이 같은 표시임을 기록했다.",3,"blue_symbol_connected"]};

const LIFE_DAY={morning:{start:7,end:10},day:{start:10,end:17},evening:{start:17,end:21},night:{start:21,end:7}};
const LIFE_ACTIONS={
  cook:{time:60,energy:-3,hunger:25,text:"따뜻한 식사를 준비했다.",flag:"cooked"},
  eat:{time:30,energy:2,hunger:35,text:"식사를 마쳤다.",flag:"ate"},
  clean:{time:45,energy:-5,house:2,text:"집을 정리했다. 물기가 조금 줄었다.",flag:"cleaned"},
  repair:{time:90,energy:-8,house:5,text:"망가진 곳을 손봤다.",flag:"repaired"},
  garden:{time:60,energy:-5,house:1,text:"온실을 돌봤다. 새싹이 조금 자랐다.",flag:"gardened"},
  animal:{time:30,energy:-2,animal:3,text:"변이동물을 돌봤다. 기분이 좋아 보인다.",flag:"animal_cared"},
  talk_a:{time:20,energy:-1,relation:2,text:"아이 A와 잠깐 이야기를 나눴다.",flag:"talk_a"},
  talk_b:{time:20,energy:-1,relation:2,text:"아이 B와 잠깐 이야기를 나눴다.",flag:"talk_b"},
  rest:{time:60,energy:10,hunger:-5,text:"잠깐 쉬었다.",flag:"rested"}
};
function ensureLife(r){
  r.life=r.life||{day:1,minutes:450,energy:100,hunger:60,house:55,animal:60,relation:50,weather:"맑음",flags:{}};
  r.life.flags=r.life.flags||{};
}
function lifePhase(min){
  if(min>=420&&min<600)return"morning";
  if(min>=600&&min<1020)return"day";
  if(min>=1020&&min<1260)return"evening";
  return"night";
}

io.on("connection",s=>{
s.on("create",({name},cb)=>{let code;do code=Math.random().toString(36).slice(2,8).toUpperCase();while(rooms.has(code));let r=mk(code);r.players.set(s.id,player(s.id,name,"A"));rooms.set(code,r);s.join(code);s.data.code=code;newEvent(r);log(r,"DAY 1 · 08:30 — 저택 아래에서 세 번의 종소리가 들렸다.","chapter");cb({ok:true,code});io.to(code).emit("state",pub(r))});
s.on("join",({name,code},cb)=>{let r=rooms.get((code||"").toUpperCase());if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});if(r.players.size>=2)return cb({ok:false,error:"2인방은 가득 찼다."});r.players.set(s.id,player(s.id,name,"B"));s.join(r.code);s.data.code=r.code;log(r,`${name||"동료"}가 도시에 합류했다.`,"system");cb({ok:true,code:r.code});io.to(r.code).emit("state",pub(r))});
s.on("move",({to},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return;if(!A[p.loc].links.includes(to))return cb({ok:false,error:"그곳으로 바로 이동할 수 없다."});if(!canEnter(r,to))return cb({ok:false,error:"아직 이 지역에 들어갈 조건이 갖춰지지 않았다. 단서와 관계를 더 쌓아보자."});if(p.actions<1)return cb({ok:false,error:"행동력이 부족하다."});p.loc=to;p.actions--;advance(r);log(r,`${p.name} → ${A[to].n}`,"move");if(Math.random()<.25){let e=r.event;log(r,`이동 중 사건: ${e.title} — ${e.text}`,"event")}sideAdvance(r,p);io.to(r.code).emit("state",pub(r));cb({ok:true,text:`${A[to].n}으로 이동했다.`})});
s.on("inspect",({spot},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return;if(p.actions<1)return cb({ok:false,error:"행동력이 부족하다."});let sp=A[p.loc]?.spots?.[spot];if(!sp)return cb({ok:false,error:"조사 지점을 찾을 수 없다."});p.actions--;advance(r);const key=`${p.loc}:${sp}`;r.spotVisits[key]=(r.spotVisits[key]||0)+1;const sc=sceneFor(p.loc,sp,r,p);r.scene={id:`${key}:${Date.now()}`,loc:p.loc,spot:sp,visit:r.spotVisits[key],...sc};log(r,`${p.name}이(가) ${sp} 앞에서 멈췄다.`,'scene');io.to(r.code).emit('state',pub(r));cb({ok:true,scene:r.scene});});
s.on("sceneChoice",({choice},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||!r.scene)return cb({ok:false,error:"진행 중인 장면이 없다."});const c=r.scene.choices.find(x=>x.id===choice);if(!c)return cb({ok:false,error:"그 선택은 없다."});if(typeof c.money==='number'&&p.money+c.money<0)return cb({ok:false,error:"돈이 부족하다."});if(typeof c.money==='number')p.money+=c.money;if(typeof c.energy==='number')p.energy=Math.max(0,Math.min(100,p.energy+c.energy));if(typeof c.relationship==='number'){p.rel=p.rel||{};p.rel.naru=(p.rel.naru||0)+c.relationship;r.mansionState.relationship=(r.mansionState.relationship||0)+c.relationship;}if(c.item&&!p.items.includes(c.item))p.items.push(c.item);if(c.flag){r.flags[c.flag]=true;p.flags=p.flags||{};p.flags[c.flag]=true;}if(c.clue)clue(r,p,c.clue,r.scene.loc,'scene');if(c.knowledge){r.score+=c.knowledge;if(!c.clue)clue(r,p,`${r.scene.spot} · ${c.result}`,r.scene.loc,'scene');}r.sceneHistory.push({day:r.day,loc:r.scene.loc,spot:r.scene.spot,choice:c.label,result:c.result});if(r.sceneHistory.length>80)r.sceneHistory.shift();log(r,`${p.name}의 선택 — ${c.label} · ${c.result}`,'choice');
if(c.next){const next={...c.next};r.scene={id:`chain:${Date.now()}`,loc:r.scene.loc,spot:r.scene.spot,visit:r.scene.visit,title:next.title,text:next.text,choices:next.choices};io.to(r.code).emit('state',pub(r));return cb({ok:true,text:c.result,item:c.item||null,continued:true});}
r.scene=null;combine(r,p);maybeMain(r);io.to(r.code).emit('state',pub(r));cb({ok:true,text:c.result,item:c.item||null});});
s.on("share",({index},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||!p.clues[index])return cb({ok:false,error:"단서가 없다."});p.shared.push(p.clues[index]);log(r,`${p.name}이(가) 단서를 공개했다.`,"share");io.to(r.code).emit("state",pub(r));cb({ok:true})});
s.on("talk",({npc},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id),n=NPC[npc];if(!r||!p||!n)return cb({ok:false,error:"NPC를 찾을 수 없다."});if(p.loc!==n.area)return cb({ok:false,error:"그 NPC가 있는 지역으로 이동해야 한다."});if(p.actions<1)return cb({ok:false,error:"행동력이 부족하다."});p.actions--;advance(r);let lv=(p.rel[npc]||0)+1;p.rel[npc]=Math.min(lv,n.max);r.stats.talks++;const lines={
childA:["오늘 시장에 가면 뭐 사 올 거야?", "온실에 새 잎이 났어.", "저녁에는 같이 먹자.", "내가 정리할 수 있는 건 도와줄게.", "도시에서 새로운 곳을 발견했어?", "다음에는 선착장에 가 보고 싶어.", "집이 커서 가끔 길을 잃어.", "그래도 여기 집이 좋아."],
childB:["오늘은 서재를 정리할 거야.", "지도에 새로운 길을 표시해 봤어.", "시장까지는 배로도 갈 수 있어.", "수중 통로는 생각보다 편해.", "다음에는 같이 도시를 돌아다니자.", "선착장에 새 배가 들어왔대.", "집에 돌아오면 물건을 정리해야 해.", "내일은 다른 곳에 가 보고 싶어."],
pie:["오늘은 파이가 잘 구워졌어.","시장 사람들은 17번 수로 이야기를 싫어해.","예전에 그쪽에서 아이 하나가 사라졌거든.","사라진 아이의 가족은 아직 파이를 사러 와.","그 가족은 아이가 돌아왔다고 믿고 있어.","나는 그 아이가 돌아온 적 없다고 생각해."],
antique:["오래된 유리병은 깨지기 쉬워.", "생활번호는 물건을 정리할 때 쓰는 번호야.", "오래된 물건은 출처를 확인하는 게 좋아.", "상태가 좋은 물건은 아직 쓸 수 있어.", "도시 곳곳에서 재미있는 생활용품이 들어와.", "원하면 다른 물건도 보여줄게.", "금고에는 오래된 생활용품이 있어."],
keeper:["이 역은 폐쇄됐어.","밤이면 불이 켜져.","시계는 항상 13분 늦어.","열차는 역에 도착한 뒤 출발하지 않아.","승객들은 모두 자기 목적지를 잊어.","한 번은 내 이름도 잊은 승객이 있었어.","그 사람은 '아직 하루가 끝나지 않았다'고 했지.","그날 이후 나는 시간을 기록하기 시작했어."],
archivist:["기록은 차곡차곡 남겨 두는 게 좋아.", "오래된 기록은 일부가 손상되기도 해.", "도시 생활 기록은 종류가 아주 많아.", "수몰 전 자료도 아직 남아 있어.", "번호는 물건을 분류하는 데 사용해.", "원하면 지도 자료를 찾아줄게.", "오래된 기록을 비교하면 도시의 변화를 알 수 있어.", "필요한 자료가 있으면 신청해 둬."],
doctor:["수중 생활에서 생기는 불편은 치료할 수 있어.", "물에 오래 있으면 몸이 쉽게 피곤해져.", "수중 병실에는 다양한 주민들이 머문다.", "창문 쪽은 물고기가 자주 지나가.", "환자 기록은 날짜별로 정리해 둔다.", "필요한 물품이 있으면 접수대에 말해 줘.", "오늘은 비교적 한산해.", "무리하지 말고 쉬어."],
actor:["이번 주에는 오래된 영화를 상영할 예정이야.", "표는 이미 몇 장 팔렸어.", "필름 상태가 좋아서 다행이지.", "좌석을 다시 정리해야 해.", "영사기를 점검하고 있어.", "마지막 장면만 조금 흐려졌어.", "저택 근처 풍경도 영화에 잠깐 나온대.", "다음 상영 때 한번 와 봐.", "영화가 끝나면 조명도 확인해 줘."],
washer:["이 동네 사람들은 이상한 옷을 맡겨.","죽은 사람 옷이 돌아오기도 해.","돌아온 옷은 항상 젖어 있어.","주머니에서 다른 사람의 열쇠가 나와.","어제는 생활번호이라고 적힌 열쇠가 나왔어.","그걸 시장 골동품상에게 보여줬더니 얼굴이 굳더라."]
};let arr=lines[npc]||["별일 없어요."];let text=arr[Math.min(lv-1,arr.length-1)];clue(r,p,`${n.n}: ${text}`,n.area,"talk");combine(r,p);log(r,`${n.n}: ${text}`,"npc");maybeMain(r);io.to(r.code).emit("state",pub(r));cb({ok:true,text})});
s.on("event",({choice},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||!r.event)return cb({ok:false,error:"사건이 없다."});if(p.actions<1)return cb({ok:false,error:"행동력이 부족하다."});p.actions--;advance(r);let e=r.event;if(choice==="investigate"){clue(r,p,`사건 조사 · ${e.title}: ${e.text}`,e.area,"event");p.money+=6}
else if(choice==="help"){p.money+=10;p.energy=Math.max(0,p.energy-6);log(r,`${p.name}은(는) 사건을 도왔다. 보상 10c.`,"reward")}
else{p.energy=Math.min(100,p.energy+4);log(r,`${p.name}은(는) 사건을 지나쳤다.`,"event")}
if(e.title==="시장 소동") choiceWorld(r,"market_fire",choice==="help"?"help":choice==="investigate"?"investigate":"ignore");
if(e.title==="무음 열차") choiceWorld(r,"station_clock",choice==="investigate"?"repair":choice==="help"?"repair":"break");
if(e.title==="병실의 바다") choiceWorld(r,"hospital_patient",choice==="investigate"?"believe":choice==="help"?"believe":"report");
if(e.title==="마지막 상영") choiceWorld(r,"theater_film",choice==="investigate"?"watch":choice==="help"?"watch":"burn");
if(e.title==="검은 계단") choiceWorld(r,"water_gate",choice==="help"?"turn":choice==="investigate"?"turn":"wait");r.event.used=true;io.to(r.code).emit("state",pub(r));cb({ok:true})});
s.on("rest",()=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return;p.actions=Math.min(10,p.actions+3);p.energy=Math.min(100,p.energy+18);p.hunger=Math.max(0,p.hunger-4);advance(r);log(r,`${p.name}이(가) 잠시 쉬었다.`,"rest");io.to(r.code).emit("state",pub(r))});
s.on("buy",({item},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||p.loc!=="market")return cb({ok:false,error:"시장에 있어야 한다."});let price={파이:6,유리병:12,담요:8,열쇠:18}[item];if(!price||p.money<price)return cb({ok:false,error:"살 수 없다."});p.money-=price;p.items.push(item);p.actions--;advance(r);log(r,`${p.name}이(가) ${item}을 구입했다.`,"trade");io.to(r.code).emit("state",pub(r));cb({ok:true})});
s.on("chat",({text})=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(r&&p)io.to(r.code).emit("chat",{name:p.name,text:String(text||"").slice(0,160)})});

s.on("eventChoice",({choice},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});if(!r.event)return cb({ok:false,error:"현재 사건이 없다."});let e=r.event; if(choice==="investigate"){clue(r,p,`사건 조사 · ${e.title}: ${e.text}`,e.area,"event");p.money+=6;r.score+=2}else if(choice==="help"){p.money+=10;p.energy=Math.max(0,p.energy-6);r.score+=3;log(r,`${p.name}이(가) 사건을 도왔다. 보상 10c.`,"reward")}else{p.energy=Math.min(100,p.energy+4);log(r,`${p.name}은(는) 사건을 지나쳤다.`,"event")} if(e.title==="시장 소동")choiceWorld(r,"market_fire",choice==="help"?"help":choice==="investigate"?"investigate":"ignore");r.event=null;r.stats.events++;combine(r,p);io.to(r.code).emit("state",pub(r));cb({ok:true})});
s.on("inspectSpot",({spot},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 let region=REGIONS_EXTRA[p.loc];if(!region||!region.spots.includes(spot))return cb({ok:false,error:"그 장소는 여기 없다."});
 let reward=2;let item=null;
 if(spot==="시계 수리점"||spot==="수위계") item=region.name==="구시가지"?"부서진 시계":"수위 기록편";
 if(spot==="씨앗 보관함") item="유리 씨앗";
 if(spot==="오래된 기록") item="오래된 기록 조각";
 if(spot==="낡은 망원경") item="13분 관측";
 if(spot==="봉인 서랍") item="봉인 열쇠";
 if(item&&!p.items.includes(item)){p.items.push(item);r.inventory.push(item);reward+=3;}
 p.money+=reward;r.score+=2;r.stats.discoveries++;combine(r,p);log(r,`${p.name}이(가) ${spot}을 조사했다.${item?` · ${item} 획득`:""}`,"discover");
 io.to(r.code).emit("state",pub(r));cb({ok:true,item});
});

s.on("extraTalk",({id},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id),ex=NPC_EXTRA[id];
 if(!r||!p||!ex||ex.area!==p.loc)return cb({ok:false,error:"이 사람은 지금 여기 없다."});
 p.rel=p.rel||{};p.flags=p.flags||{};p.items=p.items||[];let step=p.rel[id]||0;let text=ex.lines[Math.min(step,ex.lines.length-1)];
 p.rel[id]=step+1;p.money+=2;clue(r,p,`${ex.name}: ${text}`,ex.area,"talk");log(r,`${ex.name}: ${text}`,"npc");
 io.to(r.code).emit("state",pub(r));cb({ok:true,text});
});

function applyChoiceEffects(p,effects){
 effects=effects||{};p.flags=p.flags||{};p.items=p.items||[];p.rel=p.rel||{};
 if(effects.flags)Object.assign(p.flags,effects.flags);
 if(Array.isArray(effects.items))for(const it of effects.items)if(!p.items.includes(it))p.items.push(it);
 if(typeof effects.score==="number")p.score+=effects.score;
 if(typeof effects.money==="number")p.money+=effects.money;
 for(const [k,v] of Object.entries(effects)){if(k.endsWith("_trust"))p.rel[k.replace("_trust","")]=(p.rel[k.replace("_trust","")]||0)+v;}
}
function choiceAvailable(p,c){
 const req=c.require||{};if(req.flag && !p.flags?.[req.flag])return false;
 if(req.item && !(p.items||[]).includes(req.item))return false;
 if(typeof req.score==="number" && p.score<req.score)return false;
 return true;
}
function beginChoiceTree(r,p,id){
 const tree=CHOICE_TREE[id]||SIDE_CHOICE_TREES[id];if(!tree)return null;
 r.choiceState=r.choiceState||{current:null,history:[]};
 r.choiceState.current={id,tree};return tree;
}


s.on("worldConsequence",({kind},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);
 if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 let id=null;
 if(kind==="mara" && (p.flags?.clock_taken||p.flags?.clock_opened||p.flags?.letter_kept)) id="mara_confrontation";
 if(kind==="lune" && p.flags?.seed_planted) id="lune_seed";
 if(kind==="archive" && p.flags?.archive_opened) id="archive_consequence";
 if(!id)return cb({ok:false,error:"지금은 발생할 세계 변화가 없다."});
 const tree=CROSS_WORLD_TREES[id];
 beginChoiceTree(r,p,id);
 io.to(r.code).emit("state",pub(r));
 cb({ok:true,tree});
});
s.on("triggerChoice",({kind},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 const ids={pier:"pier_letter",oldtown:"oldtown_clock",greenhouse:"greenhouse_seed",observatory:"observatory_water",archive2:"archive_ownerless"};
 const id=ids[p.loc];if(!id)return cb({ok:false,error:"이 지역에는 아직 선택지가 없다."});
 const tree=beginChoiceTree(r,p,id);io.to(r.code).emit("state",pub(r));cb({ok:true,tree});
});




s.on("lifeAction",({action},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 ensureLife(r);const a=LIFE_ACTIONS[action];if(!a)return cb({ok:false,error:"알 수 없는 행동이다."});
 const phase=lifePhase(r.life.minutes);
 if(action==="cook" && (phase==="night"))return cb({ok:false,error:"밤이라 부엌 불을 켜기 어렵다."});
 if(action==="garden" && phase==="night")return cb({ok:false,error:"온실은 너무 어둡다."});
 if(r.life.energy+a.energy<=0)return cb({ok:false,error:"너무 지쳤다. 잠깐 쉬어야 한다."});
 r.life.minutes+=a.time;r.life.energy=Math.max(0,Math.min(100,r.life.energy+a.energy));
 r.life.hunger=Math.max(0,Math.min(100,r.life.hunger+a.hunger||0));
 r.life.house=Math.max(0,Math.min(100,r.life.house+a.house||0));
 r.life.animal=Math.max(0,Math.min(100,r.life.animal+a.animal||0));
 r.life.relation=Math.max(0,Math.min(100,r.life.relation+a.relation||0));
 r.life.flags[a.flag]=true;
 if(r.life.minutes>=1440){r.life.minutes-=1440;r.life.day++;r.life.hunger=Math.max(0,r.life.hunger-15);r.life.energy=85;}
 log(r,`${a.text}`,"life");
 io.to(r.code).emit("state",pub(r));cb({ok:true,text:a.text});
});
s.on("spaceEnter",({space},cb)=>{let r=rooms.get(s.data.code);if(!r||!SPACE_STATES[space])return cb({ok:false,error:"공간을 찾을 수 없다."});r.spaceStates=r.spaceStates||{};r.spaceStates[space]=r.spaceStates[space]||{stage:"quiet",seen:0};r.spaceStates[space].seen++;r.currentSpace=space;io.to(r.code).emit("state",pub(r));cb({ok:true});});
s.on("spaceAction",({space,action},cb)=>{let r=rooms.get(s.data.code),ss=r?.spaceStates?.[space],sp=SPACE_STATES[space],ac=SPACE_ACTIONS[action];if(!r||!ss||!sp||!ac)return cb({ok:false,error:"행동할 수 없다."});let stage=sp.stages[ss.stage];if(!stage.actions.includes(action))return cb({ok:false,error:"지금은 그 행동을 할 수 없다."});ss.stage=ac[0];r.flags=r.flags||{};r.flags[ac[3]]=true;r.mansionState=r.mansionState||{};r.mansionState.knowledge=(r.mansionState.knowledge||0)+ac[2];log(r,sp.label+": "+ac[1],"space");io.to(r.code).emit("state",pub(r));cb({ok:true,text:ac[1]});});
s.on("mansionEvent",({eventId},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 const ev=MANSION_EVENTS[eventId];if(!ev)return cb({ok:false,error:"존재하지 않는 사건이다."});
 const ms=r.mansionState||{};
 if(ms.room!==ev.room)return cb({ok:false,error:"지금은 이 사건이 발생할 장소에 있지 않다."});
 ms.activeEvent=eventId;r.mansionState=ms;io.to(r.code).emit("state",pub(r));cb({ok:true,event:ev});
});
s.on("mansionEventChoice",({eventId,choiceId},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 const ev=MANSION_EVENTS[eventId];const ch=ev?.choices?.find(x=>x.id===choiceId);
 if(!ch)return cb({ok:false,error:"존재하지 않는 선택이다."});
 const ms=r.mansionState||{};
 if(ms.activeEvent!==eventId)return cb({ok:false,error:"진행 중인 사건이 아니다."});
 for(const [k,v] of Object.entries(ch.effects||{})){
   if(k==="flags"){ms.flags=ms.flags||{};Object.assign(ms.flags,v);}
   else ms[k]=(ms[k]||0)+v;
 }
 ms.activeEvent=null;ms.eventCount=(ms.eventCount||0)+1;r.mansionState=ms;
 log(r,`${ev.title}: ${ch.text}`,"mansion-event");
 io.to(r.code).emit("state",pub(r));cb({ok:true});
});
s.on("mansionMove",({room},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 if(!MANSION_ROOMS[room])return cb({ok:false,error:"존재하지 않는 방이다."});
 r.mansionState=r.mansionState||{room:"hall",day:1,time:8,unlocks:[]};
 if(!r.mansionState.unlocks)r.mansionState.unlocks=[];
 const locked=["bedroom","attic","archive","music","basement","underwater","garden_b"];
 if(locked.includes(room)&&!r.mansionState.unlocks.includes(room))return cb({ok:false,error:"아직 들어갈 수 없는 곳이다."});
 r.mansionState.room=room;io.to(r.code).emit("state",pub(r));cb({ok:true});
});

const ROOM_OBJECTS={
 hall:["젖은 우산","우편함","현관 거울"], kitchen:["오래된 냄비","식료품장","벽의 메모"], dining:["긴 식탁","빈 의자","창가"], living:["벽시계","낡은 소파","수조"], laundry:["세탁통","빨랫줄","배수구"], storage:["목상자","공구함","방수 가방"], greenhouse:["유리 화분","물가 식물","금 간 창"], dock:["계류 밧줄","낡은 보트","수면 아래 사다리"], kids_a:["작은 상자","그림","창문"], kids_b:["지도 묶음","장난감 배","서랍"], study:["도시 지도","장부","책상 서랍"], bedroom:["침대 옆 탁자","초상화","잠긴 서랍"], guest:["침대","여행 가방","창문"], attic:["먼지 쌓인 상자","오래된 깃발","작은 문"], archive:["장부 선반","봉인 문서","지도 서랍"], music:["피아노","악보","축음기"], boiler:["보일러 게이지","밸브","연료통"], water:["수위계","정화 필터","수조"], workshop:["작업대","부품 상자","손전등"], basement:["잠긴 상자","침수 계단","벽의 금속판"], underwater:["수중 창","녹슨 표지판","검은 문"], garden_b:["빛나는 수초","돌 연못","뿌리 사이의 틈"]
};
s.on("mansionInspect",({index},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id); if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 const room=r.mansionState?.room||"hall", list=ROOM_OBJECTS[room]||[]; const obj=list[Number(index)];
 if(!obj)return cb({ok:false,error:"조사할 물건을 찾을 수 없다."});
 const key=`home:${room}:${obj}`;r.spotVisits[key]=(r.spotVisits[key]||0)+1;advance(r,10);
 const repeat=r.spotVisits[key]; const texts={
  "젖은 우산":"아직 물기가 남아 있다. 누군가 방금 도시에서 돌아온 것 같다.","우편함":"오늘은 편지가 없다. 대신 바닥에 작은 물방울이 세 개 있다.","현관 거울":"거울 속 집은 실제보다 한 박자 늦게 움직인다.",
  "오래된 냄비":"바닥에 오래된 수로 지도가 희미하게 새겨져 있다.","식료품장":"남은 식량을 세어 보니 예상보다 하나 많다.","벽의 메모":"'13분 늦게'라는 문장이 여러 번 덧쓰여 있다.",
  "긴 식탁":"두 사람이 앉은 흔적이 있지만 의자는 하나뿐이다.","빈 의자":"누군가 앉았다 일어난 듯 물기가 남아 있다.","창가":"수면 위를 지나가는 작은 배가 오늘은 반대 방향으로 간다.",
  "벽시계":"초침이 잠깐 멈췄다가 두 칸 앞으로 뛰었다.","낡은 소파":"쿠션 아래에서 오래된 동전 하나가 나온다.","수조":"변이동물이 수면 아래 무언가를 바라보고 있다.",
  "세탁통":"주머니에서 작은 열쇠가 하나 나온다.","빨랫줄":"마른 옷 사이에 젖은 소매 하나가 섞여 있다.","배수구":"도시의 종소리가 아주 작게 들린다.",
  "목상자":"방수된 상자 안에 오래된 생활용품이 남아 있다.","공구함":"쓸 수 있는 부품 하나를 찾았다.","방수 가방":"가방 안쪽에 아직 마르지 않은 흙이 묻어 있다."
 };
 const text=texts[obj]||`${obj}을 자세히 살펴봤다. ${repeat>1?"전에 보았던 흔적과 조금 달라져 있다.":"아직 처음 보는 흔적이 남아 있다."}`;
 if(p.money!==undefined&&obj==="낡은 소파"&&repeat===1)p.money+=2;
 log(r,`${p.name}이(가) 저택의 ${obj}을 조사했다.`,'scene');
 io.to(r.code).emit('state',pub(r)); cb({ok:true,text,item:repeat===1&&obj==="낡은 소파"?"오래된 동전":null});
});
s.on("mansionAction",({action},cb)=>{
 let r=rooms.get(s.data.code);if(!r)return cb({ok:false,error:"방을 찾을 수 없다."});
 const ms=r.mansionState||{};const act=MANSION_ACTIONS[action];if(!act)return cb({ok:false,error:"존재하지 않는 행동이다."});
 for(const [k,v] of Object.entries(act.effects||{}))ms[k]=(ms[k]||0)+v;
 ms.home_clean=Math.max(0,Math.min(10,ms.home_clean));ms.house_condition=Math.max(0,Math.min(10,ms.house_condition));
 ms.water=Math.max(0,Math.min(10,ms.water));ms.food=Math.max(0,Math.min(10,ms.food));ms.fuel=Math.max(0,Math.min(10,ms.fuel));
 if(ms.house_condition>=8&&!ms.unlocks.includes("bedroom"))ms.unlocks.push("bedroom","attic");
 if(ms.knowledge>=5&&!ms.unlocks.includes("archive"))ms.unlocks.push("archive");
 if(ms.parts>=2&&!ms.unlocks.includes("music"))ms.unlocks.push("music");
 if(ms.house_condition>=10&&!ms.unlocks.includes("basement"))ms.unlocks.push("basement");
 if(ms.knowledge>=10&&!ms.unlocks.includes("underwater"))ms.unlocks.push("underwater");
 if(ms.time>=24){ms.time=8;ms.day=(ms.day||1)+1;ms.hunger=Math.max(0,(ms.hunger||6)-1);ms.energy=6;ms.prepared=0;}
 r.mansionState=ms;log(r,`${act.label}: ${act.text}`,"mansion");io.to(r.code).emit("state",pub(r));cb({ok:true});
});
s.on("choiceTree",({id},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 let tree=beginChoiceTree(r,p,id);if(!tree)return cb({ok:false,error:"존재하지 않는 선택지 트리다."});
 io.to(r.code).emit("state",pub(r));cb({ok:true,tree});
});
s.on("choicePick",({choice},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 const cur=r.choiceState?.current?.tree;if(!cur)return cb({ok:false,error:"진행 중인 선택지가 없다."});
 const c=cur.choices.find(x=>x.id===choice);if(!c||!choiceAvailable(p,c))return cb({ok:false,error:"선택할 수 없다."});
 applyChoiceEffects(p,c.effects);
 r.choiceState.history.push({tree:r.choiceState.current.id,choice:c.id,at:Date.now()});
 p.stats.events++;
 if(c.next){beginChoiceTree(r,p,c.next);}
 else r.choiceState.current=null;
 combine(r,p);log(r,`${p.name}의 선택: ${c.text}`,"choice");
 io.to(r.code).emit("state",pub(r));cb({ok:true,next:c.next||null});
});
s.on("worldAction",({action},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p)return cb({ok:false,error:"방을 찾을 수 없다."});
 if(action==="openGate"){r.world.doorProgress=Math.min(2,(r.world.doorProgress||0)+1);if(r.world.doorProgress>=2){r.world.opened.deep=true;achievement(r,"deep","새로운 수중 통로");log(r,"수문이 열렸다. 아래쪽 생활권으로 가는 길이 열렸다.","chapter");}else log(r,"수문 장치를 한 번 작동했다. 반대편 장치도 확인해 보자.","puzzle");}
 if(action==="ending"){if(r.score>=20){r.world.ending="LIFE_MILESTONE";achievement(r,"ending","오늘의 큰 사건");log(r,"오늘의 큰 사건을 마쳤다. 이제 자유롭게 도시와 저택을 계속 플레이할 수 있다.","ending");}else return cb({ok:false,error:"조금 더 생활하고 탐험한 뒤 큰 사건을 마무리할 수 있다."});}
 io.to(r.code).emit("state",pub(r));cb({ok:true});
});

function cardRankValue(rank){return Math.min(rank,10)}
function drawCard(){const suits=["♠","♥","♦","♣"], ranks=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];const rank=Math.floor(Math.random()*13)+1;return{rank,symbol:ranks[rank-1],suit:suits[Math.floor(Math.random()*4)],value:rank===1?1:cardRankValue(rank)}}
function handTotal(hand){let total=hand.reduce((a,c)=>a+c.value,0),aces=hand.filter(c=>c.rank===1).length;while(total>21&&aces){total-=10;aces--}return total}
function startPoker(p){const deck=[...Array(5)].map(drawCard);p.minigame={type:'poker',phase:'result',player:deck,house:[drawCard(),drawCard()],cost:5};}
function startBaccarat(p){p.minigame={type:'baccarat',phase:'bet',cost:5};}
s.on("miniOpen",({game},cb)=>{let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||p.loc!=="salon")return cb({ok:false,error:"운하 살롱에서만 할 수 있다."});p.minigame=null;io.to(r.code).emit('state',pub(r));cb({ok:true});});
s.on("miniPlay",({game,choice},cb)=>{
 let r=rooms.get(s.data.code),p=me(r,s.id);if(!r||!p||p.loc!=="salon")return cb({ok:false,error:"운하 살롱에서만 할 수 있다."});
 const cost=5;if((p.money||0)<cost)return cb({ok:false,error:"살롱 코인이 부족하다. 시장에서 일을 하거나 물건을 팔아 코인을 마련하자."});
 p.money-=cost;
 if(game==='poker'){
   const player=[drawCard(),drawCard(),drawCard(),drawCard(),drawCard()], house=[drawCard(),drawCard(),drawCard(),drawCard(),drawCard()];
   function rankHand(h){const counts={};h.forEach(c=>counts[c.rank]=(counts[c.rank]||0)+1);const vals=Object.values(counts).sort((a,b)=>b-a);const sorted=h.map(c=>c.rank===1?14:c.rank).sort((a,b)=>a-b);const straight=sorted.every((v,i)=>i===0||v===sorted[i-1]+1)||JSON.stringify(sorted)===JSON.stringify([2,3,4,5,14]);const flush=h.every(c=>c.suit===h[0].suit);if(straight&&flush)return 8;if(vals[0]===4)return 7;if(vals[0]===3&&vals[1]===2)return 6;if(flush)return 5;if(straight)return 4;if(vals[0]===3)return 3;if(vals[0]===2&&vals[1]===2)return 2;if(vals[0]===2)return 1;return 0}
   const a=rankHand(player),b=rankHand(house);let mult=a>b?2:a===b?1:0;if(mult)p.money+=cost*mult; p.minigame={type:'poker',phase:'result',player,house,playerRank:a,houseRank:b,won:a>b,tie:a===b};
 } else if(game==='baccarat'){
   const player=[drawCard(),drawCard()],banker=[drawCard(),drawCard()];const pt=handTotal(player)%10,bt=handTotal(banker)%10;let result=pt>bt?'player':pt<bt?'banker':'tie';const bet=choice||'player';let mult=bet==='tie'?8:1;let win=bet===result;if(win)p.money+=cost*(mult+1);p.minigame={type:'baccarat',phase:'result',player,banker,pt,bt,result,bet,won:win};
 } else return cb({ok:false,error:"알 수 없는 미니게임이다."});
 log(r,`${p.name}이(가) 살롱에서 ${game}을 플레이했다.`,'minigame');io.to(r.code).emit('state',pub(r));cb({ok:true});
});

s.on("save",(_,cb)=>{let r=rooms.get(s.data.code);if(!r)return cb({ok:false});cb({ok:true,data:pub(r)})});
s.on("disconnect",()=>{let r=rooms.get(s.data.code);if(r){r.players.delete(s.id);if(!r.players.size)rooms.delete(r.code);else io.to(r.code).emit("state",pub(r))}});
});
server.listen(PORT,"0.0.0.0",()=>console.log("WATERLINE V19 running"));
