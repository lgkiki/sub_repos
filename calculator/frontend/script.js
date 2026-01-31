let currentInput = '';
let operatorAdded = false;

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
        showStatus('请输入表达式', 'error');
        return;
    }

    const expression = currentInput.trim();
    showStatus('计算中...', 'info');

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
            showStatus('错误: ' + data.error, 'error');
            document.getElementById('result').textContent = '';
        } else {
            document.getElementById('result').textContent = '结果: ' + data.result;
            showStatus('计算成功', 'success');
            currentInput = data.result.toString();
            document.getElementById('expression').value = currentInput;
            operatorAdded = false;
        }
    } catch (error) {
        showStatus('连接错误: 请确保后端服务器正在运行', 'error');
        console.error('Error:', error);
    }
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