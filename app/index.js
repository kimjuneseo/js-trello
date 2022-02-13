const addlistBtn = document.querySelector(".addlist");
addlistBtn.addEventListener("click", e =>  list_popupWrap.classList.toggle("none"));
let boardContainer = document.querySelector(".container");
// add list popup
const list_popupWrap = document.querySelector(".list__popup");
const list_listForm = document.list__form;
//add card popup
const card_popupWrap = document.querySelector(".card__popup");
const card_cardForm = document.card__form;
let image = document.querySelector("#card__add--img");
const openFileButton = document.querySelector("#openFile"); 
//cardView popup
const cardView_popupWrap = document.querySelector(".cardView__popup");
let cardView_listModifyForm = document.cardView__form;
let cardViewImage = document.querySelector('.cardView__form--img')
const cardViewOpenFileButton = document.querySelector("#cardViewopenFile");

const createEl = (el) => document.createElement(el);

// list method
let cardCnt = 0;
const addListListener = () => {
  let title = list_listForm.list.value;
  dataSetCnt++;
  addList(dataSetCnt, title);
  DBAdd('trello__list' ,dataSetCnt, title);
  list_popupWrap.classList.toggle("none");
};

let list;
const listChk = () => {
  list = document.querySelectorAll('.list')
  listEventListener(list);
};

let targetListNum;
const addList = (listDataSet, listTitle) => {
  if(listTitle !== ''){
    const list = createEl('div');
    list.classList.add('list', 'grid');
    list.dataset.list = listDataSet;
    list.innerHTML += `
    <input type="checkbox" id="list__menu${listDataSet}" class="list__input_chk">
    <div class="list__menu--wrap none">
      <div class="remove">삭제</div>
    </div>
    <div class="list__container" >
      <div class="list__header flex">
        <p class="list__title">${listTitle}</p>
        <label for="list__menu${listDataSet}" class="list__menu"><i class=" fa-ellipsis-h fa"></i></label>
      </div>
      <div class="cards flex"></div>
      <div class="list__footer flex">
        <div class="list__footer--txt">+ Add a card</div>
      <i class="fa fa-copy"></i>
      </div>
    </div> `;
    addlistBtn.before(list);
    list_listForm.reset();
  };
  listChk();
};
  
//card method
let cardDataSet;
const onBase64File = (file, db) =>{
  let img = cardView_popupWrap.classList.contains('none') ? image : cardViewImage.childNodes[0];
  let reader = new FileReader();
  reader.onload = function () {
    let result = reader.result;
    img.src = result;
    if(db){
      DBCardModify(cardDataSet, 'image', result);
    }
    return result;
  };
  reader.readAsDataURL(file); 
};

const elementChange = (target, keyName) => {
  target.remove();
  let input =  createEl('input');
  input.setAttribute('type', 'text');
  input.setAttribute('value', target.innerText);
  input.addEventListener("keydown", e => {
    if(window.event.keyCode === 13){
      DBCardModify(cardDataSet, keyName, input.value);
      input.blur();
    }
  });
  input.addEventListener("blur", e => {
    DBCardModify(cardDataSet, keyName, input.value);
  });
  return input;
};

const viewCard = (list) => {
  cardView_popupWrap.classList.remove("none");
  let data = DBFetch('trello__card', list);
  data.onsuccess = e => {
    cardView_listModifyForm.childNodes.forEach(e => {
      if(e.classList){
        if(e.classList.contains('cardView__form--title'))  e.innerText = data.result.title;
        if(e.classList.contains('cardView__form--img'))    e.childNodes[0].src = data.result.image;
        if(e.classList.contains('cardView__view--content')) e.innerText = data.result.content ==='' ? '설명을 입력해주세요..' :  data.result.content;
      }
    })
  }
};

