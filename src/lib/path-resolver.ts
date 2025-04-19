export const SystemIconId = 'system'

export function resolveIconPath(iconId: string | number) {
  return ['icons', iconId.toString()]
}
