export function isDevOnlySniff(code: string): boolean {
  const devOnlySniffs = [
    '1_3_4',
    '1_3_5',
    '1_3_6',
    '1_4_2',
    '1_4_4',
    '1_4_8',
    '1_4_10',
    '1_4_12',
    '2_1_1',
    '2_1_2',
    '2_1_3',
    '2_1_4',
    '2_2_1',
    '2_2_4',
    '2_2_5',
    '2_2_6',
    '2_3_3',
    '2_4_3',
    '2_4_5',
    '2_4_7',
    '2_5_1',
    '2_5_2',
    '2_5_4',
    '2_5_6',
    '3_2_1',
    '3_2_2',
    '3_3_1',
    '3_3_2',
    '3_3_3',
    '3_3_4',
    '3_3_6'
  ];
  for (let i = 0; i < devOnlySniffs.length; i++) {
    const x = devOnlySniffs[i];
    if (code.indexOf(`.${x}.`) > -1) {
      return true;
    }
  }
  return false;
}

export function isCmOnlySniff(code: string): boolean {
  const cmOnlySniffs = [
    '1_2_1',
    '1_2_2',
    '1_2_3',
    '1_2_4',
    '1_2_5',
    '1_2_6',
    '1_2_7',
    '1_2_8',
    '1_2_9',
    '1_4_7',
    '3_1_1',
    '3_1_2',
    '3_1_5'
  ];
  for (let i = 0; i < cmOnlySniffs.length; i++) {
    const x = cmOnlySniffs[i];
    if (code.indexOf(`.${x}.`) > -1) {
      return true;
    }
  }
  return false;
}
