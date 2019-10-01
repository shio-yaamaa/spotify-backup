import * as Sentry from '@sentry/node';

import Git from './Git';
import SpotifyAPI from './SpotifyAPI';
import PlaylistsHistory from './PlaylistsHistory';

Sentry.init({ dsn: process.env.SENTRY_DSN });

const backup = async () => {
  const previousPlaylists = await Git.getPreviousPlaylists();
  const playlists = await SpotifyAPI.getPlaylists();
  const snapshots = new PlaylistsHistory(previousPlaylists, playlists).constructSnapshots();
  await Git.commit(snapshots);
};

backup();