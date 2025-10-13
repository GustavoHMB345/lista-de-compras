# Gerar APK (Android) para amostra

Este projeto usa Expo (SDK 54). Para gerar um APK instalável (útil para amostras), recomendamos usar o EAS Build.

## Pré-requisitos

- Node 18+
- Conta Expo e login via CLI
- EAS CLI instalado globalmente: `npm i -g eas-cli`

## Configuração

Já adicionamos `eas.json` com um perfil `preview` (gera APK) e `production` (AAB).

Atualize os campos de app em `app.json` (nome, ícone etc.) conforme necessário.

## Gerar APK (perfil preview)

```pwsh
# Login na conta Expo (uma única vez)
eas login

# Opcional: vincular projeto ao Expo
# Isso permite builds em nuvem e armazenamento de chaves
# eas init

# Iniciar build de APK
npm run build:android:apk
```

- O build ocorre na nuvem da Expo. Ao finalizar, será exibido um link para download do APK.

## Download rápido (APK)

- Link direto do último build:
  - https://expo.dev/artifacts/eas/3bUx2JCuxgwn2qky9Gw3wh.apk
- QR code (aponte a câmera para instalar no Android):

![QR para APK](https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fexpo.dev%2Fartifacts%2Feas%2F3bUx2JCuxgwn2qky9Gw3wh.apk)

Observação: se o link expirar ou você fizer um novo build, atualize este documento com o novo link (o comando acima gera um link ao final da execução).

## Gerar AAB (para Play Store)

```pwsh
npm run build:android:aab
```

## Observações

- Jest e Husky não geram APK. Eles cuidam de testes e validação antes de commits (lint/format/test), mas o binário é produzido via EAS Build.
- Se precisar de build local nativo (Gradle), é necessário ejetar (`npx expo prebuild`) e usar `./android/gradlew assembleRelease`. Isso foge do fluxo managed.
- Para distribuição rápida, prefira o `build:android:apk`.
