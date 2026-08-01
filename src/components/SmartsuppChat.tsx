"use client";

import Script from "next/script";

/**
 * Chat en direct Smartsupp, affiché en bas à droite (position par défaut du
 * widget). Le composant ne rend rien tant que la clé n'est pas fournie via
 * NEXT_PUBLIC_SMARTSUPP_KEY : pas de widget cassé en développement, activation
 * par simple variable d'environnement en production.
 *
 * La clé se trouve dans le tableau de bord Smartsupp, rubrique « Paramètres →
 * Chat box → Code d'installation » (identifiant après `_smartsupp.key`).
 */
export function SmartsuppChat() {
  const key = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;
  if (!key) return null;

  return (
    <Script id="smartsupp" strategy="afterInteractive">
      {`
        var _smartsupp = _smartsupp || {};
        _smartsupp.key = '${key}';
        window.smartsupp||(function(d) {
          var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
          s=d.getElementsByTagName('script')[0];c=d.createElement('script');
          c.type='text/javascript';c.charset='utf-8';c.async=true;
          c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
        })(document);
      `}
    </Script>
  );
}
