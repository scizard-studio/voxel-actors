import {
  clips,
  everydayOutfits,
  hairStyles,
  hatStyles,
  outfits,
  type Age,
  type ClipName,
  type ExpressionName,
  type Gender,
  type HairStyleName,
  type HatStyleName,
  type OutfitName,
} from '../../packages/voxel-actors/src';
import { clothColors, hairColors, skinTones } from './palette';
import { equipmentItems, type Equipment, type EquipmentHand, type EquipmentName, type UseResult } from '../../packages/voxel-actors/src';

/** Everything picked in the studio. */
export interface StudioState {
  age: Age;
  gender: Gender;
  /** Place in the list of skin tones. */
  tone: number;
  /** The hairstyle, or none. */
  hair: HairStyleName | null;
  /** Place in the list of hair colors. */
  hairColor: number;
  /** The outfit, or none. */
  outfit: OutfitName | null;
  /** Place in the list of cloth colors, or none for the outfit's own. Work outfits always keep their own. */
  clothColor: number | null;
  /** The hat, or none: then the outfit's own hat is worn, if it has one. */
  hat: HatStyleName | null;
  expression: ExpressionName;
  clip: ClipName;
  prop: StudioProp;
  equipment: Equipment;
  detail: 'auto' | 'high' | 'low';
  guide: boolean;
  /** Whether the attachment points, the body's sockets, are marked. */
  sockets: boolean;
}

export interface Panel {
  /** Shows a line about the figure, such as its height. */
  setReadout(text: string): void;
}

interface Choice<T> {
  readonly value: T;
  readonly name: string;
}

