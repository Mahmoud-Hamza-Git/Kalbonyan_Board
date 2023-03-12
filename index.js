const btns = document.querySelectorAll('.btn-add');
const tasksLists = document.querySelectorAll('.tasks-list');
const droppables = document.querySelectorAll('.tasks-list');

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

  tasksLists.forEach((list) => {
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
    const values = [];
    for (const child of container.children) {
      values.push(child.firstElementChild.value);
    }
    window.localStorage.setItem(key, values.toString());
  });
}

function print(track, values) {
  values.forEach((element) => {
    const html = `
    <div class="task-wrapper" draggable="true">
      <input name="task" placeholder="new task" value="${element}" class="task"></input>
      <div class="task-icons">
        <ion-icon name="create"></ion-icon>
        <ion-icon name="trash"></ion-icon>
      </div>
    </div>`;
    track.insertAdjacentHTML('beforeend', html);

    // add drag listener for tasks printend on the screen
    const task = track.querySelector('.task-wrapper:last-child');
    addStartEndDragListener(task);
  });
}
init();
