import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as xml2js from 'xml2js';

@Injectable()
export class MusicBrainzService {
  private readonly baseUrl = process.env.MUSIC_BRAINZ_URL;
  private readonly userAgent = process.env.MUSIC_BRAINZ_USER_AGENT;

  constructor(private readonly httpService: HttpService) {}

  async getAlbumDetails(mbid: string): Promise<any[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/release/${mbid}?inc=recordings+artist-credits+labels+discids+media`, {
          headers: { 'User-Agent': this.userAgent, Accept: 'application/xml' },
          responseType: 'text',
        }),
      );
      
      const result = await new xml2js.Parser({ explicitArray: false, mergeAttrs: true, normalizeTags: true, trim: true }).parseStringPromise(data);
      return this.extractTrackList(result);
    } catch {
      return [];
    }
  }

  private extractTrackList(mbData: any): any[] {
    const release = mbData?.metadata?.release;
    if (!release) return [];

    const media = Array.isArray(release['medium-list']?.medium) ? release['medium-list'].medium : [release['medium-list']?.medium].filter(Boolean);
    return media.flatMap(medium => this.extractTracks(medium?.['track-list']?.track));
  }

  private extractTracks(tracks: any): any[] {
    return (Array.isArray(tracks) ? tracks : [tracks]).filter(Boolean).map((track, index) => ({
      title: track?.title || track?.recording?.title || 'Unknown',
      duration: this.formatDuration(track?.length || track?.recording?.length || 0),
      position: parseInt(track?.position || track?.number, 10) || index + 1,
    }));
  }

  private formatDuration(milliseconds: number | string): string {
    const ms = isNaN(Number(milliseconds)) ? 0 : Number(milliseconds);
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
