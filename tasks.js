let completedTasks = 0;
const defaultTasks = [
    "Make my bed",
    "Brush teeth",
    "Get dressed",
    "Eat breakfast",
    "Pack school bag"
];

function initializeTasks() {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    
    document.getElementById('selectedDate').textContent = `Tasks for ${new Date(date).toLocaleDateString()}`;
    
    loadTasks(date);
    setupEventListeners();
}

function loadTasks(date) {
    const taskList = document.getElementById('taskList');
    const savedTasks = JSON.parse(localStorage.getItem(`tasks_${date}`)) || [...defaultTasks];
    
    taskList.innerHTML = '';
    savedTasks.forEach(task => {
        addTaskToList(task);
    });
    
    updateProgressText();
}

function addTaskToList(taskText) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
        <input type="checkbox" class="task-checkbox" onchange="updateProgress(this)">
        <span>${taskText}</span>
    `;
    taskList.appendChild(li);
}

function setupEventListeners() {
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        const taskName = prompt('What task would you like to add?');
        if (taskName) {
            addTaskToList(taskName);
            saveTasks();
        }
    });
}

function updateProgress(checkbox) {
    const taskItem = checkbox.parentElement;
    
    if (checkbox.checked) {
        taskItem.classList.add('completed');
    } else {
        taskItem.classList.remove('completed');
    }

    const checkboxes = document.querySelectorAll('.task-checkbox');
    completedTasks = Array.from(checkboxes).filter(cb => cb.checked).length;
    
    updateProgressText();
    
    if (completedTasks === checkboxes.length) {
        celebrate();
    }
}

function updateProgressText() {
    const totalTasks = document.querySelectorAll('.task-checkbox').length;
    document.getElementById('progressText').textContent = `Tasks: ${completedTasks}/${totalTasks}`;
}

function celebrate() {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    
    // Update completed dates
    let taskProgress = JSON.parse(localStorage.getItem('taskProgress') || '{}');
    if (!taskProgress.completedDates) {
        taskProgress.completedDates = [];
    }
    if (!taskProgress.completedDates.includes(date)) {
        taskProgress.completedDates.push(date);
    }
    
    // Update monkey position
    const currentMonth = new Date(date).getMonth();
    const completedDatesThisMonth = taskProgress.completedDates.filter(d => 
        new Date(d).getMonth() === currentMonth
    );
    taskProgress.monkeyPosition = completedDatesThisMonth.length;
    
    localStorage.setItem('taskProgress', JSON.stringify(taskProgress));
    
    alert('Congratulations! All tasks completed for today! 🎉');
}

function saveTasks() {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    const tasks = Array.from(document.querySelectorAll('.task-item span'))
        .map(span => span.textContent);
    
    localStorage.setItem(`tasks_${date}`, JSON.stringify(tasks));
}

window.onload = initializeTasks; 