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
  listEventListener();
};

let targetListNum;
const addList = (listDataSet, listTitle) => {
  console.log("addList");
  if(listTitle !== ''){
    const list = createEl('div');
    list.classList.add('list', 'grid');
    list.dataset.list = listDataSet;
    list.innerHTML += `
    <div class="list__menu--wrap none">
      <div class="remove">삭제</div>
    </div>
    <div class="list__container" >
      <div class="list__header flex">
        <p class="list__title">${listTitle}</p>
        <div class="list__menu"><i class=" fa-ellipsis-h fa"></i></div>
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
const base64File = (file) =>{
  let img = cardView_popupWrap.classList.contains('none') ? image : cardViewImage.childNodes[0];
  let reader = new FileReader();
  reader.onload = function () {
    let result = reader.result;
    img.src = result;
    return result;
  };
  reader.readAsDataURL( file ); 
};

const elementChange = (target) => {
  target.remove();
  let input =  createEl('input');
  input.setAttribute('type', 'text');
  input.setAttribute('value', target.innerText);
  input.addEventListener("keydown", e => {
    if(window.event.keyCode === 13){
      input.blur();
    }
  })
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
        if(e.classList.contains('cardView__view--content'))data.result.content ==='' ? e.innerText = '설명을 입력해주세요..' : e.innerText= data.result.content;
      }
    })
  }
};


const addCard = (listDataSet, cardTitle, cardImg) => {
  if(cardTitle !== ''){
    let list = document.querySelector(`.list[data-list='${listDataSet}'`);
    if(list){
      list.childNodes[3].childNodes[3].innerHTML += cardImg === 'http://127.0.0.1:5500/img/noimage.png' ? `<div class="card" data-card="${cardCnt}">${cardTitle}</div>` : `<div class="card" data-card="${cardCnt}"><img data-card="${cardCnt}" src="${cardImg}" alt="card__img" class="card__img" id="card__add--img">${cardTitle}</div>`;
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

const modifyCard = () => {
  
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

const DBDeleteCard = (key) => {
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
          if(cursor.value.dataSet === key){
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
  };
  
  const DBFetch = (name, key) => {
    key = parseInt(key);
    const pNotes = db.transaction(name).objectStore(name);
    const request = pNotes.get(key);
    return request;
  };
  
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
  
  const listEventListener = ()=> {
    if(list){
      list.forEach(el => {
        el.addEventListener("click", (e) => {
          let list = document.querySelector(`.list[data-list='${e.currentTarget.dataset.list}'`);
          //list menu
          if(e.target.classList.contains("fa-ellipsis-h")){
            list.childNodes[1].classList.toggle('none');
            return;
          }
          // list remove
          if(e.target.classList.contains("remove")){
            DBDeleteList(list.dataset.list);
            list.remove();
            return;
          }
          // cardView
          if(e.target.classList.contains("card") || e.target.classList.contains("card__img")) {
            viewCard(e.target.dataset.card);
            return;
          }
          //card add
          if(e.target.classList.contains("list__footer") || e.target.classList.contains("list__footer--txt") ){
            card_popupWrap.classList.remove("none");
            targetListNum = e.currentTarget.dataset.list;
            return;
          }
      });
      });
    }
  }

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

cardViewOpenFileButton.addEventListener('change' , e => base64File(e.target.files[0]));
cardView_popupWrap.addEventListener("click", e => {
  if(e.target.classList.contains('cardView__form--title')){
    let input = elementChange(e.target);
    input.classList.add('cardView__popup--title')
    cardViewImage.before(input);
    input.focus();
    return;
  }
  
  if(e.target.classList.contains('cardView__view--content')){
    let input = elementChange(e.target);
    input.classList.add('cardView__popup-content')
    cardView_listModifyForm.appendChild(input);
    input.focus();
    return;
  }
  
  if(e.target.classList.contains('cardView__add--btn')){
    console.log('add');
  }
  
  if(e.target.classList.contains('cardView__cancel--btn')){
    cardView_popupWrap.classList.toggle('none');
    return;
  }
});

openFileButton.addEventListener("change",(e) => base64File(e.target.files[0]));
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

