SELECT
  pos.id as pos_id,
  pos.name as pos_name,
  pe.eve_id as event_id,
  pa.application_cnt as application_cnt
  -- pe.coor as coor
FROM
  "Position" as pos
    JOIN (
      SELECT
        pos.id as pos_id,
        COUNT(*) AS application_cnt
      FROM "Position" as pos, "Application" as app
      WHERE pos.id = app."positionId"
      GROUP BY pos.id
    ) AS pa ON pos.id = pa.pos_id
    JOIN (
      SELECT
        pos.id as pos_id,
        eve."id" as eve_id,
        eve."coor" as coor
      FROM "Position" as pos, "Event" as eve
      WHERE pos."eventId" = eve.id
    ) AS pe ON pos.id = pe.pos_id
WHERE
  pos.id IN (
    SELECT pos.id as pos_id
    FROM "Position" as pos, "_PositionToTag" as ptot, "Tag" as tag
    WHERE pos.id = ptot."A"
      AND ptot."B" = tag.id
      AND (
        tag.name = 'Community Services'
      )
    GROUP BY pos_id
    HAVING COUNT(pos.id) > 0
  )
  AND pos.gender ILIKE 'male'
  AND ST_DWITHIN(pe.coor, ST_MAKEPOINT(152.99, -27.4942), 10000)
-- ORDER BY pa.application_cnt DESC
-- ORDER BY pe.coor <-> ST_MakePoint(152.99, -27.4942)::geography DESC
ORDER BY pos."timeCreated" DESC