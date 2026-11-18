import fs from 'fs';
import crypto from 'crypto';

const assetMap = [
  {
    original: 'Camera_lens_catching_light_flare_f2ea6220.jpg',
    target: 'camera-lens.jpg',
    expectedSha: 'DB2B0F2C91DE5419FFCECB1E3CBB47A5E4ECE74A951C2728F5505C27F9752036',
    expectedSize: 547122
  },
  {
    original: 'Cyan_light_caustics_on_prism_35e9df35.mp4',
    target: 'prism-laser.mp4',
    expectedSha: '1E44954D2781F3CFFC55AFFA223689D817896BC8B632C6EC1F347615AF255D4D',
    expectedSize: 2287940
  },
  {
    original: 'Gyroscope_gimbal_rings_on_pedestal_e07cf76e.jpg',
    target: 'gyroscope.jpg',
    expectedSha: 'F3969A824931F38A7CC80F254CAC01C841425D5937B013EE4545FC562808737C',
    expectedSize: 541373
  },
  {
    original: 'Iron_filings_aligned_by_magnet_893f2ce0.mp4',
    target: 'magnet-filings.mp4',
    expectedSha: '515974E788934682A5FEB29CF647AA83EE69603872F26FFEAEB2910D07D8746E',
    expectedSize: 3764974
  },
  {
    original: 'Notebook_with_physics_equations_2179336a.jpg',
    target: 'notebook.jpg',
    expectedSha: '48DF03C5285F0437B0EDBD89FA7CC39720969A9B1A6C7D8AC040DE9CC851BA2C',
    expectedSize: 744185
  },
  {
    original: 'Water_ripples_interfering_in_tank_e4ff79e2.mp4',
    target: 'water-ripples.mp4',
    expectedSha: 'C69A5CDE8BBF2023FBB534679428A91B310D73A93F2D1EE47269EC53C7D1710E',
    expectedSize: 6118599
  }
];

console.log('=== ASSET INTEGRITY AUDIT (SOURCE VS TARGET MAPPING) ===');
let allMatch = true;

for (const item of assetMap) {
  const rootPath = './' + item.original;
  const pubPath = './public/assets/' + item.target;
  
  const rootExists = fs.existsSync(rootPath);
  const pubExists = fs.existsSync(pubPath);
  
  const rootSize = rootExists ? fs.statSync(rootPath).size : -1;
  const pubSize = pubExists ? fs.statSync(pubPath).size : -1;
  
  const rootHash = rootExists ? crypto.createHash('sha256').update(fs.readFileSync(rootPath)).digest('hex').toUpperCase() : 'N/A';
  const pubHash = pubExists ? crypto.createHash('sha256').update(fs.readFileSync(pubPath)).digest('hex').toUpperCase() : 'N/A';
  
  const match = (rootHash === pubHash) && (pubHash === item.expectedSha) && (pubSize === item.expectedSize) && (rootSize === pubSize);
  if (!match) allMatch = false;

  console.log(`[${match ? 'PASS' : 'FAIL'}] ${item.original} -> public/assets/${item.target}`);
  console.log(`  Source Size: ${rootSize} bytes | Dest Size: ${pubSize} bytes (Expected: ${item.expectedSize})`);
  console.log(`  Source SHA: ${rootHash}`);
  console.log(`  Dest   SHA: ${pubHash}`);
  console.log(`  Expected  : ${item.expectedSha}`);
}

console.log(`\nOVERALL ASSET INTEGRITY: ${allMatch ? 'VERIFIED 100% (ALL EXACT MATCHES)' : 'INTEGRITY MISMATCH DETECTED'}`);
