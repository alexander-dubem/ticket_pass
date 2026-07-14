import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(walletAddress: string) {
    let user = await this.prisma.user.findUnique({
      where: { walletAddress },
      include: {
        _count: { select: { tickets: true } },
      },
    });

    // Auto-create the user record if it doesn't exist yet
    if (!user) {
      user = await this.prisma.user.create({
        data: { walletAddress },
        include: { _count: { select: { tickets: true } } },
      });
    }

    // Count events organized by this address
    const eventsOrganizedCount = await this.prisma.event.count({
      where: { organizerAddress: walletAddress },
    });

    // Count tickets that have been verified (used at gate)
    const ticketsVerifiedCount = await this.prisma.ticket.count({
      where: { ownerAddress: walletAddress, status: 'VERIFIED' },
    });

    return {
      id: user.id,
      walletAddress: user.walletAddress,
      displayName: user.displayName,
      createdAt: user.createdAt,
      stats: {
        ticketsOwned: user._count.tickets,
        eventsOrganized: eventsOrganizedCount,
        ticketsVerified: ticketsVerifiedCount,
      },
    };
  }

  async updateMe(walletAddress: string, data: { displayName?: string }) {
    await this.prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
    });

    return this.prisma.user.update({
      where: { walletAddress },
      data,
      select: {
        id: true,
        walletAddress: true,
        displayName: true,
        updatedAt: true,
      },
    });
  }
}
