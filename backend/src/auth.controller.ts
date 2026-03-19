import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import type { Request, Response } from 'express';

type RefreshCookieRequest = Request & {
  cookies?: {
    refreshToken?: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('register') //Gắn route này với HTTP method POST và path 'register'
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...rest } = await this.authService.register(dto);
    this.setRefreshCookie(res, refreshToken);
    return rest;
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...rest } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return rest;
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: RefreshCookieRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as unknown as
      | { refreshToken?: string }
      | undefined;
    const token = cookies?.refreshToken;
    if (typeof token !== 'string') return { accessToken: null };

    const { accessToken, refreshToken } = await this.authService.refresh(token);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: RefreshCookieRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as unknown as
      | { refreshToken?: string }
      | undefined;
    const token = cookies?.refreshToken;
    await this.authService.logout(token);
    res.clearCookie('refreshToken', { path: '/' });
    return { ok: true };
  }
}
