import { arrayToMap } from './playlist-utils';

enum EmojiName {
  PLAYLIST = 'file_folder',
  ADD = 'new',
  REMOVE = 'negative_squared_cross_mark',
  TRANSFER = 'truck',
  MODIFY = 'pencil2',
  ARROW = 'arrow_right',
  UNKNOWN = 'question',
}

const emoji = (name: keyof typeof EmojiName) => `:${EmojiName[name]}:`;

const stringifyTrack = (track: Track): string => {
  if (track.artists.length > 0) {
    return `${track.artists[0].name} - ${track.name}`;
  } else {
    return track.name;
  }
};

export const actionToCommitMessage = (action: Action, playlists: Playlist[]): string => {
  const playlistMap = arrayToMap(playlists);
  switch (action.type) {
    case 'playlist-creation':
      return `${emoji('ADD')} Create ${emoji('PLAYLIST')} ${action.target.name}`;
    case 'playlist-deletion':
      return `${emoji('REMOVE')} Delete ${emoji('PLAYLIST')} ${action.target.name}`;
    case 'playlist-modification':
      return `${emoji('MODIFY')} Modify ${emoji('PLAYLIST')} ${action.newPlaylist.name}`;
    case 'track-addition': {
      const destinationPlaylist = playlistMap.get(action.destinationPlaylistId);
      return `${emoji('ADD')} ${stringifyTrack(action.target)} ${emoji('PLAYLIST')} ${destinationPlaylist.name}`;
    }
    case 'track-removal': {
      const sourcePlaylist = playlistMap.get(action.sourcePlaylistId);
      return `${emoji('REMOVE')} ${stringifyTrack(action.target)} ${emoji('PLAYLIST')} ${sourcePlaylist.name}`;
    }
    case 'track-transfer': {
      const sourcePlaylist = playlistMap.get(action.sourcePlaylistId);
      const destinationPlaylist = playlistMap.get(action.destinationPlaylistId);
      return `${emoji('TRANSFER')} ${stringifyTrack(action.addedTrack)} ${emoji('PLAYLIST')} ${sourcePlaylist.name} ${emoji('ARROW')} ${destinationPlaylist.name}`;
    }
    case 'track-modification': {
      const playlist = playlistMap.get(action.playlistId);
      return `${emoji('MODIFY')} ${stringifyTrack(action.newTrack)} ${emoji('PLAYLIST')} ${playlist.name}`;
    }
    case 'unknown':
      return `${emoji('UNKNOWN')} Unknown change`;
  }
};