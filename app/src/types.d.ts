type Timestamp = string; // 0000-00-00T00:00:00Z

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

interface Track {
  id: string;
  name: string;
  artists: Artist[];
  addedAt: Timestamp;
}

interface Artist {
  id: string;
  name: string;
}

// Actions/Snapshots

interface PlaylistCreation {
  type: 'playlist-creation';
  target: Playlist;
}

interface PlaylistDeletion {
  type: 'playlist-deletion';
  target: Playlist;
}

// Does not include modifications to its tracks
interface PlaylistModification {
  type: 'playlist-modification';
  oldPlaylist: Playlist;
  newPlaylist: Playlist;
}

interface TrackAddition {
  type: 'track-addition';
  destinationPlaylistId: string;
  target: Track;
}

interface TrackRemoval {
  type: 'track-removal';
  sourcePlaylistId: string;
  target: Track;
}

interface TrackTransfer {
  type: 'track-transfer';
  sourcePlaylistId: string;
  destinationPlaylistId: string;
  removedTrack: Track;
  addedTrack: Track;
}

// Includes modifications to its artists
interface TrackModification {
  type: 'track-modification';
  playlistId: string;
  oldTrack: Track;
  newTrack: Track;
}

// In case the action type cannot be determined
// Does not belong to either playlist-level or track-level change
interface UnknownAction {
  type: 'unknown';
  oldPlaylists: Playlist[];
  newPlaylists: Playlist[];
}

type Action = PlaylistCreation | PlaylistDeletion | PlaylistModification
  | TrackAddition | TrackRemoval | TrackTransfer | TrackModification
  | UnknownAction;

interface PlaylistsSnapshot {
  playlists: Playlist[];
  actionFromPrev: null | Action; // Null for the first snapshot
}