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
            addVideoStream(myVideo, stream);
            peerInit(stream);
        }).catch((err)=>{
            alert("Camarea 장치가 없을시 서비스 참여 불가");
        });
})

function peerInit(stream){

    myPeer = new Peer(null, {
        host: 'www.unoo.kro.kr',
        port: 443,
        path: '/peerjs/myapp',
        secure: true,
        debug: 3,
    });

    myPeer.on('open', (id) => {
        log('피어서버로 통신이 열림')
        myPeerId = id;
        rtcSocket.emit('peer-open', id);
    });


    myPeer.on('error', function (err) {
        log("내 피어 에러 잡기" + err);
    })
    myPeer.on('close', function (id) {
        log('받았던전화끊김 마이피어')
        log('closes' + id);

    })
    myPeer.on('disconnected', (id) => {
        log('doooooooooo ' + id);
        log('disconnected 받았던 전화가 연결끊김');
    });


    myPeer.on('call', (call) => {
        log("나한테들어온전화받음");
        log(4);
        const video = document.createElement('video');
        video.id = call.peer;
        // video.style.border = '1px solid black';
        //video.setAttribute('muted', true);
        video.setAttribute('playsinline', true);
        video.setAttribute('autoplay', true);
        // const {video,box}=makeVideoBox();
        call.answer(stream);
        call.on('stream', (userVideoStream) => {
            log('스트림을 통해 영상전송중');
            let Flag;
            if (!callList[call.peer]) {
                callList[call.peer] = call;
                log('이건가' + call.peer);
                peers[call.peer] = call;
                flag = true;
            } else {
                flag = false;
            }

            addVideoStream(video, userVideoStream, flag);
        });
        call.on('error', function (err) {
            log("여기에러나옴" + err);
        })
        call.on('close', function (id) {
            log('받았던전화끊김찾았다 ' + id + "\n" + call.peer);
            log('closes ' + id);

            try {
                log('걸었던 전화가 끊긴 후 작업');
                if (peers[id]) {
                    peers[id].close();
                    peers[id] = null;
                    callList[call.peer] = null;
                }
                if (video)
                    video.remove();
                setTimeout(() => {
                    adjustVideoGrid();
                })
            } catch (error) {
                alert(error);
            }


        })

    });

    rtcSocket.on('peer-connected', (userId) => {
        log('피어서버 통신열림 이후 소켓통해 피어아이디 전달')
        // rtcSocket.emit('test');
        if (!peers[userId]) {
            connectToNewUser(userId, stream);
        } else {
            log('이미연결되어있음');
        }

    });
}

function reSet(id, call, video) {
    if (peers[id]) {
        peers[id].close();
        peers[id] = null;
        callList[call.peer] = null;
    }
    if (video)
        video.remove();
    setTimeout(() => {
        adjustVideoGrid();
    })
}


rtcSocket.on('socket-disconnected', (userId) => {
    log('소켓을 통해 peer disconnect 처리중');
    if (peers[userId]) {
        try {
            log('peer 파괴 처리중 ');
            peers[userId].close();
            peers[userId] = null;
            let video = document.getElementById(userId);
            log('video ' + video);
            if (video)
                video.remove();
            adjustVideoGrid();
        } catch (err) {
            alert(err);
        }
    }
});

function connectToNewUser(userId, stream) {
    log("전화걸음")
    const call = myPeer.call(userId, stream);

    const video = document.createElement('video');
    video.id = userId;
    // video.style.border = '1px solid black';
    //video.setAttribute('muted', true);
    video.setAttribute('playsinline', true);
    video.setAttribute('autoplay', true);

    call.on('stream', (userVideoStream) => {
        log('call Stream');
        let Flag;
        if (!callList[call.peer]) {
            callList[call.peer] = call;
            peers[userId] = call;
            flag = true;
        } else {
            flag = false;
        }

        addVideoStream(video, userVideoStream, flag = true);
    });
    call.on('close', (id) => {
        log('close the call 걸었던 전화가 끊김 ');
        try {
            log('걸었던 전화가 끊긴 후 작업');
            if (peers[userId]) {
                peers[userId].close();
                peers[userId] = null;
                callList[call.peer] = null;
            }
            if (video)
                video.remove();
            setTimeout(() => {
                adjustVideoGrid();
            })
        } catch (error) {
            alert(error);
        }

    });

    call.on('disconnected', (id) => {

        log('disconnected 걸었던 전화가 연결끊김');
        try {


            if (peers[userId]) {
                peers[userId].close();

                peers[userId] = null;
                callList[call.peer] = null;
            }
            if (video)
                video.remove();
            setTimeout(() => {
                adjustVideoGrid();
            })
        } catch (error) {
            alert(err)
        }

    });
    call.on('error', (error) => {
        log('걸었던 전화의 에러' + error);
        //alert(error);
    });



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
        videoGrid.append(video);
    } else {
        let leftGrid = document.getElementById('video-grid');
        let rightGrid = document.getElementById('video-grid-Right');
        if (flag == true) {
            if (leftGrid.childElementCount > rightGrid.childElementCount) {
                rightGrid.append(video);
            } else {
                leftGrid.append(video);
            }
        }
    }

    setTimeout(() => {
        adjustVideoGrid();
    })

}

function log(msg) {
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