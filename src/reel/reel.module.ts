import { Module } from '@nestjs/common';
import { ReelController } from './reel/reel.controller';
import { ReelController } from './reel.controller';
import { ReelService } from './reel.service';

@Module({
  controllers: [ReelController],
  providers: [ReelService]
})
export class ReelModule {}
