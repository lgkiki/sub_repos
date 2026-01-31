let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let currentLanguage = 'zh';

const translations = {
    zh: {
        title: '农历日历',
        prevMonth: '← 上月',
        nextMonth: '下月 →',
        today: '今天',
        loading: '加载中...',
        error: '错误: 无法连接到后端服务器，请确保服务器正在运行',
        detailTitle: '日期详情',
        solar: '公历',
        lunar: '农历',
        stemBranch: '干支',
        zodiac: '生肖',
        weekdays: ['日', '一', '二', '三', '四', '五', '六']
    },
    en: {
        title: 'Lunar Calendar',
        prevMonth: '← Prev',
        nextMonth: 'Next →',
        today: 'Today',
        loading: 'Loading...',
        error: 'Error: Cannot connect to backend server, please ensure server is running',
        detailTitle: 'Date Details',
        solar: 'Solar',
        lunar: 'Lunar',
        stemBranch: 'Stem-Branch',
        zodiac: 'Zodiac',
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
};

function init() {
    updateLanguage();
    loadCalendar(currentYear, currentMonth);
}

async function loadCalendar(year, month) {
    showStatus(translations[currentLanguage].loading, 'info');
    
    try {
        const response = await fetch(`http://localhost:3031/calendar?year=${year}&month=${month}`);
        const data = await response.json();
        
        renderCalendar(data);
        showStatus('', '');
    } catch (error) {
        showStatus(translations[currentLanguage].error, 'error');
        console.error('Error loading calendar:', error);
    }
}

function renderCalendar(data) {
    // 更新标题信息
    document.getElementById('solar-year').textContent = data.year;
    document.getElementById('solar-month').textContent = data.month;
    document.getElementById('lunar-year').textContent = data.lunar_year;
    document.getElementById('zodiac').textContent = data.zodiac;
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    // 计算今天日期
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    
    data.days.forEach((dayInfo, index) => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // 判断是否属于当前月份
        const totalCells = data.days.length;
        const daysInMonth = data.days.filter(d => !d.is_weekend && d.weekday_num !== 0).length;
        const startOffset = data.days.findIndex(d => d.weekday_num === 0 && index < 7);
        
        if (index < 7 && dayInfo.day > 20) {
            dayElement.classList.add('other-month');
        } else if (index > 28 && dayInfo.day < 15) {
            dayElement.classList.add('other-month');
        }
        
        // 检查是否是今天
        const isCurrentMonth = !dayElement.classList.contains('other-month');
        if (isCurrentMonth && data.year === todayYear && data.month === todayMonth && dayInfo.day === todayDay) {
            dayElement.classList.add('today');
        }
        
        // 检查是否是周末
        if (dayInfo.is_weekend && !dayElement.classList.contains('today')) {
            dayElement.classList.add('weekend');
        }
        
        dayElement.innerHTML = `
            <div class="solar-day">${dayInfo.day}</div>
            <div class="lunar-day">${dayInfo.lunar_day}</div>
        `;
        
        dayElement.onclick = () => showDayDetail(data.year, data.month, dayInfo);
        
        grid.appendChild(dayElement);
    });
}

async function showDayDetail(year, month, dayInfo) {
    // 如果点击的是其他月份的日期，切换到那个月
    if (document.querySelector('.calendar-day.other-month:hover')) {
        if (dayInfo.day > 20) {
            // 上个月的日期
            if (month === 1) {
                currentYear = year - 1;
                currentMonth = 12;
            } else {
                currentYear = year;
                currentMonth = month - 1;
            }
        } else {
            // 下个月的日期
            if (month === 12) {
                currentYear = year + 1;
                currentMonth = 1;
            } else {
                currentYear = year;
                currentMonth = month + 1;
            }
        }
        loadCalendar(currentYear, currentMonth);
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3031/lunar?year=${year}&month=${month}&day=${dayInfo.day}`);
        const data = await response.json();
        
        document.getElementById('detail-panel').style.display = 'block';
        document.getElementById('detail-solar').textContent = data.solar_date;
        document.getElementById('detail-lunar').textContent = data.lunar_date;
        document.getElementById('detail-stem-branch').textContent = data.stem_branch;
        document.getElementById('detail-zodiac').textContent = data.zodiac;
    } catch (error) {
        console.error('Error loading day detail:', error);
    }
}

function changeMonth(delta) {
    currentMonth += delta;
    
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    } else if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    
    loadCalendar(currentYear, currentMonth);
}

function goToToday() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth() + 1;
    loadCalendar(currentYear, currentMonth);
    document.getElementById('detail-panel').style.display = 'none';
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    updateLanguage();
    
    const langButton = document.querySelector('.lang-switch');
    langButton.textContent = currentLanguage === 'zh' ? 'EN' : '中';
}

function updateLanguage() {
    const t = translations[currentLanguage];
    
    document.querySelector('.header h1').textContent = t.title;
    document.querySelectorAll('.controls button')[0].textContent = t.prevMonth;
    document.querySelectorAll('.controls button')[1].textContent = t.today;
    document.querySelectorAll('.controls button')[2].textContent = t.nextMonth;
    
    // 更新星期标题
    const weekdayElements = document.querySelectorAll('.weekday');
    t.weekdays.forEach((name, index) => {
        if (weekdayElements[index]) {
            weekdayElements[index].textContent = name;
        }
    });
    
    // 更新详情面板标题
    const detailTitle = document.querySelector('.detail-panel h3');
    if (detailTitle) {
        detailTitle.textContent = t.detailTitle;
    }
    
    // 更新详情标签
    const detailLabels = document.querySelectorAll('.detail-content p');
    if (detailLabels.length >= 4) {
        detailLabels[0].childNodes[0].textContent = t.solar + ': ';
        detailLabels[1].childNodes[0].textContent = t.lunar + ': ';
        detailLabels[2].childNodes[0].textContent = t.stemBranch + ': ';
        detailLabels[3].childNodes[0].textContent = t.zodiac + ': ';
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status' + (type ? ' ' + type : '');
    
    if (type === 'success') {
        setTimeout(() => {
            status.textContent = '';
            status.className = 'status';
        }, 2000);
    }
}

// 键盘导航支持
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        changeMonth(-1);
    } else if (event.key === 'ArrowRight') {
        changeMonth(1);
    } else if (event.key === 'Escape') {
        document.getElementById('detail-panel').style.display = 'none';
    } else if (event.key === 't' || event.key === 'T') {
        goToToday();
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
