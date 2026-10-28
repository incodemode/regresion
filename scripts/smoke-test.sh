#!/usr/bin/env bash
set -euo pipefail
PS4='+ ${BASH_SOURCE##*/}:${LINENO}: '
set -x

base_url="${1:?base URL is required}"
server_ip="${2:?server IP is required}"
expected_version="${3:?expected version is required}"
host="${base_url#*://}"
host="${host%%/*}"

curl_args=(
  --silent
  --show-error
  --fail-with-body
  --retry 18
  --retry-all-errors
  --retry-delay 5
  --connect-timeout 10
  --max-time 20
  --resolve "${host}:443:${server_ip}"
)

actual_version="$(curl "${curl_args[@]}" \
  -H 'Cache-Control: no-cache' \
  "${base_url}/version.txt")"

if [[ "$actual_version" != "$expected_version" ]]; then
  echo "Version mismatch: expected '$expected_version', received '$actual_version'" >&2
  exit 1
fi

index_html="$(curl "${curl_args[@]}" -H 'Cache-Control: no-cache' "${base_url}/")"
grep -Fq "deployment-version: ${expected_version}" <<< "$index_html"
grep -Fq '<title> Funciones de Regresión por Medio de Algoritmos Genéticos</title>' <<< "$index_html"

php_status="$(curl "${curl_args[@]}" --output /dev/null --write-out '%{http_code}' "${base_url}/index.php" || true)"
[[ "$php_status" == "404" ]] || {
  echo "PHP-like path returned HTTP $php_status, expected 404" >&2
  exit 1
}

echo "Deployment $expected_version passed version, index, and PHP-block checks."
