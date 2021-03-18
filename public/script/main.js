
function getUrlParams() {
    var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) { params[key] = value; });
    return params;
}
function checkLogin(user) {
    if (!user||user=="null")
        return false;
    else {
        document.getElementById('LoginOrUser').innerHTML
            = `Hi ${user.name}<br><a href='/auth/logout' style='font-size:20px;'>log out</a><br>`;
        return true;
    }
}
function parseEjsVar(str) {
    ret = str.replace(/&#34;/gi, '\"');
    ret = JSON.parse(ret);
    return ret;
}
function makeRoomList(roomList, roomNowUserLst, flag = true) {
    if (roomList == "null")
        return;
    if (flag) {
        roomList = parseEjsVar(roomList);
        roomNowUserLst = parseEjsVar(roomNowUserLst);
    }
    console.log(roomNowUserLst);
    let tbody = document.getElementById('roomsBody');
    let str = '';
    for (let i = 0; i < roomList.length; i++) {
        str += `<tr><td class='tbTitle'>${roomList[i].title}</td><td >${roomNowUserLst[i]}</td><td class='tbMaxUser'>${roomList[i].max}</td><td>${roomList[i].owner}</td><td><input data-roomId='${roomList[i]._id}' onClick='joinRoom(event)' value='참가' type='button'></input></td><td><input data-roomId='${roomList[i]._id}' onClick='deleteRoomProcess(event)' value='삭제' type='button'></input></td></tr>`

    }
    tbody.innerHTML = str;
}
function joinRoom(event) {
    if (checkLogin(user) == false) {
        alert("Please Login");
        return;
    }
    let roomId = event.target.getAttribute("data-roomId");
    location.href = `/room/${roomId}`;
}
function removeCreatePopup() {
    let popup = document.getElementById('createRoomPopup');
    popupFlag = false;
    popup.remove();
}
let popupFlag = false;

function showCreateRoomPopup() {
    if (popupFlag == true)
        return;
    let divEle = document.createElement('div');
    divEle.id = 'createRoomPopup';
    divEle.style.backgroundColor = "white";
    divEle.style.border = '1px solid black';
    divEle.style.display = 'table';
    divEle.style.textAlign = 'center';
    divEle.style.boxShadow = '5px 5px 5px';
    //divEle.style.marginLeft=window.innerWidth/2-divEle.clientWidth/2+"px";
    divEle.innerHTML = `<div style='display:table-cell,text-align:center'><table>
<tr><td>방 제목</td><td><input id='newRoomTitle' type='text'></td></tr>
<tr><td><input onclick='createRoomProcess()'type='button'value='생성'></td><td><input onclick='removeCreatePopup()' type='button'value='취소'></td></tr>
</table></div>`
    document.body.appendChild(divEle);
    popupFlag = true;
}


async function createRoomProcess() {

    let title = document.getElementById('newRoomTitle').value;
    let response = await fetch('/room', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8'//'Application/json ;charset=utf-8'
            //text/plain;charset=UTF-8로 기본 설정된다
        },
        body: title,
    });
    if (response.ok) { // HTTP 상태 코드가 200~299일 경우
        // 응답 몬문을 받습니다(관련 메서드는 아래에서 설명).
        let responseJson = await response.json();
        if (responseJson.status) {
            makeRoomList(responseJson.rooms, responseJson.roomNowUserLst, false);
        } else {
            alert(responseJson.reason);
        }
        removeCreatePopup();
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

async function deleteRoomProcess(event) {

    let roomId = event.target.getAttribute("data-roomId");
    let response = await fetch('/room', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8'//'Application/json ;charset=utf-8'
            //text/plain;charset=UTF-8로 기본 설정된다
        },
        body: roomId,
    });
    if (response.ok) { // HTTP 상태 코드가 200~299일 경우
        // 응답 몬문을 받습니다(관련 메서드는 아래에서 설명).
        let responseJson = await response.json();

        if (responseJson.status) {
            makeRoomList(responseJson.rooms, responseJson.roomNowUserLst, false);

        } else {
            alert(responseJson.reason);
        }
    } else {
        alert("HTTP-Error: " + response.status);
    }

}
