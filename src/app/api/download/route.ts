import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const os = searchParams.get('os') || 'mac';

  if (os === 'mac') {
    const publicDmg = path.join(process.cwd(), 'public', 'downloads', 'EdgeFlow-Copier-1.0.0-arm64.dmg');
    const distDmg = path.join(process.cwd(), 'desktop', 'dist', 'EdgeFlow Copier-1.0.0-arm64.dmg');

    if (fs.existsSync(publicDmg)) {
      return NextResponse.redirect(new URL('/downloads/EdgeFlow-Copier-1.0.0-arm64.dmg', req.url));
    }

    if (fs.existsSync(distDmg)) {
      const stat = fs.statSync(distDmg);
      const nodeStream = fs.createReadStream(distDmg);
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

    return new NextResponse('El archivo de instalación para macOS aún no está disponible en el servidor.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (os === 'win') {
    const publicExe = path.join(process.cwd(), 'public', 'downloads', 'EdgeFlow-Copier-Setup-1.0.0.exe');
    const distExe = path.join(process.cwd(), 'desktop', 'dist', 'EdgeFlow-Copier-Setup-1.0.0.exe');

    if (fs.existsSync(publicExe)) {
      return NextResponse.redirect(new URL('/downloads/EdgeFlow-Copier-Setup-1.0.0.exe', req.url));
    }

    if (fs.existsSync(distExe)) {
      const stat = fs.statSync(distExe);
      const nodeStream = fs.createReadStream(distExe);
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

    return new NextResponse('El archivo de instalación para Windows (.exe) se está preparando en el servidor.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return NextResponse.json({ error: 'Plataforma no compatible' }, { status: 400 });
}
