import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PromptsModule } from './prompts/prompts.module';
import { PromptVersionsModule } from './prompt-versions/prompt-versions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PromptsModule,
    PromptVersionsModule,
  ],
})
export class AppModule {}
