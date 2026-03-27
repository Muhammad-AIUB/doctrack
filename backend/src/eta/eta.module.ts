import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EtaCalculatorService, ETA_STRATEGY } from './eta-calculator.service.js';
import { SimpleMovingAverageStrategy } from './strategies/simple-moving-average.strategy.js';
import { WeightedMovingAverageStrategy } from './strategies/weighted-moving-average.strategy.js';
import { PercentileStrategy } from './strategies/percentile.strategy.js';
import { PriorityQueueService } from '../queue/priority-queue.service.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: ETA_STRATEGY,
      useFactory: (config: ConfigService) => {
        const strategyName = config.get<string>('ETA_STRATEGY', 'simple-moving-average');
        switch (strategyName) {
          case 'weighted':
            return new WeightedMovingAverageStrategy();
          case 'percentile':
            return new PercentileStrategy();
          default:
            return new SimpleMovingAverageStrategy();
        }
      },
      inject: [ConfigService],
    },
    PriorityQueueService,
    EtaCalculatorService,
  ],
  exports: [EtaCalculatorService, PriorityQueueService],
})
export class EtaModule {}
