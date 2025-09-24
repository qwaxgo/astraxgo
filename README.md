# Astro Starter Kit: Blog

```sh
npm create astro@latest -- --template blog
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support
- ✅ DevContainer support with SSH forwarding
- ✅ Docker Compose test environment
- ✅ VSCode workspace optimization

## 🔧 Development Environment

### DevContainer Setup

This project is configured with VSCode DevContainer support for a consistent development experience.

#### Prerequisites

- Docker Desktop
- VSCode with Remote-Containers extension
- SSH keys configured for GitHub (if using SSH git operations)

#### Getting Started with DevContainer

1. **Clone the repository:**

   ```sh
   git clone git@github.com:yourusername/qwaxgodotcom.git
   cd qwaxgodotcom
   ```

2. **Open in DevContainer:**

   - Open VSCode
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Dev Containers: Reopen in Container"
   - Wait for container to build and start

3. **SSH Setup (for Git operations):**
   The DevContainer automatically mounts your SSH keys from `~/.ssh/` and forwards SSH agent.
   Your host `.zshrc` configuration is also mounted for a consistent shell experience.
   Test SSH connection: `ssh -T git@github.com`

#### DevContainer Features

- **Node.js 24** with latest npm, pnpm, and yarn
- **Pre-installed tools:** git, zsh, oh-my-zsh, vim, nano
- **Host integration:** Uses your host VSCode settings and extensions
- **Shell integration:** Your host `.zshrc` configuration is mounted
- **SSH forwarding:** Access to your host SSH keys and agent
- **Port forwarding:** Automatic forwarding of ports 4321 (dev server) and 3000 (preview)

### Docker Compose Environment

#### Development Environment

```sh
# Start development server
docker-compose up astro-dev

# Start all services (dev + lighthouse)
docker-compose up

# Stop all services
docker-compose down
```

#### Test Environment

```sh
# Run all tests
docker-compose -f docker-compose.test.yml up --build

# Run specific test service
docker-compose -f docker-compose.test.yml up test-runner
```

#### Available Services

- **astro-dev**: Development server (port 4321)
- **astro-preview**: Production build preview (port 4322)
- **lighthouse**: Performance testing (port 9001)
- **test-runner**: Unit and integration tests
- **e2e-tests**: End-to-end testing with Playwright

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

### VSCode Tasks

Available tasks in Command Palette (`Ctrl+Shift+P` → "Tasks: Run Task"):

- **Astro: Dev Server** - Start development server
- **Astro: Build** - Build production site
- **Astro: Preview** - Preview built site
- **Test SSH Connection** - Test GitHub SSH connectivity
- **Docker: Build DevContainer** - Build the DevContainer image
- **Docker Compose: Up Dev** - Start development environment
- **Docker Compose: Up Test** - Run test suite
- **Docker Compose: Down** - Stop all containers

## 🛠️ Configuration Files

### DevContainer Configuration

- `.devcontainer/devcontainer.json` - DevContainer settings and extensions
- `.devcontainer/Dockerfile` - Container image definition
- `docker-compose.yml` - Development services
- `docker-compose.test.yml` - Test environment

### VSCode Configuration

- `.vscode/tasks.json` - Custom tasks (build, test, docker commands)
- `.vscode/launch.json` - Debug configurations
- **Note:** VSCode settings and extensions use your host configuration for consistency

## 🔍 Troubleshooting

### SSH Issues

If SSH connections to GitHub fail:

1. Ensure SSH keys are properly configured: `ssh-add -l`
2. Test connection: `ssh -T git@github.com`
3. Restart DevContainer if SSH agent forwarding fails

### Port Conflicts

If ports 4321 or 3000 are already in use:

1. Stop conflicting services: `docker-compose down`
2. Check for running processes: `lsof -i :4321`
3. Use different ports in `astro.config.mjs` if needed

### Container Build Issues

If DevContainer fails to build:

1. Clear Docker cache: `docker system prune -a`
2. Rebuild without cache: Use "Dev Containers: Rebuild Container" in VSCode
3. Check Docker Desktop is running and updated

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
