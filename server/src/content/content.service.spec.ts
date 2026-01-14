import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { getModelToken } from '@nestjs/mongoose';
import { Content } from './schemas/content.schema';

describe('ContentService', () => {
  let service: ContentService;

  const mockContentModel = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    }),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...dto, _id: '123' }),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getModelToken(Content.name),
          useValue: mockContentModel,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of contents', async () => {
      const result = await service.findAll('user123');
      expect(result).toEqual([]);
    });
  });
});
