const API_BASE = 'http://192.168.3.176:3030/api';

let currentClothes = [];
let currentFilter = { type: 'all', season: 'all', search: '' };

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadClothes();
    setupEventListeners();
    updateStats();
}

function setupEventListeners() {
    // 导航按钮
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // TODO: 实现不同视图的切换
        });
    });

    // 添加衣物按钮
    document.getElementById('add-clothing-btn').addEventListener('click', showAddModal);

    // 筛选标签
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter.type = this.dataset.filter;
            filterAndRenderClothes();
        });
    });

    // 季节筛选
    document.querySelectorAll('.season-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter.season = this.dataset.season;
            filterAndRenderClothes();
        });
    });

    // 搜索功能
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        currentFilter.search = this.value.toLowerCase();
        filterAndRenderClothes();
    });

    // 模态框事件
    setupModalEvents();

    // 穿着次数增减按钮
    setupWearCountControls();
}

function setupModalEvents() {
    // 添加模态框
    const addModal = document.getElementById('add-clothing-modal');
    const addOverlay = document.getElementById('add-modal-overlay');
    const addForm = document.getElementById('add-clothing-form');

    document.getElementById('close-add-modal').addEventListener('click', hideAddModal);
    document.getElementById('cancel-add-btn').addEventListener('click', hideAddModal);
    addOverlay.addEventListener('click', hideAddModal);

    addForm.addEventListener('submit', handleAddClothing);

    // 编辑模态框
    const editModal = document.getElementById('edit-clothing-modal');
    const editOverlay = document.getElementById('edit-modal-overlay');
    const editForm = document.getElementById('edit-clothing-form');

    document.getElementById('close-edit-modal').addEventListener('click', hideEditModal);
    document.getElementById('cancel-edit-btn').addEventListener('click', hideEditModal);
    editOverlay.addEventListener('click', hideEditModal);

    editForm.addEventListener('submit', handleEditClothing);
    document.getElementById('delete-edit-btn').addEventListener('click', handleDeleteFromEdit);
}

function setupWearCountControls() {
    document.getElementById('decrement-wear').addEventListener('click', function() {
        const countElement = document.getElementById('edit-wear-count');
        let count = parseInt(countElement.textContent);
        if (count > 0) {
            countElement.textContent = count - 1;
        }
    });

    document.getElementById('increment-wear').addEventListener('click', function() {
        const countElement = document.getElementById('edit-wear-count');
        let count = parseInt(countElement.textContent);
        countElement.textContent = count + 1;
    });
}

async function loadClothes() {
    try {
        const response = await fetch(`${API_BASE}/clothes`);
        if (response.ok) {
            currentClothes = await response.json();
            filterAndRenderClothes();
        } else {
            console.error('Failed to load clothes:', response.statusText);
        }
    } catch (error) {
        console.error('Error loading clothes:', error);
    }
}

function filterAndRenderClothes() {
    let filteredClothes = [...currentClothes];

    // 按类型筛选
    if (currentFilter.type !== 'all') {
        filteredClothes = filteredClothes.filter(c => c.clothing_type === currentFilter.type);
    }

    // 按季节筛选
    if (currentFilter.season !== 'all') {
        filteredClothes = filteredClothes.filter(c => c.season === currentFilter.season);
    }

    // 按搜索词筛选
    if (currentFilter.search) {
        filteredClothes = filteredClothes.filter(c => 
            c.label.toLowerCase().includes(currentFilter.search)
        );
    }

    renderClothes(filteredClothes);
    updateEmptyState(filteredClothes.length);
}

function renderClothes(clothes) {
    const grid = document.getElementById('clothes-grid');
    
    grid.innerHTML = clothes.map(clothing => createClothingCard(clothing)).join('');
    
    // 添加事件监听器到新创建的卡片
    attachCardEventListeners();
}

function createClothingCard(clothing) {
    const imageUrl = clothing.image_url || `https://picsum.photos/seed/${clothing.id}/180/240.jpg`;
    
    const typeLabels = {
        'top': '上衣',
        'bottom': '下装',
        'dress': '连衣裙',
        'outerwear': '外套'
    };
    
    const seasonLabels = {
        'spring-autumn': '春秋',
        'summer': '夏季',
        'winter': '冬季'
    };

    return `
        <div class="clothing-card" data-id="${clothing.id}">
            <div class="card-image">
                <img src="${imageUrl}" alt="${clothing.label}" onerror="this.src='https://picsum.photos/seed/default/180/240.jpg'">
                <span class="card-badge">${clothing.wear_count}次</span>
            </div>
            <div class="card-content">
                <h3 class="card-title">${clothing.label}</h3>
                <div class="card-meta">
                    <span class="meta-tag">${typeLabels[clothing.clothing_type]}</span>
                    <span class="meta-tag season-${clothing.season}">${seasonLabels[clothing.season]}</span>
                </div>
                <div class="card-stats">
                    <div class="wear-info">
                        <span class="wear-count">穿着 ${clothing.wear_count} 次</span>
                    </div>
                    <div class="wear-controls">
                        <button class="wear-btn" onclick="quickIncrementWear('${clothing.id}')">+</button>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn btn-edit" onclick="editClothing('${clothing.id}')">编辑</button>
                    <button class="card-action-btn btn-delete" onclick="deleteClothing('${clothing.id}')">删除</button>
                </div>
            </div>
        </div>
    `;
}

