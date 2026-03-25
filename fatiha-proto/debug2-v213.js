const puppeteer = require('/home/openclaw-agent/.openclaw/workspace/node_modules/puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu-sandbox',
      '--use-gl=angle',
      '--use-angle=gl-egl',
      '--ozone-platform=headless',
      '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage',
      '--in-process-gpu',
      '--enable-webgl',
    ],
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib',
    }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 600 });

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));

  // Inline test page to debug brush.fill rendering
  const testHTML = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/p5@2.0.3/lib/p5.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/p5.brush@2.1.3-beta"></script>
</head>
<body>
<script>
function setup() {
  let cnv = createCanvas(400, 400, WEBGL);
  pixelDensity(1);
  
  console.log('CLOSE value:', typeof CLOSE, CLOSE);
  console.log('brush.fill type:', typeof brush.fill);
  console.log('brush.fillBleed type:', typeof brush.fillBleed);
  
  // Test if fill works
  background(200, 210, 190);
  translate(-width/2, -height/2);
  
  brush.fill('#002185', 70);
  brush.fillBleed(0.2);
  brush.beginShape(0);
  brush.vertex(50, 50);
  brush.vertex(200, 30);
  brush.vertex(300, 100);
  brush.vertex(250, 250);
  brush.vertex(80, 200);
  brush.endShape(CLOSE);
  
  console.log('draw complete');
  noLoop();
}
function draw() {}
</script>
</body>
</html>`;

  await page.setContent(testHTML);
  await new Promise(r => setTimeout(r, 6000));

  console.log('Logs:', logs.join('\n'));

  await page.screenshot({ path: '/home/openclaw-agent/.openclaw/workspace/fatiha-proto/renders/debug-v213.png' });
  console.log('Debug screenshot saved');

  await browser.close();
})();
