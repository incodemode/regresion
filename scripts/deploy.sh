#!/usr/bin/env bash
set -euo pipefail

version=''
arch='amd64'

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version) version="$2"; shift 2 ;;
    --arch) arch="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

: "${version:?--version is required}"
: "${arch:?--arch is required}"

deployment_manifest="$(mktemp)"
trap 'rm -f "$deployment_manifest"' EXIT

sed \
  -e "s|IMAGE_PLACEHOLDER|lmdbluis/incodemode:regresion.${arch}.${version}|g" \
  kubernetes/regresion-deployment.yaml > "$deployment_manifest"

kubectl apply -f "$deployment_manifest"
kubectl apply -f kubernetes/regresion-service.yaml
kubectl apply -f kubernetes/regresion-traefik.pr.yaml
