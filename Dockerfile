# Imagem de demonstração: os três apps num nginx, na mesma origem (Shell em /, remotes em /mfe-*/),
# e /api repassado ao BFF. Na nuvem os mesmos arquivos vão para S3 + CloudFront (veja o README).

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/shell/package.json apps/shell/
COPY apps/mfe-payments/package.json apps/mfe-payments/
COPY apps/mfe-account/package.json apps/mfe-account/
COPY packages/ui/package.json packages/ui/
COPY packages/api-client/package.json packages/api-client/
RUN npm ci
COPY . .
# O navegador fala com /api deste mesmo nginx; troque no build se o portal for usar o API Gateway direto.
ARG VITE_API_BASE_URL=/api
ARG VITE_GATEWAY_API_KEY=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_GATEWAY_API_KEY=$VITE_GATEWAY_API_KEY \
    VITE_MFE_PAYMENTS_URL=/mfe-payments/remoteEntry.js \
    VITE_MFE_ACCOUNT_URL=/mfe-account/remoteEntry.js \
    SHELL_BASE=/ \
    MFE_PAYMENTS_BASE=/mfe-payments/ \
    MFE_ACCOUNT_BASE=/mfe-account/
RUN npm run build

FROM nginx:1.29-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/shell/dist /usr/share/nginx/html
COPY --from=build /app/apps/mfe-payments/dist /usr/share/nginx/html/mfe-payments
COPY --from=build /app/apps/mfe-account/dist /usr/share/nginx/html/mfe-account
# Endereço do BFF visto de dentro do contêiner.
ENV BFF_URL=http://host.docker.internal:3000 \
    GATEWAY_ORIGIN_SECRET=
EXPOSE 8080
