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

class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.tasks = {};
        
        this.months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        this.daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        // Ensure DOM is loaded before initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing calendar...'); // Debug log
        this.initializeCalendar();
        this.setupEventListeners();
    }

    initializeCalendar() {
        console.log('Setting up calendar...'); // Debug log
        const weekdaysContainer = document.getElementById('weekdays');
        const calendarDays = document.getElementById('calendarDays');

        if (!weekdaysContainer || !calendarDays) {
            console.error('Required elements not found');
            return;
        }

        // Clear existing content
        weekdaysContainer.innerHTML = '';
        calendarDays.innerHTML = '';
        
        this.renderWeekdays();
        this.renderCalendar();
        this.loadTasks();
    }

    setupEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('taskForm')?.addEventListener('submit', (e) => this.handleAddTask(e));
    }

    renderWeekdays() {
        const weekdaysContainer = document.getElementById('weekdays');
        this.daysOfWeek.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'weekday';
            dayElement.textContent = day;
            weekdaysContainer.appendChild(dayElement);
        });
    }

    renderCalendar() {
        console.log('Rendering calendar...'); // Debug log
        const monthDisplay = document.getElementById('monthDisplay');
        const calendarDays = document.getElementById('calendarDays');

        if (!monthDisplay || !calendarDays) {
            console.error('Required elements not found');
            return;
        }
        
        // Update month and year display
        monthDisplay.textContent = `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Clear previous calendar days
        calendarDays.innerHTML = '';

        // Get the first day of the month and the number of days in the month
        const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
        const firstDayWeekday = firstDayOfMonth.getDay();

        // Create empty cells for days before the first day of the month
        for (let i = 0; i < firstDayWeekday; i++) {
            const emptyDay = document.createElement('button');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }

        // Create cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayButton = document.createElement('button');
            dayButton.className = 'calendar-day';
            dayButton.textContent = day;

            // Create date string for task checking
            const currentDateString = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                day
            ).toDateString();

            // Add 'has-tasks' class if there are tasks for this day
            if (this.tasks[currentDateString]?.length > 0) {
                dayButton.classList.add('has-tasks');
            }

            // Highlight today's date
            if (this.isToday(day)) {
                dayButton.classList.add('today');
            }

            // Highlight selected date
            if (this.selectedDate && 
                day === this.selectedDate.getDate() &&
                this.currentDate.getMonth() === this.selectedDate.getMonth() &&
                this.currentDate.getFullYear() === this.selectedDate.getFullYear()) {
                dayButton.classList.add('selected');
            }

            dayButton.addEventListener('click', () => this.handleDateClick(day));
            calendarDays.appendChild(dayButton);
        }

        // Calculate remaining cells needed to complete the grid
        const totalCells = 42; // 6 rows × 7 days
        const remainingCells = totalCells - (firstDayWeekday + daysInMonth);
        
        // Add empty cells for the remaining days
        for (let i = 0; i < remainingCells; i++) {
            const emptyDay = document.createElement('button');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }
    }

    handleDateClick(day) {
        this.selectedDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );
        this.renderCalendar(); // Re-render to show selection
        this.openModal();
    }

    openModal() {
        const modal = document.getElementById('taskModal');
        const selectedDateElement = document.getElementById('selectedDate');
        selectedDateElement.textContent = this.selectedDate.toLocaleDateString();
        modal.classList.add('show');
        this.renderTasks();
    }

    closeModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('show');
    }

    handleAddTask(e) {
        e.preventDefault();
        const input = document.getElementById('newTask');
        const task = input.value.trim();
        
        if (!task) return;

        const dateKey = this.selectedDate.toDateString();
        if (!this.tasks[dateKey]) {
            this.tasks[dateKey] = [];
        }
        this.tasks[dateKey].push(task);
        
        this.saveTasks();
        this.renderTasks();
        this.renderCalendar();
        
        input.value = '';
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        
        const dateKey = this.selectedDate.toDateString();
        const dateTasks = this.tasks[dateKey] || [];
        
        dateTasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <span>${task}</span>
                <button class="delete-task" data-index="${index}">×</button>
            `;
            
            const deleteButton = taskElement.querySelector('.delete-task');
            deleteButton.addEventListener('click', () => this.handleDeleteTask(dateKey, index));
            
            taskList.appendChild(taskElement);
        });
    }

    handleDeleteTask(dateKey, index) {
        this.tasks[dateKey] = this.tasks[dateKey].filter((_, i) => i !== index);
        this.saveTasks();
        this.renderTasks();
        this.renderCalendar();
    }

    isToday(day) {
        const today = new Date();
        return day === today.getDate() &&
            this.currentDate.getMonth() === today.getMonth() &&
            this.currentDate.getFullYear() === today.getFullYear();
    }

    saveTasks() {
        localStorage.setItem('calendarTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('calendarTasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
            this.renderCalendar(); // Re-render calendar to show task indicators
        }
    }
}

// Create calendar instance
const calendar = new Calendar();

// Add this for debugging
console.log('Script loaded'); 