function attachCardEventListeners() {
    // 为卡片添加点击事件
    document.querySelectorAll('.clothing-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的是按钮，不触发卡片点击事件
            if (e.target.classList.contains('card-action-btn') || 
                e.target.classList.contains('wear-btn')) {
                return;
            }
            const id = this.dataset.id;
            editClothing(id);
        });
    });
}

function updateEmptyState(count) {
    const emptyState = document.getElementById('empty-state');
    const clothesGrid = document.getElementById('clothes-grid');
    
    if (count === 0) {
        emptyState.style.display = 'block';
        clothesGrid.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        clothesGrid.style.display = 'grid';
    }
}

function updateStats() {
    const totalCount = currentClothes.length;
    const totalWears = currentClothes.reduce((sum, item) => sum + item.wear_count, 0);
    
    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('this-wear-count').textContent = totalWears;
    
    // TODO: 实现更复杂的统计逻辑
    document.getElementById('this-month-count').textContent = '0';
    document.getElementById('total-value').textContent = '¥0';
}

async function handleAddClothing(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const clothingData = {
        label: formData.get('label'),
        clothing_type: formData.get('clothing_type'),
        season: formData.get('season'),
        wear_count: 0,
        purchase_date: formData.get('purchase_date') || null,
        image_url: formData.get('image_url') || null
    };

    try {
        const response = await fetch(`${API_BASE}/clothes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clothingData)
        });

        if (response.ok) {
            const newClothing = await response.json();
            currentClothes.push(newClothing);
            filterAndRenderClothes();
            updateStats();
            hideAddModal();
            event.target.reset();
        } else {
            console.error('Failed to add clothing:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding clothing:', error);
    }
}

async function handleEditClothing(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = formData.get('id');
    
    const updateData = {
        label: formData.get('label'),
        clothing_type: formData.get('clothing_type'),
        season: formData.get('season'),
        wear_count: parseInt(document.getElementById('edit-wear-count').textContent),
        image_url: formData.get('image_url') || null
    };

    try {
        const response = await fetch(`${API_BASE}/clothes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const updatedClothing = await response.json();
            const index = currentClothes.findIndex(c => c.id === updatedClothing.id);
            if (index !== -1) {
                currentClothes[index] = updatedClothing;
            }
            filterAndRenderClothes();
            updateStats();
            hideEditModal();
        } else {
            console.error('Failed to update clothing:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating clothing:', error);
    }
}

async function deleteClothing(id) {
    if (!confirm('确定要删除这件衣物吗？')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/clothes/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            currentClothes = currentClothes.filter(c => c.id !== id);
            filterAndRenderClothes();
            updateStats();
        } else {
            console.error('Failed to delete clothing:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting clothing:', error);
    }
}

async function handleDeleteFromEdit() {
    const id = document.getElementById('edit-id').value;
    if (id && confirm('确定要删除这件衣物吗？')) {
        hideEditModal();
        await deleteClothing(id);
    }
}

async function quickIncrementWear(id) {
    const clothing = currentClothes.find(c => c.id === id);
    if (!clothing) return;

    const updateData = {
        wear_count: clothing.wear_count + 1
    };

    try {
        const response = await fetch(`${API_BASE}/clothes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const updatedClothing = await response.json();
            const index = currentClothes.findIndex(c => c.id === updatedClothing.id);
            if (index !== -1) {
                currentClothes[index] = updatedClothing;
            }
            filterAndRenderClothes();
            updateStats();
        } else {
            console.error('Failed to increment wear count:', response.statusText);
        }
    } catch (error) {
        console.error('Error incrementing wear count:', error);
    }
}

function editClothing(id) {
    const clothing = currentClothes.find(c => c.id === id);
    if (!clothing) return;

    document.getElementById('edit-id').value = clothing.id;
    document.getElementById('edit-label').value = clothing.label;
    document.getElementById('edit-clothing-type').value = clothing.clothing_type;
    document.getElementById('edit-season').value = clothing.season;
    document.getElementById('edit-wear-count').textContent = clothing.wear_count;

    showEditModal();
}

function showAddModal() {
    document.getElementById('add-clothing-modal').classList.add('show');
    document.getElementById('add-modal-overlay').classList.add('show');
}

function hideAddModal() {
    document.getElementById('add-clothing-modal').classList.remove('show');
    document.getElementById('add-modal-overlay').classList.remove('show');
}

function showEditModal() {
    document.getElementById('edit-clothing-modal').classList.add('show');
    document.getElementById('edit-modal-overlay').classList.add('show');
}

function hideEditModal() {
    document.getElementById('edit-clothing-modal').classList.remove('show');
    document.getElementById('edit-modal-overlay').classList.remove('show');
}