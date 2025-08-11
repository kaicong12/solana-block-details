import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SolanaModule } from './solana/solana.module';

@Module({
  imports: [SolanaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
