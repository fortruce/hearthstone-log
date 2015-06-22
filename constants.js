var keymirror = require('keymirror');

module.exports = {
  TAXONOMIES: {
    POWER: keymirror({
      TAG_CHANGE: null,
      TAG: null,
      GAME_ENTITY: null,
      PLAYER_ENTITY: null,
      FULL_ENTITY: null,
      CREATE_GAME: null,
      ACTION: null
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
      COUNT: 'Count',
      ID: 'id',
      SELECTED_OPTION: 'selectedOption',
      ACTION_START_TASKLIST: 'actionStart',
      ACTION_START: 'ACTION_START',
      ACTION_END: 'ACTION_END'
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
      DST_ZONE: 'dstZone',
      SRC_POS: 'srcPos',
      CHANGE_LIST_ID: 'changeListId',
      BRACKET_ID: '[',
      TRIGGER_ENTITY: 'triggerEntity',
      START: 'START',
      END: 'END'
    }
  },
  LOGS: keymirror({
    ZONE: null,
    POWER: null,
    LOADINGSCREEN: null,
    RACHELLE: null
  })
};