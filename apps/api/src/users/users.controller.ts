import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own profile and stats' })
  async getMe(@Request() req: any) {
    return this.usersService.getMe(req.user.address);
  }

  @Patch('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile (display name)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        displayName: { type: 'string', description: 'User display name' },
      },
    },
  })
  async updateMe(@Request() req: any, @Body() body: { displayName?: string }) {
    return this.usersService.updateMe(req.user.address, body);
  }
}
