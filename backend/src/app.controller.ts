import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api-info')
  getApiInfo(@Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.appService.getApiInfo(baseUrl);
  }

  @Get('api-info/html')
  getApiInfoHtml(@Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.appService.getApiInfoHtml(baseUrl);
  }
}
