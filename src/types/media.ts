export interface Media {
  id: string
  title: string
  description: string
  backdropPath: string
  posterPath: string
  releaseDate: string
  voteAverage: number
  genreIds: number[]
  mediaType: 'movie' | 'tv'
}

export interface Movie extends Media {
  mediaType: 'movie'
  runtime: number
}

export interface TvShow extends Media {
  mediaType: 'tv'
  numberOfSeasons: number
  numberOfEpisodes: number
}
