const API_BASE = 'http://192.168.3.176:3030/api';

let currentClothes = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadClothes();
    setupEventListeners();
}

function setupEventListeners() {
    const addBtn = document.getElementById('add-clothing-btn');
    const addModal = document.getElementById('add-clothing-modal');
    const editModal = document.getElementById('edit-clothing-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const editCancelBtn = document.getElementById('edit-cancel-btn');
    const addForm = document.getElementById('add-clothing-form');
    const editForm = document.getElementById('edit-clothing-form');
    const seasonFilter = document.getElementById('season-filter');
    const typeFilter = document.getElementById('type-filter');

    addBtn.addEventListener('click', () => showModal(addModal));
    cancelBtn.addEventListener('click', () => hideModal(addModal));
    editCancelBtn.addEventListener('click', () => hideModal(editModal));
    
    addForm.addEventListener('submit', handleAddClothing);
    editForm.addEventListener('submit', handleEditClothing);
    
    seasonFilter.addEventListener('change', filterClothes);
    typeFilter.addEventListener('change', filterClothes);

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            hideModal(this.closest('.modal'));
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            hideModal(event.target);
        }
    });
}

async function loadClothes() {
    try {
        const response = await fetch(`${API_BASE}/clothes`);
        if (response.ok) {
            currentClothes = await response.json();
            renderClothes(currentClothes);
        } else {
            console.error('Failed to load clothes:', response.statusText);
        }
    } catch (error) {
        console.error('Error loading clothes:', error);
    }
}

async function handleAddClothing(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const clothingData = {
        label: formData.get('label'),
        clothing_type: formData.get('clothing_type'),
        season: formData.get('season'),
        wear_count: parseInt(formData.get('wear_count')) || 0,
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
            renderClothes(currentClothes);
            hideModal(document.getElementById('add-clothing-modal'));
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
        wear_count: parseInt(formData.get('wear_count')),
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
            renderClothes(currentClothes);
            hideModal(document.getElementById('edit-clothing-modal'));
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
            renderClothes(currentClothes);
        } else {
            console.error('Failed to delete clothing:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting clothing:', error);
    }
}

function editClothing(id) {
    const clothing = currentClothes.find(c => c.id === id);
    if (!clothing) return;

    document.getElementById('edit-id').value = clothing.id;
    document.getElementById('edit-label').value = clothing.label;
    document.getElementById('edit-clothing-type').value = clothing.clothing_type;
    document.getElementById('edit-season').value = clothing.season;
    document.getElementById('edit-wear-count').value = clothing.wear_count;
    document.getElementById('edit-image-url').value = clothing.image_url || '';

    showModal(document.getElementById('edit-clothing-modal'));
}

function filterClothes() {
    const seasonFilter = document.getElementById('season-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    
    let filteredClothes = currentClothes;

    if (seasonFilter) {
        filteredClothes = filteredClothes.filter(c => c.season === seasonFilter);
    }
    
    if (typeFilter) {
        filteredClothes = filteredClothes.filter(c => c.clothing_type === typeFilter);
    }

    renderClothes(filteredClothes);
}

function renderClothes(clothes) {
    const grid = document.getElementById('clothes-grid');
    
    if (clothes.length === 0) {
        grid.innerHTML = '<p class="no-clothes">暂无衣物</p>';
        return;
    }

    grid.innerHTML = clothes.map(clothing => createClothingCard(clothing)).join('');
}

function createClothingCard(clothing) {
    const purchaseDate = clothing.purchase_date ? 
        new Date(clothing.purchase_date).toLocaleDateString('zh-CN') : '未知';
    
    const imageUrl = clothing.image_url || `https://picsum.photos/seed/${clothing.id}/300/400.jpg`;
    
    const typeLabels = {
        'top': '上衣',
        'bottom': '裤子',
        'dress': '裙子',
        'outerwear': '外套'
    };
    
    const seasonLabels = {
        'spring-autumn': '春秋装',
        'summer': '夏装',
        'winter': '冬装'
    };

    return `
        <div class="clothing-card">
            <div class="card-image">
                <img src="${imageUrl}" alt="${clothing.label}" onerror="this.src='https://picsum.photos/seed/default/300/400.jpg'">
            </div>
            <div class="card-content">
                <h3 class="card-title">${clothing.label}</h3>
                <div class="card-meta">
                    <span class="type">${typeLabels[clothing.clothing_type]}</span>
                    <span class="season">${seasonLabels[clothing.season]}</span>
                </div>
                <div class="card-stats">
                    <div class="stat">
                        <span class="label">穿着次数</span>
                        <span class="value wear-count" data-id="${clothing.id}">${clothing.wear_count}</span>
                    </div>
                    <div class="stat">
                        <span class="label">购买时间</span>
                        <span class="value">${purchaseDate}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-small btn-increment" onclick="incrementWearCount('${clothing.id}')">+1次</button>
                    <button class="btn-small btn-edit" onclick="editClothing('${clothing.id}')">编辑</button>
                    <button class="btn-small btn-delete" onclick="deleteClothing('${clothing.id}')">删除</button>
                </div>
            </div>
        </div>
    `;
}

async function incrementWearCount(id) {
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
            
            const wearCountElement = document.querySelector(`.wear-count[data-id="${id}"]`);
            if (wearCountElement) {
                wearCountElement.textContent = updatedClothing.wear_count;
            }
        } else {
            console.error('Failed to increment wear count:', response.statusText);
        }
    } catch (error) {
        console.error('Error incrementing wear count:', error);
    }
}

function showModal(modal) {
    modal.style.display = 'block';
}

function hideModal(modal) {
    modal.style.display = 'none';
}