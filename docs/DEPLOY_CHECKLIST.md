# Deploy Checklist

1. Clean install:
   `npm ci`
2. Check versions:
   `npm run check:versions`
3. Check dependency tree:
   `npm run check:deps`
4. Check outdated packages:
   `npm run check:outdated`
5. Security audit:
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
11. Deploy only after all checks pass.
