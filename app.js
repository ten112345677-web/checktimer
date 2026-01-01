const students = {
  "6734438":"น.ส. วิภาวดี แต้มคม", "6734446":"นาย ณัฐดนัย สิงคีพงศ์", "6734453":"นาย นิตินันท์ จันทอง", "6734454":"นาย วรธรรม สำเภาทอง", "6734455":"นาย ธีรเทพ ติ่งอินทร์", "6734458":"น.ส. สิริกร ริดจูงพืช", "6734459":"น.ส. กรณิศ วงค์สอาด", "6734460":"น.ส. โสภาพร ฉิมนอก", "6734461":"น.ส. จีรภา แพงดี", "6734462":"นาย พันธุ์ธัช ภัทรมโน", "6734463":"น.ส. อัศรานี คนการ", "6734464":"นาย เอกสิทธิ์ ยอดสูงเนิน", "6734465":"นาย พรพิพัฒน์ ภูธร", "6734466":"น.ส. พันธิตรา วงศ์ประเทศ", "6734467":"นาย ศุภณัฐ งามอยู่", "6734469":"นาย ปุญญพัฒน์ แก้วเก่า", "6734470":"นาย บุญเกื้อ พรบุญ", "6734473":"นาย จิรวัฒน์ นามนา", "6734474":"นาย ศิลาวัฒน์ หวานทอง", "6734476":"นาย ศุภกร งามอยู่", "6734478":"น.ส. ปิยากร เครือสอน", "6734480":"น.ส. ปาริชาติ ดามิลี", "6734501":"น.ส. ธิดารัตน์ อำนวยผล", "6734502":"นาย ศุภกิตติ จันโท", "6734507":"นาย ศิลา ไชยสอาด", "6734508":"น.ส. มนต์ฤตี ดอนดี", "6734509":"นาย ธนชล อุติ", "6734511":"นาย ประมัตถ์ นิ่มพัฒนสกุล", "6734512":"น.ส. นภัสสร ลอยฟู", "6734513":"นาย การัน หงส์ศรี", "6734514":"นาย อานัส ราหุละ", "6734515":"นาย ภาคภูมิ ชวนจันทึก", "6734517":"น.ส. สุชาตรา วัจรินทร์", "6734518":"นาย ชัยยุทธ์ สมมุ่ง", "6734519":"นาย กิตติชัย ลิ้มกุล", "6734520":"นาย วรวุฒิ ขวัญแก้ว", "6734521":"น.ส. รมิดา ปรุงจันทร์", "6734522":"นาย เทอดเกียรติ ชนะพงษ์สิงห์", "6734523":"น.ส. ผุสดี คำมี", "6734524":"นาย ณัฐพล เนียมห้วน", "6734525":"น.ส. เนตรนภา คงวารี", "6734526":"นาย เพชรสยาม พิทักษ์ตระกูล", "6734527":"นาย พลไพศาล สร้อยทอง", "6734528":"นาย ล้อมเดช คุ้มจินดา", "6734529":"นาย ไอซ์ วงศ์สวรรค์"
};

// Clock
function updateClock(){
  const now=new Date();
  document.getElementById("clock").innerHTML= now.toLocaleDateString('th-TH')+" ⏰ "+now.toLocaleTimeString('th-TH');
}
setInterval(updateClock,1000);
updateClock();

// Map
let map, userMarker, classroomMarker, liveMarkers={};
const classroom=[13.984967,100.570586];
const greenIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
  iconSize: [32,32],
  iconAnchor: [16,32],
  popupAnchor: [0,-32]
});

function initMap(){
  map = L.map('map').setView(classroom,17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);

  classroomMarker = L.marker(classroom).addTo(map).bindPopup("🏫 ห้องเรียน");

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos=>{
      userMarker=L.marker([pos.coords.latitude,pos.coords.longitude],{icon:greenIcon}).addTo(map).bindPopup("คุณอยู่ที่นี่").openPopup();
      map.setView([pos.coords.latitude,pos.coords.longitude],17);
    });
  }

  document.getElementById("historyDate").value=new Date().toISOString().split('T')[0];
  loadHistory();
  loadLiveMarkers();
}

// Student Functions
function findStudent(){
  const id=document.getElementById("studentId").value;
  document.getElementById("studentName").innerHTML=
    students[id]?`<span class="badge">${students[id]}</span>`:"❌ ไม่พบรหัสนักศึกษา";
}

