import { NextRequest, NextResponse } from 'next/server'
import { BackupRestoreOptions } from '@/lib/backup-restore'
import { applyRestorableOperator, loadBackupFromZipFile } from '@/lib/backup-restore-helper'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const backupRestoreOptions = JSON.parse(formData.get('options') as string) as BackupRestoreOptions
    const zipFile = formData.get('file') as File
    const zipData = await zipFile.bytes()

    const restorableOperator = await loadBackupFromZipFile(zipData, backupRestoreOptions)
    await applyRestorableOperator(restorableOperator, backupRestoreOptions)

    revalidateTag('index')

    return NextResponse.json({ message: 'Backup restored successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error during restore:', error)
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 })
  }
}
