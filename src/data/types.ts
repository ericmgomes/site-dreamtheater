export interface Setlist {
  date: string; city: string; region?: string; country: string; countryCode: string;
  venue: string; tour?: string; url: string;
}
export interface Show {
  date: string; city: string; country: string; countryCode: string; venue: string; url: string;
}
export interface Video {
  title: string; youtubeId: string; source: string; sourceUrl: string; category: string; description: string; url: string;
  viewCount: number; location: string; countryCode: 'BR';
}
export interface CoverBand {
  name: string; location?: string; description: string; instagram: string; youtube?: string; website?: string;
  sourceUrls: string[]; activityNote: string; instagramLabel?: string;
}
export interface CoverMusician {
  name: string; description: string; instagram?: string; youtube?: string; website?: string; image?: string; sourceUrls: string[];
}
export type Guitarist = CoverMusician & { instagram: string };
export type Instrument = 'guitar' | 'bass' | 'drums' | 'keys';
export interface Material {
  title: string; album?: string; instrument: Instrument; type: string; source: string;
  url: string; sourceUrls: string[]; note?: string;
}
export type AlbumCategory = 'studio' | 'live' | 'compilation' | 'ep';
export interface Album {
  title: string; year: number; releaseDate?: string; category: AlbumCategory; cover: string;
  officialUrl: string; spotifyUrl: string | null; sourceNote?: string;
}
