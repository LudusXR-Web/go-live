# GoingLive Platform

This is a platform designed to encourage sharing of skills among seasonal workers. Developed at LudusXR ApS.

## Project Structure

This repository is a `TurboRepo` monorepository for the whole project. It is structured as follows:

- `apps/web` directory contains the platform itself (a `Next.js` application to be hosted with a `Redis` cache and a `PostgreSQL` database).
- `packages/ui` directory contains reusable UI components used throughout the platform.
- Most other folders contain `TypeScript` and `ESLint` configuration files.

The platform (application) is structured as follows:

- `drizzle` directory for database migrations and history in both SQL and JSON formats.
- `public` directory for anything automatically visible to the public once the app is hosted.
- `src` directory contains the source code.

- `.env.*` files contain the structure for environment variables. It is further described with `Zod` parsing at `src/env.js`.
- `next.config.js`, `drizzle.config.js`, `postcss.config.js`, `prettier.config.js`, `tailwind.config.js`, `tsconfig.json` are configuration files for their respective packages.
- `server.js` is the entry point to the application. It shall be launched by executing this file both in development and in production.

The source code for the project (`src` directory) is structured as follows:

- `app` directory contains the routing configuration for the project and is mostly filled with `React` components (pages and layouts) and local single-use components as well as configuration for internationalisation of the application.
- `components` directory hosts reusable `React` components.
- `img` directory contains media files used in the project.
- `lib` directory contains reusable functions that are used often in the project. Functions from `utils.ts` can be used both on the server and the client side of the applications. Functions from `socket.ts` are client-side only. Functions from `server-utis.ts` are server-side only.
- `server` directory contains server-side bindings and functions for database mutations, authentication, `AWS` access and `Google API` access.
- `styles` directory contains globally used `CSS` styles.
- `trpc` directory contains configuration for the `TRPC` module and generally should not be touched.

## Project 'Culture'

- It is generally expected that all database mutations are performed through `TRPC` unless absolutely necessary.
- All media uploads must go through defined media upload routes (`src/app/api/upload`) towards `Amazon S3`.
- Configuration for internationalisation is stored in `src/app/_dictionaries`.
- The database layout is defined in `src/server/db/schema.ts`, the connection protocol is defined in the same directory in the `index.ts` file.
- `Tailwind CSS` is used throughout the project for styling purposes.
- It is generally aimed for to host as much as possible logic on the server (backend) and as little as possible on the client (frontend).
- It is generally aimed to avoid linting and styling errors unless absolutely necessary.
- The code is formatted using `Prettier`.

## Contingency Measures

LudusXR has begun the process of liquidation as of `26.05.2025.`. Any and all concerns and comments regarding this project before `30.06.2025.` should be addressed to LudusXR directly. After the passing of the aforementioned date, consultation regarding this project is available on request by email at `ari@mistclick.me` and by other mediums of communication with the people formerly involved in the development of this project.

Any questions and requests regarding the contents of this repository should be directed to `ari@mistclick.me`
