import { Test, TestingModule } from '@nestjs/testing';
import { RecordsController } from './records.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRecordRequestDTO } from './dto/create-record.dto';
import {Record } from '../schemas/record.schema';
import { RecordCategory, RecordFormat } from '../common/enums/record.enum';

describe('RecordController', () => {
  let recordsController: RecordsController;
  let recordModel: Model<Record>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordsController],
      providers: [
        {
          provide: getModelToken('Record'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    recordsController = module.get<RecordsController>(RecordsController);
    recordModel = module.get<Model<Record>>(getModelToken('Record'));
  });

  it('should be defined', () => {
    expect(recordsController).toBeDefined();
  });

  it('should create a new record', async () => {
    const createRecordDto: CreateRecordRequestDTO = {
      artist: 'Test',
      album: 'Test Record',
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ALTERNATIVE,
    };

    const savedRecord = {
      _id: '1',
      name: 'Test Record',
      price: 100,
      qty: 10,
    };

    jest.spyOn(recordModel, 'create').mockResolvedValue(savedRecord as any);

    const result = await recordsController.create(createRecordDto);
    expect(result).toEqual(savedRecord);
    expect(recordModel.create).toHaveBeenCalledWith({
      artist: 'Test',
      album: 'Test Record',
      price: 100,
      qty: 10,
      category: RecordCategory.ALTERNATIVE,
      format: RecordFormat.VINYL,
    });
  });

  it('should return an array of records', async () => {
    const records = [
      { _id: '1', name: 'Record 1', price: 100, qty: 10 },
      { _id: '2', name: 'Record 2', price: 200, qty: 20 },
    ];

    jest.spyOn(recordModel, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(records),
    } as any);

    const result = await recordsController.findAll();
    expect(result).toEqual(records);
    expect(recordModel.find).toHaveBeenCalled();
  });
});

