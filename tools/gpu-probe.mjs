// Prints the WebGL renderer each headless Chromium flag set gives on this machine.
import { chromium } from '@playwright/test';

const variants = {
  default: [],
  'angle-vulkan': ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu'],
  'angle-gl-egl': ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-gpu'],
  'angle-gl': ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist', '--enable-gpu'],
  swiftshader: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
};
const only = process.argv[2];
for (const [name, args] of Object.entries(variants)) {
  if (only && only !== name) continue;
  for (const channel of ['chromium', undefined]) {
    let browser;
    try {
      browser = await chromium.launch({ headless: true, channel, args });
      const page = await browser.newPage();
      const info = await page.evaluate(() => {
        const c = document.createElement('canvas');
        const gl = c.getContext('webgl2');
        if (!gl) return { ok: false };
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        return {
          ok: true,
          renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
          maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        };
      });
      console.log(name, channel ?? 'headless-shell', JSON.stringify(info));
    } catch (e) {
      console.log(name, channel ?? 'headless-shell', 'ERR', String(e).split('\n')[0].slice(0, 160));
    } finally {
      await browser?.close();
    }
  }
}
