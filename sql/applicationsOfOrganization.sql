SELECT
  usr.id as user_id,
  usr.fullname as user_fullname,
  eve.id as event_id,
  eve.name as event_name,
  pos.id as position_id,
  pos.name as position_name,
  usr.gender as gender,
  application.id as application_id,
  application."timeCreated" as applied_at,
  application.status as status
FROM
  "Application" as application
    JOIN(
      SELECT
        usr.id as id,
        usr.fullname as fullname,
        usr.gender as gender
      FROM
        "User" as usr
    ) AS usr ON usr.id = application."userId"
    JOIN (
      SELECT
        pos.id as id,
        pos.name as name,
        pos."eventId" as eve_id
      FROM
        "Position" as pos
    ) AS pos ON pos.id = application."positionId"
    JOIN (
      SELECT
        eve.id as id,
        eve.name as name,
        eve."organizationId" as org_id
      FROM
        "Event" as eve
    ) AS eve ON pos.eve_id = eve.id
    JOIN (
      SELECT
        org.id as id
      FROM
        "Organization" as org
    ) AS org ON eve.org_id = org.id
WHERE
  org.id = 1;


-- SELECT *
-- FROM
--   "User" as u;

-- SELECT
--   pos.id as id,
--   pos.name as name,
--   pe.eve_id as "evendId",
--   pa.application_cnt as "applicationCount",
--   pe.coor <-> ST_MakePoint(152.99, -27.4942)::geography as distance
-- FROM
--   "Position" as pos
--     JOIN (
--       SELECT
--         pos.id as pos_id,
--         COUNT(*) AS application_cnt
--       FROM "Position" as pos, "Application" as app
--       WHERE pos.id = app."positionId"
--       GROUP BY pos.id
--     ) AS pa ON pos.id = pa.pos_id
--     JOIN (
--       SELECT
--         pos.id as pos_id,
--         eve."id" as eve_id,
--         eve."coor" as coor
--       FROM "Position" as pos, "Event" as eve
--       WHERE pos."eventId" = eve.id
--     ) AS pe ON pos.id = pe.pos_id
-- WHERE
--   pos.id IN (
--     SELECT pos.id as pos_id
--     FROM "Position" as pos, "_PositionToTag" as ptot, "Tag" as tag
--     WHERE pos.id = ptot."A"
--       AND ptot."B" = tag.id
--       AND (
--         tag.name = 'Community Services'
--       )
--     GROUP BY pos_id
--     HAVING COUNT(pos.id) > 0
--   )
--   AND pos.gender ILIKE 'male'
--   AND ST_DWITHIN(pe.coor, ST_MAKEPOINT(152.99, -27.4942), 20000)
-- -- ORDER BY "applicationCount" DESC
-- ORDER BY pe.coor <-> ST_MakePoint(152.99, -27.4942)::geography DESC
-- -- ORDER BY pos."timeCreated" DESC