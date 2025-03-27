import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { MusicBrainzService } from "./musicbrainz.service";
import { of } from "rxjs";
import { AxiosResponse } from "axios";

describe("MusicBrainzService", () => {
  let service: MusicBrainzService;
  let httpService: HttpService;

  const mockXmlResponse = `
    <?xml version="1.0" encoding="UTF-8"?>
    <metadata>
      <release>
        <title>Test Album</title>
        <medium-list>
          <medium>
            <track-list>
              <track>
                <title>Track 1</title>
                <length>180000</length>
                <position>1</position>
              </track>
              <track>
                <title>Track 2</title>
                <length>240000</length>
                <position>2</position>
              </track>
            </track-list>
          </medium>
        </medium-list>
      </release>
    </metadata>
  `;

  const mockAxiosResponse = (data: any): AxiosResponse => ({
    data,
    status: 200,
    statusText: "OK",
    headers: {
      "content-type": "application/xml",
    },
    config: {
      headers: {
        Accept: "application/xml",
        "User-Agent": "BrokenRecordStore/1.0",
      },
    } as any,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusicBrainzService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MusicBrainzService>(MusicBrainzService);
    httpService = module.get<HttpService>(HttpService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getAlbumDetails", () => {
    it("should fetch and parse album details successfully", async () => {
      const mbid = "test-mbid";
      jest
        .spyOn(httpService, "get")
        .mockImplementation(() => of(mockAxiosResponse(mockXmlResponse)));

      const result = await service.getAlbumDetails(mbid);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        title: "Track 1",
        duration: "3:00",
        position: 1,
      });
      expect(result[1]).toEqual({
        title: "Track 2",
        duration: "4:00",
        position: 2,
      });
    });

    it("should handle API errors gracefully", async () => {
      const mbid = "invalid-mbid";
      jest.spyOn(httpService, "get").mockImplementation(() => {
        throw new Error("API Error");
      });

      const result = await service.getAlbumDetails(mbid);

      expect(result).toEqual([]);
    });

    it("should handle invalid XML response", async () => {
      const mbid = "test-mbid";
      jest
        .spyOn(httpService, "get")
        .mockImplementation(() => of(mockAxiosResponse("Invalid XML")));

      const result = await service.getAlbumDetails(mbid);

      expect(result).toEqual([]);
    });

    it("should handle empty track list", async () => {
      const emptyTracksXml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <metadata>
          <release>
            <title>Test Album</title>
            <medium-list>
              <medium>
                <track-list/>
              </medium>
            </medium-list>
          </release>
        </metadata>
      `;

      jest
        .spyOn(httpService, "get")
        .mockImplementation(() => of(mockAxiosResponse(emptyTracksXml)));

      const result = await service.getAlbumDetails("test-mbid");

      expect(result).toEqual([]);
    });
  });
});
