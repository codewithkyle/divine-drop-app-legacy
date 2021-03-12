# Blazor Lumen Boilerplate

An installable PWA boilerplate built using Blazor, Lumen, Redis, Cloudflare, and Amazon S3.

## Requirements

- PHP >= 7.3
- OpenSSL PHP Extension
- PDO PHP Extension
- Mbstring PHP Extension
- Redis
- AWS S3 bucket
- .NET 5

## Install

1. Download the latest [release](https://github.com/codewithkyle/blazor-lumen-boilerplate/releases).
1. Navigate your terminal to the projects root directory.

## Setup

1. Run the setup command `npm run setup`
1. Point your web server to the `Client/public/` directory.
1. Update the `API_URL` value in the `Client/Scripts/config.ts` file.
1. Update the `Server/.env` files.

## Commands

```bash
# Compile for dev
npm run build

# Compile for production
npm run production

# View docs
npm run docs

# Run unit tests
npm run test
```
