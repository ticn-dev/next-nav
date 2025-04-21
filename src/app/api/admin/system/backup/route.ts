import { NextRequest, NextResponse } from 'next/server'
import { BackupRestoreOptions } from '@/lib/backup-restore'
import { saveBackupAsZipFile } from '@/lib/backup-restore-helper'

export async function POST(request: NextRequest) {
  try {
    const backupRestoreOptions = (await request.json()) as BackupRestoreOptions
    const zipFile = await saveBackupAsZipFile(backupRestoreOptions)

    const fileName = `backup_${new Date().toISOString().replace(/:/g, '-')}.zip`
    return new NextResponse(zipFile, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${fileName}`,
      },
    })
  } catch (error) {
    console.error('Error during backup:', error)
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 })
  }
}
