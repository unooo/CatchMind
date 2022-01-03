
var rtcSocket = io.connect(`https://www.unoo.kro.kr/rtc`, { path: '/socket.io', });
const videoGrid = document.getElementById('video-grid');
let mypeer;

const myVideo = document.getElementById('myVideo');
/*이거쓸거면 메인페이지에 카메라객체 만들어놓은거 없애기
const myVideo =document.createElement('video');
alert();
myVideo.setAttribute('muted', true);
myVideo.setAttribute('playsinline', true);
myVideo.setAttribute('autoplay', true);
*/
/* 미리 html에 만들어진 객체는 위의 세팅이 안먹힘*/
//myVideo.volume=0;
const peers = {};
let myStream;
var callList = [];
var myPeerId;

rtcSocket.on('connect', function () {
    navigator.mediaDevices
        .getUserMedia({
            video: true,
            audio: true,
        })
        .then((stream) => {
            addVideoStream(myVideo, stream, myPeerId); 
            peerInit(stream);
        }).catch((err)=>{
            //alert("Camarea 장치가 없을시 서비스 참여 불가");
           // window.history.back();
        });
})

function peerInit(stream){

    myPeer = new Peer(null, {
        "iceServers": [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
            , { 'urls': 'turn:58.238.248.102:3478', 'credential': 'myPw', 'username': 'myId' }
        ],
        host: 'www.unoo.kro.kr',
        port: 443,
        path: '/peerjs/myapp',
        secure: true,
        debug: 3,
    });

    myPeer.on('open', (id) => {
        log('시그널링서버로 통신이 열림')
        myPeerId = id;
        //중요!!!!!!!!
        //시그널링 서버로 내가 신규 참여했다는 사실을 전달
        rtcSocket.emit('peer-open', id);
    });


    myPeer.on('error', function (err) {
        log("시그널링 서버연결에 에러 발생" + err);
      
        
    })
    myPeer.on('close', function (id) {
        log('시그널링 서버와의 연결 닫힘')
        log('closes' + id);
      //  alert('peeronclose');

    })
    myPeer.on('disconnected', (id) => {
        log('시그널링 서버와의 연결 해제')
        log('disconnected'+ id);

    });
    myPeer.on('call', (call) => {
     
        log("나한테들어온전화받음");      
        const video = document.createElement('video');
        video.id = call.peer;
        // video.style.border = '1px solid black';
        //video.setAttribute('muted', true);
        video.setAttribute('playsinline', true);
        video.setAttribute('autoplay', true);
        // const {video,box}=makeVideoBox();
        call.answer(stream); //내 스트림을 상대에게 전송
        call.on('stream', (userVideoStream) => { //상대가 보낸 스트림을 내 화면에 뿌리기
            log('스트림을 통해 영상전송중');
            let flag;
            if (!callList[call.peer]) {
                callList[call.peer] = call;
                peers[call.peer] = call;
                flag = true;
            } else {
                flag = false;
            }
            addVideoStream(video, userVideoStream, flag);
        });

        call.on('error', function (err) {
         //   alert('callonerror');
            try {
                removePeer(call.peer);
                if (video)
                    {
                        let parent = video.parentNode;
                        var len = parent.childElementCount;
                        for(var i=0; i<len; i++)
                            parent.removeChild(parent.childNodes[i]);
                        parent.remove();
                        //video.remove();
                    }
                setTimeout(() => {
                    adjustVideoGrid();
                })
            } catch (error) {
                alert(error);
            }
        })

        call.on('close', function () {
            //alert('callonclose');
            try {
                removePeer(call.peer);
                if (video){
                    let parent = video.parentNode;
                    var len = parent.childElementCount;
                    for(var i=0; i<len; i++)
                        parent.removeChild(parent.childNodes[i]);
                    parent.remove();
                    //video.remove();
                }
                setTimeout(() => {
                    adjustVideoGrid();
                })
            } catch (error) {
                alert(error);
            }
        })

    });
    rtcSocket.on('peer-connected', (userId) => {
        log('시그널링 서버로부터 신규 참여자가 등장했다는 알람을 받음, 신규 유저를 내 화면에 렌더링 처리');
        // rtcSocket.emit('test');
        if (!peers[userId]) {
            connectToNewUser(userId, stream);
        } else {
            log('이미연결되어있음');
        }

    });
}

rtcSocket.on('socket-disconnected', (userId) => {
    log('소켓을 통해 peer disconnect 처리중');
    if (peers[userId]) {
        try {
            log('peer 파괴 처리중 ');
            peers[userId].close();
            peers[userId] = null;
            callList[userId]=null;
            let video = document.getElementById(userId);
            log('video ' + video);
            if (video){
                let parent = video.parentNode;
                var len = parent.childElementCount;
                for(var i=0; i<len; i++)
                    parent.removeChild(parent.childNodes[i]);
                parent.remove();
                //video.remove();
            }
            adjustVideoGrid();
        } catch (err) {
            alert(err);
        }
    }
});

