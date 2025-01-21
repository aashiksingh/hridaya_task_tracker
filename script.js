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
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const percentPerRung = 100 / daysInMonth;
    const newPosition = percentPerRung * monkeyPosition;
    monkey.style.bottom = `${newPosition}%`;
    monkey.style.transition = 'bottom 0.5s ease';
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

window.onload = function() {
    initializeTasks();
    loadProgress();
    checkAndResetDaily();
    setInterval(checkAndResetDaily, 60000);
}; 