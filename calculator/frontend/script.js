let currentInput = '';
let operatorAdded = false;
let currentLanguage = 'zh';

const translations = {
    zh: {
        title: 'Rust计算器',
        placeholder: '输入表达式 (例如: 5 + 3)',
        clear: 'C',
        result: '结果: ',
        calculating: '计算中...',
        pleaseEnter: '请输入表达式',
        error: '错误: ',
        connectionError: '连接错误: 请确保后端服务器正在运行',
        calculateSuccess: '计算成功'
    },
    en: {
        title: 'Rust Calculator',
        placeholder: 'Enter expression (e.g: 5 + 3)',
        clear: 'Clear',
        result: 'Result: ',
        calculating: 'Calculating...',
        pleaseEnter: 'Please enter an expression',
        error: 'Error: ',
        connectionError: 'Connection error: Please ensure the backend server is running',
        calculateSuccess: 'Calculation successful'
    }
};

function appendToDisplay(value) {
    const display = document.getElementById('expression');
    
    if (['+', '-', '*', '/'].includes(value)) {
        if (operatorAdded) {
            return;
        }
        operatorAdded = true;
        currentInput += ' ' + value + ' ';
    } else if (value === '.') {
        const parts = currentInput.split(' ');
        const lastNumber = parts[parts.length - 1];
        if (lastNumber.includes('.')) {
            return;
        }
        currentInput += value;
    } else {
        currentInput += value;
        operatorAdded = false;
    }
    
    display.value = currentInput;
}

function clearDisplay() {
    currentInput = '';
    operatorAdded = false;
    document.getElementById('expression').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('status').textContent = '';
}

async function calculate() {
    if (!currentInput.trim()) {
        showStatus(translations[currentLanguage].pleaseEnter, 'error');
        return;
    }

    const expression = currentInput.trim();
    showStatus(translations[currentLanguage].calculating, 'info');

    try {
        const response = await fetch('http://localhost:3030/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ expression: expression })
        });

        const data = await response.json();

        if (data.error) {
            showStatus(translations[currentLanguage].error + data.error, 'error');
            document.getElementById('result').textContent = '';
        } else {
            document.getElementById('result').textContent = translations[currentLanguage].result + data.result;
            showStatus(translations[currentLanguage].calculateSuccess, 'success');
            currentInput = data.result.toString();
            document.getElementById('expression').value = currentInput;
            operatorAdded = false;
        }
    } catch (error) {
        showStatus(translations[currentLanguage].connectionError, 'error');
        console.error('Error:', error);
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    updateLanguage();
    
    const langButton = document.querySelector('.lang-switch');
    langButton.textContent = currentLanguage === 'zh' ? 'EN' : '中';
}

function updateLanguage() {
    const t = translations[currentLanguage];
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            element.placeholder = t[key];
        }
    });
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + type;
    
    if (type === 'success') {
        setTimeout(() => {
            status.textContent = '';
            status.className = 'status';
        }, 2000);
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key >= '0' && event.key <= '9') {
        appendToDisplay(event.key);
    } else if (event.key === '.') {
        appendToDisplay('.');
    } else if (['+', '-', '*', '/'].includes(event.key)) {
        appendToDisplay(event.key);
    } else if (event.key === 'Enter') {
        calculate();
    } else if (event.key === 'Escape') {
        clearDisplay();
    } else if (event.key === 'Backspace') {
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            document.getElementById('expression').value = currentInput;
            operatorAdded = false;
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    updateLanguage();
});