const addCard = (listDataSet, cardTitle, cardImg) => {
  if(cardTitle !== ''){
    let list = document.querySelector(`.list[data-list='${listDataSet}'`);
    if(list){
      list.childNodes[5].childNodes[3].innerHTML += cardImg === 'http://127.0.0.1:5500/img/noimage.png' ? `<div class="card" data-card="${cardCnt}" draggable="false"><p class="cardTitle" data-card="${cardCnt}">${cardTitle}</p></div>` : `<div class="card" draggable="false" data-card="${cardCnt}"><img draggable="false" data-card="${cardCnt}" src="${cardImg}" alt="card__img" class="card__img" id="card__add--img"><p class="cardTitle" data-card="${cardCnt}">${cardTitle}</p></div>`;
      image.src = '';
      card_cardForm.reset();
      cardCnt++;
    }
  }
};

const addCardListener = () => {
  card_popupWrap.classList.toggle("none");
  let card_title = card_cardForm.card.value;
  DBAdd('trello__card', targetListNum, card_title, image.src , '');
  addCard(targetListNum, card_title, image.src);
};

// DB METHOD
let db = null;
let dataSetCnt = 0;
const DBCreate = () => {
  const request = indexedDB.open('Trello', 1)
      request.onupgradeneeded = e => {
          db = e.target.result;
          const pNotes = db.createObjectStore("trello__list", {keyPath: "dataSet"});
          const todoNotes = db.createObjectStore("trello__card",{keyPath: "cardCnt"});
         console.log(`upgrade is called database name: ${db.name} version : ${db.version}`);
      }
      request.onsuccess = e => {
          db = e.target.result;
          console.log(`success is called database name: ${db.name} version : ${db.version}`);
          init("trello__list");
          init("trello__card");
      }
}; 
DBCreate();

const DBAdd = (tableName, dataSet, title, image, content) => {
  const data = tableName === 'trello__list' ? {dataSet, title} : {cardCnt, dataSet, title, image, content} 
  const tx = db.transaction(tableName, "readwrite");
  tx.onerror = e => console.log(`Error! ${e.target.error}`);
  const table = tx.objectStore(tableName);
  table.add(data);
};

const DBDeleteList = (key) => {
  key = parseInt(key);
  const request = indexedDB.open('Trello', 1)
  request.onsuccess = e => {
    let db = e.target.result;
    let transaction = db.transaction("trello__list", "readwrite");
    
    let objectStore = transaction.objectStore("trello__list");
    let deleteRequest = objectStore.delete(key);
    deleteRequest.onsuccess = e => console.log("delete");
    DBDeleteCard(key);
  }
};

