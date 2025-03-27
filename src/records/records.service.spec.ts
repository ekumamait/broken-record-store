import { Test, TestingModule } from "@nestjs/testing";
import { RecordsService } from "./records.service";
import { CacheModule } from "@nestjs/cache-manager";
import { CacheService } from "../cache/cache.service";
import { MusicBrainzService } from "../musicbrainz/musicbrainz.service";
import { getModelToken } from "@nestjs/mongoose";
import { RecordCategory, RecordFormat } from "../common/enums/record.enum";
import { HttpModule } from "@nestjs/axios";
import { HttpStatus } from "@nestjs/common";
import { CreateRecordRequestDTO } from "./dto/create-record.dto";

describe("RecordsService", () => {
  let service: RecordsService;
  let recordModel: any;
  let cacheService: CacheService;
  let musicBrainzService: MusicBrainzService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register(), HttpModule],
      providers: [
        RecordsService,
        CacheService,
        MusicBrainzService,
        {
          provide: getModelToken("Record"),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndDelete: jest.fn(),
            countDocuments: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
    recordModel = module.get(getModelToken("Record"));
    cacheService = module.get<CacheService>(CacheService);
    musicBrainzService = module.get<MusicBrainzService>(MusicBrainzService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new record", async () => {
    const createRecordDto: CreateRecordRequestDTO = {
      artist: "Test",
      album: "Test Record",
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ALTERNATIVE,
    };
    const mockRecord = {
      ...createRecordDto,
      _id: "67e3e30a810d696976b8f05f",
      trackList: [],
    };

    jest.spyOn(recordModel, "findOne").mockResolvedValue(null);
    jest.spyOn(recordModel, "create").mockResolvedValue(mockRecord);
    jest.spyOn(musicBrainzService, "getAlbumDetails").mockResolvedValue([]);

    const response = await service.createRecord(createRecordDto);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.data._id).toBe("67e3e30a810d696976b8f05f");
    expect(recordModel.create).toHaveBeenCalledWith(createRecordDto);
  });

  it("should return conflict if record already exists", async () => {
    const createRecordDto: CreateRecordRequestDTO = {
      artist: "Test",
      album: "Test Record",
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ALTERNATIVE,
    };
    const existingRecord = {
      ...createRecordDto,
      _id: "67e3e30a810d696976b8f05f",
    };

    jest.spyOn(recordModel, "findOne").mockResolvedValue(existingRecord);

    const response = await service.createRecord(createRecordDto);
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(response.message).toBe(
      "Record already exists with this artist, album, and format combination",
    );
  });

  it("should return conflict if update creates a duplicate record", async () => {
    const updateRecordDto = { artist: "New Artist" };
    const existingRecord = {
      artist: "New Artist",
      album: "Album",
      format: "Vinyl",
      _id: "67e3e30a810d696976b8f05f",
    };
    const mockRecord = {
      artist: "Old Artist",
      album: "Album",
      format: "Vinyl",
      _id: "67e3e30a810d696976b8f05f",
    };

    jest.spyOn(recordModel, "findById").mockResolvedValue(mockRecord);
    jest.spyOn(recordModel, "findOne").mockResolvedValue(existingRecord);

    const response = await service.updateRecord("1", updateRecordDto);
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(response.message).toBe(
      "Update would create a duplicate record with the same artist, album, and format",
    );
  });
});
