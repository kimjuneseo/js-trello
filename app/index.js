
const addlistBtn = document.querySelector(".addlist");
let boardContainer = document.querySelector(".container");
// add list popup
const list_popupWrap = document.querySelector(".list__popup");
const list_exitBtn = document.querySelector(".list__cancel--btn");
const list_addBtn = document.querySelector(".list__add--btn");
const list_listForm = document.list__form;
//add card popup
const card_popupWrap = document.querySelector(".card__popup");
const card_exitBtn = document.querySelector(".card__cancel--btn");
const card_addBtn = document.querySelector(".card__add--btn");
const card_cardForm = document.card__form;
let image = document.querySelector("#card__add--img");
// modify list popup
const listModify_popupWrap = document.querySelector(".listModify__popup");
const listModify_exitBtn = document.querySelector(".listModify__cancel--btn");
const listModify_addBtn = document.querySelector(".listModify__add--btn");
let listModify_listModifyForm = document.listModify__form;
//cardView popup
const cardView_popupWrap = document.querySelector(".cardView__popup");
const cardView_exitBtn = document.querySelector(".cardView__cancel--btn");
const cardView_addBtn = document.querySelector(".cardView__add--btn");
let cardView_listModifyForm = document.cardView__form;

// method
const createEl = (el) => document.createElement(el);
const list_popupToggle = () => list_popupWrap.classList.toggle("none");
const listModify_popupToggle = () => listModify_popupWrap.classList.toggle("none");
const card_popupToggle = () => card_popupWrap.classList.toggle("none");
const cardView_popupToggle = () => cardView_popupWrap.classList.toggle("none");
// popup toggle
list_exitBtn.addEventListener("click", list_popupToggle);
addlistBtn.addEventListener("click",list_popupToggle);
card_exitBtn.addEventListener("click", card_popupToggle);
listModify_exitBtn.addEventListener("click", listModify_popupToggle);
let cardCnt = 0;
// list Change
const menuView = (list) =>{
  list.childNodes[1].classList.toggle('none');
};

const modifyPopupView = (list) => {
  listModify_popupToggle();
  let listModifyInput = listModify_listModifyForm.listModify;
  listModifyInput.value = list.childNodes[3].childNodes[1].childNodes[1].innerText;
  menuView(list);
};

const removeList = (list) => {
  if(list){
    DBDeleteList(list.dataset.list)
    list.remove();
  }
};

const modifyList = () => {
  listModify_popupToggle();
};

//card Chage
cardView_popupWrap.addEventListener("click", e => {
  
});
console.log();


const viewCard = (list) => {
  cardView_popupWrap.classList.remove("none");
  let data = DBFetch('trello__card', list);
  data.onsuccess = e => {
    cardView_listModifyForm.childNodes.forEach(e => {
      if(e.classList){
        if(e.classList.contains('cardView__form--title'))  e.innerText = data.result.title;
        if(e.classList.contains('cardView__form--img'))    e.childNodes[0].src = data.result.image;
        if(e.classList.contains('cardView__view--content'))data.result.content == '' ? e.innerText = '설명을 입력해주세요..' : e.innerText= data.result.content;
      }
    })
  }
};

// Trello 
let targetListNum;
const addList = (listDataSet, listTitle) => {
  console.log("addList");
  if(listTitle !== ''){
    const list = createEl('div');
    list.classList.add('list', 'grid');
    list.dataset.list = listDataSet;
    list.innerHTML += `
    <div class="list__menu--wrap none">
      <div class="modify">수정</div>
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
  
  boardContainer.childNodes.forEach(el => {
    el.addEventListener("click", (e) => {
        let list = document.querySelector(`.list[data-list='${e.currentTarget.dataset.list}'`);
        //list menu
        if(e.target.classList.contains("fa-ellipsis-h"))menuView(list);
        
        //list modify
        if(e.target.classList.contains("modify")) modifyPopupView(list);
        
        // list remove
        if(e.target.classList.contains("remove")) removeList(list);
        
        //card add
         if(e.target.classList.contains("list__footer") || e.target.classList.contains("list__footer--txt") ){
          card_popupWrap.classList.remove("none");
          targetListNum = e.currentTarget.dataset.list;
        }
        
        // cardView
        if(e.target.classList.contains("card") || e.target.classList.contains("card__img")) {
          
          viewCard(e.target.dataset.card);
          
        }

      });
    });
  };


const addListListener = () => {
    let title = list_listForm.list.value;
    dataSetCnt++;
    addList(dataSetCnt, title);
    DBAdd('trello__list' ,dataSetCnt, title);
    list_popupToggle();
};
  
const addCard = (listDataSet, cardTitle, cardImg, cardDataSet) => {
    if(cardTitle !== ''){
      let list = document.querySelector(`.list[data-list='${listDataSet}'`);
      list.childNodes[3].childNodes[3].innerHTML += cardImg == 'http://127.0.0.1:5500/img/noimage.png' ? `<div class="card" data-card="${cardCnt}">${cardTitle}</div>` : `<div class="card" data-card="${cardCnt}"><img data-card="${cardCnt}" src="${cardImg}" alt="card__img" class="card__img" id="card__add--img">${cardTitle}</div>`
      image.src = '';
      card_cardForm.reset();
      cardCnt++;
    }
};
  
const addCardListener = () => {
    card_popupToggle();
    let card_title = card_cardForm.card.value;
    DBAdd('trello__card', targetListNum, card_title, image.src , '');
    addCard(targetListNum, card_title, image.src)
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
DBCreate()

const DBAdd = (tableName, dataSet, title, image, content) => {
  const data = tableName === 'trello__list' ? {dataSet, title} : {cardCnt, dataSet, title, image, content} 
  const tx = db.transaction(tableName, "readwrite");
  tx.onerror = e => console.log(`Error! ${e.target.error}`);
  const table = tx.objectStore(tableName);
  table.add(data);

};

const DBDeleteList = (key) => {
  const request = indexedDB.open('Trello', 1)
  request.onerror = e => console.log("Fail!!delete");
  key = parseInt(key);
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
  const request = indexedDB.open('Trello', 1)
  request.onerror = e => console.log("Fail!!delete");
  
  request.onsuccess = e => {
    let db = e.target.result;
    let transaction = db.transaction("trello__card", 'readwrite');
    const pNotes = transaction.objectStore("trello__card");
    const request = pNotes.openCursor();
    request.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
         if(cursor.value.dataSet == key){
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
  let result;
  return request;
}
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

list_addBtn.addEventListener("click", addListListener);
card_addBtn.addEventListener("click", addCardListener);
listModify_addBtn.addEventListener("click", modifyList);

const openFileButton = document.querySelector("#openFile"); 
const base64File = (file) =>{
  let reader = new FileReader();
  
  reader.onload = function () {
    let result = reader.result;
    image.src = result
    return result;
  };
  reader.readAsDataURL( file ); 
};

openFileButton.addEventListener("change",(e) => {
  base64File(e.target.files[0])
})

