# Playlist File Format

```javascript
{
  id: string,
  name: string,
  tracks: [
    {
      id: string,
      name: string,
      artists: [
        {
          id: string,
          name: string,
        },
      ],
      addedAt: '0000-00-00T00:00:00Z',
    },
  ],
}
```

# Commit Messages

|Change|Message|
|:--|:--|
|Create a playlist|:new: Create :file_folder: PlaylistName|
|Delete a playlist|:negative_squared_cross_mark: Delete :file_folder: PlaylistName|
|Modify a playlist|:pencil2: Modify :file_folder: PlaylistName|
|Add a track to a playlist|:new: ArtistName - TrackName :file_folder: PlaylistName|
|Remove a track from a playlist|:negative_squared_cross_mark: ArtistName - TrackName :file_folder: PlaylistName|
|Transfer a track between playlists|:truck: ArtistName - TrackName :file_folder: SourcePlaylistName :arrow_right: DestinationPlaylistName|
|Modify a track in a playlist|:pencil2: ArtistName - TrackName :file_folder: PlaylistName|
|Unknown change|:question: Unknown change|