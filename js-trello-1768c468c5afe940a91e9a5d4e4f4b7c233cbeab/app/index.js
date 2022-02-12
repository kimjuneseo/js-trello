const wrapper = document.querySelectorAll('.wrapper');

let isDown = false; // mousedown 했는지
let clone = null; // 선택한 아이템 clone
const targetInfo = {}; // target item info { gap: [x, y], width: number, height: number }
const currentPoint = {}; // 현재 마우스 point { x: number, y: number }

const placeholder = document.createElement('div'); // 아이템 드래그시 미리보기 element
placeholder.className = 'item placeholder';

// placeholder 추가 함수
const addPlaceholder = () => {
  Array.from(document.querySelectorAll('.wrapper')).some(wrapper => { // wrapper들 순회 (some을 사용한 이유는 마우스 포지션 내에 있는 wrapper를 만나면 거기서 loop를 종료하려고)
    const rect = wrapper.getBoundingClientRect();

    if (rect.left < currentPoint.x && currentPoint.x < rect.left + wrapper.clientWidth) { // 마우스 포지션이 wrapper 내에 있으면
      const isAddPlaceholder = Array.from(wrapper.children).filter(({ className }) => className === 'item').some((item) => { // item 순회 여기서 some을 사용한 이유도 위와 동일
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
    if (!(target.className === 'item')) {
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
  if (!isDown) {
    return;
  }

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
    isDown = false;

    clone.remove(); // 마우스에 있던 clone 제거
    clone.removeAttribute('style'); // style 제거 (:55 style 적용 참고)
    placeholder.parentElement.insertBefore(clone, placeholder); // placeholder 위치에 드래그한 아이템 추가

    clone = null; // clone null로 초기화

    placeholder.remove(); // placeholder 추가한거 제거
  }
}