/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "c84441956425ffce4c64802319427438"
  }, {
    "url": "pwa-512x512.png",
    "revision": "57196045c223ae59d4f00ebabad123f5"
  }, {
    "url": "pwa-192x192.png",
    "revision": "d394870bd50ef27aa6ab9ea8301c286d"
  }, {
    "url": "index.html",
    "revision": "b5bb4140bfd2c63087f0ad9395a936f9"
  }, {
    "url": "favicon.ico",
    "revision": "d6be5b6353e7498fb7e311e0ffb0b01a"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "f127a5bff8ac18eb154972857ca81ccd"
  }, {
    "url": "assets/vedic_name_career_yantra_1794305504547-D0DiPtJB.jpg",
    "revision": null
  }, {
    "url": "assets/spiritual_energy_report_banner_1794229220638-C3cE8uBh.jpg",
    "revision": null
  }, {
    "url": "assets/purify.es-Dqk5qvad.js",
    "revision": null
  }, {
    "url": "assets/planetary_transits_navagraha_1794305507441-B5Ip8CoU.jpg",
    "revision": null
  }, {
    "url": "assets/mobile_lo_shu_cosmic_grid_1794305505049-ki4tdg9Q.jpg",
    "revision": null
  }, {
    "url": "assets/islamic_vedic_noor_geometry_1794305507170-C8RwdZK4.jpg",
    "revision": null
  }, {
    "url": "assets/index.es-Txquq46a.js",
    "revision": null
  }, {
    "url": "assets/index-CjYA_G0r.css",
    "revision": null
  }, {
    "url": "assets/index-CXn_L2Lf.js",
    "revision": null
  }, {
    "url": "assets/html2canvas-Dpwb0t1T.js",
    "revision": null
  }, {
    "url": "assets/healer_ddeepak_jain_portrait_opt-B-SgvQ7z.jpg",
    "revision": null
  }, {
    "url": "assets/chakra_healing_meditation_art_1794229223170-BnGMD9o6.jpg",
    "revision": null
  }, {
    "url": "assets/a4_divine_energy_watermark_1794229222633-DqaQCgjf.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/wp8754154_d55216c3.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/tathastu_logo_small_6cf3db26.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/pic_2_93a8f2dc.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_20261114_152309_Chrome_8040a906.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-14_102344_41fec674.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-14_102054_882a6c0e.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Pic_1_20bda120.png",
    "revision": null
  }, {
    "url": "assets/aistudio/HEALER_DDEEPAK_JAIN_ea310bdc.png",
    "revision": null
  }, {
    "url": "assets/aistudio/HEALER_DDEEPAK_JAIN_cdc6843a.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "f127a5bff8ac18eb154972857ca81ccd"
  }, {
    "url": "favicon.ico",
    "revision": "d6be5b6353e7498fb7e311e0ffb0b01a"
  }, {
    "url": "pwa-192x192.png",
    "revision": "d394870bd50ef27aa6ab9ea8301c286d"
  }, {
    "url": "pwa-512x512.png",
    "revision": "57196045c223ae59d4f00ebabad123f5"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "c84441956425ffce4c64802319427438"
  }, {
    "url": "assets/aistudio/pic_2_93a8f2dc.png",
    "revision": "aceb8b0e9721f11bd0f95ac48c0f70e5"
  }, {
    "url": "manifest.json",
    "revision": "e9c4d8607b4b07ce162babad8ebf3717"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
