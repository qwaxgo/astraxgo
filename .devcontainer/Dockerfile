# Use the official Node.js LTS image
FROM node:24-bookworm

# Install additional tools and dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    zsh \
    git-flow \
    build-essential \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -ms /bin/zsh node || true

# Set the working directory
WORKDIR /workspace

# Change ownership of the workspace to the node user
RUN chown -R node:node /workspace

# Switch to non-root user
USER node

# Create SSH directory for the node user
RUN mkdir -p /home/node/.ssh && \
    chmod 700 /home/node/.ssh

# Create a setup script for zsh configuration
RUN echo '#!/bin/bash' > /tmp/setup_zsh.sh && \
    echo 'if [ -f /home/node/.zshrc ] && grep -q "oh-my-zsh" /home/node/.zshrc; then' >> /tmp/setup_zsh.sh && \
    echo '  echo "Detected oh-my-zsh configuration in .zshrc, installing oh-my-zsh..."' >> /tmp/setup_zsh.sh && \
    echo '  sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended' >> /tmp/setup_zsh.sh && \
    echo 'else' >> /tmp/setup_zsh.sh && \
    echo '  echo "No oh-my-zsh configuration detected, creating simple zsh config..."' >> /tmp/setup_zsh.sh && \
    echo '  if [ ! -f /home/node/.zshrc ]; then' >> /tmp/setup_zsh.sh && \
    echo '    echo "# Simple zsh configuration" > /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "# Enable colors" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "autoload -U colors && colors" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "# Set prompt" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "PROMPT=\"%{\$fg[cyan]%}%n@%m %{\$fg[yellow]%}%~ %{\$reset_color%}%# \"" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "# Enable completion" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "autoload -U compinit && compinit" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "# History configuration" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "HISTFILE=~/.zsh_history" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "HISTSIZE=10000" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "SAVEHIST=10000" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "setopt SHARE_HISTORY" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "# Useful aliases" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "alias ll=\"ls -alF\"" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "alias la=\"ls -A\"" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '    echo "alias l=\"ls -CF\"" >> /home/node/.zshrc' >> /tmp/setup_zsh.sh && \
    echo '  fi' >> /tmp/setup_zsh.sh && \
    echo 'fi' >> /tmp/setup_zsh.sh && \
    chmod +x /tmp/setup_zsh.sh

# Configure git safe directory
RUN git config --global --add safe.directory /workspace

# Copy package files first for better layer caching
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy the rest of the application
COPY --chown=node:node . .

# Expose the default Astro dev server port
EXPOSE 4321

# Expose additional ports for testing and preview
EXPOSE 3000 8080

# Default command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
