// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// DOM Elements
const farmersTableBody = document.getElementById('farmersTableBody');
const searchInput = document.getElementById('searchInput');
const addFarmerBtn = document.getElementById('addFarmerBtn');
const farmerModal = document.getElementById('farmerModal');
const deleteModal = document.getElementById('deleteModal');
const farmerForm = document.getElementById('farmerForm');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
const cancelDeleteButton = document.getElementById('cancelDeleteButton');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const notificationIcon = document.getElementById('notificationIcon');

let currentFarmerId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', loadFarmers);
searchInput.addEventListener('input', debounce(handleSearch, 300));
addFarmerBtn.addEventListener('click', () => showModal());
saveButton.addEventListener('click', handleSaveFarmer);
cancelButton.addEventListener('click', hideModal);
confirmDeleteButton.addEventListener('click', handleDeleteFarmer);
cancelDeleteButton.addEventListener('click', hideDeleteModal);

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'success') {
    notificationMessage.textContent = message;
    notificationIcon.className = type === 'success' 
        ? 'fas fa-check-circle text-green-400 text-xl'
        : 'fas fa-exclamation-circle text-red-400 text-xl';
    
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Modal Functions
function showModal(farmer = null) {
    currentFarmerId = farmer ? farmer.id : null;
    document.getElementById('modalTitle').textContent = farmer ? 'Editar Agricultor' : 'Adicionar Agricultor';
    
    if (farmer) {
        farmerForm.querySelector('[name="name"]').value = farmer.name;
        farmerForm.querySelector('[name="address"]').value = farmer.address;
        farmerForm.querySelector('[name="phone"]').value = farmer.phone;
        farmerForm.querySelector('[name="email"]').value = farmer.email || '';
        farmerForm.querySelector('[name="landSize"]').value = farmer.landSize;
        farmerForm.querySelector('[name="cropTypes"]').value = farmer.cropTypes.join(', ');
    } else {
        farmerForm.reset();
    }
    
    farmerModal.classList.remove('hidden');
}

function hideModal() {
    farmerModal.classList.add('hidden');
    farmerForm.reset();
    currentFarmerId = null;
}

function showDeleteModal(farmerId) {
    currentFarmerId = farmerId;
    deleteModal.classList.remove('hidden');
}

function hideDeleteModal() {
    deleteModal.classList.add('hidden');
    currentFarmerId = null;
}

// Data Management Functions
async function loadFarmers() {
    try {
        const response = await fetch(`${API_BASE_URL}/farmers`);
        if (!response.ok) {
            throw new Error('Failed to load farmers');
        }
        const farmers = await response.json();
        renderFarmers(farmers);
    } catch (error) {
        console.error('Error loading farmers:', error);
        showNotification(error.message, 'error');
    }
}

async function handleSearch(event) {
    const query = event.target.value.trim();
    try {
        const response = await fetch(`${API_BASE_URL}/farmers/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to search farmers');
        }
        const farmers = await response.json();
        renderFarmers(farmers);
    } catch (error) {
        console.error('Error searching farmers:', error);
        showNotification(error.message, 'error');
    }
}

async function handleSaveFarmer(event) {
    event.preventDefault();
    
    try {
        // Get form elements
        const name = farmerForm.querySelector('[name="name"]').value.trim();
        const address = farmerForm.querySelector('[name="address"]').value.trim();
        const phone = farmerForm.querySelector('[name="phone"]').value.trim();
        const email = farmerForm.querySelector('[name="email"]').value.trim();
        const landSize = farmerForm.querySelector('[name="landSize"]').value;
        const cropTypes = farmerForm.querySelector('[name="cropTypes"]').value
            .split(',')
            .map(crop => crop.trim())
            .filter(Boolean);

        // Validate required fields
        if (!name || !address || !phone || !landSize) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }

        // Validate phone number format
        if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone)) {
            throw new Error('Formato de telefone inválido. Use (XX) XXXXX-XXXX');
        }

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Formato de email inválido');
        }

        // Validate land size
        const landSizeNum = Number(landSize);
        if (isNaN(landSizeNum) || landSizeNum <= 0) {
            throw new Error('Área da terra deve ser um número positivo');
        }

        const formData = {
            name,
            address,
            phone,
            email,
            landSize: landSizeNum,
            cropTypes
        };

        const url = currentFarmerId 
            ? `${API_BASE_URL}/farmers/${currentFarmerId}`
            : `${API_BASE_URL}/farmers`;

        const response = await fetch(url, {
            method: currentFarmerId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Erro ao salvar agricultor');
        }

        const savedFarmer = await response.json();
        showNotification(currentFarmerId ? 'Agricultor atualizado com sucesso!' : 'Agricultor adicionado com sucesso!');
        hideModal();
        loadFarmers();
    } catch (error) {
        console.error('Error saving farmer:', error);
        showNotification(error.message, 'error');
    }
}

async function handleDeleteFarmer() {
    try {
        const response = await fetch(`${API_BASE_URL}/farmers/${currentFarmerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete farmer');
        }

        showNotification('Agricultor excluído com sucesso!');
        hideDeleteModal();
        loadFarmers();
    } catch (error) {
        console.error('Error deleting farmer:', error);
        showNotification(error.message, 'error');
    }
}

// UI Rendering
function renderFarmers(farmers) {
    farmersTableBody.innerHTML = farmers.map(farmer => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${farmer.name}</div>
                <div class="text-sm text-gray-500">${farmer.address}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${farmer.phone}</div>
                ${farmer.email ? `<div class="text-sm text-gray-500">${farmer.email}</div>` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${farmer.landSize}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${farmer.cropTypes.join(', ')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="showModal(${JSON.stringify(farmer)})" 
                        class="text-green-600 hover:text-green-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="showDeleteModal(${farmer.id})" 
                        class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}