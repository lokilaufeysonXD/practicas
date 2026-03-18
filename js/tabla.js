const API = '../conexion_BD/api.php';
let allUsers = [];
let filtered = [];
let sortCol = 'id';
let sortDir = 'asc';
let deleteId = null;

// ── Fetch all users ──
async function loadUsers() {
    try {
        const res = await fetch(API);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        allUsers = data;
        populateDeptFilter();
        applyFilters();
        updateStats();
    } catch (e) {
        showToast('Error al cargar usuarios: ' + e.message, 'error');
        document.getElementById('table-body').innerHTML =
            `<tr class="loading-row"><td colspan="7">❌ Error: ${e.message}</td></tr>`;
    }
}

// ── Stats ──
function updateStats() {
    const active = allUsers.filter(u => u.estado === 'Activo').length;
    const inactive = allUsers.filter(u => u.estado !== 'Activo').length;
    const avg = allUsers.length
        ? (allUsers.reduce((s, u) => s + parseFloat(u.salario || 0), 0) / allUsers.length)
        : 0;
    document.getElementById('st-total').textContent = allUsers.length;
    document.getElementById('st-active').textContent = active;
    document.getElementById('st-inactive').textContent = inactive;
    document.getElementById('st-avg').textContent = '€' + avg.toFixed(0);
}

// ── Dept filter ──
function populateDeptFilter() {
    const depts = [...new Set(allUsers.map(u => u.departamento).filter(Boolean))].sort();
    const sel = document.getElementById('filter-dept');
    const cur = sel.value;
    sel.innerHTML = '<option value="">Todos los depts.</option>';
    depts.forEach(d => {
        const o = document.createElement('option');
        o.value = d; o.textContent = d;
        if (d === cur) o.selected = true;
        sel.appendChild(o);
    });
}

// ── Filter + sort ──
function applyFilters() {
    const q = document.getElementById('search-input').value.toLowerCase().trim();
    const est = document.getElementById('filter-estado').value;
    const dept = document.getElementById('filter-dept').value;

    filtered = allUsers.filter(u => {
        const matchQ = !q ||
            u.nombre?.toLowerCase().includes(q) ||
            u.ciudad?.toLowerCase().includes(q) ||
            u.departamento?.toLowerCase().includes(q);
        const matchE = !est || u.estado === est;
        const matchD = !dept || u.departamento === dept;
        return matchQ && matchE && matchD;
    });

    filtered.sort((a, b) => {
        let va = a[sortCol] ?? '';
        let vb = b[sortCol] ?? '';
        if (['edad', 'salario', 'id'].includes(sortCol)) {
            va = parseFloat(va); vb = parseFloat(vb);
        } else {
            va = va.toString().toLowerCase();
            vb = vb.toString().toLowerCase();
        }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    document.getElementById('results-count').textContent =
        `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`;

    renderTable();
}

// ── Render table ──
function renderTable() {
    const tbody = document.getElementById('table-body');
    const rows = filtered;

    if (!rows.length) {
        tbody.innerHTML = `
        <tr>
          <td colspan="10">
            <div class="empty-state">
              <div class="icon">🔍</div>
              <p>No se encontraron usuarios con los filtros aplicados.</p>
            </div>
          </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = rows.map(u => {
        const initials = (u.nombre || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const badgeClass = (u.estado || '').toLowerCase();
        const salaryFmt = parseFloat(u.salario || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `
      <tr>
        <td class="id-cell">#${u.id}</td>
        <td>
          <div class="name-cell">
            <div class="avatar">${initials}</div>
            <div>
              <div class="name">${esc(u.nombre)}</div>
              <div class="city">${esc(u.ciudad)}</div>
            </div>
          </div>
        </td>
        <td>${u.edad ?? '—'}</td>
        <td>${esc(u.email) || '—'}</td>
        <td>${esc(u.telefono) || '—'}</td>
        <td>${u.fecha_nacimiento ? u.fecha_nacimiento : '—'}</td>
        <td>${esc(u.departamento)}</td>
        <td><span class="salary">€${salaryFmt}</span></td>
        <td><span class="badge ${badgeClass}">${esc(u.estado)}</span></td>
        <td>
          <div class="actions">
            <button class="btn-icon btn-edit" title="Editar" onclick="openModal(${u.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon btn-del" title="Eliminar" onclick="askDelete(${u.id}, '${esc(u.nombre)}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
}

// ── Sort ──
document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (sortCol === col) {
            sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            sortCol = col; sortDir = 'asc';
        }
        document.querySelectorAll('th.sortable').forEach(t => t.classList.remove('asc', 'desc'));
        th.classList.add(sortDir);
        applyFilters();
    });
});
// Set default sort indicator
document.querySelector('th[data-col="id"]').classList.add('asc');

