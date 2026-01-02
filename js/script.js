document.getElementById('menu-button').addEventListener('click', function (e) {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const isVisible = dropdownMenu.classList.toggle('visible');
    this.setAttribute('aria-expanded', isVisible);
    e.stopPropagation();
});

document.addEventListener('click', function (e) {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const menuButton = document.getElementById('menu-button');
    if (
        dropdownMenu.classList.contains('visible') &&
        !dropdownMenu.contains(e.target) &&
        e.target !== menuButton
    ) {
        dropdownMenu.classList.remove('visible');
    }
});

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle.addEventListener('click', toggleTheme);

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

async function fetchFeaturedRepos() {
    const featuredContainer = document.getElementById("featured-carousel-container");
    const featuredSpinner = document.getElementById("featured-loading-spinner");
    
    featuredSpinner.style.display = 'block';
    
    try {
        const response = await fetch("https://api.github.com/users/SilentCaMXMF/repos?per_page=100");
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const allRepos = await response.json();
        
        const reposWithDescriptions = allRepos.filter(repo => repo.description && repo.description.trim() !== "");
        
        const sortedRepos = [...reposWithDescriptions].sort((a, b) => {
            const dateCompare = new Date(b.updated_at) - new Date(a.updated_at);
            if (dateCompare !== 0) return dateCompare;
            return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        });
        
        const featuredRepos = sortedRepos.slice(0, 5);
        
        renderFeaturedRepos(featuredRepos);
        
    } catch (error) {
        console.error("Error fetching featured repos:", error);
        document.getElementById("featured-carousel-container").innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Failed to load featured projects.
                </div>
            </div>
        `;
    } finally {
        featuredSpinner.style.display = 'none';
    }
}

function renderFeaturedRepos(repos) {
    const carouselInner = document.getElementById("carousel-inner");
    const carouselIndicators = document.getElementById("carousel-indicators");
    const carouselContainer = document.getElementById("featured-carousel-container");
    
    carouselInner.innerHTML = "";
    carouselIndicators.innerHTML = "";
    
    if (repos.length === 0) {
        carouselContainer.innerHTML = `
            <div class="col-12 text-center">
                <p>No featured projects found.</p>
            </div>
        `;
        return;
    }
    
    repos.forEach((repo, index) => {
        const isActive = index === 0 ? 'active' : '';
        
        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.setAttribute("data-bs-target", "#featuredCarousel");
        indicator.setAttribute("data-bs-slide-to", index);
        indicator.className = isActive ? 'active' : '';
        indicator.setAttribute("aria-label", `Slide ${index + 1}`);
        carouselIndicators.appendChild(indicator);
        
        const carouselItem = document.createElement("div");
        carouselItem.className = `carousel-item ${isActive}`;
        
        carouselItem.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="repo-card featured h-100">
                        <div class="star-badge">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="repo-header">
                            <div class="repo-name">${repo.name}</div>
                            <div class="repo-description">${repo.description || "No description available."}</div>
                        </div>
                        <div class="repo-meta">
                            <span>
                                <i class="fas fa-code-branch"></i> ${repo.language || 'N/A'}
                            </span>
                            <span>
                                <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                            </span>
                            <span>
                                <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div class="repo-footer">
                            <a href="${repo.html_url}" target="_blank" class="repo-link">
                                <i class="fab fa-github"></i> View Repository
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        carouselInner.appendChild(carouselItem);
    });
    
    carouselContainer.style.display = 'block';
}

document.addEventListener("DOMContentLoaded", () => {
    fetchFeaturedRepos();
    
    const repoContainer = document.getElementById("github-repos");
    const filterInput = document.getElementById("repo-filter");
    const sortSelect = document.getElementById("repo-sort");
    const loadingSpinner = document.getElementById("loading-spinner");
    const noReposMessage = document.getElementById("no-repos-message");
    
    let allRepos = [];
    let reposWithDesc = [];
    let reposWithoutDesc = [];

    async function fetchRepos() {
        loadingSpinner.style.display = 'block';
        noReposMessage.style.display = 'none';
        
        const cacheKey = 'github-repos-cache';
        const cacheExpiry = 5 * 60 * 1000;
        
        try {
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                const now = Date.now();
                
                if (now - timestamp < cacheExpiry) {
                    allRepos = data;
                }
            }
            
            if (allRepos.length === 0) {
                const response = await fetch("https://api.github.com/users/SilentCaMXMF/repos?per_page=100");
                
                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }
                
                allRepos = await response.json();
                
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: allRepos,
                    timestamp: Date.now()
                }));
            }
            
            reposWithDesc = allRepos.filter(repo => repo.description && repo.description.trim() !== "");
            reposWithoutDesc = allRepos.filter(repo => !repo.description || repo.description.trim() === "");
            
            renderRepos(reposWithDesc.slice(0, 3));
            
            if (reposWithoutDesc.length > 0) {
                showLoadMoreButton();
            }
            
        } catch (error) {
            console.error("Error fetching repos:", error);
            repoContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Failed to load repositories. Please try again later.
                    </div>
                </div>
            `;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    function filterRepos(repos, query) {
        const lower = query.toLowerCase();
        const filtered = repos.filter(repo =>
            repo.name.toLowerCase().includes(lower) ||
            (repo.description && repo.description.toLowerCase().includes(lower))
        );
        return sortRepos(filtered);
    }

    function sortRepos(repos) {
        const sortType = sortSelect.value;
        return [...repos].sort((a, b) => {
            if (sortType === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortType === "updated") {
                return new Date(b.updated_at) - new Date(a.updated_at);
            } else if (sortType === "stars") {
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            }
            return 0;
        });
    }

    function renderRepos(repos) {
        repoContainer.innerHTML = "";
        
        if (repos.length === 0) {
            noReposMessage.style.display = 'block';
            return;
        }
        
        noReposMessage.style.display = 'none';

        repos.forEach(repo => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";

            card.innerHTML = `
                <div class="repo-card h-100">
                    <div class="repo-header">
                        <div class="repo-name">${repo.name}</div>
                        <div class="repo-description">${repo.description || "No description available."}</div>
                    </div>
                    <div class="repo-meta">
                        <span>
                            <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                        </span>
                        <span>
                            <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div class="repo-footer">
                        <a href="${repo.html_url}" target="_blank" class="repo-link">
                            <i class="fab fa-github"></i> View Repository
                        </a>
                    </div>
                </div>
            `;

            repoContainer.appendChild(card);
        });
    }

    function showLoadMoreButton() {
        const btn = document.createElement("button");
        btn.textContent = "Load repos without description";
        btn.className = "btn btn-secondary my-3";
        btn.addEventListener("click", () => {
            const filtered = filterRepos(reposWithoutDesc, filterInput.value);
            appendRepos(filtered);
            btn.remove();
        });

        repoContainer.parentElement.insertBefore(btn, repoContainer.nextSibling);
    }

    function appendRepos(repos) {
        repos.forEach(repo => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";

            card.innerHTML = `
                <div class="repo-card h-100">
                    <div class="repo-header">
                        <div class="repo-name">${repo.name}</div>
                        <div class="repo-description">${repo.description || "No description available."}</div>
                    </div>
                    <div class="repo-meta">
                        <span>
                            <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                        </span>
                        <span>
                            <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div class="repo-footer">
                        <a href="${repo.html_url}" target="_blank" class="repo-link">
                            <i class="fab fa-github"></i> View Repository
                        </a>
                    </div>
                </div>
            `;

            repoContainer.appendChild(card);
        });
    }

    filterInput.addEventListener("input", () => {
        const filtered = filterRepos(reposWithDesc, filterInput.value);
        renderRepos(filtered);
    });

    sortSelect.addEventListener("change", () => {
        const filtered = filterRepos(reposWithDesc, filterInput.value);
        renderRepos(filtered);
    });

    fetchRepos();
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();
});