function connectToNewUser(otherId, stream) {

    const call = myPeer.call(otherId, stream);
    const video = document.createElement('video');
    video.id = otherId;
    // video.style.border = '1px solid black';
    //video.setAttribute('muted', true);
    video.setAttribute('playsinline', true);
    video.setAttribute('autoplay', true);
    console.log("상대접속처리");
    call.on('stream', (userVideoStream) => {
        log('call Stream');
        let flag;
        if (!callList[call.peer]) {
            callList[call.peer] = call;
            peers[otherId] = call;
            flag = true;
        } else {
            flag = false;
        }
        addVideoStream(video, userVideoStream, flag = true);
    });
    call.on('close', () => { 
        try {          
           removePeer(call.peer);
            if (video){
                let parent = video.parentNode;
                var len = parent.childElementCount;
                for(var i=0; i<len; i++)
                    parent.removeChild(parent.childNodes[i]);
                parent.remove();
                //video.remove();
            }
            setTimeout(() => {
                adjustVideoGrid();
            })
        } catch (error) {
//alert(error);
        }
    });

    call.on('disconnected', () => {

        try {
           removePeer(call.peer);
            if (video){
                let parent = video.parentNode;
                var len = parent.childElementCount;
                for(var i=0; i<len; i++)
                    parent.removeChild(parent.childNodes[i]);
                parent.remove();
                //video.remove();
            }
            setTimeout(() => {
                adjustVideoGrid();
            })
        } catch (error) {
           // alert(err)
        }

    });
    call.on('error', (err) => {
        try {
            removePeer(call.peer);
             if (video){
                let parent = video.parentNode;
                var len = parent.childElementCount;
                for(var i=0; i<len; i++)
                    parent.removeChild(parent.childNodes[i]);
                parent.remove();
                //video.remove();
            }
             setTimeout(() => {
                 adjustVideoGrid();
             })
         } catch (error) {
             //alert(err)
         }
        
    });
}

function removePeer(rmPeerId){
    if (peers[rmPeerId]) {
        peers[rmPeerId].close();
        peers[rmPeerId] = null;
        callList[rmPeerId] = null;
        ;
        delete peers[rmPeerId];
        delete callList[rmPeerId];
    }
}
function addVideoStream(video, stream, flag = true) {

    try {
        video.srcObject = stream;
    } catch (error) {
        alert(error);
    }
    video.addEventListener('loadedmetadata', () => {
        try {
            log('비디오 재생');
            video.play();
        } catch (error) {
            alert('비디오재생에러');
        }
    });
    if (device_check() == 'mobile') {
        if(flag==true){
            videoGrid.append(video);
        }else{

        }
    } else {
        let div = document.createElement('div');
        div.classList.add('video-wrapper');     
        let div2 = document.createElement('div');
        div2.classList.add('overlay-text');
        div2.innerText = "test";

        let leftGrid = document.getElementById('video-grid');
        let rightGrid = document.getElementById('video-grid-Right');
        
        if(video.parentNode && video.parentNode.classList[0] == "video-wrapper")
        {
            var aa= '수정필요';

        }
        video.style.height = (document.body.offsetHeight)/3+ "px";
        if (flag == true) {
            let grid = leftGrid.childElementCount > rightGrid.childElementCount ? rightGrid : leftGrid;
            div.append(div2);
            div.append(video);
            grid.append(div);
            /*
            if (leftGrid.childElementCount > rightGrid.childElementCount) {
                {
                    div.append(div2);
                    div.append(video);
                    rightGrid.append(div);
                }    
            } else {
                {
                    div.append(div2);
                    div.append(video);
                    leftGrid.append(div);
                }
            }
            */
        }
    }
    setTimeout(() => {
        adjustVideoGrid();
    })

}
function log(msg) {
    console.log(msg);
    var p = document.getElementById('log');
    p.innerHTML = msg + "\n" + p.innerHTML;
}
function makeVideoBox() {
    const box = document.createElement('div');
    const volControl = document.createElement('input');
    volControl.type = "range";
    volControl.min = 0;
    volControl.max = 100;
    volControl.step = 1;
    volControl.oninput = (event) => {
        SetVolume(event, video, this.value);
    };
    volControl.onchange = () => {
        SetVolume(event, video, this.value);
    };
    const video = document.createElement('video');
    video.id = call.peer;
    video.setAttribute('playsinline', true);
    video.setAttribute('autoplay', true);
    box.append(video);
    box.append(volControl);
    return { video, box };
}
function SetVolume(event, video, val) {
    console.log('Before: ' + video.volume);
    video.volume = val / 100;
    console.log('After: ' + video.volume);

}