// ── Search & filter events ──
document.getElementById('search-input').addEventListener('input', () => { applyFilters(); });
document.getElementById('filter-estado').addEventListener('change', () => { applyFilters(); });
document.getElementById('filter-dept').addEventListener('change', () => { applyFilters(); });

// ── Modal ──
function openModal(id = null) {
    clearForm();
    if (id) {
        const u = allUsers.find(u => u.id == id);
        if (!u) return;
        document.getElementById('modal-title').textContent = 'Editar usuario';
        document.getElementById('save-label').textContent = 'Guardar cambios';
        document.getElementById('f-id').value = u.id;
        document.getElementById('f-nombre').value = u.nombre;
        document.getElementById('f-edad').value = u.edad;
        document.getElementById('f-email').value = u.email || '';
        document.getElementById('f-telefono').value = u.telefono || '';
        document.getElementById('f-fecha_nacimiento').value = u.fecha_nacimiento || '';
        document.getElementById('f-ciudad').value = u.ciudad;
        document.getElementById('f-departamento').value = u.departamento;
        document.getElementById('f-salario').value = u.salario;
        document.getElementById('f-estado').value = u.estado;
    } else {
        document.getElementById('modal-title').textContent = 'Nuevo usuario';
        document.getElementById('save-label').textContent = 'Guardar usuario';
    }
    document.getElementById('form-modal').classList.add('open');
}

function closeModal() {
    document.getElementById('form-modal').classList.remove('open');
}

function clearForm() {
    ['f-id', 'f-nombre', 'f-edad', 'f-email', 'f-telefono', 'f-fecha_nacimiento',
        'f-ciudad', 'f-departamento', 'f-salario'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('f-estado').value = 'Activo';
}

function handleOverlayClick(e) {
    if (e.target.id === 'form-modal') closeModal();
}

// ── Save (create or update) ──
async function saveUser() {
    const id = document.getElementById('f-id').value;
    const nombre = document.getElementById('f-nombre').value.trim();

    if (!nombre) {
        showToast('El nombre es obligatorio', 'error');
        document.getElementById('f-nombre').focus();
        return;
    }

    const emailVal = document.getElementById('f-email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailVal && !emailRegex.test(emailVal)) {
        showToast('El correo electrónico no tiene un formato válido', 'error');
        document.getElementById('f-email').focus();
        return;
    }

    const payload = {
        nombre,
        edad: parseInt(document.getElementById('f-edad').value) || 0,
        email: document.getElementById('f-email').value.trim(),
        telefono: document.getElementById('f-telefono').value.trim(),
        fecha_nacimiento: document.getElementById('f-fecha_nacimiento').value || null,
        ciudad: document.getElementById('f-ciudad').value.trim(),
        departamento: document.getElementById('f-departamento').value.trim(),
        salario: parseFloat(document.getElementById('f-salario').value) || 0,
        estado: document.getElementById('f-estado').value,
    };

    if (id) payload.id = parseInt(id);

    try {
        const res = await fetch(API, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        showToast(id ? 'Usuario actualizado ✓' : 'Usuario creado ✓', 'success');
        closeModal();
        await loadUsers();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

// ── Delete ──
function askDelete(id, nombre) {
    deleteId = id;
    document.getElementById('confirm-text').textContent =
        `¿Estás segura de que quieres eliminar a "${nombre}"? Esta acción no se puede deshacer.`;
    document.getElementById('confirm-modal').classList.add('open');
}
function closeConfirm() {
    document.getElementById('confirm-modal').classList.remove('open');
    deleteId = null;
}
function handleConfirmOverlay(e) {
    if (e.target.id === 'confirm-modal') closeConfirm();
}
async function confirmDelete() {
    if (!deleteId) return;
    try {
        const res = await fetch(API, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: deleteId })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        showToast('Usuario eliminado', 'success');
        closeConfirm();
        await loadUsers();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

// ── Toast ──
function showToast(msg, type = 'success') {
    const container = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
    container.appendChild(el);
    setTimeout(() => {
        el.classList.add('out');
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

// ── Utils ──
function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Init ──
loadUsers();