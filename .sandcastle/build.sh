#!/bin/sh
set -e
tag=$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9_.-' '-')
tag=${tag%-}
pnpm_version=$(node -p "require('./package.json').packageManager.split('@')[1]" 2> /dev/null || echo "")
if [ -z "$pnpm_version" ]; then
  echo "Error: Unable to determine pnpm version from package.json"
  exit 1
fi
exec docker build \
  --build-arg AGENT_UID="$(id -u)" \
  --build-arg AGENT_GID="$(id -g)" \
  --build-arg PNPM_VERSION="$pnpm_version" \
  -t "sandcastle:$tag" \
  .sandcastle/
