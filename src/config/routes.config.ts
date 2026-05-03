export const routes = {
  home: '/',
  auth: {
    login: '/login',
    register: '/register',
  },
  catalog: {
    movies: '/movies',
    series: '/series',
    detail: (id: string) => `/catalog/${id}`,
  },
  player: (id: string) => `/play/${id}`,
  profiles: {
    list: '/profiles',
    manage: '/profiles/manage',
  }
}
