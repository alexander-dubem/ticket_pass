import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stellarService: StellarService,
  ) {}

  async createEvent(data: {
    title: string;
    description: string;
    date: Date;
    endDate?: Date;
    location: string;
    price: string;
    capacity: number;
    maxPremiumPctScaled: number;
    images?: string[];
    instructions?: string;
    category?: string;
    tags?: string[];
    organizerAddress: string;
    isPublished?: boolean;
    contractAddress?: string;
  }) {
    // Ensure organizer has a user record
    await this.prisma.user.upsert({
      where: { walletAddress: data.organizerAddress },
      update: {},
      create: { walletAddress: data.organizerAddress },
    });

    return this.prisma.event.create({ data });
  }

  async updateEvent(
    id: string,
    organizerAddress: string,
    data: {
      title?: string;
      description?: string;
      date?: Date;
      endDate?: Date;
      location?: string;
      price?: string;
      capacity?: number;
      maxPremiumPctScaled?: number;
      images?: string[];
      instructions?: string;
      category?: string;
      tags?: string[];
      isPublished?: boolean;
      contractAddress?: string;
    },
  ) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerAddress !== organizerAddress) {
      throw new ForbiddenException('Only the event organizer can update this event');
    }
    return this.prisma.event.update({ where: { id }, data });
  }

  async deleteEvent(id: string, organizerAddress: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerAddress !== organizerAddress) {
      throw new ForbiddenException('Only the event organizer can delete this event');
    }
    // Soft-delete by unpublishing
    return this.prisma.event.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async getAllEvents(organizerAddress?: string) {
    return this.prisma.event.findMany({
      where: {
        ...(organizerAddress ? { organizerAddress } : { isPublished: true }),
      },
      include: {
        _count: { select: { tickets: true } },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getEventById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tickets: true,
        _count: { select: { tickets: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async purchaseTicket(eventId: string, buyerAddress: string, innerTxXdr: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { tickets: true } } },
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event._count.tickets >= event.capacity) {
      throw new BadRequestException('Event is sold out');
    }

    // Submit through the parallel dispatcher (Fee-Bumped, Channel-Assigned)
    const txHash = await this.stellarService.submitSorobanTxWithChannelAndFeeBump(innerTxXdr);

    // Register ticket in DB
    const ticketId = event._count.tickets + 1;

    await this.prisma.user.upsert({
      where: { walletAddress: buyerAddress },
      update: {},
      create: { walletAddress: buyerAddress },
    });

    const ticket = await this.prisma.ticket.create({
      data: { eventId, ownerAddress: buyerAddress, ticketId, txHash, status: 'MINTED' },
    });

    return { success: true, txHash, ticket };
  }

  async transferTicket(
    eventId: string,
    ticketId: number,
    fromAddress: string,
    toAddress: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { eventId_ticketId: { eventId, ticketId } },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.ownerAddress !== fromAddress) {
      throw new BadRequestException('Invalid sender address');
    }

    await this.prisma.user.upsert({
      where: { walletAddress: toAddress },
      update: {},
      create: { walletAddress: toAddress },
    });

    const updatedTicket = await this.prisma.ticket.update({
      where: { eventId_ticketId: { eventId, ticketId } },
      data: { ownerAddress: toAddress, status: 'TRANSFERRED' },
    });

    return { success: true, ticket: updatedTicket };
  }

  async getTicketsByOwner(ownerAddress: string) {
    return this.prisma.ticket.findMany({
      where: { ownerAddress },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyTicket(eventId: string, ticketId: number, expectedOwner: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { eventId_ticketId: { eventId, ticketId } },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.ownerAddress !== expectedOwner) {
      throw new BadRequestException('Ticket owner mismatch. Fraudulent check-in attempt.');
    }

    const verifiedTicket = await this.prisma.ticket.update({
      where: { eventId_ticketId: { eventId, ticketId } },
      data: { status: 'VERIFIED' },
    });

    return { success: true, ticket: verifiedTicket };
  }
}
