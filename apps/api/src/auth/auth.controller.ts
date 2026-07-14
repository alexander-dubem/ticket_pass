import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('challenge')
  @ApiOperation({ summary: 'Generate a SEP-10 challenge transaction' })
  @ApiQuery({ name: 'address', description: 'Stellar public address of the user' })
  async getChallenge(@Query('address') address: string) {
    const xdr = await this.authService.generateChallenge(address);
    return { xdr, serverKey: this.authService.getServerPublicKey() };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify the signed challenge and issue a JWT token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        xdr: { type: 'string' },
      },
      required: ['address', 'xdr'],
    },
  })
  async login(@Body() body: { address: string; xdr: string }) {
    return this.authService.verifyChallengeAndIssueToken(body.xdr, body.address);
  }
}
