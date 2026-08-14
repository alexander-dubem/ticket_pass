import { Injectable, OnModuleInit } from '@nestjs/common';
import { Keypair, TransactionBuilder, Networks } from '@stellar/stellar-sdk';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StellarService implements OnModuleInit {
  private sponsorKeypair: Keypair;
  private channelAccounts: string[] = []; // Memory queue of available channel addresses

  constructor(private readonly prisma: PrismaService) {
    const sponsorSeed = process.env.SPONSOR_SECRET_KEY;
    if (sponsorSeed) {
      this.sponsorKeypair = Keypair.fromSecret(sponsorSeed);
    } else {
      throw new Error('SPONSOR_SECRET_KEY environment variable is required for fee-bump transaction sponsorship.');
    }
  }

  async onModuleInit() {
    // Load existing channel accounts from database
    await this.refreshChannelPool();
  }

  async refreshChannelPool() {
    const dbChannels = await this.prisma.channelAccount.findMany({
      where: { isLocked: false },
    });
    this.channelAccounts = dbChannels.map((c) => c.address);
    console.log(`Stellar Channel Pool initialized with ${this.channelAccounts.length} channels.`);
  }

  // Add a new channel account to the database
  async registerChannelAccount(secretKey: string) {
    try {
      const kp = Keypair.fromSecret(secretKey);
      const address = kp.publicKey();
      await this.prisma.channelAccount.upsert({
        where: { address },
        update: { secretKey, isLocked: false },
        create: { address, secretKey, isLocked: false },
      });
      await this.refreshChannelPool();
      return { success: true, address };
    } catch (err: any) {
      throw new Error(`Invalid channel key: ${err.message}`);
    }
  }

  // Get and lock a channel account from the queue
  private async checkoutChannel(): Promise<{ address: string; secretKey: string }> {
    if (this.channelAccounts.length === 0) {
      // If pool is empty, we fall back to sponsor key for simplicity or throw
      console.warn('Stellar Dispatcher: Channel pool is empty, falling back to sponsor account.');
      return {
        address: this.sponsorKeypair.publicKey(),
        secretKey: this.sponsorKeypair.secret(),
      };
    }

    const address = this.channelAccounts.shift()!;
    // Mark as locked in DB
    await this.prisma.channelAccount.update({
      where: { address },
      data: { isLocked: true },
    });

    const account = await this.prisma.channelAccount.findUnique({
      where: { address },
    });

    return {
      address,
      secretKey: account!.secretKey,
    };
  }

  // Return a channel account back to the queue
  private async returnChannel(address: string) {
    if (address === this.sponsorKeypair.publicKey()) return;

    await this.prisma.channelAccount.update({
      where: { address },
      data: { isLocked: false },
    });
    this.channelAccounts.push(address);
  }

  // Build parallel-ready fee-bumped transaction
  async submitSorobanTxWithChannelAndFeeBump(innerTxXdr: string): Promise<string> {
    const { address: channelAddress } = await this.checkoutChannel();
    try {
      // 1. Load the signed inner transaction from XDR
      const innerTx = TransactionBuilder.fromXDR(innerTxXdr, Networks.TESTNET) as any;

      // 2. Wrap it inside a Fee-Bump transaction envelope signed by the Sponsor Account
      const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
        this.sponsorKeypair,
        '10000', // Sponsor fee in stroops
        innerTx,
        Networks.TESTNET
      );

      // Sign the outer Fee Bump transaction with Sponsor key
      feeBumpTx.sign(this.sponsorKeypair);
      console.log('Outer Tx XDR:', feeBumpTx.toXDR());
      console.log(`Dispatched transaction using Channel Account ${channelAddress}. Sponsor Funded Fee.`);
      return feeBumpTx.toXDR();
    } catch (err: any) {
      throw new Error(`Transaction dispatch failed: ${err.message}`);
    } finally {
      await this.returnChannel(channelAddress);
    }
  }
}
