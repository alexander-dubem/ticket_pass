import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';

describe('AuthService', () => {
  let service: AuthService;
  const kp1 = Keypair.random();
  const validPublicKey = kp1.publicKey();
  const validSeed = Keypair.random().secret();

  const mockPrismaService = {
    user: {
      upsert: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockTx = {
    signatures: [
      { hint: () => ({ equals: () => true }) },
      { hint: () => ({ equals: () => true }) },
    ],
  };

  beforeEach(async () => {
    process.env.SECRET_SEP10_SIGNING_SEED = validSeed;
    jest.spyOn(TransactionBuilder, 'fromXDR').mockReturnValue(mockTx as any);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getServerPublicKey should return the server public key', () => {
    const publicKey = service.getServerPublicKey();
    expect(publicKey).toBeDefined();
    expect(typeof publicKey).toBe('string');
    expect(publicKey.startsWith('G')).toBe(true);
  });

  it('generateChallenge should throw BadRequestException for empty public key', async () => {
    await expect(service.generateChallenge('')).rejects.toThrow(BadRequestException);
  });

  it('generateChallenge should create a nonce and return XDR', async () => {
    mockPrismaService.user.upsert.mockResolvedValue({});
    const xdr = await service.generateChallenge(validPublicKey);
    expect(xdr).toBeDefined();
    expect(typeof xdr).toBe('string');
    expect(mockPrismaService.user.upsert).toHaveBeenCalledWith({
      where: { walletAddress: validPublicKey },
      update: { nonce: expect.any(String) },
      create: { walletAddress: validPublicKey, nonce: expect.any(String) },
    });
  });

  it('verifyChallengeAndIssueToken should throw UnauthorizedException for missing nonce', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({ walletAddress: validPublicKey, nonce: null });
    await expect(service.verifyChallengeAndIssueToken('someXdr', validPublicKey)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('verifyChallengeAndIssueToken should clear nonce and return JWT on success', async () => {
    const nonce = 'testnonce123';
    const mockToken = 'jwt.token.here';

    mockPrismaService.user.findUnique.mockResolvedValue({ walletAddress: validPublicKey, nonce });
    mockPrismaService.user.update.mockResolvedValue({});
    mockJwtService.sign.mockReturnValue(mockToken);

    const result = await service.verifyChallengeAndIssueToken('someXdr', validPublicKey);
    expect(result).toEqual({ token: mockToken, address: validPublicKey });
    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { walletAddress: validPublicKey },
      data: { nonce: null },
    });
  });
});
