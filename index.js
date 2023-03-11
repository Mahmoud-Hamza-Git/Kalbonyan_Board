const btns = document.querySelectorAll('.btn-add');
const tasksLists = document.querySelectorAll('.tasks-list');
const draggables = document.querySelectorAll('.task-wrapper');
const droppables = document.querySelectorAll('.tasks-list');

const init = () => {
  btns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      createNewTask(e.target.previousElementSibling);
    });
  });

  tasksLists.forEach((list) => {
    // listenfocus-out on cards
    list.addEventListener('focusout', (e) => {
      e.target.setAttribute('readonly', 'true');
      e.target.classList.remove('focus');
    });
    // listen to click on edit or delete btns
    list.addEventListener('click', (e) => {
      handleClickTask(e.target);
    });
  });

  draggables.forEach((task) => {
    //listening for start and end of dragging
    addStartEndDragListener(task);
  });

  droppables.forEach((track) => {
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      document.activeElement?.blur();
    }
  });
};

function createNewTask(parent) {
  const html = `
    <div class="task-wrapper" draggable="true">
      <textarea name="task" placeholder="new task" class="task"></textarea>
      <div class="task-icons">
        <ion-icon name="create"></ion-icon>
        <ion-icon name="trash"></ion-icon>
      </div>
    </div>`;
  parent.insertAdjacentHTML('beforeend', html);
  const newCreatedTask = parent.querySelector('.task-wrapper:last-child .task');
  newCreatedTask.classList.add('focus');
  newCreatedTask.focus();

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
  }
}

function addStartEndDragListener(task) {
  //listening for start and end of dragging
  task.addEventListener('dragstart', (e) => {
    task.classList.add('dragging');
  });
  task.addEventListener('dragend', (e) => {
    task.classList.remove('dragging');
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

init();
