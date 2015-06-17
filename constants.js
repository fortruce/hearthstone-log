var keymirror = require('keymirror');

module.exports = {
  TAXONOMIES: {
    POWER: keymirror({
      TAG_CHANGE: null,
      TAG: null,
      GAME_ENTITY: null,
      PLAYER_ENTITY: null,
      FULL_ENTITY: null,
      CREATE_GAME: null
    }),
    ZONE: keymirror({
      ZONE_CHANGE: null,
      LOCAL_CHANGE: null,
      FINISH_CHANGE: null
    })
  },
  LOG: {
    POWER: {
      TAG_CHANGE: 'TAG_CHANGE',
      TAG: 'tag',
      GAME_ENTITY: 'GameEntity',
      PLAYER: 'Player',
      FULL_ENTITY: 'FULL_ENTITY',
      CREATE_GAME: 'CREATE_GAME'
    },
    ZONE: {
      TRANSITIONING: 'TRANSITIONING',
      ID: 'id'
    }
  }
};