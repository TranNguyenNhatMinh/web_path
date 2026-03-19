import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getApiInfo(baseUrl: string) {
    const endpoints = [
      {
        method: 'POST',
        path: '/auth/register',
        description: 'Đăng ký tài khoản',
      },
      { method: 'POST', path: '/auth/login', description: 'Đăng nhập' },
      {
        method: 'POST',
        path: '/auth/refresh',
        description: 'Refresh access token',
      },
      { method: 'POST', path: '/auth/logout', description: 'Đăng xuất' },
      { method: 'GET', path: '/users', description: 'Danh sách user' },
      {
        method: 'GET',
        path: '/users/:id',
        description: 'Chi tiết user theo id',
      },
    ];

    return {
      baseUrl,
      endpoints,
    };
  }

  getApiInfoHtml(baseUrl: string): string {
    const info = this.getApiInfo(baseUrl);
    const lines = info.endpoints
      .map(
        (e) =>
          `<li><code>${e.method} ${info.baseUrl}${e.path}</code> - ${e.description}</li>`,
      )
      .join('\n');

    return `
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>API Info</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; background:#0f172a; color:#e5e7eb; }
      h1 { margin-bottom: 8px; }
      code { background:#020617; padding:2px 4px; border-radius:4px; }
      ul { margin-top: 8px; }
    </style>
  </head>
  <body>
    <h1>API backend</h1>
    <p><strong>Base URL:</strong> <code>${info.baseUrl}</code></p>
    <h2>Endpoints</h2>
    <ul>
      ${lines}
    </ul>
  </body>
</html>`;
  }
}
