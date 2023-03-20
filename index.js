const btns = document.querySelectorAll('.btn-add');
const droppables = document.querySelectorAll('.tasks-list');
let timeout;

const init = () => {
  // restore all saved content from localStorage
  droppables.forEach((track) => {
    const key = track.id;
    let values = window.localStorage.getItem(key);
    values = values ? values.split(',') : [];
    print(track, values);

    // add listener for dragover event
    track.addEventListener('dragover', (e) => {
      e.preventDefault();
      const bottomTask = insertAbove(track, e.clientY);
      const curTask = document.querySelector('.dragging');
      if (!bottomTask) {
        track.appendChild(curTask);
      } else {
        track.insertBefore(curTask, bottomTask);
      }
    });
  });

  // liten to clicks on Add btns to create new tasks
  btns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      createNewTask(e.target.previousElementSibling);
    });
  });

  droppables.forEach((list) => {
    // listenfocus-out on cards
    list.addEventListener('focusout', (e) => {
      // check if the element contains 'focus' class before we store it's value
      if (e.target.classList.contains('focus')) {
        store();
      }
      e.target.setAttribute('readonly', 'true');
      e.target.classList.remove('focus');
    });

    // listen to click on edit or delete btns
    list.addEventListener('click', (e) => {
      handleClickTask(e.target);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      document.activeElement?.blur();
    }
  });
};

function createNewTask(parent) {
  const html = `
    <div class="task-wrapper" draggable="true">
      <input name="task" placeholder="new task" class="task"></input>
      <div class="task-icons">
        <ion-icon name="create"></ion-icon>
        <ion-icon name="trash"></ion-icon>
      </div>
    </div>`;
  parent.insertAdjacentHTML('beforeend', html);

  const newCreatedTask = parent.querySelector('.task-wrapper:last-child .task');
  newCreatedTask.classList.add('focus');
  newCreatedTask.focus();

  // select the last created task
  const task = parent.querySelector('.task-wrapper:last-child');
  addStartEndDragListener(task);
  addStartEndTouchListener(task);
}

function handleClickTask(target) {
  const targetBtn = target.attributes.name?.value;
  if (targetBtn === 'create') {
    const card = target.parentElement.previousElementSibling;
    card.removeAttribute('readonly');
    card.focus();
    card.classList.add('focus');
  } else if (targetBtn === 'trash') {
    const cardContainer = target.parentElement.parentElement;
    cardContainer.remove();
    store();
  }
}

function addStartEndDragListener(task) {
  //listening for start and end of dragging
  task.addEventListener('dragstart', (e) => {
    task.classList.add('dragging');
  });
  task.addEventListener('dragend', (e) => {
    task.classList.remove('dragging');
    store();
  });
}

function addStartEndTouchListener(task) {
  // handle long touch on task
  task.addEventListener('touchstart', (e) => {
    timeout = setTimeout(() => {
      task.style.position = 'absolute';
      task.classList.add('dragging');
      task.style.top = `${e.touches[0].clientY - task.offsetHeight / 2}px`;
      task.style.left = `${e.touches[0].clientX - task.offsetWidth / 2}px`;
    }, 500);
  });

  // handle touchEnd
  task.addEventListener('touchend', (e) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (task.classList.contains('dragging')) {
      task.style.position = 'relative';
      task.style.top = `auto`;
      task.style.left = `auto`;
      task.classList.remove('dragging');
      store();
    }
  });

  // handlle touch moving over task containers to drop task
  task.addEventListener('touchmove', (e) => {
    if (task.classList.contains('dragging')) {
      task.style.top = `${e.touches[0].clientY - task.offsetHeight / 2}px`;
      task.style.left = `${e.touches[0].clientX - task.offsetWidth / 2}px`;

      // detect all elements that touch moves over.
      const elements = document.elementsFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      elements.forEach((el, i) => {
        if (el.classList.contains('tasks-list')) {
          const track = el;
          const bottomTask = insertAbove(track, e.touches[0].clientY);
          const curTask = document.querySelector('.dragging');
          if (!bottomTask) {
            track.appendChild(curTask);
          } else {
            track.insertBefore(curTask, bottomTask);
          }
        }
      });
    }
  });
}

function insertAbove(track, mouseY) {
  //selects all the tasks not dragged in the the current track
  const notDraggedTasks = track.querySelectorAll('.task-wrapper:not(.dragging');

  let closestTask = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  notDraggedTasks.forEach((task) => {
    const { top } = task.getBoundingClientRect();
    const offset = mouseY - top;
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestTask = task;
    }
  });
  return closestTask;
}

function store() {
  droppables.forEach((container) => {
    const key = container.id;
    const values = container.children.map((child) => {
      return child.firstElementChild.value;
    });
    window.localStorage.setItem(key, values.toString());
  });
}

function print(track, values) {
  values.forEach((element) => {
    const html = `
    <div class="task-wrapper" draggable="true">
      <input name="task" placeholder="new task" readonly value="${element}" class="task"></input>
      <div class="task-icons">
        <ion-icon name="create"></ion-icon>
        <ion-icon name="trash"></ion-icon>
      </div>
    </div>`;
    track.insertAdjacentHTML('beforeend', html);

    // add drag listener for tasks printend on the screen
    const task = track.querySelector('.task-wrapper:last-child');
    addStartEndDragListener(task);
    addStartEndTouchListener(task);
  });
}
init();
