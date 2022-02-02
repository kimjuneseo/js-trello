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

let dataSetCnt = 0;
let listDataSet;
const addList = () => {
  let title = list_listForm.list.value;
  dataSetCnt++;

  if(title !== ''){
    const list = createEl('div');
    list.classList.add('list', 'grid');
    list.dataset.list = dataSetCnt;
    list.innerHTML += `
    <div class="list__menu--wrap none">
      <div class="modify">수정</div>
      <div class="remove">삭제</div>
    </div>
    <div class="list__container" >
      <div class="list__header flex">
        <p class="list__title">${title}</p>
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
          listDataSet = e.currentTarget.dataset.list;
          card_popupWrap.classList.remove("none");
        }
        if(e.target.classList.contains("fa-ellipsis-h"))menuView(list);
        if(e.target.classList.contains("modify")) modifyPopupView(list);
        if(e.target.classList.contains("remove")) removeList(list);
      });
    });
  list_popupToggle();
};

const addCard = () => {
  let card_input = card_cardForm.card.value;
  if(card_input !== ''){
    let list = document.querySelector(`.list[data-list='${listDataSet}'`);
    list.childNodes[3].childNodes[3].innerHTML += image.src == 'http://127.0.0.1:5500/img/noimage.png' ? `<div class="card">${card_input}</div>` : `<div class="card"><img src="${image.src}" alt="card__img" id="card__add--img">${card_input}</div>`
    image.src = '';
    card_cardForm.reset();
    card_popupToggle();
  }
};

const modifyList = () => {
  listModify_popupToggle();
};

list_addBtn.addEventListener("click", addList);
card_addBtn.addEventListener("click", addCard);
listModify_addBtn.addEventListener("click", modifyList);

const openFileButton = document.querySelector("#openFile"); 
openFileButton.addEventListener("click", async e => {
  const [fileHandle] = await showOpenFilePicker();   
  const file = await fileHandle.getFile();
  const urlCreator = window.URL || window.webkitURL;
  const mediaUrl = urlCreator.createObjectURL(file);
  image.src = mediaUrl;
});

const viewNotes = () => {

  const tx = db.transaction("personal_notes","readonly")
  const pNotes = tx.objectStore("personal_notes")
  const request = pNotes.openCursor()
  request.onsuccess = e => {

      const cursor = e.target.result

      if (cursor) {
          alert(`Title: ${cursor.key} Text: ${cursor.value.text} `)
          //do something with the cursor
          cursor.continue()
      }
  }

}

const addNote = () => {

  const note = {
      title: "note" + Math.random(),
      text: "This is my note"
  }

  const tx = db.transaction("personal_notes", "readwrite")
  tx.onerror = e => alert( ` Error! ${e.target.error}  `)
  const pNotes = tx.objectStore("personal_notes")
  pNotes.add(note)
}

const createDB = (dbName, dbVersion) => {

  const request = indexedDB.open(dbName,dbVersion)

      //on upgrade needed
      request.onupgradeneeded = e => {
          db = e.target.result
         /* note = {
              title: "note1",
              text: "this is a note"
          }*/
          const pNotes = db.createObjectStore("personal_notes", {keyPath: "title"})
          const todoNotes = db.createObjectStore("todo_notes", {keyPath: "title"})
         
         alert(`upgrade is called database name: ${db.name} version : ${db.version}`)

      }
      //on success 
      request.onsuccess = e => {
          db = e.target.result
          alert(`success is called database name: ${db.name} version : ${db.version}`)
      }
      //on error
      request.onerror = e => {
          alert(`error: ${e.target.error} was found `)
           
      }


}