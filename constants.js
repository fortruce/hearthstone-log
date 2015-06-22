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
      TRANSITIONING: null,
      ZONE_CHANGE: null,
      LOCAL_CHANGE: null,
      FINISH_CHANGE: null
    })
  },
  KEYWORDS: {
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
      ID: 'id',
      PROCESS_CHANGES: /ProcessChanges/,
      LOCAL_CHANGES: /LocalChangesFromTrigger/,
      FINISH: /Finish/
    }
  },
  LOGS: keymirror({
    ZONE: null,
    POWER: null,
    LOADINGSCREEN: null,
    RACHELLE: null
  })
};