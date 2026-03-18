const LANG_COLORS = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219', CSS: '#563d7c', HTML: '#e34c26', Go: '#00ADD8',
    Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', Shell: '#89e051',
    C: '#555555', 'C++': '#f34b7d', Swift: '#F05138', Kotlin: '#A97BFF',
    Vue: '#41b883', Dart: '#00B4AB', 'Jupyter Notebook': '#DA5B0B'
};

const input = document.getElementById('username-input');
const clearBtn = document.getElementById('clear-btn');
const searchBtn = document.getElementById('search-btn');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error-msg');
const errorText = document.getElementById('error-text');
const profileCard = document.getElementById('profile-card');

let allRepos = [];
let showingAll = false;
const REPOS_LIMIT = 6;

input.addEventListener('input', () => {
    clearBtn.classList.toggle('visible', input.value.length > 0);
    hideError();
});
input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('visible');
    hideError();
    input.focus();
});

document.querySelectorAll('.quick-badge').forEach(b => {
    b.addEventListener('click', () => {
        input.value = b.dataset.user;
        clearBtn.classList.add('visible');
        doSearch();
    });
});

searchBtn.addEventListener('click', doSearch);

document.getElementById('show-more-btn').addEventListener('click', () => {
    showingAll = !showingAll;
    renderRepos();
});

function hideError() { errorMsg.classList.remove('visible'); }
function showError(msg) {
    errorText.textContent = msg;
    errorMsg.classList.add('visible');
    profileCard.classList.remove('visible');
}

async function doSearch() {
    const user = input.value.trim();
    if (!user) { input.focus(); return; }

    loading.classList.add('visible');
    hideError();
    profileCard.classList.remove('visible');
    searchBtn.disabled = true;

    try {
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${encodeURIComponent(user)}`),
            fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=stars`)
        ]);

        if (userRes.status === 404) { showError(`Usuario "@${user}" no encontrado.`); return; }
        if (!userRes.ok) { showError('Error al conectar con la API de GitHub.'); return; }

        const userData = await userRes.json();
        const reposData = reposRes.ok ? await reposRes.json() : [];

        renderProfile(userData, reposData);
    } catch (e) {
        showError('Error de red. Verifica tu conexión.');
    } finally {
        loading.classList.remove('visible');
        searchBtn.disabled = false;
    }
}

function fmt(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n;
}

function renderProfile(user, repos) {
    document.getElementById('profile-avatar').src = user.avatar_url;
    document.getElementById('profile-name').textContent = user.name || user.login;
    document.getElementById('profile-login').textContent = `@${user.login}`;
    document.getElementById('profile-bio').textContent = user.bio || '';
    document.getElementById('github-link').href = user.html_url;
    document.getElementById('stat-repos').textContent = fmt(user.public_repos);
    document.getElementById('stat-followers').textContent = fmt(user.followers);
    document.getElementById('stat-following').textContent = fmt(user.following);

    // Meta info
    const meta = document.getElementById('profile-meta');
    meta.innerHTML = '';
    const metaItems = [
        user.company ? { icon: buildingIcon(), text: user.company } : null,
        user.location ? { icon: locationIcon(), text: user.location } : null,
        user.blog ? { icon: linkIcon(), text: user.blog, href: user.blog.startsWith('http') ? user.blog : 'https://' + user.blog } : null,
        user.twitter_username ? { icon: twitterIcon(), text: `@${user.twitter_username}` } : null,
    ].filter(Boolean);
    metaItems.forEach(item => {
        const d = document.createElement('div');
        d.className = 'meta-item';
        d.innerHTML = item.icon;
        if (item.href) {
            const a = document.createElement('a');
            a.href = item.href; a.target = '_blank';
            a.style.cssText = 'color:inherit;text-decoration:none;';
            a.textContent = item.text;
            d.appendChild(a);
        } else {
            d.appendChild(document.createTextNode(item.text));
        }
        meta.appendChild(d);
    });

    allRepos = repos.filter(r => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count);
    showingAll = false;
    document.getElementById('repos-count').textContent = allRepos.length;
    renderRepos();

    profileCard.classList.add('visible');
    profileCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderRepos() {
    const grid = document.getElementById('repos-grid');
    const showMoreBtn = document.getElementById('show-more-btn');
    const displayed = showingAll ? allRepos : allRepos.slice(0, REPOS_LIMIT);

    grid.innerHTML = '';
    displayed.forEach(repo => {
        const a = document.createElement('a');
        a.className = 'repo-card';
        a.href = repo.html_url;
        a.target = '_blank';

        const langColor = LANG_COLORS[repo.language] || '#8b949e';
        a.innerHTML = `
        <div class="repo-name">${escHtml(repo.name)}</div>
        ${repo.description ? `<div class="repo-desc">${escHtml(repo.description)}</div>` : ''}
        <div class="repo-footer">
          <span class="repo-stat">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
            ${fmt(repo.stargazers_count)}
          </span>
          <span class="repo-stat">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>
            ${fmt(repo.forks_count)}
          </span>
          ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background:${langColor}"></span>${escHtml(repo.language)}</span>` : ''}
        </div>`;
        grid.appendChild(a);
    });

    if (allRepos.length > REPOS_LIMIT) {
        showMoreBtn.style.display = 'block';
        showMoreBtn.textContent = showingAll
            ? `Mostrar menos`
            : `Ver todos los repositorios (${allRepos.length})`;
    } else {
        showMoreBtn.style.display = 'none';
    }
}

function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildingIcon() { return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Zm0 2.5h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Zm3.75-2.5h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Zm0 2.5h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM4.25 4h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Zm3.5 0h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"/><path d="M11 14.25v-3.5a.75.75 0 0 0-.75-.75H8.75a.75.75 0 0 0-.75.75v3.5H.75a.75.75 0 0 1 0-1.5H1V1.75C1 .784 1.784 0 2.75 0h8.5C12.216 0 13 .784 13 1.75V12.75h.25a.75.75 0 0 1 0 1.5Z"/></svg>`; }
function locationIcon() { return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z"/></svg>`; }
function linkIcon() { return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 2 2 0 0 0 2.83 0l2.5-2.5a2 2 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a2 2 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 2 2 0 0 0-2.83 0l-2.5 2.5a2 2 0 0 0 0 2.83Z"/></svg>`; }
function twitterIcon() { return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/></svg>`; }