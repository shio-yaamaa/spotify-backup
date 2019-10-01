// Issue:
// If there are multiple tracks with the same id and addedAt in a single playlist, (which is unlikely,)
// PlaylistHistory#detectActions cannot identify TrackRemoval actions correctly,
// and PlaylistHistory#applyAction may apply the action to a wrong track.

import { arrayToMap, sortPlaylists, sortTracks, isPlaylistModified, isTrackModified } from './playlist-utils';

class PlaylistsHistory {
  constructor(private oldPlaylists: Playlist[], private newPlaylists: Playlist[]) { }

  private applyAction(originalPlaylists: Playlist[], action: Action): Playlist[] {
    switch (action.type) {
      case 'playlist-creation':
        return sortPlaylists([...originalPlaylists, action.target]);
      case 'playlist-deletion':
        return originalPlaylists.filter(playlist => playlist.id !== action.target.id);
      case 'playlist-modification':
        const modifiedPlaylists = originalPlaylists.map(playlist => {
          return playlist.id === action.oldPlaylist.id ? action.newPlaylist : playlist;
        });
        return sortPlaylists(modifiedPlaylists);
      case 'track-addition':
        return originalPlaylists.map(playlist => {
          if (playlist.id === action.destinationPlaylistId) {
            return {
              ...playlist,
              tracks: sortTracks([...playlist.tracks, action.target]),
            }
          } else {
            return playlist;
          }
        });
      case 'track-removal':
        return originalPlaylists.map(playlist => {
          if (playlist.id === action.sourcePlaylistId) {
            return {
              ...playlist,
              tracks: playlist.tracks.filter(track => !(track.id === action.target.id && track.addedAt === action.target.addedAt)),
            };
          } else {
            return playlist;
          }
        });
      case 'track-transfer':
        const playlistsAfterRemoval = this.applyAction(
          originalPlaylists,
          {
            type: 'track-removal',
            sourcePlaylistId: action.sourcePlaylistId,
            target: action.removedTrack,
          },
        );
        const playlistsAfterAddition = this.applyAction(
          playlistsAfterRemoval,
          {
            type: 'track-addition',
            destinationPlaylistId: action.destinationPlaylistId,
            target: action.addedTrack,
          },
        );
        return playlistsAfterAddition;
      case 'track-modification':
        return originalPlaylists.map(playlist => {
          if (playlist.id === action.playlistId) {
            return {
              ...playlist,
              tracks: playlist.tracks.map(track => {
                return track.id === action.oldTrack.id ? action.newTrack : track;
              }),
            };
          } else {
            return playlist;
          }
        });
      case 'unknown':
        return action.newPlaylists;
      default:
        return originalPlaylists;
    }
  }

