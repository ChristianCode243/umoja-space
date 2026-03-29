This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Configuration PostgreSQL (Vercel)

Ce projet est configure pour utiliser PostgreSQL Vercel avec Prisma.

### Variables requises

- `umoja_PRISMA_DATABASE_URL` : URL Prisma/pooling (utilisee pour le runtime Prisma)
- `umoja_DATABASE_URL` : URL directe non-poolée (utilisee pour les migrations Prisma)
- `ADMIN_EMAIL` : email admin initial pour le seed (optionnel)
- `ADMIN_PASSWORD` : mot de passe admin initial pour le seed (optionnel)

### Commandes de mise en place (production)

1. Generer le client Prisma:

```bash
pnpm prisma generate
```

2. Appliquer les migrations en production:

```bash
pnpm db:migrate:deploy
```

3. Executer le seed:

```bash
pnpm db:seed:run
```

### Si rien ne passe cote DB

- Verifie que `umoja_PRISMA_DATABASE_URL` et `umoja_DATABASE_URL` existent bien dans **le meme environnement Vercel** (Production/Preview/Development) que ton deployment.
- Verifie que `umoja_DATABASE_URL` est une URL **directe** (non poolée) compatible migration.
- Redeploie apres ajout/modification des variables d'environnement.
- Lance d'abord `pnpm prisma generate`, puis `pnpm db:migrate:deploy`, puis `pnpm db:seed:run`.
