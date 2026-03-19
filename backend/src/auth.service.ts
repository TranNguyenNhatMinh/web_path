import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './auth.dto';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private signAccessToken(user: {
    _id: unknown;
    email: string;
    permissions: string[];
  }): string {
    return this.jwtService.sign({
      sub: String(user._id),
      email: user.email,
      permissions: user.permissions ?? [],
    });
  }

  private refreshSecret(): string {
    const base = process.env.JWT_SECRET || 'dev-secret';
    return process.env.JWT_REFRESH_SECRET || `${base}-refresh`;
  }

  private signRefreshToken(user: { _id: unknown }): string {
    return this.jwtService.sign(
      { sub: String(user._id), type: 'refresh' as const },
      {
        secret: this.refreshSecret(),
        // Nest's JwtSignOptions types expect ms.StringValue, env is plain string
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
          '7d') as unknown as never,
      },
    );
  }

  private refreshExpiresAt() {
    const days = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 7);
    const ms = Number.isFinite(days)
      ? days * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ms);
  }

  private async issueTokens(user: {
    _id: unknown;
    email: string;
    permissions: string[];
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshTokenExpiresAt = this.refreshExpiresAt();
    await this.usersService.setRefreshToken(
      String(user._id),
      refreshTokenHash,
      refreshTokenExpiresAt,
    );
    return { accessToken, refreshToken };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: unknown }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const created = await this.usersService.createUser({
      email: dto.email,
      password: hashed,
      name: dto.name,
      permissions: ['USER_VIEW'],
    });

    const { password: _password, ...safe } = created.toObject();
    void _password;
    const { accessToken, refreshToken } = await this.issueTokens(created);
    return { accessToken, refreshToken, user: safe };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: unknown }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _password, ...safe } = user.toObject();
    void _password;
    const { accessToken, refreshToken } = await this.issueTokens(user);
    return { accessToken, refreshToken, user: safe };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; type?: string };
    try {
      payload = this.jwtService.verify<{ sub: string; type?: string }>(
        refreshToken,
        {
          secret: this.refreshSecret(),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh' || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findByIdForAuth(payload.sub);
    if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (user.refreshTokenExpiresAt.getTime() < Date.now()) {
      await this.usersService.clearRefreshToken(String(user._id));
      throw new UnauthorizedException('Refresh token expired');
    }

    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.issueTokens(user);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = this.jwtService.verify<{ sub: string; type?: string }>(
        refreshToken,
        {
          secret: this.refreshSecret(),
        },
      );
      if (payload?.sub) {
        await this.usersService.clearRefreshToken(payload.sub);
      }
    } catch {
      // ignore
    }
  }
}
