import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const os = searchParams.get('os') || 'mac';

  if (os === 'mac') {
    const localDmgPath = path.join(process.cwd(), 'desktop', 'dist', 'EdgeFlow Copier-1.0.0-arm64.dmg');
    if (fs.existsSync(localDmgPath)) {
      const stat = fs.statSync(localDmgPath);
      const nodeStream = fs.createReadStream(localDmgPath);
      const stream = new ReadableStream({
        start(controller) {
          nodeStream.on('data', (chunk) => controller.enqueue(chunk));
          nodeStream.on('end', () => controller.close());
          nodeStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'application/x-apple-diskimage',
          'Content-Disposition': 'attachment; filename="EdgeFlow-Copier-1.0.0-arm64.dmg"',
          'Content-Length': stat.size.toString(),
        },
      });
    }

    return NextResponse.redirect(
      'https://github.com/juandesousast/tracking/releases/latest/download/EdgeFlow-Copier-1.0.0-arm64.dmg',
      302
    );
  }

  if (os === 'win') {
    const localExePath = path.join(process.cwd(), 'desktop', 'dist', 'EdgeFlow-Copier-Setup-1.0.0.exe');
    if (fs.existsSync(localExePath)) {
      const stat = fs.statSync(localExePath);
      const nodeStream = fs.createReadStream(localExePath);
      const stream = new ReadableStream({
        start(controller) {
          nodeStream.on('data', (chunk) => controller.enqueue(chunk));
          nodeStream.on('end', () => controller.close());
          nodeStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'application/vnd.microsoft.portable-executable',
          'Content-Disposition': 'attachment; filename="EdgeFlow-Copier-Setup-1.0.0.exe"',
          'Content-Length': stat.size.toString(),
        },
      });
    }

    return NextResponse.redirect(
      'https://github.com/juandesousast/tracking/releases/latest/download/EdgeFlow-Copier-Setup-1.0.0.exe',
      302
    );
  }

  return NextResponse.json({ error: 'Plataforma no compatible' }, { status: 400 });
}