function checkIn(){
  const id=document.getElementById("studentId").value;
  if(!students[id]){ showLog("ไม่พบรหัสนักศึกษา","error"); return; }

  const time=new Date().toLocaleString('th-TH');
  let allHistory=JSON.parse(localStorage.getItem("attendance")||"{}");
  const date=document.getElementById("historyDate").value;
  if(!allHistory[date]) allHistory[date]=[];

  if(!allHistory[date].some(x=>x.id===id)){
    const pos=userMarker?[userMarker.getLatLng().lat,userMarker.getLatLng().lng]:classroom;
    allHistory[date].push({id:id,name:students[id],time:time,pos:pos});
    localStorage.setItem("attendance",JSON.stringify(allHistory));
    showLog(`✔ ${students[id]} เช็คชื่อแล้ว<br>${time}`,"success");
    loadHistory(); updateChart(); addLiveMarker(id, students[id], pos);
  } else showLog(`⚠ ${students[id]} เช็คชื่อแล้วก่อนหน้า`,"error");
}

// Log
function showLog(msg,type){ document.getElementById("studentName").innerHTML=`<span class="${type}">${msg}</span>`; }

// History
function loadHistory(){
  let allHistory=JSON.parse(localStorage.getItem("attendance")||"{}");
  const date=document.getElementById("historyDate").value;
  const history=allHistory[date]||[];
  const container=document.getElementById("history");
  container.innerHTML="";
  history.forEach((item,i)=>{
    const div=document.createElement("div");
    div.className="history-card success";
    div.innerHTML=`${item.name} ✅ ${item.time}`;
    container.appendChild(div);
    setTimeout(()=>{div.style.opacity=1;},i*100);
  });
  updateChart();
}

// Filter Search
function filterHistory(){
  const val=document.getElementById("searchName").value.toLowerCase();
  document.querySelectorAll(".history-card").forEach(card=>{
    card.style.display=card.innerText.toLowerCase().includes(val)?"flex":"none";
  });
}

// Live Markers
function addLiveMarker(id,name,pos){
  if(liveMarkers[id]) return;
  const marker = L.marker(pos,{icon: greenIcon, title:name}).addTo(map);
  marker.bindPopup(`${name}<br>${new Date().toLocaleTimeString('th-TH')}`);
  liveMarkers[id] = marker;
}
function loadLiveMarkers(){
  const allHistory=JSON.parse(localStorage.getItem("attendance")||"{}");
  const date=document.getElementById("historyDate").value;
  const history=allHistory[date]||[];
  Object.values(liveMarkers).forEach(m=> map.removeLayer(m));
  liveMarkers={};
  history.forEach(h=> addLiveMarker(h.id,h.name,h.pos));
}

// Export CSV
function exportCSV(){
  const date=document.getElementById("historyDate").value;
  const allHistory=JSON.parse(localStorage.getItem("attendance")||"{}");
  const history=allHistory[date]||[];
  if(history.length===0){ alert("ไม่มีข้อมูลวันที่นี้"); return; }
  let csv="รหัสนักศึกษา,ชื่อ,เวลา\n";
  history.forEach(h=>{ csv+=`${h.id},${h.name},${h.time}\n`; });
  const blob=new Blob([csv],{type:"text/csv"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download=`attendance_${date}.csv`;
  link.click();
}

// Chart
let chart=null;
function updateChart(){
  const date=document.getElementById("historyDate").value;
  const allHistory=JSON.parse(localStorage.getItem("attendance")||"{}");
  const count=allHistory[date]?allHistory[date].length:0;
  const ctx=document.getElementById("attendanceChart").getContext('2d');
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:'bar',
    data:{ labels:['จำนวนคน'], datasets:[{ label:'เข้าห้องเรียน', data:[count], backgroundColor:'#00ffd5' }] },
    options:{ responsive:true, scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1 } } } }
  });
}

// Dark Mode
document.getElementById("darkModeBtn").onclick=function(){
  document.body.classList.toggle("light");
  this.innerText=document.body.classList.contains("light")?"🌙 Dark Mode":"🌑 Light Mode";
}

// Initial
document.addEventListener("DOMContentLoaded",()=>{
  updateClock();
  initMap();
});
