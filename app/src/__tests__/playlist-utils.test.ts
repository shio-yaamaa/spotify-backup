import { arrayToMap, shouldBackup, sortPlaylists, sortTracks, isPlaylistModified, isTrackModified } from '../playlist-utils';

test('arrayToMap', () => {
  const playlists: Playlist[] = [
    {
      id: '000',
      name: '000',
      tracks: [],
    },
    {
      id: '111',
      name: '111',
      tracks: [],
    }
  ];
  expect(arrayToMap(playlists)).toEqual(new Map<string, Playlist>([
    [playlists[0].id, playlists[0]],
    [playlists[1].id, playlists[1]],
  ]));
});

test('shouldBackup', () => {
  const playlist1: Playlist = {
    id: '',
    name: '10',
    tracks: [],
  };
  const playlist2: Playlist = {
    id: '',
    name: 'New',
    tracks: [],
  };
  const playlist3: Playlist = {
    id: '',
    name: 'Old',
    tracks: [],
  };
  expect(shouldBackup(playlist1)).toBe(true);
  expect(shouldBackup(playlist2)).toBe(true);
  expect(shouldBackup(playlist3)).toBe(false);
});

test('sortPlaylists', () => {
  const playlists: Playlist[] = [
    {
      id: '',
      name: '10',
      tracks: [],
    },
    {
      id: '',
      name: 'New',
      tracks: [],
    },
    {
      id: '',
      name: '2',
      tracks: [],
    },
  ];
  expect(sortPlaylists(playlists)).toEqual([
    playlists[2],
    playlists[0],
    playlists[1],
  ]);
});

test('sortTracks', () => {
  const createTrack = (addedAt: string): Track => {
    return {
      id: '',
      name: '',
      artists: [],
      addedAt,
    };
  };
  const tracks = [
    createTrack('2019-09-01T01:00:00Z'),
    createTrack('2019-09-01T00:00:00Z'),
    createTrack('2019-10-01T00:00:00Z'),
  ];
  expect(sortTracks(tracks)).toEqual([
    tracks[1],
    tracks[0],
    tracks[2],
  ]);
});

test('isPlaylistModified', () => {
  const oldPlaylist: Playlist = {
    id: '000',
    name: 'abc',
    tracks: [
      { id: '000', name: 'abc', artists: [], addedAt: '' }
    ],
  };
  const newPlaylist1: Playlist = {
    id: oldPlaylist.id,
    name: oldPlaylist.name,
    tracks: [],
  };
  const newPlaylist2: Playlist = {
    id: oldPlaylist.id,
    name: 'xyz',
    tracks: oldPlaylist.tracks,
  };
  expect(isPlaylistModified(oldPlaylist, { ...oldPlaylist })).toBe(false);
  expect(isPlaylistModified(oldPlaylist, newPlaylist1)).toBe(false);
  expect(isPlaylistModified(oldPlaylist, newPlaylist2)).toBe(true);
});

test('isTrackModified', () => {
  const oldTrack: Track = {
    id: '000',
    name: 'abc',
    artists: [
      { id: '000', name: 'abc' }
    ],
    addedAt: '0000-00-00T00:00:00Z',
  };
  const newTrack1: Track = {
    id: oldTrack.id,
    name: oldTrack.name,
    artists: oldTrack.artists,
    addedAt: '1111-11-11T11:11:11Z',
  };
  const newTrack2: Track = {
    id: oldTrack.id,
    name: oldTrack.name,
    artists: [
      { id: '000', name: 'xyz' }
    ],
    addedAt: oldTrack.addedAt,
  };
  expect(isTrackModified(oldTrack, { ...oldTrack })).toBe(false);
  expect(isTrackModified(oldTrack, newTrack1)).toBe(false);
  expect(isTrackModified(oldTrack, newTrack2)).toBe(true);
});