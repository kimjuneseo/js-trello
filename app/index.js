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
// 카드 번호
let cardCnt = 0;
// 타켓된 list num
let targetListNum;
// list의 nodeList
let list;

// list method
const addListListener = () => {
  let title = list_listForm.list.value;
  dataSetCnt++;
  addList(dataSetCnt, title);
  DBAdd('trello__list' ,dataSetCnt, title);
  list_popupWrap.classList.toggle("none");
};

const listChk = () => {
  list = document.querySelectorAll('.list');
  listEventListener(list);
};

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
  }
  listChk();
};
  
const listClear = () => list.forEach(e => e.childNodes[5].childNodes[3].innerHTML = '');

//card method
let cardDataSet;
const onBase64File = (file, db) =>{
  let img = cardView_popupWrap.classList.contains('none') ? image : cardViewImage.childNodes[0];
  let reader = new FileReader();
  reader.onload = function(){
    let result = reader.result;
    img.src = result;
    if(db){
      // DBCardModify 수정중 
      DBCardModify(cardView_popupWrap.dataset.card, 'image', result);
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
      DBCardModify(cardView_popupWrap.dataset.card, keyName, input.value);
      input.blur();
    }
  });
  input.addEventListener("blur", e => {
    DBCardModify(cardView_popupWrap.dataset.card, keyName, input.value);
  });
  return input;
};

const viewCard = (viewCard) => {
  cardView_popupWrap.classList.remove("none");
  let data = DBFetch('trello__card', viewCard);
  data.onsuccess = e => {
    cardView_popupWrap.dataset.card = viewCard;
    cardView_listModifyForm.childNodes.forEach(e => {
      if(e.classList){
        if(e.classList.contains('cardView__form--title'))  e.innerText = data.result.title;
        if(e.classList.contains('cardView__form--img'))    e.childNodes[0].src = data.result.image;
        if(e.classList.contains('cardView__view--content')) e.innerText = data.result.content ==='' ? '설명을 입력해주세요..' :  data.result.content;
        if(e.classList.contains('btns')) e.innerHTML = data.result.image === '' ? ` <label  class="card_btn card_btn1 add__img" for="cardViewImage">이미지 추가</label>` :  `<label  class="card_btn card_btn1" for="cardViewopenFile">이미지 수정</label> <button class="card_btn card_btn2">이미지 삭제</button>`;
      }
    });
  }
};


const addCard = (listDataSet, cardTitle, cardImg) => { 
  listDataSet = parseInt(listDataSet);
  let list = document.querySelector(`.list[data-list='${listDataSet}'`);
  if(list){
    if(cardTitle !== ''){
    list.childNodes[5].childNodes[3].innerHTML += cardImg === '' ? `<div class="card" data-card="${cardCnt}"><p class="cardTitle" data-card="${cardCnt}">${cardTitle}</p></div>` : `<div class="card" data-card="${cardCnt}"><img data-card="${cardCnt}" src="${cardImg}" alt="card__img" class="card__img" id="card__add--img"><p class="cardTitle" data-card="${cardCnt}">${cardTitle}</p></div>`;
    image.src = '';
    card_cardForm.reset();
    cardCnt++;
    }
  }
};
  
const addCardListener = () => {
      card_popupWrap.classList.toggle("none");
      let card_title = card_cardForm.card.value;
      DBAdd('trello__card', targetListNum, card_title, image.src.includes('noimage') ? '' : image.src    , '');
      addCard(targetListNum, card_title, image.src.includes('noimage') ? '' : image.src);
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
        render("trello__list");
        setTimeout(() => render("trello__card"), 10);
      }
}; 

// db에는 listNum이라는 걸 추가 list
const DBAdd = (tableName, dataSet, title, image, content) => {
  const data = tableName === 'trello__list' ? {dataSet, title} : {cardCnt, dataSet, title, image, content};
  const tx = db.transaction(tableName, "readwrite");
  tx.onerror = e => console.log(`Error! ${e.target.error}`);
  const table = tx.objectStore(tableName);
  console.log( data);
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
      let card = name === 'title'? document.querySelector(`.cardTitle[data-card='${key}'`) : document.querySelector(`.card[data-card='${key}'`);

      if(name === 'content')data.content = value;
      
      if(name === 'key') data.dataSet = value;

      if(name === 'title') {
        data.title = value;
        card.innerText = value;
      }
      if(name === 'image'){
        if(!card.childNodes[1]){
          let img = createEl('img');
          img.src = value;
          img.classList.add('card__img');
          cardView_listModifyForm.childNodes[9].innerHTML = `<label  class="card_btn card_btn1" for="cardViewopenFile">이미지 수정</label> <button class="card_btn card_btn2">이미지 삭제</button>`;
        }
        else card.childNodes[0].src = value;
        data.image = value;
      }
      let requestUpdate = objectStore.put(data);
       requestUpdate.onsuccess = () => {
         console.log('update');
       };
    };
    
  }
};

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

