---
title: "Como configurar alertas no OBS em 5 minutos"
slug: "como-configurar-alertas-obs"
date: "2026-05-10"
category: "Tutorial"
excerpt: "Passo a passo para colocar o widget da pix.tips na sua live com Browser Source e testar doações."
thumbnail: "🎬"
---

## O que você vai precisar

- Conta pix.tips com onboarding concluído
- OBS Studio (ou Streamlabs com Browser Source)
- URL do widget no painel **Alertas**

## Passo 1: copie a URL do widget

No dashboard, abra **Alertas** e copie o link do widget. Ele já inclui seu token único — não compartilhe publicamente.

## Passo 2: adicione no OBS

1. Em **Fontes**, clique em **+** → **Navegador** (Browser Source).
2. Cole a URL do widget.
3. Defina largura **1920** e altura **1080** (tela cheia transparente).
4. Marque **Desativar quando a fonte não estiver visível** se quiser economizar CPU.

## Passo 3: teste antes da live

Use o botão **Testar alerta** no painel. Você deve ver animação, som e texto personalizado na cena.

## Dicas extras

- Coloque a fonte do widget **acima** da gameplay, mas **abaixo** da webcam se preferir.
- Ajuste duração e template em **Alertas** sem reiniciar o OBS — basta atualizar a página do browser (F5 na preview).

Pronto! Na próxima doação confirmada, o alerta dispara automaticamente via WebSocket.
