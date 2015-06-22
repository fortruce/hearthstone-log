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
      ZONE_CHANGE: null
    })
  },
  KEYWORDS: {
    POWER: {
      TAG_CHANGE: 'TAG_CHANGE',
      TAG: 'tag',
      GAME_ENTITY: 'GameEntity',
      PLAYER: 'Player',
      FULL_ENTITY: 'FULL_ENTITY',
      CREATE_GAME: 'CREATE_GAME',
      M_CURRENT_TASK_LIST: 'm_currentTaskList',
      COUNT: 'Count'
    },
    ZONE: {
      TRANSITIONING: 'TRANSITIONING',
      ID: 'id',
      PROCESS_CHANGES: /ProcessChanges/,
      LOCAL_CHANGES: /LocalChangesFromTrigger/,
      FINISH: /Finish/,
      M_ID: 'm_id',
      TASK_LIST_ID: 'taskListId',
      SRC_ZONE: 'srcZone',
      SRC_POS: 'srcPos',
      CHANGE_LIST_ID: 'changeListId',
      BRACKET_ID: '['
    }
  },
  LOGS: keymirror({
    ZONE: null,
    POWER: null,
    LOADINGSCREEN: null,
    RACHELLE: null
  })
};