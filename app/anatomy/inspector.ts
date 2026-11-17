import type { RegionMeasurements } from '../../packages/voxel-actors/src';

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 });

export function formatVoxelCount(volume: number): string {
  return `${number.format(volume)} ${Number.isInteger(volume) ? (volume === 1 ? 'voxel' : 'voxels') : 'voxel equivalents'}`;
}

export function renderInspector(container: HTMLElement, region?: RegionMeasurements): void {
  if (!region) {
    container.innerHTML = '<p class="panel-status">Select a body part to inspect it.</p>';
    return;
  }
  container.innerHTML = `
    <h2>${region.label}</h2>
    <div class="voxel-count"><strong>${formatVoxelCount(region.voxelVolume)}</strong><span>Solid volume · overlaps counted once</span></div>
    <h3>Dimensions <span>VOXELS</span></h3>
    <div class="metrics">${['Width', 'Height', 'Depth'].map((label, i) => `<div><strong>${number.format(region.size[i])}</strong><span>${label}</span></div>`).join('')}</div>
    <h3>Position <span>CENTER · UNPOSED</span></h3>
    <div class="coordinates">${['X', 'Y', 'Z'].map((label, i) => `<div><span>${label}</span><b>${number.format(region.center[i])}</b></div>`).join('')}</div>
    <h3>Connected ${region.joints.length === 1 ? 'joint' : 'joints'}</h3>
    <div class="joint"><span>◇</span> ${region.joints.join(', ')}</div>
    <p class="small-note">Measurements include any smaller regions within this part.<br>Left and right follow the character.</p>`;
}
