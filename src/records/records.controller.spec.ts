import { Test, TestingModule } from '@nestjs/testing';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { CreateRecordRequestDTO } from './dto/create-record.dto';
import { Record } from '../schemas/record.schema';
import { RecordCategory, RecordFormat } from '../common/enums/record.enum';
import { CacheService } from '../cache/cache.service';
import { MusicBrainzService } from '../musicbrainz/musicbrainz.service';
import { ApiResponse } from '../common/utils/api-response.util';
import { FilterRecordDto } from './dto/filter-record.dto';
import { PaginatedResponse } from '../common/utils/paginated-response.util';

describe('RecordController', () => {
  let recordsController: RecordsController;
  let recordsService: RecordsService;
  let cacheService: CacheService;

  const mockRecord : Record =  {
    _id: '1',
    artist: 'Test',
    album: 'Test Record',
    price: 100,
    qty: 10,
    format: RecordFormat.VINYL,
    category: RecordCategory.ALTERNATIVE,
  } as unknown as Record;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordsController],
      providers: [
        {
          provide: RecordsService,
          useValue: {
            createRecord: jest.fn(),
            findAllRecords: jest.fn(),
            findOneRecord: jest.fn(),
            updateRecord: jest.fn(),
            removeRecord: jest.fn(),
            invalidateRecordsCache: jest.fn(),
            invalidateRecordCache: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            invalidateByPattern: jest.fn(),
          },
        },
      ],
    }).compile();

    recordsController = module.get<RecordsController>(RecordsController);
    recordsService = module.get<RecordsService>(RecordsService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(recordsController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const createRecordDto: CreateRecordRequestDTO = {
        artist: 'Test',
        album: 'Test Record',
        price: 100,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ALTERNATIVE,
      };

      const expectedResponse = ApiResponse.created(mockRecord);
      jest.spyOn(recordsService, 'createRecord').mockResolvedValue(expectedResponse);
      jest.spyOn(recordsService, 'invalidateRecordsCache').mockResolvedValue();

      const result = await recordsController.create(createRecordDto);
      
      expect(result).toEqual(expectedResponse);
      expect(recordsService.createRecord).toHaveBeenCalledWith(createRecordDto);
      expect(recordsService.invalidateRecordsCache).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated records', async () => {
      const filterDto: FilterRecordDto = {
        page: 1,
        limit: 10,
      };

      const paginatedResponse = new PaginatedResponse(
        [mockRecord],
        1,
        1,
        10
      );

      const expectedResponse = ApiResponse.success(paginatedResponse);
      jest.spyOn(recordsService, 'findAllRecords').mockResolvedValue(expectedResponse);

      const result = await recordsController.findAll(filterDto);
      
      expect(result).toEqual(expectedResponse);
      expect(recordsService.findAllRecords).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a single record', async () => {
      const expectedResponse = ApiResponse.success(mockRecord);
      jest.spyOn(recordsService, 'findOneRecord').mockResolvedValue(expectedResponse);

      const result = await recordsController.findOne('1');
      
      expect(result).toEqual(expectedResponse);
      expect(recordsService.findOneRecord).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a record', async () => {
      const updateDto = {
        price: 150,
        qty: 20,
      };

      const expectedResponse = ApiResponse.success(mockRecord);
      jest.spyOn(recordsService, 'updateRecord').mockResolvedValue(expectedResponse);
      jest.spyOn(recordsService, 'invalidateRecordsCache').mockResolvedValue();
      jest.spyOn(recordsService, 'invalidateRecordCache').mockResolvedValue();

      const result = await recordsController.update('1', updateDto);
      
      expect(result).toEqual(expectedResponse);
      expect(recordsService.updateRecord).toHaveBeenCalledWith('1', updateDto);
      expect(recordsService.invalidateRecordsCache).toHaveBeenCalled();
      expect(recordsService.invalidateRecordCache).toHaveBeenCalledWith('1');
    });
  });

  describe('remove', () => {
    it('should remove a record', async () => {
      const expectedResponse = ApiResponse.success(null, 'Record deleted successfully');
      jest.spyOn(recordsService, 'removeRecord').mockResolvedValue(expectedResponse);
      jest.spyOn(recordsService, 'invalidateRecordsCache').mockResolvedValue();
      jest.spyOn(recordsService, 'invalidateRecordCache').mockResolvedValue();

      const result = await recordsController.remove('1');
      
      expect(result).toEqual(expectedResponse);
      expect(recordsService.removeRecord).toHaveBeenCalledWith('1');
      expect(recordsService.invalidateRecordsCache).toHaveBeenCalled();
      expect(recordsService.invalidateRecordCache).toHaveBeenCalledWith('1');
    });
  });
});