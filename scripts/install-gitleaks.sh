#!/usr/bin/env bash
set -e

echo "Installing GitLeaks..."

sudo -v

( while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null & )

GITLEAKS_VERSION="8.18.4"
curl -fsSL "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" -o /tmp/gitleaks.tar.gz
tar -xzf /tmp/gitleaks.tar.gz -C /tmp
sudo mv /tmp/gitleaks /usr/local/bin/gitleaks
sudo chmod +x /usr/local/bin/gitleaks
rm -f /tmp/gitleaks.tar.gz

if command -v gitleaks &> /dev/null; then
    echo "GitLeaks installed successfully: $(gitleaks version)"
else
    echo "GitLeaks installation failed."
    exit 1
fi
