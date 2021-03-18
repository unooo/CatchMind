
function doResizePc() {
  debugger;
  let can = document.getElementById('mainCanvas');
  //  let can=document.getElementsByClassName('toolAndcan');
  /*----그림판 리사이즈----*/
  let pivotSize = window.outerWidth > window.outerHeight ? window.outerHeight : window.outerWidth;
  //let pivotSize=window.clientWidth>window.clientHeight?window.clientHeight:window.clientWidth;
  let pivotWidth = pivotSize / 3;//(window.outerWidth)/3;
  let pivotHeight = pivotSize / 3;//(window.outerHeight)/3;
  can.width = pivotWidth;
  can.height = pivotHeight;

  can.style.border = "1px solid black";

  /*----도구상자 리사이즈----*/
  let toolTable = document.getElementById('toolTable');
  toolTable.width = pivotWidth;
  toolTable.height = pivotHeight;

  toolTable.style.border = "1px solid black";


  /*----채팅 리사이즈----*/
  let chatContent = document.getElementById('chatContent');
  chatContent.style.width = parseInt(pivotWidth) + "px";
  chatContent.style.height = parseInt(pivotHeight) + "px";
  //chatContent.style.marginLeft=Number.parseInt(pivotWidth)/2-Number.parseInt(can.style.width)/2+"px";

  let chatTable = document.getElementById('chatTable');
  chatTable.width=pivotWidth;
  let chatBox = document.getElementById('chatMessage');
  let sendBtn = document.getElementById('sendBtn');
  debugger;




  let chatContentOuter = document.getElementById('chatContentOuter');
  console.log(chatContent.clientWidth - 20 + "px");
  chatContentOuter.style.width = chatContent.clientWidth - 5 + "px";

  /*---채팅창의 스크롤크기에 맞게 캔버스와 툴도구 너비조정----*/
  let chatTbW = document.getElementById("chatTable").clientWidth;
  can.width = chatTbW;
  toolTable.width = chatTbW;
  chatBox.style.width = pivotWidth - sendBtn.clientWidth + "px";

  /*----요소들 중앙이동*/
  can.style.marginLeft = (window.outerWidth) / 2 - parseInt(can.width) / 2 + "px";
  toolTable.style.marginLeft = (window.outerWidth) / 2 - parseInt(can.width) / 2 + "px";
  chatTable.style.marginLeft = parseInt(window.outerWidth) / 2 - parseInt(can.width) / 2 + "px";

  /*--------비디오 그리드 조절 ---------*/
  // alert(window.outerWidth-chatTbW+" "+window.outerWidth+" "+chatTbW);
  const videoGrid = document.getElementById('video-grid');
  videoGrid.style.position = 'absolute';
  videoGrid.style.gridTemplateColumns = `repeat(auto-fill, ${(window.outerWidth - chatTbW) / 2}px)`;
  videoGrid.style.gridAutoRows = (window.outerWidth - chatTbW) / 2 + "px";
  videoGrid.style.left = 0 + "px";
  videoGrid.style.top = 0 + "px";


  const videoGridRight = document.getElementById('video-grid-Right');

  videoGridRight.style.gridTemplateColumns = `repeat(auto-fill, ${(window.outerWidth - chatTbW) / 3}px)`;
  videoGridRight.style.gridAutoRows = ((window.outerWidth - chatTbW) / 3) + "px";
 
}

