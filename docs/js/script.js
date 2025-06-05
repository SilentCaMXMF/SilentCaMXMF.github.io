document.getElementById('menu-button').addEventListener('click', function (e) {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.classList.toggle('visible');
    e.stopPropagation(); // Prevent click from bubbling to document
});

// Hide dropdown when clicking outside
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

document.addEventListener("DOMContentLoaded", () => {
    const repoContainer = document.getElementById("github-repos");

    fetch("https://api.github.com/users/SilentCaMXMF/repos")
        .then(response => response.json())
        .then(repos => {
            // Show only the first 3 repos on page load
            repoContainer.innerHTML = "";

            repos.slice(0, 3).forEach(repo => {
                const repoElement = document.createElement("div");
                repoElement.classList.add("repo");

                repoElement.innerHTML = `
                    <a href="${repo.html_url}" target="_blank">
                        <h3>${repo.name}</h3>
                        <p>${repo.description || "No description available."}</p>
                    </a>
                `;

                repoContainer.appendChild(repoElement);
            });
        })
        .catch(error => {
            console.error("Error fetching GitHub repos:", error);
            repoContainer.innerHTML = "<p>Failed to load repositories.</p>";
        });
});
document.addEventListener("DOMContentLoaded", () => {
    const repoContainer = document.getElementById("github-repos");
    const filterInput = document.getElementById("repo-filter");
    const sortSelect = document.getElementById("repo-sort");

    let allRepos = [];

    // Fetch all public repos from GitHub
    fetch("https://api.github.com/users/SilentCaMXMF/repos")
        .then(res => res.json())
        .then(data => {
            allRepos = data;
            renderRepos(allRepos);
        })
        .catch(err => {
            console.error("Error fetching repos:", err);
            repoContainer.innerHTML = "<p>Error loading repositories.</p>";
        });

    // Filter input event
    filterInput.addEventListener("input", () => {
        const filtered = filterRepos(allRepos, filterInput.value);
        renderRepos(filtered);
    });

    // Sort select event
    sortSelect.addEventListener("change", () => {
        const filtered = filterRepos(allRepos, filterInput.value);
        renderRepos(filtered);
    });

    // Filter logic
    function filterRepos(repos, query) {
        const lower = query.toLowerCase();
        const filtered = repos.filter(repo =>
            repo.name.toLowerCase().includes(lower) ||
            (repo.description && repo.description.toLowerCase().includes(lower))
        );
        return sortRepos(filtered);
    }

    // Sort logic
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

    // Render repositories
    function renderRepos(repos) {
        repoContainer.innerHTML = "";

        repos.forEach(repo => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4";

            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="https://opengraph.githubassets.com/1/${repo.full_name}" class="card-img-top" alt="Repo Thumbnail">
                    <div class="card-body">
                        <h5 class="card-title">${repo.name}</h5>
                        <p class="card-text">${repo.description || "No description available."}</p>
                        <p class="card-text"><small class="text-muted">⭐ ${repo.stargazers_count || 0} | Updated: ${new Date(repo.updated_at).toLocaleDateString()}</small></p>
                        <a href="${repo.html_url}" target="_blank" class="btn btn-primary">View on GitHub</a>
                    </div>
                </div>
            `;

            repoContainer.appendChild(card);
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const repoContainer = document.getElementById("github-repos");
    const filterInput = document.getElementById("repo-filter");
    const sortSelect = document.getElementById("repo-sort");

    let allRepos = [];
    let reposWithDesc = [];
    let reposWithoutDesc = [];

    // Fetch all public repos from GitHub
    fetch("https://api.github.com/users/SilentCaMXMF/repos")
        .then(res => res.json())
        .then(data => {
            allRepos = data;

            // Split repos into two groups
            reposWithDesc = allRepos.filter(repo => repo.description && repo.description.trim() !== "");
            reposWithoutDesc = allRepos.filter(repo => !repo.description || repo.description.trim() === "");

            // Only show the first 3 repos with description on initial load
            renderRepos(reposWithDesc.slice(0, 3));

            // Show button to load repos without description if there are any
            if (reposWithoutDesc.length > 0) {
                showLoadMoreButton();
            }
        })
        .catch(err => {
            console.error("Error fetching repos:", err);
            repoContainer.innerHTML = "<p>Error loading repositories.</p>";
        });

    filterInput.addEventListener("input", () => {
        const filtered = filterRepos(reposWithDesc, filterInput.value);
        renderRepos(filtered);
    });

    sortSelect.addEventListener("change", () => {
        const filtered = filterRepos(reposWithDesc, filterInput.value);
        renderRepos(filtered);
    });

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

        repos.forEach(repo => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4";

            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="https://opengraph.githubassets.com/1/${repo.full_name}" class="card-img-top" alt="Repo Thumbnail" onerror="this.onerror=null;this.src='fallback-image.png';">
                    <div class="card-body">
                        <h5 class="card-title">${repo.name}</h5>
                        <p class="card-text">${repo.description || "No description available."}</p>
                        <p class="card-text"><small class="text-muted">⭐ ${repo.stargazers_count || 0} | Updated: ${new Date(repo.updated_at).toLocaleDateString()}</small></p>
                        <a href="${repo.html_url}" target="_blank" class="btn btn-primary">View on GitHub</a>
                    </div>
                </div>
            `;

            repoContainer.appendChild(card);
        });
    }

    // Add a button to load repos without description on demand
    function showLoadMoreButton() {
        const btn = document.createElement("button");
        btn.textContent = "Load repos without description";
        btn.className = "btn btn-secondary my-3";
        btn.addEventListener("click", () => {
            // Render reposWithoutDesc below the current ones
            const filtered = filterRepos(reposWithoutDesc, filterInput.value);
            renderRepos([...reposWithDesc, ...filtered]);

            // Remove the button after loading
            btn.remove();
        });

        repoContainer.parentElement.insertBefore(btn, repoContainer.nextSibling);
    }
});
