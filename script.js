const tasks = {
    default: [
        "Make my bed",
        "Brush teeth",
        "Get dressed",
        "Eat breakfast",
        "Pack school bag"
    ]
};

let completedTasks = 0;
let stars = 0;
let currentStreak = 0;
let completedDates = new Set();
let scheduledTasks = {};
let monkeyPosition = 0;

let currentDate = new Date();
let selectedDate = null;
let tasks = {};

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function initializeCalendar() {
    const today = new Date();
    renderCalendar(today.getFullYear(), today.getMonth());
    setupTreeRungs();
    loadProgress();
}

function renderCalendar(year, month) {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearLabel = document.getElementById('currentMonthYear');
    
    // Get first day of current month
    const firstDay = new Date(year, month, 1);
    // Get last day of current month
    const lastDay = new Date(year, month + 1, 0);
    // Get last day of previous month
    const prevMonthLastDay = new Date(year, month, 0);
    
    monthYearLabel.textContent = new Date(year, month).toLocaleString('default', { 
        month: 'long',
        year: 'numeric'
    });

    calendarGrid.innerHTML = '';

    // Add weekday headers (MON to SUN)
    const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-weekday';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // Calculate first Monday to display (might be from previous month)
    let firstMonday = new Date(firstDay);
    firstMonday.setDate(firstMonday.getDate() - firstMonday.getDay() + (firstMonday.getDay() === 0 ? -6 : 1));

    // Generate 6 weeks of dates
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(firstMonday);
        currentDate.setDate(firstMonday.getDate() + i);
        
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-date';
        
        const dateNumber = document.createElement('span');
        dateNumber.className = 'date-number';
        
        // Add ordinal indicator (st, nd, rd, th)
        const day = currentDate.getDate();
        const ordinal = getOrdinalSuffix(day);
        dateNumber.textContent = `${day}${ordinal}`;

        // Style dates from other months
        if (currentDate.getMonth() !== month) {
            dateCell.classList.add('empty');
            dateNumber.classList.add('other-month');
            if (currentDate.getMonth() < month || (currentDate.getMonth() === 11 && month === 0)) {
                dateNumber.textContent += '\nDecember';
            } else {
                dateNumber.textContent += '\nFebruary';
            }
        }

        // Highlight today
        if (isToday(year, month, day)) {
            dateCell.classList.add('today');
        }

        dateCell.appendChild(dateNumber);
        
        // Add click event
        const dateString = currentDate.toISOString().split('T')[0];
        dateCell.addEventListener('click', () => {
            window.location.href = `tasks.html?date=${dateString}`;
        });

        calendarGrid.appendChild(dateCell);
    }
}

function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:  return 'st';
        case 2:  return 'nd';
        case 3:  return 'rd';
        default: return 'th';
    }
}

function setupTreeRungs() {
    const tree = document.getElementById('tree');
    const daysInMonth = new Date(
        new Date().getFullYear(), 
        new Date().getMonth() + 1, 
        0
    ).getDate();

    tree.innerHTML = '';
    for (let i = 0; i < daysInMonth; i++) {
        const rung = document.createElement('div');
        rung.className = 'tree-rung';
        tree.appendChild(rung);
    }
}

function isToday(year, month, date) {
    const today = new Date();
    return today.getDate() === date && 
           today.getMonth() === month && 
           today.getFullYear() === year;
}

function loadProgress() {
    const saved = localStorage.getItem('taskProgress');
    if (saved) {
        const data = JSON.parse(saved);
        stars = data.stars || 0;
        currentStreak = data.streak || 0;
        completedDates = new Set(data.completedDates || []);
        scheduledTasks = data.scheduledTasks || {};
        monkeyPosition = data.monkeyPosition || 0;
        updateStars();
        updateStreak();
        updateCalendar();
        updateMonkeyPosition();
    }
}

function saveProgress() {
    const data = {
        stars: stars,
        streak: currentStreak,
        completedDates: Array.from(completedDates),
        scheduledTasks: scheduledTasks,
        monkeyPosition: monkeyPosition
    };
    localStorage.setItem('taskProgress', JSON.stringify(data));
}

