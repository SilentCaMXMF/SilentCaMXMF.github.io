# 🌐 SilentCaMXMF Portfolio

Welcome to my personal portfolio website, built using HTML, CSS, and JavaScript, and hosted on **GitHub Pages**.

This site showcases my professional profile, coding projects, experience, skills, and contact information, and serves as a central hub for my online presence.

## 📁 Live Site

🔗 [https://silentcamxmf.github.io](https://silentcamxmf.github.io)

## 📌 Features

- 🎨 Clean, responsive layout with animated gradient background
- 💼 GitHub repository showcase with dynamic search, filtering, and sorting
- 🌙 Dark mode support with theme persistence
- 🎯 Featured projects carousel with star badges
- 📱 Mobile-friendly responsive design with hamburger menu
- 🎓 Professional experience timeline section
- 📚 Education & certifications showcase
- 🛠️ Technical skills visualization with progress bars
- 🔍 Accessible design with skip-to-content links
- ⚡ Service Worker for offline caching support
- 🔙 Back to top button
- 📞 Contact section with social media links
- 🤖 Automated deployment via GitHub Actions

## 🛠️ Tech Stack

- **HTML5** - Semantic markup structure
- **CSS3** - Custom styling with CSS variables and animations
- **JavaScript (Vanilla)** - Interactive functionality
- **Bootstrap 5.3.0** - Responsive grid system and components
- **Font Awesome 6.4.0** - Icon library
- **Google Fonts** - Roboto, Open Sans, Lora typography
- **GitHub Pages** - Static site hosting
- **GitHub Actions** - CI/CD deployment pipeline
- **Service Worker** - Offline caching capabilities


# 📁 Project Structure

```
SilentCaMXMF.github.io/
├── css/
│   └── style.css              # Custom styles with CSS variables
├── js/
│   └── script.js              # Interactive JavaScript functionality
├── img/                       # Profile images and icons
├── .github/
│   └── workflows/
│       └── static.yml         # GitHub Actions deployment workflow
├── .nojekyll                  # Prevent Jekyll processing on GitHub Pages
├── index.html                 # Main HTML structure
├── sw.js                      # Service Worker for offline caching
├── README.md                  # This file
├── build-a-personal-portfolio-webpage.txt  # Documentation reference
└── google6d2c5ef30f1580c3.html # Google verification
```

---

## 🚀 Features in Detail

### Design & UX
- **Animated Gradient Background** - Dynamic 4-color gradient animation
- **Dark/Light Theme Toggle** - User preference saved to localStorage
- **Responsive Navigation** - Sticky header with mobile hamburger menu
- **Smooth Scrolling** - Enhanced navigation experience
- **Accessibility** - Skip links, ARIA labels, keyboard navigation support

### Sections
1. **About Me** - Professional summary with profile image and CTA buttons
2. **Professional Experience** - Timeline layout of career history
3. **Education & Certifications** - Formal education and freeCodeCamp certifications
4. **Technical Skills** - Grid of skill cards with progress indicators
5. **Featured Projects** - Carousel showcasing top 5 repositories
6. **All Projects** - GitHub repositories with search and sort functionality
7. **Contact** - Email, location, and social media links

### GitHub Integration
- **Dynamic Repository Loading** - Fetches up to 100 repositories from GitHub API
- **Search Functionality** - Filter repos by name or description
- **Sorting Options** - Sort by name, recent updates, or star count
- **Smart Caching** - 5-minute localStorage cache for API responses
- **Featured Carousel** - Highlights top 5 repos with descriptions

### Performance & SEO
- **Resource Preloading** - Critical resources preloaded for faster load times
- **Service Worker** - Offline caching of core assets
- **Meta Tags** - Open Graph tags for social sharing
- **Favicon Variants** - Multiple sizes for different devices

---

## ⚡ Performance Optimizations

- GitHub API responses cached for 5 minutes to reduce API calls
- Critical CSS and JavaScript preloaded
- Service Worker caching for offline access
- Optimized image loading with lazy loading
- CSS animations use transforms for GPU acceleration

---

## 🌙 Dark Mode Implementation

The portfolio includes a fully functional dark mode:
- Toggle button in header with sun/moon icon
- Theme preference persisted in localStorage
- CSS custom variables for easy theme switching
- All sections and components support both themes

---

## 🤖 Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions:

```yaml
on:
  push:
    branches: ["main"]
  workflow_dispatch:
```

The workflow builds and deploys on every push to the main branch.

---

## ✨ Future Enhancements

Here are some ideas and planned features to improve the portfolio:

- 🌐 **Multilingual Support** – Enable localization for multiple languages to reach a broader audience.
- 🧩 **Modular Components** – Refactor HTML sections into reusable components for cleaner code and easier updates.
- 📸 **Project Screenshots** – Include visual previews of selected repositories to enhance the project showcase.
- 🧪 **Unit Testing for JavaScript** – Add lightweight tests to improve code reliability.
- 📊 **Analytics** – Add visitor analytics to track engagement
- 💬 **Comments** – Allow visitors to leave comments or feedback

Have suggestions? Feel free to open an issue or submit a pull request!

---

## 🛠️ Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SilentCaMXMF/SilentCaMXMF.github.io.git
   ```
   
2. **Navigate to the Project Directory**
   ```bash
   cd SilentCaMXMF.github.io
   ```

3. **Open index.html in Your Browser**
   You can double-click the index.html file or use a live server extension in your code editor.

4. **Run Locally (Optional)**
   For a better development experience with live reload:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js with http-server
   npx http-server
   ```
   
   Then open `http://localhost:8000` in your browser.

## 📄 License

This project is open-source and available under the MIT License.

---

## 👤 Author

**Pedro Calado** - Junior Software Engineer

- [GitHub](https://github.com/SilentCaMXMF)
- [LinkedIn](https://www.linkedin.com/in/pedro-calado-33113926/)
- [freeCodeCamp](https://www.freecodecamp.org/fccf49151df-4d61-4fca-95e4-34786a2857ac)