cardView_popupWrap.addEventListener("click", e => {
  if(e.target.classList.contains("cardView__form--title")){
    let input = elementChange(e.target, "title");
    input.classList.add('cardView__popup--title');
    cardViewImage.before(input);
    input.focus();
    return;
  }
  
  if(e.target.classList.contains('cardView__view--content')){
    let input = elementChange(e.target, 'content');
    input.classList.add('cardView__popup-content');
    cardView_listModifyForm.appendChild(input);
    input.focus();
    return;
  }
  
  if(e.target.classList.contains('cardView__add--btn')){
    cardView_popupWrap.classList.toggle('none');
    DBDeleteCard(cardDataSet, true);
    return;
  }
  
  if(e.target.classList.contains('cardView__cancel--btn')){
    cardView_popupWrap.classList.toggle('none');
    listClear();
    render('trello__card')
    return;
  }
  
  if(e.target.classList.contains('card_btn2')){
    // btn
    let cardImg = document.querySelector(`.card__img[data-card="${cardView_popupWrap.dataset.card}"]`);
    cardImg.remove();
    cardView__form.childNodes[9].innerHTML = ` <label  class="card_btn card_btn1 add__img" for="cardViewImage">이미지 추가</label>`;
    cardView__form.childNodes[3].childNodes[0].src = '';
    DBCardModify(cardView_popupWrap.dataset.card, 'image', ''); 
  }
});

let cardViewAddImg = document.querySelector('#cardViewImage');

cardViewAddImg.addEventListener("change", e => onBase64File(e.target.files[0], true));

cardViewOpenFileButton.addEventListener("change", e => onBase64File(e.target.files[0], true));

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

let isDown = false; 
let clone = null; 
const targetInfo = {}; 
const currentPoint = {}; 

const placeholder = document.createElement('div'); 

let mouseCardDataSet;
let mouseListDataSet;

const addPlaceholder = () => {
  Array.from(document.querySelectorAll('.cards')).some(wrapper => { 
    const rect = wrapper.getBoundingClientRect();

    if (rect.left < currentPoint.x && currentPoint.x < rect.left + wrapper.clientWidth) { 
      const isAddPlaceholder = Array.from(wrapper.children).filter(({ className }) => className === 'card').some((item) => { 
        const rect = item.getBoundingClientRect();

        if (currentPoint.y < rect.top + item.clientHeight / 2) { 
          placeholder.remove(); 
          wrapper.insertBefore(placeholder, item); 
          return true; 
        }
      });

      if (!isAddPlaceholder) { 
        placeholder.remove(); 
        wrapper.appendChild(placeholder); 
      }
      return true; 
    }
  });
};

let mouseDownList;
let moveMouseChk = true;
const mousedown = () => {
  Array.from(list).map(ele => {
    ele.addEventListener('mousedown', ({pageX, pageY, target}) => {
      // listEventListener();
      if (!(target.classList.contains('card') || target.classList.contains('cardTitle') || target.classList.contains('card__img'))) {
        return;
      }
      let mouseDownCard = document.querySelector(`.card[data-card="${target.dataset.card}"]`);
      if(mouseDownCard.closest('.list')){
        moveMouseChk = true;
        mouseDownList = target.closest('.list').dataset.list;
      
        isDown = true; 
    
        const rect = mouseDownCard.getBoundingClientRect();
    
        Object.assign(currentPoint, { 
          x: pageX,
          y: pageY,
        });
    
        Object.assign(targetInfo, {
          gap: [pageX - rect.left, pageY - rect.top], 
          width: mouseDownCard.clientWidth, 
          height: mouseDownCard.clientHeight, 
        });
        placeholder.style.height = targetInfo.height + 'px'; 
    
        clone = mouseDownCard.cloneNode(true); 
    
        Object.assign(clone.style, { 
          position: 'fixed',
          width: mouseDownCard.clientWidth + 'px',
          height: mouseDownCard.clientHeight + 'px',
          left: rect.left + 'px',
          top: rect.top + 'px',
          zIndex: 999,
        });
        
        mouseDownCard.parentElement.insertBefore(placeholder, mouseDownCard); 
        mouseCardDataSet = mouseDownCard.dataset.card;
        
        mouseDownCard.remove(); 
        document.body.appendChild(clone); 
    }
    });
  });
};


window.onmousemove = (e) => {
  if (!isDown) {
    return;
  }
  
  moveMouseChk = false;
  e.preventDefault();
  Object.assign(currentPoint, { 
    x: e.pageX,
    y: e.pageY,
  });

  Object.assign(clone.style, { 
    left: e.pageX - targetInfo.gap[0] + 'px',
    top: e.pageY - targetInfo.gap[1] + 'px',
    transform: 'rotate(10deg)'
  });

  addPlaceholder();
};

window.onmouseup = (e) => {
  if (isDown) {
    isDown = false;
    clone.remove(); 
    clone.removeAttribute('style'); 
    placeholder.parentElement.insertBefore(clone, placeholder); 
    clone = null; 
    mouseListDataSet = parseInt(e.target.closest('.list').dataset.list);
    placeholder.remove(); 
    if(moveMouseChk){
      viewCard(mouseCardDataSet);
      return;
    }
    DBCardModify(mouseCardDataSet, 'key', mouseListDataSet);
  }
};

const render = (name) => { 
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
    if(list){
      mousedown();
    }
  };
};

const init = (() => {
  DBCreate();
})(); 