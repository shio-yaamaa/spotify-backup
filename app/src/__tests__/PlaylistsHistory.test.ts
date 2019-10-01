import PlaylistsHistory from '../PlaylistsHistory';

test('constructSnapshots', () => {
  const oldPlaylists: Playlist[] = [
    // Playlist to be deleted
    {
      id: '000',
      name: '1',
      tracks: [
        {
          id: '000',
          name: 'track1',
          artists: [],
          addedAt: '2019-09-01T00:00:00Z',
        },
      ],
    },
    // Playlist to be modified
    {
      id: '001',
      name: '2',
      tracks: [
        // Track to be deleted
        {
          id: '001',
          name: 'track2',
          artists: [],
          addedAt: '2019-09-02T00:00:00Z',
        },
        // Track to be transferred
        {
          id: '002',
          name: 'track3',
          artists: [],
          addedAt: '2019-09-03T00:00:00Z',
        },
        // Track to be modified
        {
          id: '003',
          name: 'track4',
          artists: [
            {
              id: '000',
              name: 'abc',
            },
          ],
          addedAt: '2019-09-04T00:00:00Z',
        },
      ],
    },
    {
      id: '002',
      name: '3',
      tracks: [],
    }
  ];
  const newPlaylists: Playlist[] = [
    {
      ...oldPlaylists[2],
      tracks: [
        // Transferred track
        {
          ...oldPlaylists[1].tracks[1],
          addedAt: '2019-09-06T00:00:00Z'
        },
      ],
    },
    // Created playlist
    {
      id: '003',
      name: '4',
      tracks: [
        // Added track
        {
          id: '005',
          name: 'track6',
          artists: [],
          addedAt: '2019-09-07T00:00:00Z',
        },
      ],
    },
    // Modified playlist
    {
      ...oldPlaylists[1],
      name: '5',
      tracks: [
        // Modified track
        {
          ...oldPlaylists[1].tracks[2],
          artists: [
            {
              ...oldPlaylists[1].tracks[2].artists[0],
              name: 'xyz',
            },
          ],
        },
        // Added track
        {
          id: '004',
          name: 'track5',
          artists: [],
          addedAt: '2019-09-05T00:00:00Z',
        },
      ],
    },
  ];

  const expectedSnapshots: PlaylistsSnapshot[] = [];
  expectedSnapshots.push({
    playlists: oldPlaylists,
    actionFromPrev: null,
  });
  expectedSnapshots.push({
    playlists: [
      oldPlaylists[1],
      oldPlaylists[2],
    ],
    actionFromPrev: {
      type: 'playlist-deletion',
      target: oldPlaylists[0],
    },
  });
  expectedSnapshots.push({
    playlists: [
      ...expectedSnapshots[expectedSnapshots.length - 1].playlists,
      {
        ...newPlaylists[1],
        tracks: [],
      }
    ],
    actionFromPrev: {
      type: 'playlist-creation',
      target: {
        ...newPlaylists[1],
        tracks: [],
      },
    },
  });
  expectedSnapshots.push({
    playlists: [
      expectedSnapshots[expectedSnapshots.length - 1].playlists[1],
      expectedSnapshots[expectedSnapshots.length - 1].playlists[2],
      {
        ...expectedSnapshots[expectedSnapshots.length - 1].playlists[0],
        name: newPlaylists[2].name,
      },
    ],
    actionFromPrev: {
      type: 'playlist-modification',
      oldPlaylist: expectedSnapshots[expectedSnapshots.length - 1].playlists[0],
      newPlaylist: {
        ...expectedSnapshots[expectedSnapshots.length - 1].playlists[0],
        name: newPlaylists[2].name,
      },
    },
  });
  expectedSnapshots.push({
    playlists: [
      expectedSnapshots[expectedSnapshots.length - 1].playlists[0],
      expectedSnapshots[expectedSnapshots.length - 1].playlists[1],
      {
        ...expectedSnapshots[expectedSnapshots.length - 1].playlists[2],
        tracks: [
          expectedSnapshots[expectedSnapshots.length - 1].playlists[2].tracks[1],
          expectedSnapshots[expectedSnapshots.length - 1].playlists[2].tracks[2],
        ],
      },
    ],
    actionFromPrev: {
      type: 'track-removal',
      sourcePlaylistId: expectedSnapshots[expectedSnapshots.length - 1].playlists[2].id,
      target: expectedSnapshots[expectedSnapshots.length - 1].playlists[2].tracks[0],
    },
  });
  expectedSnapshots.push({
    playlists: [
      expectedSnapshots[expectedSnapshots.length - 1].playlists[0],
      expectedSnapshots[expectedSnapshots.length - 1].playlists[1],
      {
        ...expectedSnapshots[expectedSnapshots.length - 1].playlists[2],
        tracks: [
          ...expectedSnapshots[expectedSnapshots.length - 1].playlists[2].tracks,
          newPlaylists[2].tracks[1],
        ],
      },
    ],
    actionFromPrev: {
      type: 'track-addition',
      destinationPlaylistId: expectedSnapshots[expectedSnapshots.length - 1].playlists[2].id,
      target: newPlaylists[2].tracks[1],
    },
  });
  expectedSnapshots.push({
    playlists: [
      expectedSnapshots[expectedSnapshots.length - 1].playlists[0],
      {
        ...expectedSnapshots[expectedSnapshots.length - 1].playlists[1],
        tracks: newPlaylists[1].tracks,
      },
      expectedSnapshots[expectedSnapshots.length - 1].playlists[2],
    ],
    actionFromPrev: {
      type: 'track-addition',
      destinationPlaylistId: newPlaylists[1].id,
      target: newPlaylists[1].tracks[0],
    }
  });
  expectedSnapshots.push({
    playlists: [
      {
        ...expectedSnapshots[expectedSnapshots.length - 1].playlists[0],
        tracks: [
          newPlaylists[0].tracks[0],
        ],
      },
      expectedSnapshots[expectedSnapshots.length - 1].playlists[1],
      {
        ...expectedSnapshots[expectedSnapshots.length - 1].playlists[2],
        tracks: [
          expectedSnapshots[expectedSnapshots.length - 1].playlists[2].tracks[1],
          expectedSnapshots[expectedSnapshots.length - 1].playlists[2].tracks[2],
        ],
      },
    ],
    actionFromPrev: {
      type: 'track-transfer',
      sourcePlaylistId: expectedSnapshots[expectedSnapshots.length - 1].playlists[2].id,
      destinationPlaylistId: newPlaylists[0].id,
      removedTrack: expectedSnapshots[expectedSnapshots.length - 1].playlists[2].tracks[0],
      addedTrack: newPlaylists[0].tracks[0],
    },
  });
  expectedSnapshots.push({
    playlists: [
      expectedSnapshots[expectedSnapshots.length - 1].playlists[0],
      expectedSnapshots[expectedSnapshots.length - 1].playlists[1],
      {
        ...expectedSnapshots[expectedSnapshots.length - 1].playlists[2],
        tracks: [
          newPlaylists[2].tracks[0],
          expectedSnapshots[expectedSnapshots.length - 1].playlists[2].tracks[1],
        ],
      },
    ],
    actionFromPrev: {
      type: 'track-modification',
      playlistId: expectedSnapshots[expectedSnapshots.length - 1].playlists[2].id,
      oldTrack: expectedSnapshots[expectedSnapshots.length - 1].playlists[2].tracks[0],
      newTrack: newPlaylists[2].tracks[0],
    },
  });

  expect(new PlaylistsHistory(oldPlaylists, newPlaylists).constructSnapshots())
    .toEqual(expectedSnapshots);
});