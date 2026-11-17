import type { RegionMeasurements } from '../../packages/voxel-actors/src';

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 });

export function formatVoxelCount(volume: number): string {
  return `${number.format(volume)} ${Number.isInteger(volume) ? (volume === 1 ? 'voxel' : 'voxels') : 'voxel equivalents'}`;
}

export function renderInspector(container: HTMLElement, region?: RegionMeasurements): void {
  if (!region) {
    container.innerHTML = '<div class="empty-icon">⌖</div><h2>Start with a part.</h2><p class="description">Click the character to see its dimensions, voxel count, position, and connected joint.</p><div class="empty-line"></div><p class="small-note">Measurements describe the unposed base body.</p>';
    return;
  }
  container.innerHTML = `
    <div class="selected-tag">SELECTED PART</div>
    <h2>${region.label}</h2>
    <p class="description">A piece of the original Studio base body.</p>
    <div class="voxel-count"><strong>${formatVoxelCount(region.voxelVolume)}</strong><span>Solid volume · overlaps counted once</span></div>
    <h3>Dimensions <span>VOXELS</span></h3>
    <div class="metrics">${['Width', 'Height', 'Depth'].map((label, i) => `<div><strong>${number.format(region.size[i])}</strong><span>${label}</span></div>`).join('')}</div>
    <h3>Position <span>CENTER · UNPOSED</span></h3>
    <div class="coordinates">${['X', 'Y', 'Z'].map((label, i) => `<div><span>${label}</span><b>${number.format(region.center[i])}</b></div>`).join('')}</div>
    <h3>Connected ${region.joints.length === 1 ? 'joint' : 'joints'}</h3>
    <div class="joint"><span>◇</span> ${region.joints.join(', ')}</div>
    <p class="small-note">Measurements include any smaller regions within this part.<br>Left and right follow the character.</p>`;
}
