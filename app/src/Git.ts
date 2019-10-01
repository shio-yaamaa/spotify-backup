// Issue:
// If the name of a track or artist contains double quotes,
// the JSON file might not be interpreted properly.

import * as fs from 'fs-extra';
import * as path from 'path';
import * as simplegit from 'simple-git/promise';

import { playlistToFormattedJson, parsePlaylistString } from './playlist-utils';
import { actionToCommitMessage } from './commit-message';

const playlistsPath = path.resolve(process.env.GITHUB_WORKSPACE, 'playlists');

class Git {
  private git: simplegit.SimpleGit;

  constructor() {
    this.git = simplegit();
    fs.ensureDirSync(playlistsPath);
  }

  // Reads the playlists data from the files in the workspace
  public async getPreviousPlaylists(): Promise<Playlist[]> {
    const playlists: Playlist[] = [];
    const filenames = await fs.readdir(playlistsPath);
    for (const filename of filenames) {
      const content = await fs.readFile(path.resolve(playlistsPath, filename), 'utf8');
      playlists.push(parsePlaylistString(content));
    }
    return playlists;
  }

  // Writes the playlists data to the files in the workspace
  private async exportPlaylists(playlists: Playlist[]) {
    await fs.emptyDir(playlistsPath);

    for (const playlist of playlists) {
      const filename = `${playlist.name}.json`;
      await fs.writeFile(
        path.resolve(playlistsPath, filename),
        playlistToFormattedJson(playlist),
      );
    }
  }

  public async commit(snapshots: PlaylistsSnapshot[]) {
    if (snapshots.length === 1) {
      return;
    }

    for (const snapshot of snapshots.slice(1)) {
      await this.exportPlaylists(snapshot.playlists);
      await this.git.add(playlistsPath);
      await this.git.commit(actionToCommitMessage(snapshot.actionFromPrev, snapshot.playlists));
    }
  }
}

export default new Git();