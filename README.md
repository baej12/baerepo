# Brandon Bae - Portfolio Website

A modern, responsive portfolio website showcasing my professional experience, projects, and technical skills as a Software Engineer.

## 🚀 Features

- **Professional Experience Timeline** - Detailed work history at Huntington Ingalls Industries, Raytheon, Credit One Bank, and more
- **Dynamic Project Showcase** - Automatically fetches and displays GitHub repositories
- **Smooth Navigation** - Anchor-based scrolling between sections
- **Responsive Design** - Optimized for desktop and mobile viewing
- **Accessibility** - Built with semantic HTML and ARIA labels
- **SEO Optimized** - Comprehensive meta tags and Open Graph support

## 🛠️ Built With

- **React** 19 - Modern UI framework
- **TypeScript** 5 - Type-safe development
- **React Router** 7 - Client-side routing
- **Axios** 1.x - HTTP requests for GitHub API
- **Vite** 7 - Fast dev/build tooling
- **CSS3** - Custom styling with smooth animations

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/baej12/baerepo.git

# Navigate to project directory
cd baerepo

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
VITE_GITHUB_USERNAME=your_github_username
```

## 📜 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Runs tests with Vitest

### `npm run build`
Builds the app for production to the `build` folder

## 🌐 Deployment

The production build is optimized and ready for deployment to any static hosting service.

## 🐳 Container Delivery

GitHub Actions now includes a `containerize` stage in `.github/workflows/build.yml` that builds this app into a Docker image and publishes it to GitHub Container Registry.

- Image name: `ghcr.io/baej12/baerepo`
- Pushed on branch builds (not pull requests)
- Includes `latest` tag on the default branch

Run the published image locally:

```bash
docker pull ghcr.io/baej12/baerepo:latest
docker run --rm -p 8080:80 ghcr.io/baej12/baerepo:latest
```

Then open [http://localhost:8080](http://localhost:8080).

## 🔒 CI Security Scans

The CI workflow also runs security checks before container publishing:

- `npm audit --audit-level=high` for dependency vulnerabilities
- CodeQL static analysis for JavaScript/TypeScript
- Trivy image scan for OS/library vulnerabilities in the built container
- Weekly scheduled scan every Monday at 07:00 UTC

Note: scheduled runs execute security checks, but skip image publishing.

## 👤 Author

**Jung Hwan (Brandon) Bae**
- GitHub: [@baej12](https://github.com/baej12)
- LinkedIn: [Jung Hwan Bae](https://www.linkedin.com/in/jhbbae/)

## 📄 License

This project is open source and available for personal and educational use.