/** A name from the code as a label: "pixieCut" becomes "Pixie cut". */
function label(name: string): string {
  const words = name.replace(/([A-Z])/g, ' $1').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** A titled block of the panel. Returns the row its buttons go in. */
function section(parent: HTMLElement, title: string): HTMLElement {
  const block = document.createElement('section');
  block.className = 'studio__section';
  const heading = document.createElement('h2');
  heading.className = 'studio__heading';
  heading.textContent = title;
  const row = document.createElement('div');
  row.className = 'studio__row';
  block.append(heading, row);
  parent.append(block);
  return row;
}

/** A row of buttons, one of them pressed. Pressing another calls `onPick`. */
function segmented<T>(parent: HTMLElement, title: string, choices: readonly Choice<T>[], start: T, onPick: (value: T) => void): HTMLButtonElement[] {
  const row = section(parent, title);
  const buttons = choices.map((choice) => {
    const button = document.createElement('button');
    button.className = 'control';
    button.textContent = choice.name;
    button.setAttribute('aria-pressed', String(choice.value === start));
    button.addEventListener('click', () => {
      for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
      onPick(choice.value);
    });
    row.append(button);
    return button;
  });
  return buttons;
}

/**
 * The studio's controls. Every change goes into `state`, then `onChange` is
 * called. `onView` is called to put the camera in front or at three-quarters.
 */
export function createPanel(
  container: HTMLElement,
  state: StudioState,
  onChange: () => void,
  onView: (view: 'front' | 'threeQuarter') => void,
  onUse: (hand: EquipmentHand) => UseResult,
): Panel {
  const panel = document.createElement('aside');
  panel.className = 'workspace-panel studio__panel';
  container.append(panel);

  const title = document.createElement('h1');
  title.className = 'studio__title';
  title.textContent = 'Character Studio';
  const readout = document.createElement('p');
  readout.className = 'studio__readout';
  panel.append(title, readout);

  const set =
    <K extends keyof StudioState>(key: K) =>
    (value: StudioState[K]): void => {
      state[key] = value;
      onChange();
      updateActions();
    };

  segmented(
    panel,
    'Age',
    [
      { value: 'child', name: 'Child' },
      { value: 'teen', name: 'Teen' },
      { value: 'adult', name: 'Adult' },
      { value: 'elder', name: 'Elder' },
      { value: 'aged', name: 'Aged' },
    ],
    state.age,
    set('age'),
  );
  segmented(
    panel,
    'Gender',
    [
      { value: 'female', name: 'Female' },
      { value: 'male', name: 'Male' },
    ],
    state.gender,
    set('gender'),
  );
  segmented(
    panel,
    'Skin',
    skinTones.map((tone, index) => ({ value: index, name: tone.name })),
    state.tone,
    set('tone'),
  );
  // Every hairstyle in the library is offered, so a new style shows here without changing the studio.
  segmented<HairStyleName | null>(
    panel,
    'Hair',
    [
      ...(Object.keys(hairStyles) as HairStyleName[]).map((style) => ({ value: style, name: label(style) })),
      { value: null, name: 'None' },
    ],
    state.hair,
    set('hair'),
  );
  segmented(
    panel,
    'Hair color',
    hairColors.map((color, index) => ({ value: index, name: color.name })),
    state.hairColor,
    set('hairColor'),
  );
  segmented<OutfitName | null>(
    panel,
    'Outfit',
    [{ value: null, name: 'None' }, ...(Object.keys(outfits) as OutfitName[]).map((outfit) => ({ value: outfit, name: label(outfit) }))],
    state.outfit,
    set('outfit'),
  );
  const clothColorButtons = segmented<number | null>(
    panel,
    'Cloth color',
    [{ value: null, name: 'Own' }, ...clothColors.map((color, index) => ({ value: index, name: color.name }))],
    state.clothColor,
    set('clothColor'),
  );
  segmented<HatStyleName | null>(
    panel,
    'Hat',
    [{ value: null, name: 'None' }, ...(Object.keys(hatStyles) as HatStyleName[]).map((hat) => ({ value: hat, name: label(hat) }))],
    state.hat,
    set('hat'),
  );
  segmented(
    panel,
    'Expression',
    [
      { value: 'normal', name: 'Normal' },
      { value: 'happy', name: 'Happy' },
      { value: 'smiling', name: 'Smiling' },
      { value: 'sad', name: 'Sad' },
    ],
    state.expression,
    set('expression'),
  );
  const propChoices = (Object.keys(studioProps) as StudioProp[])
    .map(value => ({ value, name: studioProps[value].label }));
  const propClips = new Set(propChoices.map(choice => propMotion(choice.value)));
  const motionChoices = (Object.keys(clips) as ClipName[])
    .filter(clip => !propClips.has(clip))
    .map(clip => ({ value: clip, name: label(clip) }));
  const motionButtons = segmented(
    panel,
    'Movement and activities',
    motionChoices,
    state.clip,
    set('clip'),
  );
  const propButtons = segmented(panel, 'Props', propChoices, state.prop, set('prop'));
  const propStatus = document.createElement('p');
  propStatus.setAttribute('role', 'status');
  propStatus.className = 'studio__readout';
  propButtons[0].closest('section')!.append(propStatus);
  const handButtons: HTMLButtonElement[] = [];
  for (const [hand, title] of [['handLeft', 'Left hand'], ['handRight', 'Right hand']] as const) {
    const items = (Object.keys(equipmentItems) as EquipmentName[])
      .filter(name => equipmentItems[name].hands.includes(hand));
    handButtons.push(...segmented<EquipmentName | null>(panel, title, [
      { value: null, name: 'Empty' },
      ...items.map(value => ({ value, name: equipmentItems[value].label })),
    ], state.equipment[hand], value => {
      state.equipment[hand] = value;
      onChange();
      updateActions();
    }));
  }
  const actions = section(panel, 'Equipment actions');
  const actionStatus = document.createElement('p');
  actionStatus.setAttribute('role', 'status');
  actionStatus.className = 'studio__readout';
  actions.parentElement!.append(actionStatus);
  function updateActions(): void {
    const canRecolor = state.outfit !== null && state.outfit in everydayOutfits;
    for (const button of clothColorButtons) button.disabled = !canRecolor;
    const holdingCrate = state.prop === 'crate';
    const activity = propMotion(state.prop);
    const handsReserved = holdingCrate || activity !== undefined;
    const supportsCrate = (clip: ClipName): boolean => clip === 'idle' || clip === 'walk';
    const crateButton = propButtons[propChoices.findIndex(choice => choice.value === 'crate')];
    crateButton.disabled = !supportsCrate(state.clip);
    propStatus.textContent = holdingCrate ? 'Both hands occupied.'
      : activity ? `${studioProps[state.prop].label} controls movement and arms.`
      : crateButton.disabled ? 'Crate is available with Idle or Walk.' : '';
    for (const button of handButtons) button.disabled = handsReserved;
    for (const [index, button] of motionButtons.entries()) {
      button.disabled = activity !== undefined || (holdingCrate && !supportsCrate(motionChoices[index].value));
    }
    actions.replaceChildren();
    actionStatus.textContent = '';
    if (handsReserved) {
      actions.parentElement!.hidden = true;
      return;
    }
    for (const [hand, side] of [['handLeft', 'Left'], ['handRight', 'Right']] as const) {
      const name = state.equipment[hand];
      const item = name === null ? undefined : equipmentItems[name];
      if (!item?.action) continue;
      const button = document.createElement('button');
      button.className = 'control';
      button.textContent = `${side}: ${item.action.label} (${item.label})`;
      button.addEventListener('click', () => {
        const result = onUse(hand);
        actionStatus.textContent = result === 'busy' ? 'Required arm is busy.' : '';
      });
      actions.append(button);
    }
    actions.parentElement!.hidden = actions.childElementCount === 0;
  }
  updateActions();
  segmented(
    panel,
    'Size guide',
    [
      { value: true, name: 'Wall and door' },
      { value: false, name: 'Hidden' },
    ],
    state.guide,
    set('guide'),
  );
  segmented(
    panel,
    'Attachment points',
    [
      { value: true, name: 'Shown' },
      { value: false, name: 'Hidden' },
    ],
    state.sockets,
    set('sockets'),
  );

  const viewRow = section(panel, 'View');
  for (const [view, name] of [
    ['front', 'Front'],
    ['threeQuarter', 'Three-quarter'],
  ] as const) {
    const button = document.createElement('button');
    button.className = 'control';
    button.textContent = name;
    button.addEventListener('click', () => onView(view));
    viewRow.append(button);
  }

  segmented(panel, 'Level of detail', [
    { value: 'auto', name: 'Auto' },
    { value: 'high', name: 'Full' },
    { value: 'low', name: 'Reduced' },
  ], state.detail, set('detail'));

  return {
    setReadout(text) {
      if (readout.textContent !== text) readout.textContent = text;
    },
  };
}
import { propMotion, studioProps, type StudioProp } from '../rendering/props/props';
