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
      <div class="cards grid"></div>
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
  
  //drag and drop
  const onDragover = (e) => {
    if(e.target.classList.contains('cards') || e.target.classList.contains('card')){
      e.preventDefault();
    }
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
  
  const throttle = (callback, limit = 100) => {
    let waiting = false;
    return function() {
        if(!waiting) {
            callback.apply(this, arguments);
            waiting = true;
            setTimeout(() => waiting = false , limit)
          }
        };
  };
  let chkClick = false;
  let layerX;
  let layerY;
  let moveCard
  window.addEventListener("mousedown", e => {
    if(e.target.classList.contains("card") || e.target.classList.contains("card__img") || e.target.classList.contains("cardTitle")) {
      e.preventDefault();
      moveCard = document.querySelector(`.card[data-card='${e.target.dataset.card}']`);
      layerX = e.target.offsetWidth/2;
      layerY = e.target.offsetHeight/2;
      moveCard.style.position = 'absolute'
      moveCard.style.zIndex= 99;
    }
    });
  window.addEventListener("mousemove", throttle((e) => {
    if(moveCard){
      moveCard.style.left =  `${e.pageX - layerX}px`;
      moveCard.style.top =   `${e.pageY - layerY}px`;  
    }
  },100));

  window.addEventListener("mouseup", e => {
      moveCard.style.position = ''
      moveCard.style.left =0;
      moveCard.style.top = 0; 
  })

  
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
