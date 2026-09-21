# Deploy the website

## Static build

```sh
npm install
npm run check
npm run build
npm test
```

Publish the contents of `dist/` on a static host supporting JavaScript modules and workers. All app URLs are relative, so subdirectory hosting is supported.

## GitHub Pages

A manually triggered Pages workflow is included; it does not change repository settings automatically.

1. In the repository, open **Settings → Pages**.
2. Under Build and deployment, select **GitHub Actions** as the source.
3. Open **Actions → Deploy Pages → Run workflow**, selecting main.
4. Wait for successful completion and use the URL shown in the deployment result.

The workflow builds, checks and tests before publishing. Do not assume the site is live until the deployment succeeds. Pull requests run CI and do not receive deployment credentials.

## Existing hosted demo

The original Sites deployment is separate and owner-private. Pushing this repository does not update its source or audience automatically. No Sites identity, credentials or automatic synchronization are included in this public repository.
