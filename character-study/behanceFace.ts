type FaceBlock = (x: number, y: number, z: number, width: number, height: number, depth: number, color: number) => void;

// Coordinates are relative to the study head's chin and front surface.
export function buildBehanceFace(draw: FaceBlock): void {
  const box: FaceBlock = (x, y, z, w, h, d, color) => draw(x, y - 22, z - 4, w, h, d, color);
  function pixels(pattern: readonly string[], x: number, top: number, z: number, unit: number): void {
    for (const [row, line] of pattern.entries()) {
      for (const [column, pixel] of [...line].entries()) {
        const color = faceColors[pixel];
        if (color !== undefined) {
          box(x + (column + 0.5) * unit, top - (row + 1) * unit, z - 0.125, unit, unit, 0.25, color);
        }
      }
    }
  }
  const faceColors: Record<string, number> = { E: 0x361913, R: 0x6a3125, B: 0x986343, C: 0xed947e, T: 0xfff4de, M: 0xbc372c };
  for (const side of [-1, 1]) {
    pixels(['.EEEE.', 'EEEEEE', 'EEEEEE', 'EEEEEE', '.RRRR.'], side * 3.5 - 1.125, 28.75, 4, 0.375);
    pixels(['BBBB.', '.BBBB'], side * 3.5 - 0.875, 30.125, 4, 0.375);
    pixels(['.CCCC.', 'CCCCCC', 'CCCCCC', '.CCCC.'], side * 4.125 - 1.125, 26.375, 4, 0.375);
  }
  pixels(['.TTTT.', 'MMMMMM', '.MMMM.', '..MM..'], -0.75, 25.5, 4, 0.25);
  box(0.375, 26.625, 3.875, 0.25, 0.75, 0.25, 0xdca181);
  box(0.125, 26.625, 3.875, 0.5, 0.25, 0.25, 0xdca181);
  box(0.125, 26.875, 3.875, 0.25, 0.5, 0.25, 0xffd5b2);
}
