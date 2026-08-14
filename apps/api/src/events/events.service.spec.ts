import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma.service';
import { StellarService } from '../stellar/stellar.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;

  const mockPrismaService = {
    user: {
      upsert: jest.fn(),
    },
    event: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    ticket: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockStellarService = {
    submitSorobanTxWithChannelAndFeeBump: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StellarService,
          useValue: mockStellarService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createEvent should create an event and ensure user exists', async () => {
    mockPrismaService.user.upsert.mockResolvedValue({});
    mockPrismaService.event.create.mockResolvedValue({ id: '1', title: 'Test' });

    const result = await service.createEvent({
      title: 'Test Event',
      description: 'Desc',
      date: new Date(),
      location: 'Lagos',
      price: '10',
      capacity: 100,
      maxPremiumPctScaled: 150,
      organizerAddress: 'GABC',
    });

    expect(result).toEqual({ id: '1', title: 'Test' });
    expect(mockPrismaService.user.upsert).toHaveBeenCalledWith({
      where: { walletAddress: 'GABC' },
      update: {},
      create: { walletAddress: 'GABC' },
    });
    expect(mockPrismaService.event.create).toHaveBeenCalled();
  });

  it('getEventById should throw NotFoundException for missing event', async () => {
    mockPrismaService.event.findUnique.mockResolvedValue(null);
    await expect(service.getEventById('missing')).rejects.toThrow(NotFoundException);
  });

  it('purchaseTicket should throw NotFoundException for missing event', async () => {
    mockPrismaService.event.findUnique.mockResolvedValue(null);
    await expect(service.purchaseTicket('missing', 'GABC', 'xdr')).rejects.toThrow(NotFoundException);
  });

  it('purchaseTicket should throw BadRequestException when sold out', async () => {
    mockPrismaService.event.findUnique.mockResolvedValue({
      id: '1',
      _count: { tickets: 100 },
      capacity: 100,
    });
    await expect(service.purchaseTicket('1', 'GABC', 'xdr')).rejects.toThrow(BadRequestException);
  });

  it('purchaseTicket should mint ticket when available', async () => {
    mockPrismaService.event.findUnique.mockResolvedValue({
      id: '1',
      _count: { tickets: 0 },
      capacity: 100,
    });
    mockStellarService.submitSorobanTxWithChannelAndFeeBump.mockResolvedValue('tx_123');
    mockPrismaService.user.upsert.mockResolvedValue({});
    mockPrismaService.ticket.create.mockResolvedValue({ id: 't1', ticketId: 1 });

    const result = await service.purchaseTicket('1', 'GABC', 'xdr');
    expect(result.success).toBe(true);
    expect(result.txHash).toBe('tx_123');
    expect(mockPrismaService.ticket.create).toHaveBeenCalledWith({
      data: {
        eventId: '1',
        ownerAddress: 'GABC',
        ticketId: 1,
        txHash: 'tx_123',
        status: 'MINTED',
      },
    });
  });

  it('transferTicket should throw NotFoundException for missing ticket', async () => {
    mockPrismaService.ticket.findUnique.mockResolvedValue(null);
    await expect(service.transferTicket('1', 1, 'GABC', 'GDEF')).rejects.toThrow(NotFoundException);
  });

  it('transferTicket should throw BadRequestException for wrong sender', async () => {
    mockPrismaService.ticket.findUnique.mockResolvedValue({
      eventId: '1',
      ticketId: 1,
      ownerAddress: 'GDEF',
    });
    await expect(service.transferTicket('1', 1, 'GABC', 'GDEF')).rejects.toThrow(BadRequestException);
  });

  it('updateEvent should throw ForbiddenException when organizer mismatches', async () => {
    mockPrismaService.event.findUnique.mockResolvedValue({ id: '1', organizerAddress: 'GDEF' });
    await expect(service.updateEvent('1', 'GABC', { title: 'New' })).rejects.toThrow(ForbiddenException);
  });
});
