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
import { ages, dropdown, expressions, genders, panelHeader, panelSection, type Choice } from '../panel';
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

import { propMotion, studioProps, type StudioProp } from '../rendering/props/props';

function choices<T extends string>(names: readonly T[], titleCase = false): Choice<T>[] {
  return names.map(name => {
    const words = name.replace(/([A-Z])/g, ' $1').toLowerCase();
    const label = words.replace(titleCase ? /\b[a-z]/g : /^[a-z]/, letter => letter.toUpperCase());
    return [name, label];
  });
}

export function createPanel(
  container: HTMLElement,
  state: StudioState,
  onChange: () => void,
  onView: (view: 'front' | 'threeQuarter') => void,
  onUse: (hand: EquipmentHand) => UseResult,
): Panel {
  const panel = document.createElement('aside');
  panel.className = 'workspace-panel';
  const content = document.createElement('div');
  content.className = 'panel-content';
  content.append(panelHeader('Character Studio', 'Customize and animate a character.'));
  const footer = document.createElement('footer');
  footer.className = 'panel-footer';
  panel.append(content, footer);
  container.append(panel);

  const set = <K extends keyof StudioState>(key: K) => (value: StudioState[K]): void => {
    state[key] = value;
    onChange();
    updateControls();
  };

  const appearance = panelSection(content, 'Appearance');
  dropdown(appearance, 'Gender', genders, state.gender, set('gender'));
  dropdown(appearance, 'Age', ages, state.age, set('age'));
  dropdown(appearance, 'Expression', expressions, state.expression, set('expression'));
  dropdown(appearance, 'Skin', skinTones.map((tone, index) => [index, tone.name]), state.tone, set('tone'));
  dropdown<HairStyleName | null>(appearance, 'Hair', [[null, 'None'], ...choices(Object.keys(hairStyles) as HairStyleName[])], state.hair, set('hair'));
  const hairColor = dropdown(appearance, 'Hair Color', hairColors.map((color, index) => [index, color.name]), state.hairColor, set('hairColor'));

  const outfit = panelSection(content, 'Outfit');
  const outfitChoices = choices(Object.keys(outfits) as OutfitName[], true);
  dropdown<OutfitName | null>(outfit, 'Outfit', [[null, 'None'], ...outfitChoices], state.outfit, set('outfit'));
  const clothColor = dropdown<number | null>(outfit, 'Cloth color',
    [[null, 'Default'], ...clothColors.map((color, index): Choice<number> => [index, color.name])],
    state.clothColor, set('clothColor'));
  dropdown<HatStyleName | null>(outfit, 'Hat', [[null, 'Outfit default'], ...choices(Object.keys(hatStyles) as HatStyleName[])], state.hat, set('hat'));

  const propChoices = (Object.keys(studioProps) as StudioProp[]).map((name): Choice<StudioProp> => [name, studioProps[name].label]);
  const propClips = new Set(propChoices.map(([name]) => propMotion(name)));
  const movement = panelSection(content, 'Movement');
  const motion = dropdown(movement, 'Motion', choices((Object.keys(clips) as ClipName[]).filter(clip => !propClips.has(clip))), state.clip, set('clip'));
  const props = panelSection(content, 'Props');
  const prop = dropdown(props, 'Prop', propChoices, state.prop, set('prop'));
  const propStatus = document.createElement('p');
  propStatus.className = 'panel-status';
  propStatus.setAttribute('role', 'status');
  props.append(propStatus);

  const equipment = panelSection(content, 'Equipment');
  const hands = [['handLeft', 'Left'], ['handRight', 'Right']] as const;
  const handFields = hands.map(([hand, side]) => {
    const items = (Object.keys(equipmentItems) as EquipmentName[])
      .filter(name => equipmentItems[name].hands.includes(hand));
    return dropdown<EquipmentName | null>(equipment, side + ' hand', [
      [null, 'Empty'],
      ...items.map((name): Choice<EquipmentName> => [name, equipmentItems[name].label]),
    ], state.equipment[hand], value => {
      state.equipment[hand] = value;
      onChange();
      updateControls();
    });
  });

  const actions = panelSection(content, 'Equipment actions');
  const actionButtons = document.createElement('div');
  actionButtons.className = 'panel-actions';
  const actionStatus = document.createElement('p');
  actionStatus.className = 'panel-status';
  actionStatus.setAttribute('role', 'status');
  actions.append(actionButtons, actionStatus);

  function updateControls(): void {
    clothColor.disabled = state.outfit === null || !(state.outfit in everydayOutfits);
    hairColor.disabled = state.hair === null;
    const holdingCrate = state.prop === 'crate';
    const activity = propMotion(state.prop);
    const handsReserved = holdingCrate || activity !== undefined;
    const supportsCrate = (clip: string): boolean => clip === 'idle' || clip === 'walk';
    const crateOption = [...prop.options].find(option => option.value === 'crate')!;
    crateOption.disabled = !supportsCrate(state.clip);
    propStatus.textContent = holdingCrate ? 'Both hands occupied.'
      : activity ? studioProps[state.prop].label + ' controls movement and arms.'
      : crateOption.disabled ? 'Crate is available with Idle or Walk.' : '';
    for (const input of handFields) input.disabled = handsReserved;
    motion.disabled = activity !== undefined;
    for (const option of motion.options) option.disabled = holdingCrate && !supportsCrate(option.value);
    actionButtons.replaceChildren();
    actionStatus.textContent = '';
    if (!handsReserved) for (const [hand, side] of hands) {
      const name = state.equipment[hand];
      const item = name === null ? undefined : equipmentItems[name];
      if (!item?.action) continue;
      const button = document.createElement('button');
      button.className = 'control';
      button.textContent = side + ': ' + item.action.label + ' (' + item.label + ')';
      button.addEventListener('click', () => {
        actionStatus.textContent = onUse(hand) === 'busy' ? 'Required arm is busy.' : '';
      });
      actionButtons.append(button);
    }
    actions.hidden = actionButtons.childElementCount === 0;
  }

  const preview = panelSection(content, 'Preview');
  dropdown(preview, 'Size guide', [[true, 'Wall and door'], [false, 'Hidden']], state.guide, set('guide'));
  dropdown(preview, 'Attachment points', [[true, 'Shown'], [false, 'Hidden']], state.sockets, set('sockets'));
  dropdown(preview, 'View', [['threeQuarter', 'Three-quarter'], ['front', 'Front']], 'threeQuarter', onView);
  dropdown(preview, 'Level of detail', [['auto', 'Auto'], ['high', 'Full'], ['low', 'Reduced']], state.detail, set('detail'));
  updateControls();

  return {
    setReadout(text) {
      if (footer.textContent !== text) footer.textContent = text;
    },
  };
}