  private detectActions(): Action[] {
    const playlistCreations: PlaylistCreation[] = [];
    const playlistDeletions: PlaylistDeletion[] = [];
    const playlistModifications: PlaylistModification[] = [];
    const trackAdditions: TrackAddition[] = [];
    const trackRemovals: TrackRemoval[] = [];
    const trackTransfers: TrackTransfer[] = [];
    const trackModifications: TrackModification[] = [];

    // Detect playlist-level changes
    // Deletion and modification
    const oldPlaylistMap = arrayToMap(this.oldPlaylists);
    const newPlaylistMap = arrayToMap(this.newPlaylists);
    for (const oldPlaylist of this.oldPlaylists) {
      const newPlaylist = newPlaylistMap.get(oldPlaylist.id);
      if (newPlaylist) {
        if (isPlaylistModified(oldPlaylist, newPlaylist)) {
          playlistModifications.push({
            type: 'playlist-modification',
            oldPlaylist,
            newPlaylist: {
              ...newPlaylist,
              tracks: oldPlaylist.tracks,
            }
          });
        }
        // Detect track-level changes
        // Removals and modifications
        const oldTrackMap = arrayToMap(oldPlaylist.tracks);
        const newTrackMap = arrayToMap(newPlaylist.tracks);
        for (const oldTrack of oldPlaylist.tracks) {
          const newTrack = newTrackMap.get(oldTrack.id);
          if (newTrack) {
            if (oldTrack.addedAt === newTrack.addedAt) {
              if (isTrackModified(oldTrack, newTrack)) {
                trackModifications.push({ type: 'track-modification', playlistId: oldPlaylist.id, oldTrack, newTrack });
              }
            } else {
              trackRemovals.push({ type: 'track-removal', sourcePlaylistId: oldPlaylist.id, target: oldTrack });
              trackAdditions.push({ type: 'track-addition', destinationPlaylistId: newPlaylist.id, target: newTrack });
            }
          } else {
            trackRemovals.push({ type: 'track-removal', sourcePlaylistId: oldPlaylist.id, target: oldTrack });
          }
        }
        // Additions
        for (const newTrack of newPlaylist.tracks) {
          if (!oldTrackMap.get(newTrack.id)) {
            trackAdditions.push({ type: 'track-addition', destinationPlaylistId: newPlaylist.id, target: newTrack });
          }
        }
      } else {
        playlistDeletions.push({ type: 'playlist-deletion', target: oldPlaylist });
      }
    }
    // Creations
    for (const newPlaylist of this.newPlaylists) {
      if (!oldPlaylistMap.get(newPlaylist.id)) {
        playlistCreations.push({
          type: 'playlist-creation',
          target: {
            ...newPlaylist,
            tracks: [],
          },
        });
        // Every track in a new playlist is considered to be added 
        trackAdditions.push(...newPlaylist.tracks.map((track): TrackAddition => ({
          type: 'track-addition',
          destinationPlaylistId: newPlaylist.id,
          target: track,
        })));
      }
    }

    // Merge a track addition and removal into a transfer
    // Even if the properties are changed, don't count them as TrackModifications
    let trackRemovalIndex = 0;
    while (trackRemovalIndex < trackRemovals.length) {
      // Find the corresponding addition if any
      const trackAdditionIndex = trackAdditions.findIndex(addition => {
        return addition.target.id === trackRemovals[trackRemovalIndex].target.id;
      });
      if (trackAdditionIndex >= 0) {
        trackTransfers.push({
          type: 'track-transfer',
          sourcePlaylistId: trackRemovals[trackRemovalIndex].sourcePlaylistId,
          destinationPlaylistId: trackAdditions[trackAdditionIndex].destinationPlaylistId,
          removedTrack: trackRemovals[trackRemovalIndex].target,
          addedTrack: trackAdditions[trackAdditionIndex].target,
        });
        trackAdditions.splice(trackAdditionIndex, 1);
        trackRemovals.splice(trackRemovalIndex, 1);
        // Do not change trackRemovalIndex because the item at this index was replaced
      } else {
        trackRemovalIndex++;
      }
    }

    return [
      ...playlistDeletions, ...playlistCreations, ...playlistModifications,
      ...trackRemovals, ...trackAdditions, ...trackTransfers, ...trackModifications,
    ];
  }

  public constructSnapshots(): PlaylistsSnapshot[] {
    const actions = this.detectActions();
    const snapshots: PlaylistsSnapshot[] = [];
    let currentPlaylists = this.oldPlaylists;

    // The initial state
    snapshots.push({ playlists: this.oldPlaylists, actionFromPrev: null });

    for (const action of actions) {
      currentPlaylists = this.applyAction(currentPlaylists, action);
      snapshots.push({
        playlists: currentPlaylists,
        actionFromPrev: action,
      });
    }

    // If the resulting playlists do not match the actual one,
    // UnknownAction represents the difference
    if (JSON.stringify(currentPlaylists) !== JSON.stringify(this.newPlaylists)) {
      snapshots.push({
        playlists: this.newPlaylists,
        actionFromPrev: {
          type: 'unknown',
          oldPlaylists: currentPlaylists,
          newPlaylists: this.newPlaylists,
        },
      });
    }

    return snapshots;
  }
}

export default PlaylistsHistory;