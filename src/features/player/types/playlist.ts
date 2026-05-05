export type IptvChannel = {
  id: string;
  name: string;
  url: string;
  logo?: string;
  groupTitle?: string;
  tvgId?: string;
  tvgName?: string;
};

export type LoadedPlaylist = {
  channels: IptvChannel[];
  total: number;
};
