import { actionToCommitMessage } from '../commit-message';

test('actionToCommitMessage:PlaylistCreation', () => {
  const playlists: Playlist[] = [
    {
      id: '',
      name: 'Playlist',
      tracks: [],
    },
  ];
  const action: PlaylistCreation = {
    type: 'playlist-creation',
    target: playlists[0],
  };
  expect(actionToCommitMessage(action, playlists)).toBe(':new: Create :file_folder: Playlist');
});

test('actionToCommitMessage:PlaylistDeletion', () => {
  const playlists: Playlist[] = [];
  const action: PlaylistDeletion = {
    type: 'playlist-deletion',
    target: {
      id: '',
      name: 'Playlist',
      tracks: [],
    },
  };
  expect(actionToCommitMessage(action, playlists)).toBe(':negative_squared_cross_mark: Delete :file_folder: Playlist');
});

test('actionToCommitMessage:PlaylistModification', () => {
  const playlists: Playlist[] = [
    {
      id: '',
      name: 'Playlist2',
      tracks: [],
    },
  ];
  const action: PlaylistModification = {
    type: 'playlist-modification',
    oldPlaylist: {
      ...playlists[0],
      name: 'Playlist',
    },
    newPlaylist: playlists[0],
  };
  expect(actionToCommitMessage(action, playlists)).toBe(':pencil2: Modify :file_folder: Playlist2');
});

test('actionToCommitMessage:TrackAddition', () => {
  const track: Track = {
    id: '',
    name: 'Track',
    artists: [],
    addedAt: '',
  };
  const playlists: Playlist[] = [
    {
      id: '000',
      name: 'Playlist',
      tracks: [ track ],
    },
  ];
  const action: TrackAddition = {
    type: 'track-addition',
    target: track,
    destinationPlaylistId: '000',
  };
  expect(actionToCommitMessage(action, playlists)).toBe(':new: Track :file_folder: Playlist');
});

test('actionToCommitMessage:TrackDeletion', () => {
  const track: Track = {
    id: '',
    name: 'Track',
    artists: [
      {
        id: '',
        name: 'Artist',
      },
    ],
    addedAt: '',
  };
  const playlists: Playlist[] = [
    {
      id: '000',
      name: 'Playlist',
      tracks: [],
    },
  ];
  const action: TrackRemoval = {
    type: 'track-removal',
    target: track,
    sourcePlaylistId: '000',
  };
  expect(actionToCommitMessage(action, playlists)).toBe(':negative_squared_cross_mark: Artist - Track :file_folder: Playlist');
});

test('actionToCommitMessage:TrackTransfer', () => {
  const track: Track = {
    id: '',
    name: 'Track',
    artists: [
      {
        id: '',
        name: 'Artist',
      },
    ],
    addedAt: '',
  };
  const playlists: Playlist[] = [
    {
      id: '000',
      name: 'Playlist1',
      tracks: [],
    },
    {
      id: '111',
      name: 'Playlist2',
      tracks: [ track ],
    },
  ];
  const action: TrackTransfer = {
    type: 'track-transfer',
    removedTrack: track,
    addedTrack: track,
    sourcePlaylistId: '000',
    destinationPlaylistId: '111',
  };
  expect(actionToCommitMessage(action, playlists)).toBe(':truck: Artist - Track :file_folder: Playlist1 :arrow_right: Playlist2');
});

test('actionToCommitMessage:TrackModification', () => {
  const track: Track = {
    id: '',
    name: 'Track2',
    artists: [],
    addedAt: '',
  };
  const playlists: Playlist[] = [
    {
      id: '000',
      name: 'Playlist',
      tracks: [ track ],
    },
  ];
  const action: TrackModification = {
    type: 'track-modification',
    oldTrack: {
      ...track,
      name: 'Track1',
    },
    newTrack: track,
    playlistId: '000',
  };
  expect(actionToCommitMessage(action, playlists)).toBe(':pencil2: Track2 :file_folder: Playlist');
});

test('actionToCommitMessage:UnknownAction', () => {
  const playlists: Playlist[] = [];
  const action: UnknownAction = {
    type: 'unknown',
    oldPlaylists: [],
    newPlaylists: [],
  };
  expect(actionToCommitMessage(action, playlists)).toBe(':question: Unknown change');
});