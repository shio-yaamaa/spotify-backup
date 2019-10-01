// Converts an array into a map whose key is the id of each item
export const arrayToMap = <T extends Playlist | Track>(array: T[]): Map<string, T> => {
  const map = new Map<string, T>();
  for (const item of array) {
    map.set(item.id, item);
  }
  return map;
};

// Determines if the given playlist should be backed up
export const shouldBackup = (playlist: Playlist) => {
  return playlist.name === 'New' || parseInt(playlist.name) > 0;
};

// Sorts playlists by name
// Numerics come before alphabets
export const sortPlaylists = (playlists: Playlist[]): Playlist[] => {
  // Don't mutate the original array
  return [...playlists].sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
};

// Sorts tracks by addedAt
export const sortTracks = (tracks: Track[]): Track[] => {
  // Don't mutate the original array
  return [...tracks].sort((a, b) => Date.parse(a.addedAt) - Date.parse(b.addedAt));
};

// Assumes the two playlists have the same id and does not consider changes in tracks
export const isPlaylistModified = (oldPlaylist: Playlist, newPlaylist: Playlist): boolean => {
  const toComparisonString = (playlist: Playlist) => {
    return JSON.stringify({
      ...playlist,
      tracks: null,
    });
  };
  return toComparisonString(oldPlaylist) !== toComparisonString(newPlaylist);
};

// Assumes the two tracks have the same id and does not consider changes in addedAt
export const isTrackModified = (oldTrack: Track, newTrack: Track): boolean => {
  const toComparisonString = (track: Track) => {
    return JSON.stringify({
      ...track,
      addedAt: null,
    });
  };
  return toComparisonString(oldTrack) !== toComparisonString(newTrack);
};

export const playlistToFormattedJson = (playlist: Playlist): string => {
  return JSON.stringify(playlist, null, 2);
};

export const parsePlaylistString = (string: string): Playlist => {
  return JSON.parse(string) as Playlist;
};