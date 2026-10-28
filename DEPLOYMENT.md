# Kubernetes deployment

The manual GitHub Actions workflow at `.github/workflows/2.1.-build-and-deploy-pr.yaml` builds an architecture-specific nginx image, pushes it to Docker Hub, deploys it to the PR Kubernetes server, waits for the rolling update, and verifies the live site.

The container is static and PHP-less. It copies `public/` into nginx and returns `404` for PHP-like paths instead of installing or executing PHP.

## Deployment version and verification

The deployment version is `${GITHUB_RUN_ID}.${GITHUB_RUN_ATTEMPT}`. The image build writes it to:

- the `deployment-version` comment in `/index.html`;
- `/version.txt`, served with no-cache headers;
- the unique Docker image tag.

After Kubernetes reports a successful rollout, `scripts/smoke-test.sh` connects directly to the PR server while using `regresion.incodemode.com` for TLS and ingress routing. It verifies the exact version, the index page, and that `/index.php` returns `404`.

The Deployment uses `/` for startup, readiness, and liveness probes. Its rolling-update strategy has `maxUnavailable: 0`, and a replacement pod must remain ready for 10 seconds before Kubernetes considers it available.

## GitHub configuration

Required Actions secrets:

- `DOCKERHUB_USER`
- `DOCKERHUB_PASS`
- `DEPLOY_PK`

Required Actions variable:

- `KNOWN_HOSTS`

These names match the `v3soluciones` deployment. The PR Kubernetes server is read from `.github/config.json`.
