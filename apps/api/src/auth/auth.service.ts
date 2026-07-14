import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Keypair, TransactionBuilder, Networks, Operation, Account } from '@stellar/stellar-sdk';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  private serverKeypair: Keypair;
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    const seed = process.env.SECRET_SEP10_SIGNING_SEED;
    if (seed) {
      this.serverKeypair = Keypair.fromSecret(seed);
    } else {
      // Fallback keypair for dev environment
      const devKeypair = Keypair.random();
      this.serverKeypair = devKeypair;
      console.warn('WARNING: SECRET_SEP10_SIGNING_SEED is not set. Generated dynamic dev keypair:', devKeypair.publicKey());
    }
  }

  getServerPublicKey(): string {
    return this.serverKeypair.publicKey();
  }

  async generateChallenge(clientPublicKey: string): Promise<string> {
    if (!clientPublicKey) {
      throw new BadRequestException('Client public key is required.');
    }
    
    // Generate a random nonce and save it to the user record for verification
    const nonce = Math.random().toString(36).substring(2, 15);
    await this.prisma.user.upsert({
      where: { walletAddress: clientPublicKey },
      update: { nonce },
      create: { walletAddress: clientPublicKey, nonce },
    });

    // Create challenge transaction
    const tx = new TransactionBuilder(
      new Account(clientPublicKey, "0"),
      {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
        timebounds: {
          minTime: Math.floor(Date.now() / 1000) - 60,
          maxTime: Math.floor(Date.now() / 1000) + 900, // 15 mins validity
        },
      }
    )
      .addOperation(
        Operation.manageData({
          name: 'Drip Web Auth',
          value: Buffer.from(nonce),
          source: clientPublicKey,
        })
      )
      .build();

    tx.sign(this.serverKeypair);
    return tx.toXDR();
  }

  async verifyChallengeAndIssueToken(signedXDR: string, clientPublicKey: string): Promise<{ token: string; address: string }> {
    try {
      const tx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET) as any;
      
      // Get user nonce
      const user = await this.prisma.user.findUnique({
        where: { walletAddress: clientPublicKey },
      });

      if (!user || !user.nonce) {
        throw new UnauthorizedException('Challenge nonce not found for this public key.');
      }

      // Verify signatures
      const serverVerified = tx.signatures.some((sig: any) => 
        sig.hint().equals(this.serverKeypair.signatureHint())
      );
      
      const clientKeypair = Keypair.fromPublicKey(clientPublicKey);
      const clientVerified = tx.signatures.some((sig: any) => 
        sig.hint().equals(clientKeypair.signatureHint())
      );

      if (!serverVerified || !clientVerified) {
        throw new UnauthorizedException('Invalid cryptographic signatures.');
      }

      // Clear the nonce to prevent replay attacks
      await this.prisma.user.update({
        where: { walletAddress: clientPublicKey },
        data: { nonce: null },
      });

      const token = this.jwtService.sign({ sub: clientPublicKey });
      return { token, address: clientPublicKey };
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'Signature verification failed.');
    }
  }
}
