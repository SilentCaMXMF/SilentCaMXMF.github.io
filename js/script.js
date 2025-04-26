document.getElementById('menu-button').addEventListener('click', function () {
    const menuList = document.getElementById('menu-list');
    if (menuList.style.display === 'block') {
        menuList.style.display = 'none';
    } else {
        menuList.style.display = 'block';
    }
});