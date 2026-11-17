import type { Age, ExpressionName, Gender } from '../packages/voxel-actors/src';

export type Choice<T> = readonly [value: T, label: string];

export const genders: readonly Choice<Gender>[] = [['female', 'Female'], ['male', 'Male']];
export const ages: readonly Choice<Age>[] = [
  ['child', 'Child'], ['teen', 'Teen'], ['adult', 'Adult'], ['elder', 'Elder'], ['aged', 'Aged'],
];
export const expressions: readonly Choice<ExpressionName>[] = [
  ['normal', 'Neutral'], ['happy', 'Happy'], ['smiling', 'Smiling'], ['sad', 'Sad'],
];

export function panelHeader(title: string, subtitle: string): HTMLElement {
  const header = document.createElement('div');
  header.className = 'panel-header';
  const heading = document.createElement('h1');
  heading.className = 'panel-title';
  heading.textContent = title;
  const summary = document.createElement('p');
  summary.className = 'panel-subtitle';
  summary.textContent = subtitle;
  header.append(heading, summary);
  return header;
}

export function panelSection(parent: HTMLElement, title: string): HTMLElement {
  const section = document.createElement('section');
  section.className = 'panel-section';
  const heading = document.createElement('h2');
  heading.className = 'panel-section-title';
  heading.textContent = title;
  section.append(heading);
  parent.append(section);
  return section;
}

export function dropdown<T extends string | number | boolean | null>(
  section: HTMLElement, title: string, choices: readonly Choice<T>[], initial: T, onChange?: (value: T) => void,
): HTMLSelectElement {
  const field = document.createElement('label');
  field.className = 'field';
  const label = document.createElement('span');
  label.className = 'field-label';
  label.textContent = title;
  const input = document.createElement('select');
  input.className = 'field-select';
  for (const [value, name] of choices) input.add(new Option(name, String(value ?? '')));
  input.value = String(initial ?? '');
  if (onChange) input.addEventListener('change', () => {
    const choice = choices[input.selectedIndex];
    if (choice) onChange(choice[0]);
  });
  field.append(label, input);
  section.append(field);
  return input;
}
