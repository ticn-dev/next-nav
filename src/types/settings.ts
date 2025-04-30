import { MetaData } from './metadata'
import { SystemSettings } from '@/lib/settings'

export interface SystemSettingsRecord extends SystemSettings {
  metadata: MetaData[]
}
