// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterOptions = document.querySelectorAll('.filter-option');
const clearCompletedBtn = document.getElementById('clearCompleted');

// Task counter elements
const totalTasksCount = document.getElementById('totalTasksCount');
const completedTasksCount = document.getElementById('completedTasksCount');
const pendingTasksCount = document.getElementById('pendingTasksCount');

// Init tasks array from localStorage or empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Current filter state
let currentFilter = 'all';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  updateTaskCounters();
});

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

filterOptions.forEach(option => {
  option.addEventListener('click', () => {
    filterOptions.forEach(btn => btn.classList.remove('active'));
    option.classList.add('active');
    currentFilter = option.getAttribute('data-filter');
    renderTasks();
  });
});

clearCompletedBtn.addEventListener('click', clearCompletedTasks);

// Functions
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  updateTaskCounters();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTaskStatus(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  
  saveTasks();
  renderTasks();
  updateTaskCounters();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  updateTaskCounters();
}

function editTask(id, newText) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, text: newText };
    }
    return task;
  });
  
  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
  updateTaskCounters();
}

function renderTasks() {
  taskList.innerHTML = '';
  
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all' filter
  });
  
  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = currentFilter === 'all' 
      ? 'No tasks yet. Add a task to get started!'
      : `No ${currentFilter} tasks.`;
    taskList.appendChild(emptyMessage);
    return;
  }
  
  filteredTasks.forEach(task => {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    if (task.completed) taskItem.classList.add('completed');
    
    // Create task content wrapper
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
    
    // Create task text
    const taskTextSpan = document.createElement('span');
    taskTextSpan.className = 'task-text';
    taskTextSpan.textContent = task.text;
    
    // Add double-click to edit functionality
    taskTextSpan.addEventListener('dblclick', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'edit-task';
      input.value = task.text;
      
      taskContent.replaceChild(input, taskTextSpan);
      input.focus();
      
      const saveEdit = () => {
        const newText = input.value.trim();
        if (newText) {
          editTask(task.id, newText);
        } else {
          deleteTask(task.id);
        }
      };
      
      input.addEventListener('blur', saveEdit);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          saveEdit();
        }
      });
    });
    
    // Create task actions
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    // Assemble the task item
    taskContent.appendChild(checkbox);
    taskContent.appendChild(taskTextSpan);
    taskActions.appendChild(deleteBtn);
    
    taskItem.appendChild(taskContent);
    taskItem.appendChild(taskActions);
    
    taskList.appendChild(taskItem);
  });
}

function updateTaskCounters() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  totalTasksCount.textContent = totalTasks;
  completedTasksCount.textContent = completedTasks;
  pendingTasksCount.textContent = pendingTasks;
  
  // Show/hide clear completed button
  clearCompletedBtn.style.display = completedTasks > 0 ? 'block' : 'none';
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}