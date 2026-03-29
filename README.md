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

## Configuration MySQL (externe)

Ce projet est configure pour utiliser une base **MySQL externe** via Prisma.

### Variables requises

- `DATABASE_URL` : URL MySQL Prisma (format: `mysql://USER:PASSWORD@HOST:PORT/DB_NAME`)
- `ADMIN_EMAIL` : email admin initial pour le seed (optionnel)
- `ADMIN_PASSWORD` : mot de passe admin initial pour le seed (optionnel)

### Commandes de mise en place

```bash
pnpm prisma generate
pnpm db:migrate:deploy
pnpm db:seed:run
```

### Exemple `.env`

```env
DATABASE_URL="mysql://root:secret@127.0.0.1:3306/umja_space"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeMe123!"
```


### Diagnostic si Vercel deploie un ancien commit

Si le SHA affiche dans les logs Vercel ne correspond pas au dernier commit GitHub:

1. Verifie la branche source du projet Vercel (ex: `main`).
2. Lance un **Redeploy** depuis le dernier commit.
3. Si besoin, utilise **Redeploy with cache cleared**.
4. Confirme dans les logs que le SHA source est bien le dernier commit attendu.

