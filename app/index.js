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
// method
const createEl = (el) => document.createElement(el);
const list_popupToggle = () => list_popupWrap.classList.toggle("none");
const card_popupToggle = () => card_popupWrap.classList.toggle("none");
const listModify_popupToggle = () => listModify_popupWrap.classList.toggle("none");
// popup toggle
list_exitBtn.addEventListener("click", list_popupToggle);
addlistBtn.addEventListener("click",list_popupToggle);
card_exitBtn.addEventListener("click", card_popupToggle);
listModify_exitBtn.addEventListener("click", listModify_popupToggle);
let cardCnt = 0;
// list Change
const removeList = (list) => {
  list.remove();
};
const modifyPopupView = (list) => {
  listModify_popupToggle();
  let listModifyInput = listModify_listModifyForm.listModify;
  listModifyInput.value = list.childNodes[3].childNodes[1].childNodes[1].innerText;
  menuView(list);
};
const menuView = (list) =>{
  list.childNodes[1].classList.toggle('none');
};

// Trello 
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

        if(e.target.classList.contains("list__footer") || e.target.classList.contains("list__footer--txt") ){
          card_popupWrap.classList.remove("none");
          targetListNum = e.currentTarget.dataset.list;
        }
        if(e.target.classList.contains("fa-ellipsis-h"))menuView(list);
        if(e.target.classList.contains("modify")) modifyPopupView(list);
        if(e.target.classList.contains("remove")) removeList(list);
      });
    });
  }
  
  let targetListNum;
  const addListListener = () => {
    let title = list_listForm.list.value;
    dataSetCnt++;
    addList(dataSetCnt, title);
    DBAdd('trello__list' ,dataSetCnt, title);
    list_popupToggle();
  };
  

  const addCard = (listDataSet, cardTitle, cardImg) => {
    if(cardTitle !== ''){
      let list = document.querySelector(`.list[data-list='${listDataSet}'`);
      list.childNodes[3].childNodes[3].innerHTML += cardImg == 'http://127.0.0.1:5500/img/noimage.png' ? `<div class="card">${cardTitle}</div>` : `<div class="card"><img src="${cardImg}" alt="card__img" id="card__add--img">${cardTitle}</div>`
      image.src = '';
      card_cardForm.reset();
      cardCnt++;
    }
  }
  
  const addCardListener = () => {
    card_popupToggle();
    let card_title = card_cardForm.card.value;
    DBAdd('trello__card', targetListNum, card_title, image.src);
    addCard(targetListNum, card_title, image.src)
    
};

const modifyList = () => {
  listModify_popupToggle();
};

// DB METHOD
let db = null;
let dataSetCnt = 0;
const DBCreate = (dbName, dbVersion) => {
  const request = indexedDB.open(dbName,dbVersion);

      request.onupgradeneeded = e => {
          db = e.target.result;
          const pNotes = db.createObjectStore("trello__list", {keyPath: "dataSet"});
          const todoNotes = db.createObjectStore("trello__card",{keyPath: "cardCnt"});
         console.log(`upgrade is called database name: ${db.name} version : ${db.version}`);
      }

      request.onsuccess = e => {
          db = e.target.result;
          console.log(`success is called database name: ${db.name} version : ${db.version}`);
          viewLists("trello__list");
          viewLists("trello__card");
      }
      
      request.onerror = e => {
          console.log(`error: ${e.target.error} was found `);
      }
};

const DBAdd = (tableName, dataSet, title, image) => {
  const data = tableName === 'trello__list' ? {dataSet, title} : {cardCnt, dataSet, title, image} 
  const tx = db.transaction(tableName, "readwrite");
  tx.onerror = e => console.log(`Error! ${e.target.error}`);
  const table = tx.objectStore(tableName);
  table.add(data);

};

const viewLists = (name) => {
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
          addCard(cursor.value.dataSet, cursor.value.title, cursor.value.image);
        }
        cursor.continue();
      }
  };
};

// init
const init = (() => {
  DBCreate('Trello', 1);
})();

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

