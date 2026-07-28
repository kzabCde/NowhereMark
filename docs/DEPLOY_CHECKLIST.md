# Deploy Checklist

1. Confirm Node.js 20.9+ and npm 10+:
   `npm run check:versions`
2. Clean install:
   `npm ci`
3. Check dependency tree:
   `npm run check:deps`
4. Check outdated packages:
   `npm run check:outdated`
5. Production security audit:
   `npm run check:audit`
6. TypeScript check:
   `npm run typecheck`
7. Lint:
   `npm run lint`
8. Unit tests:
   `npm run test`
9. Production build:
   `npm run build`
10. Local production preview:
   `npm run start`
11. Smoke-test `/`, `/tools`, and `/editor`.
12. In the editor, verify resize preview, background removal, project restore,
    PNG/JPEG/WebP export, and Thai/English switching.
13. Deploy only after all checks pass.
