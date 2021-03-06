'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db,callback) {
  db.runSql(`
  with cte_task as (
    select
      tagentity_tasks__task_tags.id as tag_id,
      case tagentity."name"
          when 'Part Time Detail' then 'Part-time'
          when 'Full Time Detail' then 'Full-time'  
          else null
        end as detail_selection,
        task.id
    from task
    left join tagentity_tasks__task_tags on task.id = tagentity_tasks__task_tags.task_tags
    left join tagentity on tagentity.id = tagentity_tasks__task_tags.tagentity_tasks
    where tagentity."type" = 'task-time-required'
    )
    update task set detail_selection = (select detail_selection from cte_task where cte_task.id = task.id order by cte_task.tag_id desc limit 1)`,callback);
};

exports.down = function (db) {
  return null;
};

