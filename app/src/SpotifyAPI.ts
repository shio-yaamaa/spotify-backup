import * as Sentry from '@sentry/node';
import axios from 'axios';

import { shouldBackup, sortPlaylists, sortTracks } from './playlist-utils';

// The shape of the Spotify API responses
// Unused properties are omitted
// https://developer.spotify.com/documentation/web-api/reference-beta/#objects-index

interface APIPlaylistObject {
  id: string;
  href: string;
  name: string;
  owner: {
    id: string;
  };
  tracks: {
    href: string;
  };
}

interface APIPlaylistTrackObject {
  added_at: Timestamp;
  track: APITrackObject;
}

interface APITrackObject {
  id: string;
  href: string;
  name: string;
  artists: APIArtistObject[];
}

interface APIArtistObject {
  id: string;
  href: string;
  name: string;
}

Sentry.init({ dsn: process.env.SENTRY_DSN });

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const PLAYLISTS_ENDPOINT = `https://api.spotify.com/v1/users/${process.env.SPOTIFY_USER_ID}/playlists`;

class SpotifyAPI {
  private accessToken: string | null = null; // Initially null. Use getAccessToken() when calling Spotify API

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    // This program assumes that the refresh token never changes,
    // but the official documentation says "a new refresh token might be returned too"
    // upon refreshing the access token...
    const params = new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': process.env.SPOTIFY_REFRESH_TOKEN,
      'client_id': process.env.SPOTIFY_CLIENT_ID,
      'client_secret': process.env.SPOTIFY_CLIENT_SECRET,
    });
    const { data } = await axios.post(TOKEN_ENDPOINT, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (data['refresh_token']) {
      Sentry.captureException(new Error('A new refresh token is provided when refreshing the access key'));
    }
    return data['access_token'];
  }

  private async getItemsInAllPages<T>(firstPageEndpoint: string, headers: object): Promise<T[]> {
    const getItemsInSinglePage = async <T>(endpoint: string, headers: object): Promise<{items: T[], next: string | null}> => {
      const { data } = await axios.get(endpoint, { headers });
      return {
        items: data.items,
        next: data.next,
      };
    };
    const items = [];
    let next: string | null = firstPageEndpoint;
    while (next) {
      const singlePageResult = await getItemsInSinglePage<T>(next, headers);
      next = singlePageResult.next;
      items.push(...singlePageResult.items);
    }
    return items;
  }

  // Returns the list of tracks in a playlist sorted by addedAt
  private async getTracks(endpoint: string): Promise<Track[]> {
    const accessToken = await this.getAccessToken();
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    const items = await this.getItemsInAllPages<APIPlaylistTrackObject>(endpoint, headers);
    const tracks = items.map(item => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map(artist => ({
        id: artist.id,
        name: artist.name,
      })),
      addedAt: item.added_at,
    }));
    return sortTracks(tracks);
  }

  // Returns the list of playlists created by a user sorted by their names
  async getPlaylists(): Promise<Playlist[]> {
    try {
      const accessToken = await this.getAccessToken();
      const headers = { 'Authorization': `Bearer ${accessToken}` };
      const items = (await this.getItemsInAllPages<APIPlaylistObject>(PLAYLISTS_ENDPOINT, headers))
        .filter(item => item.owner.id === process.env.SPOTIFY_USER_ID);
      const playlists = await Promise.all(items.map(async item => ({
        id: item.id,
        name: item.name,
        tracks: await this.getTracks(item.tracks.href),
      })));
      return sortPlaylists(playlists.filter(playlist => shouldBackup(playlist)));
    } catch (e) {
      Sentry.captureException(e);
    }
  }
}

export default new SpotifyAPI();