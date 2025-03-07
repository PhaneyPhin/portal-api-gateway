import { Test, TestingModule } from '@nestjs/testing';
import { CamdigkeyService } from './camdigkey.service';

describe('CamdigkeyService', () => {
  let service: CamdigkeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CamdigkeyService],
    }).compile();

    service = module.get<CamdigkeyService>(CamdigkeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