const DBDeleteCard = (key, cardCnt) => {
  key = parseInt(key);
  const request = indexedDB.open('Trello', 1)
  request.onsuccess = e => {
    let db = e.target.result;
    let transaction = db.transaction("trello__card", 'readwrite');
    const pNotes = transaction.objectStore("trello__card");
    const request = pNotes.openCursor();
    request.onsuccess = e => {
      const cursor = e.target.result;
      if (cursor) {
        if(cardCnt){
          if(cursor.key === key) cursor.delete();
        } 

        if(cursor.value.dataSet === key) cursor.delete();
          cursor.continue();
        }
      };
    }
  };
  
  const DBCardModify = (key, name, value) => {
    key = parseInt(key);
    const request = indexedDB.open('Trello', 1);
    request.onsuccess = e => {
      let objectStore = db.transaction("trello__card", "readwrite").objectStore("trello__card");
      let request = objectStore.get(key);
      request.onsuccess = e => {
        let data = e.target.result;
        let card = document.querySelector(`.card[data-card='${key}'`);
        if(name === 'title') {
          data.title = value;
          card.childNodes[1].innerText = value;
        }
        
        if(name === 'content') data.content = value;
        
        if(name === 'image'){
          card.childNodes[0].src = value;
          data.image = value;
        }
        
        let requestUpdate = objectStore.put(data);
         requestUpdate.onsuccess = () => {
           console.log('update');
         };
      };
      
    }
  }

  const DBFetch = (name, key) => {
    key = parseInt(key);
    const pNotes = db.transaction(name).objectStore(name);
    const request = pNotes.get(key);
    return request;
  };

  const listEventListener = (list)=> {
    if(list){
      list.forEach(el => {
        el.addEventListener("click", (e) => {
          let list = document.querySelector(`.list[data-list='${e.currentTarget.dataset.list}'`);
          if(list){
            // list remove
            if(e.target.classList.contains("remove")){
              DBDeleteList(list.dataset.list);
              list.remove();
              return;
            }
            // cardView
            if(e.target.classList.contains("card") || e.target.classList.contains("card__img") || e.target.classList.contains("cardTitle")) {
              viewCard(e.target.dataset.card);
              cardDataSet = e.target.dataset.card;
              return;
            }
            //card add
            if(e.target.classList.contains("list__footer") || e.target.classList.contains("list__footer--txt") ){
              card_popupWrap.classList.remove("none");
              targetListNum = e.currentTarget.dataset.list;
              return;
            }
          }
        });

      });
    }
  };



  list_popupWrap.addEventListener("click", e => {
  if(e.target.classList.contains('list__cancel--btn')){
    list_popupWrap.classList.toggle("none");
    return;
  }
  if(e.target.classList.contains('list__add--btn')){
    addListListener();
    return;
  }
});

cardViewOpenFileButton.addEventListener("change", e => onBase64File(e.target.files[0], true));
cardView_popupWrap.addEventListener("click", e => {
  if(e.target.classList.contains("cardView__form--title")){
    let input = elementChange(e.target, "title");
    input.classList.add('cardView__popup--title')
    cardViewImage.before(input);
    input.focus();
    return;
  }
  
  if(e.target.classList.contains('cardView__view--content')){
    let input = elementChange(e.target, 'content');
    input.classList.add('cardView__popup-content')
    cardView_listModifyForm.appendChild(input);
    input.focus();
    return;
  }
  
  if(e.target.classList.contains('cardView__add--btn')){
    cardView_popupWrap.classList.toggle('none');
    DBDeleteCard(cardDataSet, true);
    let card = document.querySelector(`.card[data-card='${cardDataSet}'`);
    card.remove();
    return;
  }
  
  if(e.target.classList.contains('cardView__cancel--btn')){
    cardView_popupWrap.classList.toggle('none');
    // window.location.reload();
    return;
  }
});

openFileButton.addEventListener("change",(e) => onBase64File(e.target.files[0]));
card_popupWrap.addEventListener('click', e => {
  if(e.target.classList.contains('card__cancel--btn')){
    card_popupWrap.classList.toggle("none");
    return;
  }
  if(e.target.classList.contains('card__add--btn')){
    addCardListener();
    return;
  }
});

  // init
  const init = (name) => { 
    const tx = db.transaction(name,"readonly");
    const pNotes = tx.objectStore(name);
    const request = pNotes.openCursor();
    request.onsuccess = e => {
      const cursor = e.target.result;
      if (cursor) {
        if(name === 'trello__list'){
          dataSetCnt = cursor.key;
          addList(dataSetCnt, cursor.value.title);
        }else{
          cardCnt = cursor.key;
          addCard(cursor.value.dataSet, cursor.value.title, cursor.value.image, cardCnt);
        }
        cursor.continue();
      }
    };
  };



let wrapper = document.querySelectorAll('.list');

let isDown = false; // mousedown 했는지
let clone = null; // 선택한 아이템 clone
const targetInfo = {}; // target item info { gap: [x, y], width: number, height: number }
const currentPoint = {}; // 현재 마우스 point { x: number, y: number }

const placeholder = document.createElement('div'); // 아이템 드래그시 미리보기 element
placeholder.className = 'card placeholder';

