import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const os = searchParams.get('os') || 'mac';

  if (os === 'mac') {
    const candidates = [
      path.join(process.cwd(), 'public', 'downloads', 'EdgeFlow-Copier-1.0.0-arm64.dmg'),
      path.join(process.cwd(), 'desktop', 'dist', 'EdgeFlow Copier-1.0.0-arm64.dmg'),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const nodeStream = fs.createReadStream(filePath);
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
    }

    return new NextResponse('El archivo de instalación para macOS aún se está generando en el servidor.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (os === 'win') {
    const candidates = [
      path.join(process.cwd(), 'public', 'downloads', 'EdgeFlow-Copier-Setup-1.0.0.exe'),
      path.join(process.cwd(), 'desktop', 'dist', 'EdgeFlow-Copier-Setup-1.0.0.exe'),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const nodeStream = fs.createReadStream(filePath);
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
    }

    return new NextResponse('El archivo de instalación para Windows aún se está generando en el servidor.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return NextResponse.json({ error: 'Plataforma no compatible' }, { status: 400 });
}