function initializeTasks() {
    const today = new Date().toISOString().split('T')[0];
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    const todaysTasks = scheduledTasks[today] || [...tasks.default];
    
    todaysTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" onchange="updateProgress(this)">
            <span>${task}</span>
        `;
        taskList.appendChild(li);
    });
    updateProgressText();
}

function updateProgress(checkbox) {
    const taskItem = checkbox.parentElement;
    const stepSound = document.getElementById('stepSound');
    
    if (checkbox.checked) {
        taskItem.classList.add('completed');
        stepSound.currentTime = 0;
        stepSound.play();
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
    const completionSound = document.getElementById('completionSound');
    completionSound.play();

    const today = new Date().toISOString().split('T')[0];
    completedDates.add(today);
    
    updateStreak();
    
    stars += 5;
    monkeyPosition++;
    updateStars();
    updateMonkeyPosition();
    
    createConfetti();
    
    saveProgress();
    updateCalendar();
}

function createConfetti() {
    const celebration = document.getElementById('celebration');
    celebration.style.display = 'block';
    celebration.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        celebration.appendChild(confetti);
    }

    setTimeout(() => {
        celebration.style.display = 'none';
    }, 3000);
}

function updateStars() {
    document.getElementById('stars').textContent = `⭐ × ${stars}`;
}

function updateStreak() {
    const dates = Array.from(completedDates).sort();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dates.includes(today)) {
        if (dates.includes(yesterday)) {
            currentStreak++;
        } else {
            currentStreak = 1;
        }
    }

    const streakBanner = document.getElementById('streakBanner');
    streakBanner.textContent = `🔥 Current Streak: ${currentStreak} days`;
    streakBanner.style.display = 'block';
}

function updateMonkeyPosition() {
    const monkey = document.getElementById('monkey');
    const daysInMonth = new Date(
        new Date().getFullYear(), 
        new Date().getMonth() + 1, 
        0
    ).getDate();
    const percentPerRung = 100 / daysInMonth;
    const newPosition = Math.min(percentPerRung * monkeyPosition, 100);
    monkey.style.bottom = `${newPosition}%`;
}

function updateCalendar() {
    const calendar = document.getElementById('calendar');
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    function renderCalendar(month, year) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const todayDate = new Date().toISOString().split('T')[0];

        calendar.innerHTML = `
            <div class="calendar-header">
                <button class="calendar-nav" onclick="previousMonth()">←</button>
                <h3>${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</h3>
                <button class="calendar-nav" onclick="nextMonth()">→</button>
            </div>
            <div class="calendar-days"></div>
        `;

        const calendarDays = calendar.querySelector('.calendar-days');

        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day';
            dayHeader.style.background = 'none';
            dayHeader.style.fontWeight = 'bold';
            dayHeader.textContent = day;
            calendarDays.appendChild(dayHeader);
        });

        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            emptyDay.style.background = 'none';
            calendarDays.appendChild(emptyDay);
        }

        for (let date = 1; date <= lastDay.getDate(); date++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date;

            const dateString = new Date(year, month, date).toISOString().split('T')[0];
            
            if (dateString === todayDate) {
                dayElement.classList.add('today');
            }

            if (completedDates.has(dateString)) {
                dayElement.classList.add('completed');
            }

            if (dateString >= todayDate) {
                dayElement.onclick = () => addTask(dateString);
                if (scheduledTasks[dateString]) {
                    dayElement.style.border = '2px solid #4CAF50';
                }
            } else {
                dayElement.classList.add('disabled');
            }

            calendarDays.appendChild(dayElement);
        }
    }

    renderCalendar(currentMonth, currentYear);

    window.previousMonth = () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    };

    window.nextMonth = () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    };
}

function addTask(date = null) {
    const taskName = prompt('What task would you like to add?');
    if (!taskName) return;

    if (date) {
        if (!scheduledTasks[date]) {
            scheduledTasks[date] = [...tasks.default];
        }
        scheduledTasks[date].push(taskName);
        saveProgress();
        updateCalendar();
    } else {
        const today = new Date().toISOString().split('T')[0];
        if (!scheduledTasks[today]) {
            scheduledTasks[today] = [...tasks.default];
        }
        scheduledTasks[today].push(taskName);
        initializeTasks();
        saveProgress();
    }
}

function checkAndResetDaily() {
    const lastResetDate = localStorage.getItem('lastResetDate');
    const today = new Date().toISOString().split('T')[0];

    if (lastResetDate !== today) {
        const checkboxes = document.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.parentElement.classList.remove('completed');
        });

        completedTasks = 0;
        updateProgressText();
        
        localStorage.setItem('lastResetDate', today);
        saveProgress();
    }
}

function initCalendar() {
    setupWeekdays();
    renderCalendar();
    setupEventListeners();
    loadTasks();
}

function setupWeekdays() {
    const weekdaysContainer = document.getElementById('weekdays');
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'weekday';
        dayElement.textContent = day;
        weekdaysContainer.appendChild(dayElement);
    });
}

function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    
    monthDisplay.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    calendarGrid.innerHTML = '';

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayButton = document.createElement('button');
        dayButton.className = 'calendar-day';
        dayButton.textContent = day;

        const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        
        if (tasks[dateString]?.length > 0) {
            dayButton.classList.add('has-tasks');
        }

        if (isToday(day)) {
            dayButton.classList.add('today');
        }

        if (isSelected(day)) {
            dayButton.classList.add('selected');
        }

        dayButton.addEventListener('click', () => handleDateClick(day));
        calendarGrid.appendChild(dayButton);
    }
}

function handleDateClick(day) {
    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    renderCalendar();
    openModal();
}

function openModal() {
    const modal = document.getElementById('taskModal');
    const modalDate = document.getElementById('modalDate');
    modal.style.display = 'block';
    modalDate.textContent = `Tasks for ${selectedDate.toLocaleDateString()}`;
    renderTasks();
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

function setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById('taskForm').addEventListener('submit', handleAddTask);
}

function handleAddTask(e) {
    e.preventDefault();
    const input = document.getElementById('newTask');
    const task = input.value.trim();
    
    if (!task) return;

    const dateKey = selectedDate.toDateString();
    if (!tasks[dateKey]) {
        tasks[dateKey] = [];
    }
    tasks[dateKey].push(task);
    
    input.value = '';
    saveTasks();
    renderTasks();
    renderCalendar();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    const dateKey = selectedDate.toDateString();
    
    taskList.innerHTML = '';
    
    if (tasks[dateKey]) {
        tasks[dateKey].forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <span>${task}</span>
                <button class="delete-task" onclick="deleteTask('${dateKey}', ${index})">×</button>
            `;
            taskList.appendChild(taskElement);
        });
    }
}

function deleteTask(dateKey, index) {
    tasks[dateKey].splice(index, 1);
    if (tasks[dateKey].length === 0) {
        delete tasks[dateKey];
    }
    saveTasks();
    renderTasks();
    renderCalendar();
}

function saveTasks() {
    localStorage.setItem('calendarTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('calendarTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderCalendar();
    }
}

function isToday(day) {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
}

function isSelected(day) {
    return selectedDate &&
           day === selectedDate.getDate() &&
           currentDate.getMonth() === selectedDate.getMonth() &&
           currentDate.getFullYear() === selectedDate.getFullYear();
}

window.onload = initCalendar; 