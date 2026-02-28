# Use the official Node.js LTS image with security updates
FROM node:24-bookworm

# Install system packages (runs as root)
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    zsh \
    git-flow \
    build-essential \
    openssh-client \
    keychain \
    && rm -rf /var/lib/apt/lists/*

# Install eza (modern ls replacement)
RUN curl -fsSL https://raw.githubusercontent.com/eza-community/eza/main/deb.asc | gpg --dearmor -o /etc/apt/keyrings/eza.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/eza.gpg] http://deb.gierens.de stable main" > /etc/apt/sources.list.d/eza.list && \
    apt-get update && apt-get install -y eza && \
    rm -rf /var/lib/apt/lists/*

# Install starship prompt
RUN curl -fsSL https://starship.rs/install.sh | sh -s -- -y

# Install zoxide
RUN curl -fsSL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | bash && \
    mv /root/.local/bin/zoxide /usr/local/bin/zoxide

# Ensure node user has zsh as default shell
RUN chsh -s /bin/zsh node

# Set the working directory
WORKDIR /workspace

# Change ownership of the workspace to the node user
RUN chown -R node:node /workspace

# Switch to non-root user
USER node

# Set environment variables for shell
ENV SHELL=/bin/zsh

# Install antidote (zsh plugin manager)
RUN git clone --depth=1 https://github.com/mattmc3/antidote.git /home/node/.antidote

# Create SSH directory for the node user
RUN mkdir -p /home/node/.ssh && \
    chmod 700 /home/node/.ssh

# Copy setup script
COPY --chown=node:node .devcontainer/setup_zsh.sh /tmp/setup_zsh.sh
RUN chmod +x /tmp/setup_zsh.sh

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
