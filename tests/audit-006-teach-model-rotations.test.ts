import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateGearSvg, generateFlangeSvg } from '../src/utils/partSVGs';
import { createInitialGoldenSamples } from '../src/components/TeachModelPage';

describe('AUDIT-006: Fix Misleading 8-Rotation Defect-Training Demonstration', () => {
  const rotationAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  test('1. generateGearSvg produces 8 genuinely distinct rotated SVGs', () => {
    const svgs = rotationAngles.map((deg) => generateGearSvg('NORMAL', deg));
    const uniqueSvgs = new Set(svgs);

    assert.equal(
      uniqueSvgs.size,
      8,
      'Every rotation angle must generate a distinct SVG string'
    );

    // Verify SVG group rotation transforms
    rotationAngles.forEach((deg, idx) => {
      const svg = svgs[idx];
      assert.ok(
        svg.includes(`<g transform="rotate(${deg} 200 200)">`),
        `Expected rotation transform for ${deg}° not found in SVG`
      );
      if (deg > 0) {
        assert.ok(
          svg.includes(`[ROT: ${deg}°]`),
          `Expected HUD text indicator for ${deg}° not found in SVG`
        );
      }
    });
  });

  test('2. generateFlangeSvg produces 8 genuinely distinct rotated SVGs', () => {
    const svgs = rotationAngles.map((deg) => generateFlangeSvg('NORMAL', deg));
    const uniqueSvgs = new Set(svgs);

    assert.equal(
      uniqueSvgs.size,
      8,
      'Every rotation angle for flange must generate a distinct SVG string'
    );

    rotationAngles.forEach((deg, idx) => {
      const svg = svgs[idx];
      assert.ok(
        svg.includes(`<g transform="rotate(${deg} 200 200)">`),
        `Expected flange rotation transform for ${deg}° not found in SVG`
      );
    });
  });

  test('3. createInitialGoldenSamples provides 8 unique reference items with distinct angles and data URIs', () => {
    const samples = createInitialGoldenSamples(false);

    assert.equal(samples.length, 8, 'Must return exactly 8 initial golden reference samples');

    const angles = samples.map((s) => s.rotationDeg);
    assert.deepEqual(
      angles,
      rotationAngles,
      'Samples must correspond to 0, 45, 90, 135, 180, 225, 270, 315 degrees'
    );

    const uris = new Set(samples.map((s) => s.uri));
    assert.equal(
      uris.size,
      8,
      'All 8 golden reference preview URIs must be distinct (not identical copies)'
    );

    // Also verify flange mode
    const flangeSamples = createInitialGoldenSamples(true);
    assert.equal(flangeSamples.length, 8);
    const flangeUris = new Set(flangeSamples.map((s) => s.uri));
    assert.equal(flangeUris.size, 8);
  });

  test('4. Backward compatibility: calling SVG generators with default parameters works', () => {
    const defaultGear = generateGearSvg();
    assert.ok(defaultGear.includes('<g transform="rotate(0 200 200)">'));
    assert.ok(defaultGear.includes('STATUS: NORMAL'));

    const defaultFlange = generateFlangeSvg();
    assert.ok(defaultFlange.includes('<g transform="rotate(0 200 200)">'));
  });

  test('5. TeachModelPage source code honestly labels feature as visual reference and disclaims training loop', () => {
    const teachModelPath = path.resolve(process.cwd(), 'src/components/TeachModelPage.tsx');
    const source = fs.readFileSync(teachModelPath, 'utf8');

    // Must not claim zero-shot edge envelope established
    assert.ok(
      !source.includes('Zero-shot edge envelope established'),
      'Must remove unsupported "Zero-shot edge envelope established" claim'
    );

    // Must not claim "100% COVERAGE" normality baseline
    assert.ok(
      !source.includes('NORMAL BASELINE\n                <div className="text-[#00ff66] font-bold">100% COVERAGE</div>') &&
      !source.includes('100% COVERAGE'),
      'Must remove false "100% COVERAGE" normality baseline claim'
    );

    // Must not claim covariance matrix is real
    assert.ok(
      !source.includes('[FEATURE COVARIANCE DENSITY MATRIX]'),
      'Must relabel covariance matrix to indicate demo/synthetic nature'
    );
    assert.ok(
      source.includes('[SYNTHETIC FEATURE DENSITY DEMO]'),
      'Must display synthetic feature density demo label'
    );

    // Must disclose that sliders are demo controls
    assert.ok(
      source.includes('TOLERANCE THRESHOLDS (DEMO CONTROLS)') || source.includes('DEMO CONTROLS'),
      'Must clearly label tolerance sliders as demo controls'
    );
    assert.ok(
      source.includes('Sliders do not alter neural weights') || source.includes('no neural network training'),
      'Must disclose that sliders do not calibrate neural network weights'
    );

    // Must disclose that uploads are for visual catalog reference only
    assert.ok(
      source.includes('do not execute a local or cloud training pipeline to update neural network weights') ||
      source.includes('Zero neural network training loop executed'),
      'Must disclose that uploads do not execute a neural network training loop'
    );
  });
});
