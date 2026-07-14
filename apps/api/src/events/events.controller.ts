import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Events & Tickets')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ─── Events ──────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new ticket drop event' })
  async createEvent(
    @Request() req: any,
    @Body()
    body: {
      title: string;
      description: string;
      date: string;
      endDate?: string;
      location: string;
      price: string;
      capacity: number;
      maxPremiumPctScaled: number;
      images?: string[];
      instructions?: string;
      category?: string;
      tags?: string[];
      isPublished?: boolean;
      contractAddress?: string;
    },
  ) {
    return this.eventsService.createEvent({
      ...body,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      organizerAddress: req.user.address,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all published events, or filter by organizer wallet' })
  @ApiQuery({ name: 'organizer', required: false, description: 'Filter events by organizer wallet address' })
  async getAllEvents(@Query('organizer') organizer?: string) {
    return this.eventsService.getAllEvents(organizer);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get tickets owned by a wallet address' })
  @ApiQuery({ name: 'address', description: 'Stellar wallet address' })
  async getTicketsByOwner(@Query('address') address: string) {
    return this.eventsService.getTicketsByOwner(address);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an event' })
  async getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event (organizer only)' })
  async updateEvent(
    @Param('id') id: string,
    @Request() req: any,
    @Body()
    body: {
      title?: string;
      description?: string;
      date?: string;
      endDate?: string;
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
    return this.eventsService.updateEvent(id, req.user.address, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish/delete an event (organizer only)' })
  async deleteEvent(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.deleteEvent(id, req.user.address);
  }

  // ─── Tickets ─────────────────────────────────────────────────────────────────

  @Post(':id/purchase')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase/mint a ticket for an event' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { xdr: { type: 'string', description: 'Signed user minting transaction XDR' } },
      required: ['xdr'],
    },
  })
  async purchaseTicket(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { xdr: string },
  ) {
    return this.eventsService.purchaseTicket(id, req.user.address, body.xdr);
  }

  @Post(':eventId/tickets/:ticketId/transfer')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a ticket transfer' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { toAddress: { type: 'string', description: 'Recipient wallet address' } },
      required: ['toAddress'],
    },
  })
  async transferTicket(
    @Param('eventId') eventId: string,
    @Param('ticketId') ticketId: string,
    @Request() req: any,
    @Body() body: { toAddress: string },
  ) {
    return this.eventsService.transferTicket(
      eventId,
      parseInt(ticketId),
      req.user.address,
      body.toAddress,
    );
  }

  @Post(':eventId/tickets/:ticketId/verify')
  @ApiOperation({ summary: 'Gate check-in verification of a ticket holder' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ownerAddress: { type: 'string', description: 'Wallet address of the ticket holder' } },
      required: ['ownerAddress'],
    },
  })
  async verifyTicket(
    @Param('eventId') eventId: string,
    @Param('ticketId') ticketId: string,
    @Body() body: { ownerAddress: string },
  ) {
    return this.eventsService.verifyTicket(eventId, parseInt(ticketId), body.ownerAddress);
  }
}