// placeholder 추가 함수
const addPlaceholder = () => {
  console.log(Array.from(document.querySelectorAll('.list')));
  Array.from(document.querySelectorAll('.list')).some(wrapper => { // wrapper들 순회 (some을 사용한 이유는 마우스 포지션 내에 있는 wrapper를 만나면 거기서 loop를 종료하려고)
    const rect = wrapper.getBoundingClientRect();

    if (rect.left < currentPoint.x && currentPoint.x < rect.left + wrapper.clientWidth) { // 마우스 포지션이 wrapper 내에 있으면
      const isAddPlaceholder = Array.from(wrapper.children).filter(({ className }) => className === 'card').some((item) => { // item 순회 여기서 some을 사용한 이유도 위와 동일
        const rect = item.getBoundingClientRect();

        if (currentPoint.y < rect.top + item.clientHeight / 2) { // 마우스가 해당 아이템보다 위에 있으면
          placeholder.remove(); // 기존에 있던 placeholder를 제거

          wrapper.insertBefore(placeholder, item); // 해당 아이템의 이전에 placeholder를 추가

          return true; // loop 종료
        }
      });

      if (!isAddPlaceholder) { // 만약에 loop를 다 돌았는데도 해당되는 아이템이 없다면
        placeholder.remove(); // 기존에 있던 placeholder를 제거

        wrapper.appendChild(placeholder); // 해당 wrapper의 맨 마지막에 placeholder 추가
      }

      return true; // wrapper 순회 종료
    }
  });
}

Array.from(wrapper).map(ele => {
  ele.addEventListener('mousedown', ({ target, pageX, pageY }) => {
    if (!(target.className === 'card')) {
      return;
    }

    isDown = true; // 마우스 down flag = true

    const rect = target.getBoundingClientRect();

    Object.assign(currentPoint, { // 현재 마우스 point 위치 세팅
      x: pageX,
      y: pageY,
    });

    Object.assign(targetInfo, {
      gap: [pageX - rect.left, pageY - rect.top], // mousedown한 위치가 item의 x y 좌표랑 얼마나 차이 나는지
      width: target.clientWidth, // 아이템 사이즈
      height: target.clientHeight, // 아이템 사이즈
    });

    placeholder.style.height = targetInfo.height + 'px'; // placeholder의 사이즈를 target 만큼 설정

    clone = target.cloneNode(true); // 아이템 clone

    Object.assign(clone.style, { // clone item style 세팅
      position: 'fixed',
      width: target.clientWidth + 'px',
      height: target.clientHeight + 'px',
      left: rect.left + 'px',
      top: rect.top + 'px',
      zIndex: 999,
    });

    target.parentElement.insertBefore(placeholder, target); // 현재 아이템의 위치에 placeholder 추가함

    target.remove(); // 타켓 아이템 삭제

    document.body.appendChild(clone); // clone 아이템 화면에 추가
  });
});

window.onmousemove = ({ pageX, pageY }) => {
  wrapper = document.querySelectorAll('.list');
  if (!isDown) {
    return;
  }
  console.log(123)

  Object.assign(currentPoint, { // 현재 마우스 point 위치 세팅
    x: pageX,
    y: pageY,
  });

  Object.assign(clone.style, { // style position 세팅
    left: pageX - targetInfo.gap[0] + 'px',
    top: pageY - targetInfo.gap[1] + 'px',
  });

  addPlaceholder();
}

window.onmouseup = () => {
  if (isDown) {
    console.log(wrapper)
    isDown = false;

    clone.remove(); // 마우스에 있던 clone 제거
    clone.removeAttribute('style'); // style 제거 (:55 style 적용 참고)
    placeholder.parentElement.insertBefore(clone, placeholder); // placeholder 위치에 드래그한 아이템 추가

    clone = null; // clone null로 초기화

    placeholder.remove(); // placeholder 추가한거 제거
  }
}