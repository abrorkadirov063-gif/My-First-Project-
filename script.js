
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let draggedId = null;

// Сохранение задач
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Открытие окна
function openModal() {
    document.getElementById("modal").style.display = "flex";
}

// Закрытие окна
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Добавление задачи
function addTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const status = document.getElementById("taskStatus").value;

    if (!title) {
        alert("Введите название задачи!");
        return;
    }

    tasks.push({
        id: Date.now(),
        title: title,
        description: description,
        status: status
    });

    saveTasks();
    render();

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";

    closeModal();
}

// Удаление задачи
function deleteTask(id) {
    if (!confirm("Удалить эту задачу?")) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    render();
}

// Перемещение задачи
function moveTask(id, status) {
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.status = status;
        saveTasks();
        render();
    }
}

// Создание карточки
function createCard(task) {
    const card = document.createElement("article");
    card.className = "task";
    card.draggable = true;

    const title = document.createElement("strong");
    title.textContent = task.title;

    const description = document.createElement("p");
    description.textContent = task.description || "Без описания";

    const number = document.createElement("small");
    number.textContent = "Задача #" + String(task.id).slice(-5);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const statusSelect = document.createElement("select");

    const statuses = [
        ["todo", "Новые"],
        ["progress", "В процессе"],
        ["done", "Готово"]
    ];

    statuses.forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        statusSelect.appendChild(option);
    });

    statusSelect.value = task.status;

    statusSelect.addEventListener("change", () => {
        moveTask(task.id, statusSelect.value);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.className = "delete";

    deleteButton.onclick = () => deleteTask(task.id);

    actions.append(statusSelect, deleteButton);
    card.append(title, description, number, actions);

    // Перетаскивание карточки
    card.addEventListener("dragstart", () => {
        draggedId = task.id;
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
        draggedId = null;
        card.classList.remove("dragging");
    });

    return card;
}

// Отображение задач
function render() {
    const lists = {
        todo: document.getElementById("todo"),
        progress: document.getElementById("progress-list"),
        done: document.getElementById("done-list")
    };

    const counts = {
        todo: 0,
        progress: 0,
        done: 0
    };

    Object.values(lists).forEach(list => {
        list.innerHTML = "";
    });

    tasks.forEach(task => {
        counts[task.status]++;

        const card = createCard(task);
        lists[task.status].appendChild(card);
    });

    Object.keys(lists).forEach(status => {
        if (counts[status] === 0) {
            const empty = document.createElement("div");
            empty.className = "empty";
            empty.textContent = "Пока нет задач";
            lists[status].appendChild(empty);
        }
    });

    document.getElementById("total").textContent = tasks.length;
    document.getElementById("progress").textContent = counts.progress;
    document.getElementById("done").textContent = counts.done;

    document.getElementById("count-todo").textContent = counts.todo;
    document.getElementById("count-progress").textContent = counts.progress;
    document.getElementById("count-done").textContent = counts.done;
}

// Настройка перетаскивания колонок
document.querySelectorAll(".column").forEach(column => {

    column.addEventListener("dragover", event => {
        event.preventDefault();
        column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", event => {
        if (!column.contains(event.relatedTarget)) {
            column.classList.remove("drag-over");
        }
    });

    column.addEventListener("drop", event => {
        event.preventDefault();
        column.classList.remove("drag-over");

        if (draggedId !== null) {
            moveTask(draggedId, column.dataset.status);
        }
    });

});

// Первый запуск
render();
                          
