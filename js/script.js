document.getElementById('menu-button').addEventListener('click', function () {
    const menuList = document.getElementById('menu-list');
    if (menuList.style.display === 'block') {
        menuList.style.display = 'none';
    } else {
        menuList.style.display = 'block';
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const repoContainer = document.getElementById("github-repos");

    fetch("https://api.github.com/users/SilentCaMXMF/repos")
        .then(response => response.json())
        .then(repos => {
            // Clear existing static repos (optional)
            repoContainer.innerHTML = "";

            repos.forEach(repo => {
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