function doResizeMobile() {
  let can = document.getElementById('mainCanvas');
  //  let can=document.getElementsByClassName('toolAndcan');
  /*----그림판 리사이즈----*/
  let pivotSize = window.outerWidth - 5;
  let pivotWidth = pivotSize;//(window.outerWidth)/3;
  let pivotHeight = pivotSize;//(window.outerHeight)/3;
  can.width = pivotWidth;
  can.height = pivotHeight;

  can.style.border = "1px solid black";

  /*----도구상자 리사이즈----*/
  let toolTable = document.getElementById('toolTable');
  toolTable.width = pivotWidth;
  toolTable.style.border = "1px solid black";
  /*----채팅 리사이즈----*/
  let chatContent = document.getElementById('chatContent');
  chatContent.style.width = parseInt(pivotWidth) + "px";
  chatContent.style.height = parseInt(pivotHeight / 2) + "px";
  //chatContent.style.marginLeft=Number.parseInt(pivotWidth)/2-Number.parseInt(can.style.width)/2+"px";

  let chatTable = document.getElementById('chatTable');
  let chatBox = document.getElementById('chatMessage');
  let sendBtn = document.getElementById('sendBtn');

  let chatContentOuter = document.getElementById('chatContentOuter');
  chatContentOuter.style.width = chatContent.clientWidth - 5 + "px";

  /*---채팅창의 스크롤크기에 맞게 캔버스와 툴도구 너비조정----*/
  let chatTbW = document.getElementById("chatTable").clientWidth;
  can.width = chatTbW;
  toolTable.width = chatTbW;
  chatBox.style.width = pivotWidth - sendBtn.clientWidth + "px";
  /*----요소들 중앙이동*/
  can.style.marginLeft = (window.outerWidth) / 2 - parseInt(can.width) / 2 + "px";
  toolTable.style.marginLeft = (window.outerWidth) / 2 - parseInt(can.width) / 2 + "px";
  chatTable.style.marginLeft = parseInt(window.outerWidth) / 2 - parseInt(can.width) / 2 + "px";

  /*--------초기 비디오 그리드 조절 ---------*/
  // alert(window.outerWidth-chatTbW+" "+window.outerWidth+" "+chatTbW);
  const videoGrid = document.getElementById('video-grid');
  videoGrid.style.position = "static";
  videoGrid.style.gridTemplateColumns = `repeat(auto-fill, ${pivotSize / 3}px)`;
  videoGrid.style.gridAutoRows = (pivotSize / 3) + "px";

 

}

function temp(canvas){
  let tempEle=document.getElementById('createRoomPopup');
  if(tempEle)
  tempEle.parentNode.removeChild(tempEle);
  setTimeout(()=>{
    let divEle = document.createElement('div');
    divEle.id = 'createRoomPopup';
    divEle.style.position="absolute";
     divEle.style.width=canvas.clientWidth;
     divEle.style.height=canvas.height;
     divEle.style.backgroundColor="black";
     divEle.innerText="touch to use";
     divEle.style.color="white";
     divEle.style.marginLeft=canvas.style.marginLeft;
     divEle.style.top=canvas.offsetTop+"px";
     document.body.append(divEle);
  },0);
  
}

function device_check() {
  // 디바이스 종류 설정
  var pc_device = "win16|win32|win64|mac|macintel";
  // 접속한 디바이스 환경
  var this_device = navigator.platform;

  if (this_device) {
    document.body.style.margin = "0px";
    if (pc_device.indexOf(navigator.platform.toLowerCase()) < 0) {          //console.log('MOBILE');
      return 'mobile';// doResizeMobile() ;
    } else {
      return 'pc'; //doResizePc() ;
    }

  }
}

function adjustVideoGrid() {
  let pivotSize;
  let gridNum = document.getElementsByTagName('video').length;
  let gridSize;
  let videoGridRight=document.getElementById('video-grid-Right');
  if (device_check() == 'mobile') {
    videoGrid.style.position = "static";
    pivotSize = window.outerWidth - 5;
    gridSize = pivotSize / gridNum;
    videoGrid.style.gridTemplateColumns = `repeat(auto-fill, ${gridSize}px)`;
    videoGrid.style.gridAutoRows = gridSize + "px";
    videoGrid.style.alignContent="center";
  } else {
    let leftGrid = document.getElementById('video-grid');
    let rightGrid = document.getElementById('video-grid-Right');

    leftGrid.style.position = "absolute";
    let w = document.body.offsetWidth; //outer
    let h = document.body.offsetHeight;
    pivotSize = w > h ? h : w;    

    let leftGridNum=leftGrid.childElementCount ;
    let rightGridNum=rightGrid.childElementCount ;

    leftGridNum=leftGridNum<=2?3:leftGridNum;
    rightGridNum=rightGridNum<=2?3 :rightGridNum;

    leftGridSize = pivotSize / leftGridNum;
    rightGridSize = pivotSize / rightGridNum;

    leftGrid.style.gridTemplateColumns = `repeat(auto-fill, ${leftGridSize}px)`;
    leftGrid.style.gridAutoRows = leftGridSize + "px";

    rightGrid.style.gridTemplateColumns = `repeat(auto-fill, ${rightGridSize}px)`;
    rightGrid.style.gridAutoRows = rightGridSize + "px";
  }

  let can = document.getElementById('mainCanvas');

  //setTimeout(()=>temp(can),0);

}
